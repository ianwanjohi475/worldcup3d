import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../lib/utils.js';

/** Gold divider draws itself in as the footer enters. */
export function initFooter() {
  const divider = document.querySelector('.footer__divider');
  if (prefersReducedMotion()) {
    divider.style.transform = 'scaleX(1)';
    return;
  }
  gsap.to(divider, {
    scaleX: 1,
    duration: 1.4,
    ease: 'power4.inOut',
    scrollTrigger: { trigger: '.footer', start: 'top 92%', once: true },
  });
  gsap.from('.footer__inner > *', {
    y: 22,
    autoAlpha: 0,
    stagger: 0.08,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.footer', start: 'top 86%', once: true },
  });
}
