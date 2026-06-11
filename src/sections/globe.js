import { gsap } from 'gsap';
import { byId } from '../data/teams.js';
import { lenis } from '../lib/scroll.js';
import { prefersReducedMotion } from '../lib/utils.js';

/** Lazy-inits the interactive globe; wires marker picks to team cards. */
export function initGlobeSection() {
  const canvas = document.getElementById('globe-canvas');
  const tooltip = document.getElementById('globe-tip');
  const reduced = prefersReducedMotion();
  let scene = null;

  const pick = (team) => {
    const card = document.getElementById(`team-${team.id}`);
    if (!card) return;
    const reveal = () => {
      card.classList.remove('is-targeted');
      void card.offsetWidth;
      card.classList.add('is-targeted');
    };
    if (lenis) { lenis.scrollTo(card, { offset: -120, duration: 1.2, onComplete: reveal }); setTimeout(reveal, 1300); }
    else { card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); setTimeout(reveal, 600); }
  };

  const io = new IntersectionObserver(async ([entry]) => {
    if (!entry.isIntersecting || scene) return;
    io.disconnect();
    const { initGlobe } = await import('../three/globe.js');
    scene = initGlobe(canvas, { tooltip, onPick: pick });
  }, { rootMargin: '300px' });
  io.observe(canvas);

  /* legend chips jump the globe + cards too */
  document.querySelectorAll('#globe-legend [data-team]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const team = byId[chip.dataset.team];
      if (team) { scene?.spinTo(team); pick(team); }
    });
  });
}
