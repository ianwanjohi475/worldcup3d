// Generates a 30s cinematic soundtrack (mono, 44.1kHz, 16-bit WAV) for the CR7 explainer.
// Fully synthesized — no external assets. Whooshes and the final impact are timed to scene cuts.
//
//   node scripts/make-soundtrack.mjs
//
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const SR = 44100;
const DUR = 30;
const N = SR * DUR;
const buf = new Float64Array(N);

const idx = (t) => Math.floor(t * SR);
const clampAdd = (i, v) => {
  if (i >= 0 && i < N) buf[i] += v;
};

// Scene cuts (seconds) — must match the Remotion composition.
const CUTS = [4.5, 10.0, 15.5, 21.0, 26.0];

// --- Sustained sub-bass drone with a slow swell, root note per section ---
function drone(freq, t0, t1, gain) {
  const a = 0.4; // attack seconds
  const r = 0.5; // release seconds
  for (let i = idx(t0); i < idx(t1); i++) {
    const t = i / SR;
    const local = t - t0;
    const len = t1 - t0;
    let env = 1;
    if (local < a) env = local / a;
    else if (local > len - r) env = Math.max(0, (len - local) / r);
    // root + soft fifth + sub octave for body
    const s =
      Math.sin(2 * Math.PI * freq * t) * 0.6 +
      Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.2 +
      Math.sin(2 * Math.PI * freq * 0.5 * t) * 0.5;
    clampAdd(i, s * env * gain);
  }
}

// --- Kick drum: pitch-dropping sine with exponential decay ---
function kick(t0, gain = 0.9) {
  const dur = 0.32;
  for (let i = idx(t0); i < idx(t0 + dur); i++) {
    const t = (i - idx(t0)) / SR;
    const f = 120 * Math.exp(-t * 28) + 48; // 120Hz -> 48Hz
    const env = Math.exp(-t * 9);
    clampAdd(i, Math.sin(2 * Math.PI * f * t) * env * gain);
  }
}

// --- Hi-hat: short low-passed noise burst ---
function hat(t0, gain = 0.18) {
  const dur = 0.05;
  let lp = 0;
  for (let i = idx(t0); i < idx(t0 + dur); i++) {
    const t = (i - idx(t0)) / SR;
    const env = Math.exp(-t * 60);
    const noise = Math.random() * 2 - 1;
    lp = lp + 0.6 * (noise - lp); // brighten
    clampAdd(i, lp * env * gain);
  }
}

// --- Whoosh: low-passed noise that swells up then snaps, centered on a cut ---
function whoosh(tCut, gain = 0.5) {
  const pre = 0.6;
  const post = 0.25;
  let lp = 0;
  for (let i = idx(tCut - pre); i < idx(tCut + post); i++) {
    const t = i / SR;
    const rel = t - (tCut - pre);
    const total = pre + post;
    // amplitude rises into the cut, then quick fall
    let env;
    if (rel < pre) env = Math.pow(rel / pre, 2);
    else env = Math.max(0, 1 - (rel - pre) / post);
    const noise = Math.random() * 2 - 1;
    // sweep filter cutoff up as we approach the cut
    const alpha = 0.05 + 0.4 * (rel / total);
    lp = lp + alpha * (noise - lp);
    clampAdd(i, lp * env * gain);
  }
}

// --- Riser: rising filtered noise building tension before the verdict ---
function riser(t0, t1, gain = 0.4) {
  let lp = 0;
  for (let i = idx(t0); i < idx(t1); i++) {
    const t = i / SR;
    const rel = (t - t0) / (t1 - t0);
    const env = Math.pow(rel, 1.5);
    const noise = Math.random() * 2 - 1;
    const alpha = 0.03 + 0.5 * rel;
    lp = lp + alpha * (noise - lp);
    clampAdd(i, lp * env * gain);
    // add a rising tone underneath
    const f = 200 + 600 * rel;
    clampAdd(i, Math.sin(2 * Math.PI * f * t) * env * gain * 0.3);
  }
}

// --- Build the arrangement ---
// Section roots (Hz) — minor, determined, cinematic
const sections = [
  { t0: 0.0, t1: 4.5, root: 55.0 }, // A1 — hook
  { t0: 4.5, t1: 10.0, root: 43.65 }, // F1 — the legend
  { t0: 10.0, t1: 15.5, root: 65.41 }, // C2 — the team
  { t0: 15.5, t1: 21.0, root: 49.0 }, // G1 — the hunger
  { t0: 21.0, t1: 26.0, root: 55.0 }, // A1 — verdict
  { t0: 26.0, t1: 30.0, root: 110.0 }, // A2 — outro
];
for (const s of sections) drone(s.root, s.t0, s.t1, 0.5);

// Kick pattern: starts at scene 2, gets denser. Beat = 0.5s (120 BPM).
const beat = 0.5;
for (let t = 4.5; t < 30; t += beat) {
  const intensity = t < 10 ? 0.6 : t < 21 ? 0.85 : 1.0;
  kick(t, 0.9 * intensity);
  // off-beat hats from scene 3 onward
  if (t >= 10) hat(t + beat / 2, 0.16);
  if (t >= 15.5) hat(t + beat / 4, 0.1);
}

// Whooshes on every cut
for (const c of CUTS) whoosh(c, 0.55);

// Riser into the verdict (cut at 21s)
riser(19.2, 21.0, 0.45);
// Big impact on the verdict + outro
kick(21.0, 1.2);
kick(26.0, 1.3);

// --- Normalize + gentle soft-clip to avoid clipping ---
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const norm = peak > 0 ? 0.85 / peak : 1;
const pcm = Buffer.alloc(N * 2);
for (let i = 0; i < N; i++) {
  let v = Math.tanh(buf[i] * norm * 1.1); // soft clip
  const s = Math.max(-1, Math.min(1, v));
  pcm.writeInt16LE(Math.round(s * 32767), i * 2);
}

// --- WAV header (mono, 16-bit) ---
const dataSize = pcm.length;
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + dataSize, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(1, 22); // mono
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 2, 28); // byte rate
header.writeUInt16LE(2, 32); // block align
header.writeUInt16LE(16, 34); // bits
header.write("data", 36);
header.writeUInt32LE(dataSize, 40);

const out = "public/soundtrack.wav";
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.concat([header, pcm]));
console.log(`Wrote ${out} (${(dataSize / 1024 / 1024).toFixed(2)} MB, ${DUR}s)`);
