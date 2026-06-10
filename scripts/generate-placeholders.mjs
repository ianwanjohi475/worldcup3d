/**
 * Generates placeholder art for any missing source asset so the site runs
 * out of the box. Never overwrites an existing file — drop your real
 * hero-stadium.png / hero-ball-texture.png / hosts-triptych.png /
 * player-*.png into /public/assets and they take over automatically.
 */
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = join(root, 'public', 'assets');
mkdirSync(ASSETS, { recursive: true });

/* Deterministic pseudo-random, so placeholder output is stable. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const hash2 = (x, y) => {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/* ------------------------------------------------------------------ */
/* hero-ball-texture.png — seamless navy panel grid with gold seams    */
/* ------------------------------------------------------------------ */
function ballTextureSVG() {
  const SIZE = 1024;
  const s = 86; // hex radius
  const w = Math.sqrt(3) * s;
  const vstep = 1.5 * s;
  const fills = ['#0B1020', '#0D1428', '#0A0E1C', '#101936', '#0C1224'];

  // Jitter a corner consistently by its (wrapped) position so adjacent
  // panels share edges and the texture tiles perfectly.
  const corner = (x, y) => {
    const wx = ((x % SIZE) + SIZE) % SIZE;
    const wy = ((y % SIZE) + SIZE) % SIZE;
    const jx = (hash2(Math.round(wx * 4), Math.round(wy * 4)) - 0.5) * 13;
    const jy = (hash2(Math.round(wy * 4) + 7919, Math.round(wx * 4)) - 0.5) * 13;
    return [x + jx, y + jy];
  };

  let cells = '';
  const cols = Math.ceil(SIZE / w) + 2;
  const rows = Math.ceil(SIZE / vstep) + 2;
  for (let r = -1; r <= rows; r++) {
    for (let c = -1; c <= cols; c++) {
      const cx = c * w + (r % 2 ? w / 2 : 0);
      const cy = r * vstep;
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 6 + (i * Math.PI) / 3;
        pts.push(corner(cx + s * Math.cos(a), cy + s * Math.sin(a)));
      }
      const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('') + 'Z';
      const fill = fills[Math.floor(hash2(c + 31, r + 57) * fills.length)];
      const scuff = hash2(c + 101, r + 11) < 0.3
        ? `<path d="${d}" fill="url(#scuff)" opacity="${(0.04 + hash2(c, r) * 0.08).toFixed(3)}"/>` : '';
      cells += `<path d="${d}" fill="${fill}"/>${scuff}
        <path d="${d}" fill="none" stroke="#3A2C12" stroke-width="13" opacity="0.85"/>
        <path d="${d}" fill="none" stroke="url(#seam)" stroke-width="6.5"/>
        <path d="${d}" fill="none" stroke="#FFE9B8" stroke-width="1.6" opacity="${(0.25 + hash2(c + 7, r + 3) * 0.45).toFixed(2)}"/>`;
    }
  }

  const rnd = rng(20260611);
  let speckle = '';
  for (let i = 0; i < 170; i++) {
    const x = rnd() * SIZE, y = rnd() * SIZE, rr = 0.6 + rnd() * 1.8, o = 0.05 + rnd() * 0.3;
    for (const ox of [0, SIZE, -SIZE]) for (const oy of [0, SIZE, -SIZE])
      speckle += `<circle cx="${(x + ox).toFixed(1)}" cy="${(y + oy).toFixed(1)}" r="${rr.toFixed(1)}" fill="#F4D58D" opacity="${o.toFixed(2)}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <linearGradient id="seam" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F4D58D"/><stop offset="0.5" stop-color="#C9962E"/><stop offset="1" stop-color="#8C6420"/>
    </linearGradient>
    <linearGradient id="scuff" x1="0" y1="0" x2="1" y2="0.4">
      <stop offset="0" stop-color="#F4D58D"/><stop offset="1" stop-color="#F4D58D" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="#0A0E1C"/>
  ${cells}${speckle}
</svg>`;
}

/* ------------------------------------------------------------------ */
/* hero-stadium.png — cinematic gold stadium bowl, 21:9                */
/* ------------------------------------------------------------------ */
function stadiumSVG() {
  const W = 2520, H = 1080;
  const rnd = rng(48104);
  let stars = '';
  for (let i = 0; i < 150; i++) {
    stars += `<circle cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * H * 0.55).toFixed(0)}" r="${(0.5 + rnd() * 1.4).toFixed(1)}" fill="#F4D58D" opacity="${(0.08 + rnd() * 0.4).toFixed(2)}"/>`;
  }
  let lights = '', beams = '';
  for (let i = 0; i < 46; i++) {
    const t = i / 45, x = 180 + t * (W - 360);
    const y = 392 - Math.sin(t * Math.PI) * 150;
    lights += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="5" fill="#FFF3D6"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="16" fill="url(#bulb)"/>`;
    if (i % 5 === 2) beams += `<path d="M${x} ${y} L${x - 130} ${H} L${x + 130} ${H} Z" fill="url(#beam)"/>`;
  }
  let tiers = '';
  for (let t = 0; t < 5; t++) {
    const ry = 235 + t * 64;
    tiers += `<ellipse cx="${W / 2}" cy="${620 + t * 26}" rx="${980 + t * 210}" ry="${ry}" fill="none" stroke="url(#tier)" stroke-width="${13 + t * 5}" opacity="${0.5 - t * 0.07}"/>`;
  }
  let crowd = '';
  for (let i = 0; i < 1500; i++) {
    const a = rnd() * Math.PI, rr = 0.82 + rnd() * 0.36;
    const x = W / 2 + Math.cos(a + Math.PI) * 1050 * rr;
    const y = 600 - Math.sin(a) * 250 * rr + rnd() * 30;
    if (y < 250 || y > 660) continue;
    crowd += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="1.5" fill="${rnd() < 0.16 ? '#F4D58D' : '#2A2F45'}" opacity="${(0.25 + rnd() * 0.5).toFixed(2)}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#04050B"/><stop offset="0.55" stop-color="#0A0D18"/><stop offset="1" stop-color="#141022"/>
    </linearGradient>
    <linearGradient id="tier" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#8C6420"/><stop offset="0.5" stop-color="#F4D58D"/><stop offset="1" stop-color="#8C6420"/>
    </linearGradient>
    <radialGradient id="bulb"><stop offset="0" stop-color="#FFE9B8" stop-opacity="0.9"/><stop offset="1" stop-color="#FFE9B8" stop-opacity="0"/></radialGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F4D58D" stop-opacity="0.28"/><stop offset="1" stop-color="#F4D58D" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="pitchGlow" cx="0.5" cy="0.62"><stop offset="0" stop-color="#C9962E" stop-opacity="0.55"/><stop offset="0.55" stop-color="#5E4514" stop-opacity="0.22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.72"/></radialGradient>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${stars}
  <g filter="url(#soft)">${tiers}</g>
  ${tiers}${crowd}${beams}${lights}
  <ellipse cx="${W / 2}" cy="905" rx="1240" ry="330" fill="url(#pitchGlow)"/>
  <ellipse cx="${W / 2}" cy="965" rx="960" ry="205" fill="#0F1A14"/>
  <ellipse cx="${W / 2}" cy="965" rx="960" ry="205" fill="url(#pitchGlow)" opacity="0.65"/>
  <ellipse cx="${W / 2}" cy="965" rx="190" ry="48" fill="none" stroke="#EFE6CF" stroke-width="3" opacity="0.4"/>
  <line x1="${W / 2}" y1="775" x2="${W / 2}" y2="1080" stroke="#EFE6CF" stroke-width="3" opacity="0.35"/>
  <ellipse cx="${W / 2}" cy="760" rx="1300" ry="120" fill="#C9962E" opacity="0.08" filter="url(#soft)"/>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* hosts-triptych.png — three stacked 1600x900 host scenes             */
/* ------------------------------------------------------------------ */
function triptychSVG() {
  const W = 1600, PH = 900;

  const aurora = (colors, seed, oy) => {
    const rnd = rng(seed);
    let out = '';
    for (let i = 0; i < 9; i++) {
      const c = colors[i % colors.length];
      const y0 = oy + 60 + rnd() * 330;
      const amp = 90 + rnd() * 160;
      out += `<path d="M-100 ${y0} C ${W * 0.3} ${y0 - amp}, ${W * 0.55} ${y0 + amp}, ${W + 100} ${y0 - amp * 0.5}"
        fill="none" stroke="${c}" stroke-width="${(26 + rnd() * 58).toFixed(0)}" stroke-linecap="round"
        opacity="${(0.1 + rnd() * 0.16).toFixed(2)}" filter="url(#blur24)"/>`;
    }
    return out;
  };
  const starfield = (seed, oy) => {
    const rnd = rng(seed);
    let out = '';
    for (let i = 0; i < 90; i++)
      out += `<circle cx="${(rnd() * W).toFixed(0)}" cy="${(oy + rnd() * 470).toFixed(0)}" r="${(0.5 + rnd() * 1.3).toFixed(1)}" fill="#F4D58D" opacity="${(0.1 + rnd() * 0.45).toFixed(2)}"/>`;
    return out;
  };
  const bowl = (oy, ry, glow) => `
    <ellipse cx="${W / 2}" cy="${oy + 700}" rx="560" ry="${ry}" fill="#0B0F1C" stroke="url(#goldL)" stroke-width="6"/>
    <ellipse cx="${W / 2}" cy="${oy + 672}" rx="500" ry="${ry * 0.82}" fill="none" stroke="url(#goldL)" stroke-width="3.5" opacity="0.7"/>
    <ellipse cx="${W / 2}" cy="${oy + 645}" rx="436" ry="${ry * 0.64}" fill="none" stroke="url(#goldL)" stroke-width="2.5" opacity="0.5"/>
    <ellipse cx="${W / 2}" cy="${oy + 700}" rx="330" ry="60" fill="${glow}" opacity="0.5" filter="url(#blur24)"/>
    <g>${Array.from({ length: 26 }, (_, i) => {
      const x = W / 2 - 530 + (i * 1060) / 25;
      return `<circle cx="${x.toFixed(0)}" cy="${(oy + 700 - ry * Math.sin(Math.acos(Math.min(1, Math.abs(x - W / 2) / 560))) * 0.96).toFixed(0)}" r="3.4" fill="#FFF3D6"/>`;
    }).join('')}</g>`;

  /* USA — navy night, red/white/blue light trails, skyline */
  const rndU = rng(76);
  let skyline = '';
  for (let i = 0; i < 26; i++) {
    const bw = 26 + rndU() * 58, bh = 70 + rndU() * 200, x = i * (W / 26);
    skyline += `<rect x="${x.toFixed(0)}" y="${(560 - bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" fill="#0A0E1A"/>`;
    for (let wnd = 0; wnd < 7; wnd++)
      if (rndU() < 0.5) skyline += `<rect x="${(x + 6 + rndU() * (bw - 12)).toFixed(0)}" y="${(566 - bh + rndU() * (bh - 30)).toFixed(0)}" width="3.5" height="5" fill="#F4D58D" opacity="${(0.3 + rndU() * 0.6).toFixed(2)}"/>`;
  }
  const usa = `
    <rect y="0" width="${W}" height="${PH}" fill="url(#skyA)"/>
    ${starfield(11, 0)}${aurora(['#B22234', '#E8ECF4', '#3C5DA8'], 21, 0)}
    ${skyline}${bowl(0, 170, '#C9962E')}
    <ellipse cx="${W / 2}" cy="868" rx="760" ry="120" fill="#C9962E" opacity="0.12" filter="url(#blur24)"/>`;

  /* MEXICO — green/white/red aurora, sun-stone ring over round bowl */
  let stone = '';
  for (let i = 0; i < 4; i++)
    stone += `<circle cx="${W / 2}" cy="${PH + 310}" r="${150 + i * 52}" fill="none" stroke="#F4D58D" stroke-width="${7 - i}" opacity="${0.34 - i * 0.06}" stroke-dasharray="${10 + i * 14} ${7 + i * 9}"/>`;
  const mex = `
    <rect y="${PH}" width="${W}" height="${PH}" fill="url(#skyB)"/>
    ${starfield(22, PH)}${aurora(['#1E7A45', '#E8ECF4', '#C0392B'], 33, PH)}
    ${stone}${bowl(PH, 190, '#1E7A45')}
    <ellipse cx="${W / 2}" cy="${PH + 868}" rx="760" ry="120" fill="#C0392B" opacity="0.1" filter="url(#blur24)"/>`;

  /* CANADA — red/white streaks, gold maple leaf, pines, snow */
  const rndC = rng(99);
  let pines = '';
  for (let i = 0; i < 30; i++) {
    const x = rndC() * W, h = 60 + rndC() * 130, bw = h * 0.46;
    pines += `<path d="M${x.toFixed(0)} ${(2 * PH + 700 - h).toFixed(0)} l${(bw / 2).toFixed(0)} ${h.toFixed(0)} h-${bw.toFixed(0)} Z" fill="#070A12" opacity="0.95"/>`;
  }
  let snow = '';
  for (let i = 0; i < 70; i++)
    snow += `<circle cx="${(rndC() * W).toFixed(0)}" cy="${(2 * PH + rndC() * 800).toFixed(0)}" r="${(0.8 + rndC() * 1.6).toFixed(1)}" fill="#E8ECF4" opacity="${(0.15 + rndC() * 0.4).toFixed(2)}"/>`;
  const leaf = `<g transform="translate(${W / 2},${2 * PH + 235}) scale(5.6)" filter="url(#blur4)" opacity="0.85">
      <path d="M0,-26 L5,-13 L15,-17 L11,-6 L22,-2 L13,5 L17,15 L6,12 L4,24 L0,15 L-4,24 L-6,12 L-17,15 L-13,5 L-22,-2 L-11,-6 L-15,-17 L-5,-13 Z"
        fill="none" stroke="#F4D58D" stroke-width="1.6"/>
      <path d="M0,-26 L5,-13 L15,-17 L11,-6 L22,-2 L13,5 L17,15 L6,12 L4,24 L0,15 L-4,24 L-6,12 L-17,15 L-13,5 L-22,-2 L-11,-6 L-15,-17 L-5,-13 Z"
        fill="#F4D58D" opacity="0.1"/></g>`;
  const can = `
    <rect y="${2 * PH}" width="${W}" height="${PH}" fill="url(#skyC)"/>
    ${starfield(44, 2 * PH)}${aurora(['#C0392B', '#E8ECF4', '#C0392B'], 55, 2 * PH)}
    ${leaf}${pines}${bowl(2 * PH, 165, '#C0392B')}${snow}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${PH * 3}" viewBox="0 0 ${W} ${PH * 3}">
  <defs>
    <linearGradient id="skyA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04060D"/><stop offset="1" stop-color="#101426"/></linearGradient>
    <linearGradient id="skyB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070C"/><stop offset="1" stop-color="#1A1410"/></linearGradient>
    <linearGradient id="skyC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05060E"/><stop offset="1" stop-color="#140D14"/></linearGradient>
    <linearGradient id="goldL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8C6420"/><stop offset="0.5" stop-color="#F4D58D"/><stop offset="1" stop-color="#8C6420"/></linearGradient>
    <filter id="blur24" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24"/></filter>
    <filter id="blur4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>
  ${usa}${mex}${can}
</svg>`;
}

async function ensure(file, svg, label) {
  const out = join(ASSETS, file);
  if (existsSync(out)) {
    console.log(`• ${file} already present — keeping yours`);
    return;
  }
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
  console.log(`+ generated placeholder ${label} → public/assets/${file}`);
}

await ensure('hero-ball-texture.png', ballTextureSVG(), 'ball texture');
await ensure('hero-stadium.png', stadiumSVG(), 'hero stadium');
await ensure('hosts-triptych.png', triptychSVG(), 'hosts triptych');
console.log('Placeholder pass complete.');
