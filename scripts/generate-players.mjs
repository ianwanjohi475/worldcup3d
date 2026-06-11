/**
 * Generates cinematic, stylised player posters for every star in the
 * field — dark stadium bokeh, backlit action figure with team-colour
 * rim light, glowing jersey number. These are ORIGINAL stylised poster
 * renders (abstract figures, not photographic likenesses).
 *
 * Output: /public/assets/player-{img}.png  (2:3, 800x1200)
 * Never overwrites a file that already exists, so real artwork you drop
 * in always wins. Run: `node scripts/generate-players.mjs [--force] [--montage]`
 */
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { TEAMS } from '../src/data/teams.js';

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets');
mkdirSync(ASSETS, { recursive: true });
const FORCE = process.argv.includes('--force');
const MONTAGE = process.argv.includes('--montage');

const W = 800, H = 1200;

/* team kit colours: [primary, secondary/rim] -------------------------------- */
const KIT = {
  mex: ['#0B6E4F', '#E7402A'], sui: ['#D52B1E', '#ffffff'], egy: ['#C8102E', '#ffffff'],
  nzl: ['#101820', '#ffffff'], can: ['#D80621', '#ffffff'], cro: ['#E7402A', '#1F4FA8'],
  civ: ['#FF8200', '#0E9C49'], qat: ['#8A1538', '#ffffff'], bra: ['#FFDF00', '#1E9C46'],
  aut: ['#D52B1E', '#ffffff'], tun: ['#E70013', '#ffffff'], jor: ['#0E7C3A', '#CE1126'],
  usa: ['#1A3A6B', '#C8102E'], ita: ['#1B4DA0', '#ffffff'], alg: ['#0E9C49', '#D21034'],
  cuw: ['#002B7F', '#F9E814'], esp: ['#C8102E', '#FFC400'], uru: ['#5AA0E0', '#101820'],
  gha: ['#0E9C49', '#FCD116'], irq: ['#0E7C3A', '#ffffff'], fra: ['#1F2C5C', '#C8102E'],
  kor: ['#C8102E', '#1F4FA8'], sco: ['#1F4FA8', '#ffffff'], cpv: ['#1A3A8F', '#E7402A'],
  eng: ['#ffffff', '#C8102E'], ecu: ['#FFD200', '#D21034'], nor: ['#BA0C2F', '#1F2C5C'],
  hai: ['#1A3A8F', '#D21034'], arg: ['#7AB6E6', '#ffffff'], den: ['#C8102E', '#ffffff'],
  rsa: ['#0E9C49', '#FFB81C'], uzb: ['#0099B5', '#ffffff'], por: ['#A50021', '#0E7C3A'],
  col: ['#FCD116', '#0033A0'], tur: ['#E30A17', '#ffffff'], pan: ['#072357', '#D21034'],
  ned: ['#EA5B13', '#ffffff'], jpn: ['#0B1E69', '#ffffff'], pol: ['#ffffff', '#DC143C'],
  cod: ['#007FFF', '#F7D618'], ger: ['#101820', '#D52B1E'], mar: ['#C1272D', '#0E7C3A'],
  aus: ['#1E9C46', '#FFD200'], ksa: ['#0E7C3A', '#ffffff'], bel: ['#C8102E', '#FFD200'],
  sen: ['#0E9C49', '#FCD116'], irn: ['#D52B1E', '#ffffff'], par: ['#D21034', '#0033A0'],
};

/* deterministic RNG so each poster is stable across rebuilds ----------------- */
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const seedOf = (id) => [...id].reduce((a, c) => a + c.charCodeAt(0), 7) * 2654435761;
const rngPick = (team) => (seedOf(team.id) % 100) / 100 < 0.5;

/* ---- figure built from "bones": thick round-capped strokes ---------------- */
/* joints in a 360 x 560 local box, feet near y=540 -------------------------- */
/* Poses are designed around a planted foot at stanceY so the figure
   stands upright and grounded; dynamic limbs extend from there. */
const POSES = {
  // mid-stride run: front foot planted, back leg driving up behind
  stride: {
    head: [196, 70], neck: [194, 116],
    shoulderB: [172, 132], elbowB: [140, 100], wristB: [120, 64],
    shoulderF: [216, 134], elbowF: [250, 168], wristF: [232, 206],
    hip: [186, 286],
    kneeF: [178, 392], ankleF: [186, 500], toeF: [220, 504],
    kneeB: [232, 330], ankleB: [304, 348], toeB: [336, 340],
    stanceY: 500,
  },
  // striking a ball: back foot planted, kicking leg swung through low
  strike: {
    head: [168, 78], neck: [172, 124],
    shoulderB: [150, 140], elbowB: [112, 124], wristB: [78, 150],
    shoulderF: [194, 138], elbowF: [232, 122], wristF: [264, 138],
    hip: [182, 290],
    kneeB: [176, 396], ankleB: [168, 500], toeB: [146, 504],
    kneeF: [240, 330], ankleF: [300, 356], toeF: [332, 366],
    ball: [330, 476, 30], stanceY: 500,
  },
  // close control: sole resting on the ball, balanced and poised
  control: {
    head: [178, 76], neck: [180, 122],
    shoulderB: [158, 138], elbowB: [122, 168], wristB: [98, 210],
    shoulderF: [202, 138], elbowF: [238, 166], wristF: [220, 206],
    hip: [186, 288],
    kneeB: [176, 394], ankleB: [172, 500], toeB: [150, 504],
    kneeF: [232, 372], ankleF: [286, 430], toeF: [318, 452],
    ball: [318, 478, 30], stanceY: 500,
  },
  // celebration: arms spread wide, head up (the hero pose)
  celebrate: {
    head: [182, 78], neck: [182, 126],
    shoulderB: [158, 142], elbowB: [110, 120], wristB: [62, 92],
    shoulderF: [206, 142], elbowF: [254, 120], wristF: [302, 92],
    hip: [182, 296],
    kneeB: [166, 398], ankleB: [168, 502], toeB: [150, 506],
    kneeF: [206, 398], ankleF: [210, 502], toeF: [228, 506],
    stanceY: 502,
  },
  // full-stretch dive across the goal (handled with vertical centring)
  dive: {
    head: [96, 250], neck: [140, 252],
    shoulderB: [156, 256], elbowB: [196, 250], wristB: [236, 248],
    shoulderF: [150, 250], elbowF: [108, 222], wristF: [70, 196],
    hip: [236, 286],
    kneeB: [292, 312], ankleB: [350, 326], toeB: [380, 332],
    kneeF: [300, 272], ankleF: [356, 252], toeF: [384, 244],
    ball: [60, 150, 26], rotate: -6, dive: true,
  },
};

function bone(a, b, w) {
  return `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`;
}

/* Returns the figure as one bold silhouette path-set, drawn in `fill`.
   Thick round-capped bones + a filled torso read as a solid body. */
function figureShapes(P) {
  const sMid = [(P.shoulderF[0] + P.shoulderB[0]) / 2, (P.shoulderF[1] + P.shoulderB[1]) / 2];
  const torso = `<path d="M${P.shoulderB[0] - 14} ${P.shoulderB[1] - 4}
      Q${sMid[0]} ${sMid[1] - 22} ${P.shoulderF[0] + 14} ${P.shoulderF[1] - 4}
      L${P.hip[0] + 40} ${P.hip[1] + 6} Q${P.hip[0]} ${P.hip[1] + 26} ${P.hip[0] - 40} ${P.hip[1] + 6} Z"/>`;
  // bones, back-to-front, with athletic taper
  const limbs = [
    [P.shoulderB, P.elbowB, 38], [P.elbowB, P.wristB, 27],
    [P.hip, P.kneeB, 58], [P.kneeB, P.ankleB, 40], [P.ankleB, P.toeB, 26],
    [P.neck, sMid, 30],
    [P.hip, P.kneeF, 62], [P.kneeF, P.ankleF, 42], [P.ankleF, P.toeF, 28],
    [P.shoulderF, P.elbowF, 40], [P.elbowF, P.wristF, 28],
  ].map(([a, b, w]) => `<path d="${bone(a, b)}" stroke-width="${w}"/>`).join('');
  const head = `<path d="M${P.neck[0]} ${P.neck[1]} L${P.head[0]} ${P.head[1] + 20}" stroke-width="30"/>
    <circle cx="${P.head[0]}" cy="${P.head[1]}" r="40"/>`;
  const ball = P.ball ? `<circle cx="${P.ball[0]}" cy="${P.ball[1]}" r="${P.ball[2]}"/>` : '';
  return `<g fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${torso}${limbs}${head}${ball}</g>`;
}

function poster(team) {
  const [primary, rim] = KIT[team.id] || ['#C9962E', '#F4D58D'];
  const poseName = team.featured || ['messi', 'cr7', 'mbappe', 'son', 'lewandowski'].includes(team.star.img)
    ? 'celebrate' : ({ striker: 'strike', winger: 'control', keeper: 'dive' }[team.star.pose] || 'stride');
  // give wingers some run variety
  const pose = poseName === 'control' && rngPick(team) ? 'stride' : poseName;
  const P = POSES[pose];
  const rnd = rng([...team.id].reduce((a, c) => a + c.charCodeAt(0), 7) * 2654435761);

  // bokeh crowd lights
  let bokeh = '';
  for (let i = 0; i < 46; i++) {
    const x = rnd() * W, y = 120 + rnd() * 560, r = 6 + rnd() * 34;
    const c = rnd() < 0.3 ? rim : rnd() < 0.6 ? '#F4D58D' : '#C9962E';
    bokeh += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}" fill="${c}" opacity="${(0.04 + rnd() * 0.12).toFixed(3)}"/>`;
  }
  // embers
  let embers = '';
  for (let i = 0; i < 70; i++) {
    embers += `<circle cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * H).toFixed(0)}" r="${(0.6 + rnd() * 2.2).toFixed(1)}" fill="#F4D58D" opacity="${(0.1 + rnd() * 0.5).toFixed(2)}"/>`;
  }

  const SCALE = P.dive ? 1.62 : 1.92;
  const stanceY = P.stanceY || 300;
  const groundY = 1118;
  const ty = P.dive ? 300 : groundY - stanceY * SCALE;
  const tx = W / 2 - 182 * SCALE;
  const figTransform = `translate(${tx.toFixed(0)}, ${ty.toFixed(0)}) scale(${SCALE}) ${P.rotate ? `rotate(${P.rotate} 182 280) ` : ''}`;
  const shapes = figureShapes(P);
  const pivotY = P.dive ? 280 : 300;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg" cx="0.5" cy="0.32" r="0.9">
      <stop offset="0" stop-color="${primary}" stop-opacity="0.5"/>
      <stop offset="0.32" stop-color="#0B1020" stop-opacity="0.85"/>
      <stop offset="0.7" stop-color="#070A12"/>
      <stop offset="1" stop-color="#04050A"/>
    </radialGradient>
    <linearGradient id="spot" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0" stop-color="${rim}" stop-opacity="0.5"/>
      <stop offset="0.5" stop-color="${rim}" stop-opacity="0.06"/>
      <stop offset="1" stop-color="${rim}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="num" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#F4D58D"/><stop offset="0.55" stop-color="#C9962E"/><stop offset="1" stop-color="#8C6420"/>
    </linearGradient>
    <linearGradient id="bodyfill" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#10131F"/><stop offset="1" stop-color="#04050A"/>
    </linearGradient>
    <linearGradient id="floor" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0" stop-color="${rim}" stop-opacity="0.22"/><stop offset="1" stop-color="${rim}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.72"/>
    </radialGradient>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="22"/></filter>
    <filter id="halo" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>

  <rect width="${W}" height="${H}" fill="#05060B"/>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g filter="url(#soft)">${bokeh}</g>
  <path d="M${W / 2 - 150} 0 L${W / 2 + 150} 0 L${W / 2 + 360} ${H} L${W / 2 - 360} ${H} Z" fill="url(#spot)"/>

  <!-- baked jersey number, large + faint, bleeding off the right edge -->
  <g transform="translate(602 392) scale(0.8 1) translate(-602 -392)">
    <text x="602" y="540" font-family="DejaVu Sans, sans-serif" font-weight="bold"
      font-size="500" text-anchor="middle" fill="url(#num)" opacity="0.17"
      letter-spacing="-20">${team.star.no}</text>
  </g>

  <!-- floor glow + contact shadow -->
  <ellipse cx="${W / 2}" cy="1110" rx="320" ry="62" fill="url(#floor)"/>
  <ellipse cx="${W / 2}" cy="1104" rx="180" ry="24" fill="#000" opacity="0.6" filter="url(#halo)"/>

  <!-- figure: soft team-colour halo, sharp rim base, dark body inset to leave a backlit rim -->
  <g transform="${figTransform}">
    <g color="${rim}" filter="url(#halo)" opacity="0.55">${shapes}</g>
    <g color="${rim}">${shapes}</g>
    <g color="#06070D" transform="translate(-7 -5) translate(182 ${pivotY}) scale(0.955) translate(-182 -${pivotY})">${shapes}</g>
    <path transform="translate(-5 -3)" fill="${primary}" opacity="0.42"
      d="M${P.shoulderB[0] - 4} ${P.shoulderB[1] + 6} Q182 ${P.neck[1] + 8} ${P.shoulderF[0] + 4} ${P.shoulderF[1] + 6} L${P.hip[0] + 26} ${P.hip[1] - 4} Q182 ${P.hip[1] + 8} ${P.hip[0] - 26} ${P.hip[1] - 4} Z"/>
  </g>

  ${embers}
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
  <rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="18" fill="none" stroke="${rim}" stroke-width="1.5" opacity="0.12"/>
</svg>`;
  return svg;
}

/* --------------------------------------------------------------------------- */
const targets = TEAMS.map((t) => ({ team: t, file: `player-${t.star.img}.png` }));
let made = 0, kept = 0;
const previews = [];

for (const { team, file } of targets) {
  const out = join(ASSETS, file);
  if (existsSync(out) && !FORCE) { kept++; continue; }
  const buf = await sharp(Buffer.from(poster(team))).png({ compressionLevel: 9 }).toBuffer();
  await sharp(buf).toFile(out);
  if (MONTAGE && previews.length < 8) previews.push(buf);
  made++;
}
console.log(`players: generated ${made}, kept ${kept} existing`);

if (MONTAGE && previews.length) {
  const tw = 220, th = 330;
  const thumbs = await Promise.all(previews.map((b) => sharp(b).resize(tw, th).toBuffer()));
  const cols = 4;
  const rows = Math.ceil(thumbs.length / cols);
  await sharp({ create: { width: tw * cols, height: th * rows, channels: 3, background: '#05060B' } })
    .composite(thumbs.map((input, i) => ({ input, left: (i % cols) * tw, top: ((i / cols) | 0) * th })))
    .png().toFile(join(ASSETS, '..', '..', 'shots', 'players-montage.png'));
  console.log('wrote shots/players-montage.png');
}
