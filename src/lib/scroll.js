import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './utils.js';

gsap.registerPlugin(ScrollTrigger);

export let lenis = null;

export function initScroll() {
  const reduced = prefersReducedMotion();

  if (!reduced) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.05 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* thin gold scroll-progress bar */
  const bar = document.getElementById('progress-bar');
  ScrollTrigger.create({
    start: 0,
    end: () => document.documentElement.scrollHeight - innerHeight,
    onUpdate: (self) => { bar.style.transform = `scaleX(${self.progress})`; },
  });

  /* glassy nav after the fold */
  const nav = document.getElementById('nav');
  ScrollTrigger.create({
    start: 80,
    onToggle: (self) => nav.classList.toggle('is-scrolled', self.isActive),
  });

  /* anchor links through lenis */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -20, duration: 1.6 });
      else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* clip-path section reveals — never plain fades */
  if (!reduced) {
    document.querySelectorAll('[data-reveal]').forEach((node) => {
      gsap.to(node, {
        clipPath: 'inset(0% 0% -2% 0%)',
        duration: 1.15,
        ease: 'power4.out',
        scrollTrigger: { trigger: node, start: 'top 86%', once: true },
      });
    });
  }
}
