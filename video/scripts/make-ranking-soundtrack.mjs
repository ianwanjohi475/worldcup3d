// 37s suspense/countdown soundtrack for the ranking engine.
// Ascending bell on each reveal, building tension, with a triumphant climax on #1.
//   node scripts/make-ranking-soundtrack.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const SR = 44100;
const DUR = 37;
const N = SR * DUR;
const buf = new Float64Array(N);
const idx = (t) => Math.floor(t * SR);
const add = (i, v) => { if (i >= 0 && i < N) buf[i] += v; };

// reveal times (s) — match RankingVideo (INTRO 90f, PER_REVEAL 88f @30fps)
const REVEALS = [3.0, 5.93, 8.87, 11.8, 14.73, 17.67, 20.6, 23.53, 26.47, 29.4];
const CLIMAX = REVEALS[REVEALS.length - 1];
const bellNotes = [330, 392, 440, 494, 587, 659, 740, 880, 988, 1175];

function kick(t0, gain = 0.9) {
  for (let i = idx(t0); i < idx(t0 + 0.3); i++) {
    const t = (i - idx(t0)) / SR;
    add(i, Math.sin(2 * Math.PI * (130 * Math.exp(-t * 30) + 50) * t) * Math.exp(-t * 9) * gain);
  }
}
function bell(t0, freq, gain = 0.5) {
  for (let i = idx(t0); i < idx(t0 + 0.6); i++) {
    const t = (i - idx(t0)) / SR;
    const env = Math.exp(-t * 6);
    add(i, (Math.sin(2 * Math.PI * freq * t) * 0.6 + Math.sin(2 * Math.PI * freq * 2.01 * t) * 0.3 + Math.sin(2 * Math.PI * freq * 3 * t) * 0.1) * env * gain);
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
  const a = 0.4, r = 0.6, len = t1 - t0;
  for (let i = idx(t0); i < idx(t1); i++) {
    const t = i / SR, local = t - t0;
    let env = 1;
    if (local < a) env = local / a; else if (local > len - r) env = Math.max(0, (len - local) / r);
    let s = 0; for (const f of freqs) s += Math.sin(2 * Math.PI * f * t);
    add(i, (s / freqs.length) * env * gain);
  }
}
function cymbal(t0, gain = 0.4) {
  let lp = 0;
  for (let i = idx(t0); i < idx(t0 + 0.8); i++) {
    const t = (i - idx(t0)) / SR;
    const nz = Math.random() * 2 - 1;
    lp = lp + 0.8 * (nz - lp);
    add(i, (nz - lp) * Math.exp(-t * 4) * gain);
  }
}

// tension pad that rises through the countdown
pad([110, 164.81], 0, CLIMAX + 0.2, 0.28);
pad([146.83, 220], CLIMAX * 0.5, CLIMAX + 0.2, 0.2);

// steady pulse building momentum
for (let t = 3.0; t < CLIMAX; t += 0.5) {
  const inten = 0.4 + 0.5 * (t / CLIMAX);
  kick(t, 0.7 * inten);
}

// each reveal: whoosh + bell + soft kick (ascending pitch)
REVEALS.forEach((t, k) => {
  if (k < REVEALS.length - 1) {
    whoosh(t, 0.4);
    bell(t, bellNotes[k], 0.5);
    kick(t, 0.8);
  }
});

// #1 climax — big hit + triumphant major chord + cymbal
kick(CLIMAX, 1.3);
cymbal(CLIMAX, 0.5);
whoosh(CLIMAX, 0.6, 0.7);
pad([261.63, 329.63, 392.0, 523.25], CLIMAX, DUR, 0.5); // C major, uplifting outro
bell(CLIMAX, 1046.5, 0.6);

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
console.log(`Wrote ${out} (${(dataSize / 1024 / 1024).toFixed(2)} MB, ${DUR}s)`);
