export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isMobile = () =>
  window.matchMedia('(max-width: 900px), (pointer: coarse)').matches;

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;

/** Probe an image URL once; resolves true/false. Cached per session. */
const probeCache = new Map();
export function imageExists(src) {
  if (probeCache.has(src)) return probeCache.get(src);
  const p = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 4);
    img.onerror = () => resolve(false);
    img.src = src;
  });
  probeCache.set(src, p);
  return p;
}

/** Build an element from an HTML string. */
export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/**
 * Visibility-gated RAF loop: runs cb(dt, t) only while `target` intersects
 * the viewport and the tab is visible. Returns a handle with stop/dispose.
 */
export function visibilityLoop(target, cb, { margin = '120px' } = {}) {
  let rafId = 0;
  let running = false;
  let inView = false;
  let last = 0;
  let disposed = false;

  const frame = (t) => {
    if (!running) return;
    const dt = Math.min((t - last) / 1000, 0.05);
    last = t;
    cb(dt, t / 1000);
    rafId = requestAnimationFrame(frame);
  };
  const sync = () => {
    const should = inView && !document.hidden && !disposed;
    if (should && !running) {
      running = true;
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    } else if (!should && running) {
      running = false;
      cancelAnimationFrame(rafId);
    }
  };
  const io = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    sync();
  }, { rootMargin: margin });
  io.observe(target);
  document.addEventListener('visibilitychange', sync);

  return {
    get running() { return running; },
    dispose() {
      disposed = true;
      sync();
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
    },
  };
}

/** Seedless fast RNG helpers for the simulator. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
