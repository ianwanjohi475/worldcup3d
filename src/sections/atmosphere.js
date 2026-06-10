import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../lib/utils.js';

/**
 * Stadium bowl scene — lazily initialised the first time the section
 * approaches the viewport — plus the animated stat counters.
 */
export function initAtmosphere() {
  const canvas = document.getElementById('stadium-canvas');
  const reduced = prefersReducedMotion();
  let scene = null;

  const io = new IntersectionObserver(async ([entry]) => {
    if (!entry.isIntersecting || scene) return;
    io.disconnect();
    const { initStadium } = await import('../three/stadium.js');
    scene = initStadium(canvas);
  }, { rootMargin: '400px' });
  io.observe(canvas);

  /* stat counters — count up once on entry */
  document.querySelectorAll('#atmo-stats .stat').forEach((stat, i) => {
    const numEl = stat.querySelector('.stat__num');
    const target = +stat.dataset.count;
    ScrollTrigger.create({
      trigger: stat,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        if (reduced) { numEl.textContent = target; return; }
        gsap.fromTo(stat, { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, delay: i * 0.08, ease: 'power3.out' });
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          delay: i * 0.08 + 0.2,
          ease: 'power3.out',
          onUpdate: () => { numEl.textContent = Math.round(obj.v); },
        });
      },
    });
  });
}
