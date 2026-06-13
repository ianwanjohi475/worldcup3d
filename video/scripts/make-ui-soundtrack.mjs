// Generates a 40s upbeat house-style soundtrack for the UI showcase.
// Mono, 44.1kHz, 16-bit WAV. Risers + impacts land on the screen transitions.
//   node scripts/make-ui-soundtrack.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const SR = 44100;
const DUR = 40;
const N = SR * DUR;
const buf = new Float64Array(N);
const idx = (t) => Math.floor(t * SR);
const add = (i, v) => { if (i >= 0 && i < N) buf[i] += v; };

// transition / accent times (seconds) — match UiShowcase
const KEYS = [3.3, 8.9, 14.3, 19.7, 25.1, 30.5, 36.2];
const DROP = 3.3;
const BPM = 124;
const beat = 60 / BPM;

// --- instruments ---
function pad(freqs, t0, t1, gain) {
  const a = 0.5, r = 0.6, len = t1 - t0;
  for (let i = idx(t0); i < idx(t1); i++) {
    const t = i / SR, local = t - t0;
    let env = 1;
    if (local < a) env = local / a;
    else if (local > len - r) env = Math.max(0, (len - local) / r);
    let s = 0;
    for (const f of freqs) s += Math.sin(2 * Math.PI * f * t);
    add(i, (s / freqs.length) * env * gain);
  }
}
function pluck(t0, freq, gain = 0.5, dur = 0.28) {
  for (let i = idx(t0); i < idx(t0 + dur); i++) {
    const t = (i - idx(t0)) / SR;
    const env = Math.exp(-t * 14);
    add(i, (Math.sin(2 * Math.PI * freq * t) * 0.7 + Math.sin(2 * Math.PI * freq * 2 * t) * 0.3) * env * gain);
  }
}
function bass(t0, freq, gain = 0.7, dur = 0.4) {
  for (let i = idx(t0); i < idx(t0 + dur); i++) {
    const t = (i - idx(t0)) / SR;
    const env = Math.exp(-t * 6) * Math.min(1, t * 60);
    add(i, Math.sin(2 * Math.PI * freq * t) * env * gain);
  }
}
function kick(t0, gain = 1.0) {
  for (let i = idx(t0); i < idx(t0 + 0.3); i++) {
    const t = (i - idx(t0)) / SR;
    const f = 130 * Math.exp(-t * 30) + 50;
    add(i, Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 9) * gain);
  }
}
function hat(t0, gain = 0.14, dur = 0.04) {
  let lp = 0;
  for (let i = idx(t0); i < idx(t0 + dur); i++) {
    const t = (i - idx(t0)) / SR;
    const n = Math.random() * 2 - 1;
    lp = lp + 0.7 * (n - lp);
    add(i, (n - lp) * Math.exp(-t * 70) * gain);
  }
}
function riser(t1, gain = 0.4, dur = 1.2) {
  let lp = 0;
  for (let i = idx(t1 - dur); i < idx(t1); i++) {
    const t = i / SR, rel = (t - (t1 - dur)) / dur;
    const n = Math.random() * 2 - 1;
    const alpha = 0.03 + 0.5 * rel;
    lp = lp + alpha * (n - lp);
    add(i, lp * Math.pow(rel, 1.5) * gain);
    add(i, Math.sin(2 * Math.PI * (300 + 700 * rel) * t) * Math.pow(rel, 2) * gain * 0.25);
  }
}
function impact(t0, gain = 0.5) {
  kick(t0, 1.2);
  let lp = 0;
  for (let i = idx(t0); i < idx(t0 + 0.5); i++) {
    const t = (i - idx(t0)) / SR;
    const n = Math.random() * 2 - 1;
    lp = lp + 0.25 * (n - lp);
    add(i, lp * Math.exp(-t * 5) * gain);
  }
}

// --- chord progression (C - G - Am - F) ---
const chords = [
  { pad: [261.63, 329.63, 392.0], arp: [261.63, 329.63, 392.0, 523.25], bass: 65.41 },
  { pad: [196.0, 246.94, 392.0], arp: [196.0, 246.94, 293.66, 392.0], bass: 98.0 },
  { pad: [220.0, 261.63, 329.63], arp: [220.0, 261.63, 329.63, 440.0], bass: 110.0 },
  { pad: [174.61, 220.0, 261.63], arp: [174.61, 220.0, 261.63, 349.23], bass: 87.31 },
];
const chordAt = (t) => chords[Math.floor((t - DROP) / 2) % chords.length];

// Intro pad swell + riser into the drop
pad([130.81, 196.0, 261.63], 0, DROP + 0.2, 0.5);
riser(DROP, 0.5, 1.6);

// Main groove
for (let t = DROP; t < 36.2; t += beat) {
  const ch = chordAt(t);
  kick(t, 1.0);
  bass(t, ch.bass, 0.7);
  hat(t + beat / 2, 0.16);
  hat(t + beat / 4, 0.08);
  hat(t + (3 * beat) / 4, 0.08);
}
// Pad chords every 2s
for (let t = DROP; t < 36.2; t += 2) pad(chordAt(t).pad, t, t + 2, 0.32);
// Arp 16th notes
for (let t = DROP, k = 0; t < 36.2; t += beat / 4, k++) {
  const ch = chordAt(t);
  pluck(t, ch.arp[k % ch.arp.length], 0.34);
}
// Risers + impacts on transitions
for (const key of KEYS) {
  if (key === DROP) continue;
  riser(key, 0.4, 1.0);
  impact(key, 0.5);
}
// Outro chord
pad([261.63, 329.63, 392.0, 523.25], 36.2, 40, 0.45);

// normalize + soft clip
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const norm = peak > 0 ? 0.85 / peak : 1;
const pcm = Buffer.alloc(N * 2);
for (let i = 0; i < N; i++) pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, Math.tanh(buf[i] * norm * 1.1))) * 32767), i * 2);

const dataSize = pcm.length;
const header = Buffer.alloc(44);
header.write("RIFF", 0); header.writeUInt32LE(36 + dataSize, 4); header.write("WAVE", 8);
header.write("fmt ", 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
header.writeUInt32LE(SR, 24); header.writeUInt32LE(SR * 2, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
header.write("data", 36); header.writeUInt32LE(dataSize, 40);
const out = "public/ui-soundtrack.wav";
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.concat([header, pcm]));
console.log(`Wrote ${out} (${(dataSize / 1024 / 1024).toFixed(2)} MB, ${DUR}s)`);
