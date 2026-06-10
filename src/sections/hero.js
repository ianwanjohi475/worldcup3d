import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initHeroBall } from '../three/heroBall.js';
import { prefersReducedMotion } from '../lib/utils.js';

const KICKOFF = new Date('2026-06-11T20:00:00-06:00'); // Estadio Azteca, opening match

export function initHero() {
  const reduced = prefersReducedMotion();

  /* ---- 3D ball ---- */
  const ballScene = initHeroBall(document.getElementById('hero-canvas'));

  /* ---- split headline into letters (kept hidden until reveal) ---- */
  document.querySelectorAll('.hero__line').forEach((line) => {
    const text = line.dataset.line;
    line.innerHTML = [...text]
      .map((ch) => (ch === ' ' ? '<span class="ltr">&nbsp;</span>' : `<span class="ltr">${ch}</span>`))
      .join('');
  });

  /* ---- countdown ---- */
  const cd = {
    d: document.querySelector('[data-cd="d"]'),
    h: document.querySelector('[data-cd="h"]'),
    m: document.querySelector('[data-cd="m"]'),
    s: document.querySelector('[data-cd="s"]'),
  };
  const pad = (n) => String(n).padStart(2, '0');
  const updateCountdown = () => {
    const diff = KICKOFF.getTime() - Date.now();
    if (diff <= 0) {
      document.querySelectorAll('#countdown .chip').forEach((c) => c.classList.add('chip--live'));
      cd.d.textContent = 'ON';
      cd.h.textContent = 'AIR';
      cd.m.textContent = pad(new Date().getMinutes());
      cd.s.textContent = pad(new Date().getSeconds());
      document.querySelector('.hero__kickoff').textContent = 'The tournament is live — the world is watching';
      return;
    }
    cd.d.textContent = pad(Math.floor(diff / 86400000));
    cd.h.textContent = pad(Math.floor(diff / 3600000) % 24);
    cd.m.textContent = pad(Math.floor(diff / 60000) % 60);
    cd.s.textContent = pad(Math.floor(diff / 1000) % 60);
  };
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---- scroll-linked ball drift ---- */
  if (!reduced) {
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => ballScene.setScroll(self.progress),
    });
    gsap.to('.hero__backdrop img', {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  return {
    /** intro choreography, fired right after the preloader clears */
    enter() {
      if (reduced) return;
      const tl = gsap.timeline({ delay: 0.05 });
      tl.to('.hero__line .ltr', {
        y: 0,
        duration: 1.05,
        ease: 'power4.out',
        stagger: 0.035,
      })
        .from('.hero__kicker', { autoAlpha: 0, x: -28, duration: 0.7, ease: 'power3.out' }, '-=0.7')
        .from('.hero__sub', { autoAlpha: 0, y: 22, duration: 0.7, ease: 'power3.out' }, '-=0.55')
        .from('#countdown .chip', { autoAlpha: 0, y: 24, stagger: 0.07, duration: 0.6, ease: 'power3.out' }, '-=0.45')
        .from('.hero__kickoff', { autoAlpha: 0, duration: 0.6 }, '-=0.4')
        .from('.hero__cta .btn', { autoAlpha: 0, y: 22, stagger: 0.1, duration: 0.6, ease: 'power3.out' }, '-=0.45')
        .from('.hero__scrollcue', { autoAlpha: 0, duration: 0.8 }, '-=0.3');
    },
  };
}

/* keep the letters parked below their line until the intro runs */
export function primeHeroLetters() {
  if (prefersReducedMotion()) {
    document.querySelectorAll('.hero__line .ltr').forEach((l) => (l.style.transform = 'none'));
  }
}
