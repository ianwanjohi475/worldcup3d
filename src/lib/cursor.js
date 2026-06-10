import { lerp, prefersReducedMotion } from './utils.js';

/** Gold dot + trailing ring custom cursor. Desktop fine-pointer only. */
export function initCursor() {
  const fine = window.matchMedia('(pointer: fine) and (min-width: 901px)').matches;
  if (!fine || prefersReducedMotion()) return;

  document.documentElement.classList.add('has-cursor');
  const root = document.getElementById('cursor');
  const dot = root.querySelector('.cursor__dot');
  const ring = root.querySelector('.cursor__ring');

  let mx = innerWidth / 2, my = innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  }, { passive: true });

  window.addEventListener('pointerdown', () => root.classList.add('is-down'));
  window.addEventListener('pointerup', () => root.classList.remove('is-down'));

  const INTERACTIVE = 'a, button, [data-cursor], input, [data-tilt]';
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest(INTERACTIVE)) root.classList.add('is-active');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest(INTERACTIVE)) root.classList.remove('is-active');
  });

  const tick = () => {
    rx = lerp(rx, mx, 0.16);
    ry = lerp(ry, my, 0.16);
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** Magnetic pull (up to 6px toward cursor) for [data-magnetic] buttons. */
export function initMagnetic() {
  if (prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll('[data-magnetic]').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      btn.style.setProperty('--mx', `${dx * 6}px`);
      btn.style.setProperty('--my', `${dy * 6}px`);
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.setProperty('--mx', '0px');
      btn.style.setProperty('--my', '0px');
    });
  });
}

/** 3D tilt toward the cursor for [data-tilt] cards (max 6deg). */
export function initTilt(root = document) {
  if (prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return;
  root.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      card.style.setProperty('--ry', `${dx * 6}deg`);
      card.style.setProperty('--rx', `${-dy * 6}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}
