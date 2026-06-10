import * as THREE from 'three';
import { isMobile } from '../lib/utils.js';

/** Renderer with the house look: ACES tone mapping, sRGB out, capped DPR. */
export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile() ? 1.75 : 2));
  return renderer;
}

/**
 * Simple gradient environment map (navy dome, champagne horizon band,
 * obsidian floor) run through PMREM so metals pick up believable
 * gold reflections.
 */
export function gradientEnv(renderer) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.0, '#1A2238');
  g.addColorStop(0.42, '#0B0F1E');
  g.addColorStop(0.55, '#8C6420');
  g.addColorStop(0.585, '#F4D58D');
  g.addColorStop(0.62, '#5E4514');
  g.addColorStop(0.75, '#0A0A12');
  g.addColorStop(1.0, '#05050A');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);
  // a few hot studio "cards" above the horizon for sharper speculars
  for (const [x, w, a] of [[40, 70, 0.85], [220, 110, 0.6], [400, 60, 0.75]]) {
    const lg = ctx.createLinearGradient(0, 96, 0, 150);
    lg.addColorStop(0, `rgba(255, 238, 200, ${a})`);
    lg.addColorStop(1, 'rgba(255, 238, 200, 0)');
    ctx.fillStyle = lg;
    ctx.fillRect(x, 92, w, 60);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(tex).texture;
  tex.dispose();
  pmrem.dispose();
  return env;
}

/** Radial glow sprite texture (for embers / floodlights). */
export function glowTexture(inner = 'rgba(255,236,190,1)', outer = 'rgba(201,150,46,0)') {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, inner);
  g.addColorStop(0.35, inner.replace('1)', '0.55)'));
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Keep renderer + camera matched to canvas CSS size. */
export function autoResize(renderer, camera, canvas) {
  const apply = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  apply();
  const ro = new ResizeObserver(apply);
  ro.observe(canvas);
  return () => ro.disconnect();
}

/** Recursively dispose geometries, materials and their textures. */
export function disposeObject(root) {
  root.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    const mats = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
    for (const m of mats) {
      for (const key of Object.keys(m)) {
        const v = m[key];
        if (v && v.isTexture) v.dispose();
      }
      m.dispose();
    }
  });
}

/**
 * Drifting gold ember field. Returns { points, update(dt, t) }.
 */
export function emberField({ count = 300, radius = [1.6, 3.4], size = 0.05, color = 0xF4D58D } = {}) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = radius[0] + Math.random() * (radius[1] - radius[0]);
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.cos(ph);
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    seed[i] = Math.random() * 100;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    size,
    map: glowTexture(),
    color,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  const base = pos.slice();
  return {
    points,
    update(_dt, t) {
      const p = geo.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const s = seed[i];
        // gentle turbulence — layered sines, never confetti-cheap
        p[i * 3] = base[i * 3] + Math.sin(t * 0.35 + s) * 0.12 + Math.sin(t * 0.13 + s * 2.1) * 0.06;
        p[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.22 + s * 1.3) * 0.16;
        p[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.28 + s * 0.7) * 0.12;
      }
      geo.attributes.position.needsUpdate = true;
    },
  };
}
