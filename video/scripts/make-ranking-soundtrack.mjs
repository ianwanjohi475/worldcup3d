// Cinematic countdown soundtrack for the ranking engine (timing computed from ITEMS).
// Sub-bass + tension pad, ascending bells/sparkles per reveal, crowd roar + boom on #1.
//   node scripts/make-ranking-soundtrack.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const SR = 44100;
const FPS = 30;
const INTRO = 90, PER = 88, OUTRO = 132;
const ITEMS = 8;

const totalFrames = INTRO + ITEMS * PER + OUTRO;
const DUR = Math.ceil(totalFrames / FPS) + 1;
const N = SR * DUR;
const buf = new Float64Array(N);
const idx = (t) => Math.floor(t * SR);
const add = (i, v) => { if (i >= 0 && i < N) buf[i] += v; };

const REVEALS = [];
for (let k = 0; k < ITEMS; k++) REVEALS.push((INTRO + k * PER) / FPS);
const CLIMAX = REVEALS[REVEALS.length - 1];
const bellNotes = REVEALS.map((_, k) => 330 * Math.pow(1.14, k));

function kick(t0, gain = 0.9) {
  for (let i = idx(t0); i < idx(t0 + 0.3); i++) {
    const t = (i - idx(t0)) / SR;
    add(i, Math.sin(2 * Math.PI * (130 * Math.exp(-t * 30) + 50) * t) * Math.exp(-t * 9) * gain);
  }
}
function bell(t0, freq, gain = 0.5) {
  for (let i = idx(t0); i < idx(t0 + 0.7); i++) {
    const t = (i - idx(t0)) / SR;
    const env = Math.exp(-t * 5.5);
    add(i, (Math.sin(2 * Math.PI * freq * t) * 0.6 + Math.sin(2 * Math.PI * freq * 2.01 * t) * 0.3 + Math.sin(2 * Math.PI * freq * 3 * t) * 0.12) * env * gain);
  }
}
function sparkle(t0, freq, gain = 0.18) {
  for (let i = idx(t0); i < idx(t0 + 0.25); i++) {
    const t = (i - idx(t0)) / SR;
    add(i, Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 22) * gain);
  }
}
function whoosh(t1, gain = 0.4, dur = 0.5) {
  let lp = 0;
  for (let i = idx(t1 - dur); i < idx(t1); i++) {
    const t = i / SR, rel = (t - (t1 - dur)) / dur;
    const nz = Math.random() * 2 - 1;
    lp = lp + (0.05 + 0.4 * rel) * (nz - lp);
    add(i, lp * Math.pow(rel, 2) * gain);
  }
}
function pad(freqs, t0, t1, gain) {
  const a = 0.4, r = 0.7, len = t1 - t0;
  for (let i = idx(t0); i < idx(t1); i++) {
    const t = i / SR, local = t - t0;
    let env = 1;
    if (local < a) env = local / a; else if (local > len - r) env = Math.max(0, (len - local) / r);
    let s = 0; for (const f of freqs) s += Math.sin(2 * Math.PI * f * t) + Math.sin(2 * Math.PI * f * 1.003 * t) * 0.5;
    add(i, (s / (freqs.length * 1.5)) * env * gain);
  }
}
function cymbal(t0, gain = 0.4) {
  let lp = 0;
  for (let i = idx(t0); i < idx(t0 + 1.0); i++) {
    const t = (i - idx(t0)) / SR;
    const nz = Math.random() * 2 - 1;
    lp = lp + 0.85 * (nz - lp);
    add(i, (nz - lp) * Math.exp(-t * 3.5) * gain);
  }
}
function boom(t0, gain = 1.0) {
  for (let i = idx(t0); i < idx(t0 + 1.4); i++) {
    const t = (i - idx(t0)) / SR;
    const f = 80 * Math.exp(-t * 6) + 38;
    add(i, Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 2.2) * gain);
  }
}
function crowd(t0, dur = 1.8, gain = 0.4) {
  let lp1 = 0, lp2 = 0;
  for (let i = idx(t0); i < idx(t0 + dur); i++) {
    const t = (i - idx(t0)) / SR;
    const env = Math.min(1, t / 1.0) * Math.max(0, 1 - (t - 1.0) / (dur - 1.0));
    const nz = Math.random() * 2 - 1;
    lp1 = lp1 + 0.08 * (nz - lp1);   // low band
    lp2 = lp2 + 0.5 * (nz - lp2);    // mid band
    add(i, (lp1 * 1.2 + (lp2 - lp1) * 0.6) * env * gain);
  }
}

// base bed
pad([110, 164.81], 0, CLIMAX + 0.2, 0.26);
pad([146.83, 220], CLIMAX * 0.5, CLIMAX + 0.2, 0.18);
for (let t = 3.0; t < CLIMAX; t += 0.5) kick(t, 0.7 * (0.4 + 0.55 * (t / CLIMAX)));

// reveals
REVEALS.forEach((t, k) => {
  if (k < REVEALS.length - 1) {
    whoosh(t, 0.42);
    bell(t, bellNotes[k], 0.5);
    sparkle(t + 0.02, bellNotes[k] * 3, 0.16);
    kick(t, 0.8);
  }
});

// #1 climax — boom + crowd roar + crash + triumphant chord + shimmer
boom(CLIMAX, 1.1);
kick(CLIMAX, 1.2);
crowd(CLIMAX, 2.2, 0.45);
cymbal(CLIMAX, 0.5);
whoosh(CLIMAX, 0.6, 0.7);
pad([261.63, 329.63, 392.0, 523.25], CLIMAX, DUR, 0.5);
[1046.5, 1318.5, 1568].forEach((f, j) => bell(CLIMAX + 0.12 * j, f, 0.4));

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
const out = "public/ranking-soundtrack.wav";
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.concat([header, pcm]));
console.log(`Wrote ${out} (${(dataSize / 1024 / 1024).toFixed(2)} MB, ${DUR}s, ${ITEMS} items)`);
