import { gsap } from 'gsap';
import { prefersReducedMotion, asset } from '../lib/utils.js';

/**
 * Percentage ticker + the ball assembling from gold panels (SVG),
 * capped at 2s, then a clip-path reveal into the hero.
 * Resolves when the curtain is gone.
 */
export function runPreloader() {
  return new Promise((resolve) => {
    const root = document.getElementById('preloader');
    const pctEl = document.getElementById('preloader-pct');
    const panelsG = document.getElementById('preloader-panels');
    const reduced = prefersReducedMotion();

    document.body.classList.add('is-locked');

    /* build hex panels scattered, to be assembled into the ball */
    const panels = [];
    const ringR = 64;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const tx = Math.cos(a) * ringR * (i % 2 ? 0.62 : 1);
      const ty = Math.sin(a) * ringR * (i % 2 ? 0.62 : 1);
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const s = 17;
      let d = '';
      for (let k = 0; k < 6; k++) {
        const ang = Math.PI / 6 + (k * Math.PI) / 3;
        d += `${k ? 'L' : 'M'}${(s * Math.cos(ang)).toFixed(1)},${(s * Math.sin(ang)).toFixed(1)}`;
      }
      p.setAttribute('d', `${d}Z`);
      p.setAttribute('fill', i % 3 ? '#0D1428' : 'rgba(201,150,46,0.22)');
      p.setAttribute('stroke', 'url(#plgold)');
      p.setAttribute('stroke-width', '1.6');
      p.setAttribute('transform', `translate(${tx},${ty})`);
      p.dataset.tx = tx; p.dataset.ty = ty;
      panelsG.appendChild(p);
      panels.push(p);
    }

    /* preload the heavyweight images while the ticker runs */
    const sources = [
      'assets/hero-stadium.png',
      'assets/hero-ball-texture.png',
      'assets/host-usa.png',
      'assets/host-mexico.png',
      'assets/host-canada.png',
    ].map(asset);
    let loaded = 0;
    let real = 0;
    sources.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => { loaded++; real = loaded / sources.length; };
      img.src = src;
    });

    const state = { p: 0 };
    const started = performance.now();
    const MAX = reduced ? 250 : 2000;
    const MIN = reduced ? 0 : 950;

    const finish = () => {
      const tl = gsap.timeline({
        onComplete: () => {
          root.remove();
          document.body.classList.remove('is-locked');
          resolve();
        },
      });
      if (reduced) {
        tl.to(root, { autoAlpha: 0, duration: 0.05 });
        return;
      }
      tl.to(panels, {
        attr: { transform: (i) => `translate(${(Math.cos((i / 12) * Math.PI * 2) * 34).toFixed(1)},${(Math.sin((i / 12) * Math.PI * 2) * 34).toFixed(1)}) ` },
        duration: 0.55,
        ease: 'power3.inOut',
        stagger: 0.018,
      })
        .to('.preloader__ball', { scale: 0.88, transformOrigin: '50% 50%', duration: 0.4, ease: 'power2.inOut' }, '<0.2')
        .to('.preloader__meta', { y: 14, autoAlpha: 0, duration: 0.35 }, '<')
        .to(root, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.85,
          ease: 'power4.inOut',
        }, '+=0.08');
    };

    const tick = () => {
      const elapsed = performance.now() - started;
      const timeP = Math.min(1, elapsed / MAX);
      // progress follows real loads but is dragged forward by the clock
      const target = Math.max(timeP, Math.min(real, 1) * Math.min(1, elapsed / MIN));
      state.p += (target - state.p) * 0.14;
      const shown = Math.round(state.p * 100);
      pctEl.textContent = shown;

      // drift panels inward with progress
      if (!reduced) {
        panels.forEach((p, i) => {
          const f = 1 - state.p * 0.45;
          p.setAttribute('transform', `translate(${(p.dataset.tx * f).toFixed(1)},${(p.dataset.ty * f).toFixed(1)}) rotate(${(state.p * 60 + i * 4).toFixed(1)})`);
        });
      }
      if ((timeP >= 1) || (real >= 1 && elapsed >= MIN && state.p > 0.985)) {
        pctEl.textContent = '100';
        finish();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
