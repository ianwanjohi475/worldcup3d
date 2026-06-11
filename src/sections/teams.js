import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TEAMS } from '../data/teams.js';
import { flagSVG } from '../lib/flags.js';
import { icon } from '../lib/icons.js';
import { el, imageExists, prefersReducedMotion, isMobile, asset } from '../lib/utils.js';
import { initTilt } from '../lib/cursor.js';

/* ------------------------------------------------------------------ */
/* Abstract player silhouettes — reusable poses, drawn with thick      */
/* round-cap strokes so they read as deliberate concept art.           */
/* ------------------------------------------------------------------ */
const POSES = {
  /* leaning back, leg swung to chest height for the volley */
  striker: `
    <circle cx="84" cy="46" r="11.5" class="sil-head"/>
    <path class="sil" d="M88 62 C94 78 96 94 92 110"/>
    <path class="sil" d="M90 72 C74 78 62 72 54 56"/>
    <path class="sil" d="M92 74 C108 72 120 62 126 46"/>
    <path class="sil" d="M92 110 C86 134 78 158 70 184"/>
    <path class="sil sil-thin" d="M70 184 L62 198"/>
    <path class="sil" d="M94 108 C116 110 136 100 150 80"/>
    <circle cx="164" cy="62" r="12" class="sil-ball"/>`,
  /* deep forward lean, arms pumping, ball pushed ahead */
  winger: `
    <circle cx="124" cy="38" r="11.5" class="sil-head"/>
    <path class="sil" d="M118 52 C106 66 98 82 94 100"/>
    <path class="sil" d="M112 62 C124 72 130 84 128 98"/>
    <path class="sil" d="M110 62 C96 60 84 50 80 34"/>
    <path class="sil" d="M94 100 C112 112 126 130 132 154"/>
    <path class="sil" d="M92 100 C76 114 64 132 58 156"/>
    <path class="sil sil-thin" d="M132 154 L138 170"/>
    <circle cx="160" cy="196" r="12" class="sil-ball"/>`,
  /* full-stretch dive toward the top corner */
  keeper: `
    <circle cx="66" cy="98" r="11.5" class="sil-head"/>
    <path class="sil" d="M78 102 C98 104 116 110 132 120"/>
    <path class="sil" d="M72 90 C60 72 52 56 50 38"/>
    <path class="sil" d="M84 94 C74 76 68 60 68 42"/>
    <path class="sil" d="M132 120 C148 130 160 144 166 162"/>
    <path class="sil" d="M130 122 C138 138 138 156 130 172"/>
    <circle cx="44" cy="24" r="12" class="sil-ball"/>`,
};

function silhouetteSVG(team) {
  const uid = `sil-${team.id}`;
  return `
  <svg viewBox="0 0 200 240" aria-hidden="true">
    <defs>
      <linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#F4D58D"/><stop offset="0.6" stop-color="#C9962E"/><stop offset="1" stop-color="#8C6420"/>
      </linearGradient>
      <linearGradient id="${uid}-dim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="rgba(244,213,141,0.55)"/><stop offset="1" stop-color="rgba(140,100,32,0.25)"/>
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="222" rx="58" ry="7" fill="rgba(201,150,46,0.1)"/>
    <g stroke="url(#${uid})" stroke-width="11" stroke-linecap="round" fill="none"
       style="filter: drop-shadow(0 6px 18px rgba(201,150,46,0.25))">
      ${POSES[team.star.pose] || POSES.striker}
    </g>
    <style>
      .sil-head { fill: url(#${uid}); stroke: none; }
      .sil-ball { fill: rgba(244,213,141,0.08); stroke: url(#${uid}-dim); stroke-width: 4; }
      .sil-thin { stroke-width: 8; }
    </style>
  </svg>`;
}

/* ------------------------------------------------------------------ */
/* Gold particle drift inside fallback cards (tiny canvas, IO-gated)   */
/* ------------------------------------------------------------------ */
function attachParticles(canvas) {
  if (prefersReducedMotion()) return;
  const ctx = canvas.getContext('2d');
  const N = isMobile() ? 10 : 16;
  let parts = null;
  let raf = 0;
  let running = false;

  const size = () => {
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.max(2, r.width | 0);
    canvas.height = Math.max(2, r.height | 0);
  };
  const spawn = () => Array.from({ length: N }, () => ({
    x: Math.random() * canvas.width,
    y: canvas.height + Math.random() * canvas.height,
    r: 0.6 + Math.random() * 1.7,
    v: 6 + Math.random() * 14,
    drift: (Math.random() - 0.5) * 8,
    a: 0.1 + Math.random() * 0.5,
    tw: Math.random() * Math.PI * 2,
  }));

  let last = 0;
  const frame = (t) => {
    if (!running) return;
    const dt = Math.min((t - last) / 1000, 0.05);
    last = t;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of parts) {
      p.y -= p.v * dt;
      p.x += p.drift * dt;
      p.tw += dt * 2.2;
      if (p.y < -6) { p.y = canvas.height + 8; p.x = Math.random() * canvas.width; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(244, 213, 141, ${(p.a * (0.55 + 0.45 * Math.sin(p.tw))).toFixed(3)})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  };
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) {
      running = true;
      if (!parts) { size(); parts = spawn(); }
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (!e.isIntersecting && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  }, { rootMargin: '60px' });
  io.observe(canvas);
}

/* ------------------------------------------------------------------ */
/* The card component                                                  */
/* ------------------------------------------------------------------ */
const ratingsHTML = (team) => `
  <div class="tcard__ratings">
    <div class="rating">ATK<span class="rating__bar"><span class="rating__fill" data-val="${team.atk}"></span></span><b>${team.atk}</b></div>
    <div class="rating">DEF<span class="rating__bar"><span class="rating__fill" data-val="${team.def}"></span></span><b>${team.def}</b></div>
    <div class="rating rating--ovr">OVR<span class="rating__bar"><span class="rating__fill" data-val="${team.ovr}"></span></span><b>${team.ovr}</b></div>
  </div>`;

const infoHTML = (team) => `
  <div class="tcard__info">
    <div class="tcard__id">
      ${flagSVG(team.id)}
      <span class="tcard__names">
        <span class="tcard__player">${team.star.name}</span>
        <span class="tcard__nation">${team.name} · Group ${team.group}</span>
      </span>
      <span class="tcard__num-chip">${team.star.no}</span>
    </div>
    ${ratingsHTML(team)}
  </div>`;

export async function createTeamCard(team, { featured = false } = {}) {
  const src = asset(`assets/player-${team.star.img}.png`);
  const hasArt = await imageExists(src);

  const card = el(`
    <article class="tcard ${featured ? 'tcard--featured' : ''}" id="team-${team.id}" data-tilt data-cursor>
      ${featured ? `<span class="tcard__tag">${icon('star', { size: 11 })}Featured</span>` : ''}
    </article>
  `);

  if (hasArt) {
    card.insertAdjacentHTML('beforeend', `
      <div class="tcard__media"><img src="${src}" alt="${team.star.name} poster" loading="lazy" /></div>
      <div class="tcard__holo" aria-hidden="true"></div>
      <div class="tcard__sheen"></div>
      ${infoHTML(team)}
    `);
    const holo = card.querySelector('.tcard__holo');
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      holo.style.setProperty('--hx', `${((e.clientX - r.left) / r.width) * 100}%`);
      holo.style.setProperty('--hy', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  } else {
    card.insertAdjacentHTML('beforeend', `
      <canvas class="tcard__canvas" aria-hidden="true"></canvas>
      <span class="tcard__bignum">${team.star.no}</span>
      <div class="tcard__silhouette">${silhouetteSVG(team)}</div>
      <div class="tcard__sheen"></div>
      ${infoHTML(team)}
    `);
    attachParticles(card.querySelector('.tcard__canvas'));
  }
  return card;
}

/* ------------------------------------------------------------------ */
export async function initTeams() {
  const featuredWrap = document.getElementById('teams-featured');
  const grid = document.getElementById('teams-grid');

  const featured = TEAMS.filter((t) => t.featured);
  const rest = TEAMS.filter((t) => !t.featured);

  const [featCards, restCards] = await Promise.all([
    Promise.all(featured.map((t) => createTeamCard(t, { featured: true }))),
    Promise.all(rest.map((t) => createTeamCard(t))),
  ]);
  featCards.forEach((c) => featuredWrap.appendChild(c));
  restCards.forEach((c) => grid.appendChild(c));

  initTilt(featuredWrap.parentElement);

  /* rating bars + card entrances on scroll */
  const reduced = prefersReducedMotion();
  document.querySelectorAll('.tcard').forEach((cardEl) => {
    const fills = cardEl.querySelectorAll('.rating__fill');
    ScrollTrigger.create({
      trigger: cardEl,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        fills.forEach((f, i) => {
          gsap.to(f, {
            width: `${f.dataset.val}%`,
            duration: reduced ? 0 : 1.1,
            delay: reduced ? 0 : 0.15 + i * 0.12,
            ease: 'power3.out',
          });
        });
        if (!reduced) {
          gsap.fromTo(cardEl,
            { y: 34, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out' });
        }
      },
    });
  });
}
