import * as THREE from 'three';
import { createRenderer, gradientEnv, autoResize, emberField, disposeObject } from './engine.js';
import { visibilityLoop, isMobile, prefersReducedMotion, lerp } from '../lib/utils.js';

/**
 * Hero scene: the textured match ball, floating in a gold ember field
 * in front of the stadium backdrop. Mouse parallax + slow rotation.
 */
export function initHeroBall(canvas) {
  const reduced = prefersReducedMotion();
  const mobile = isMobile();

  const renderer = createRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 2, 0.1, 60);
  camera.position.set(0, 0, 6.2);

  const env = gradientEnv(renderer);
  scene.environment = env;

  const group = new THREE.Group();
  scene.add(group);

  /* ---- ball ---- */
  const ballGroup = new THREE.Group();
  group.add(ballGroup);

  const geo = new THREE.SphereGeometry(1.32, mobile ? 48 : 72, mobile ? 48 : 72);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.38,
    roughness: 0.46,
    envMapIntensity: 1.15,
    emissive: new THREE.Color(0xC9962E),
    emissiveIntensity: 0.0, // raised once the emissive map is ready
  });
  const ball = new THREE.Mesh(geo, mat);
  ballGroup.add(ball);

  // soft gold halo behind the ball
  const haloGeo = new THREE.SphereGeometry(1.36, 32, 32);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xC9962E,
    transparent: true,
    opacity: 0.07,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  ballGroup.add(new THREE.Mesh(haloGeo, haloMat));

  new THREE.TextureLoader().load('/assets/hero-ball-texture.png', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 1);
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    mat.map = tex;

    // Derive emissive + bump from the diffuse: boost the gold seam
    // highlights, use luminance as a pseudo normal (bump).
    const img = tex.image;
    const c = document.createElement('canvas');
    const size = 512;
    c.width = c.height = size;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size);
    const d = data.data;
    const bump = ctx.createImageData(size, size);
    for (let i = 0; i < d.length; i += 4) {
      const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      const seam = Math.max(0, (lum - 96) / 159); // bright gold seams only
      const e = Math.pow(seam, 1.6);
      bump.data[i] = bump.data[i + 1] = bump.data[i + 2] = lum;
      bump.data[i + 3] = 255;
      d[i] = 244 * e; d[i + 1] = 196 * e; d[i + 2] = 96 * e; d[i + 3] = 255;
    }
    ctx.putImageData(data, 0, 0);
    const emissiveTex = new THREE.CanvasTexture(c);
    emissiveTex.colorSpace = THREE.SRGBColorSpace;
    emissiveTex.wrapS = emissiveTex.wrapT = THREE.RepeatWrapping;
    emissiveTex.repeat.copy(tex.repeat);

    const c2 = document.createElement('canvas');
    c2.width = c2.height = size;
    c2.getContext('2d').putImageData(bump, 0, 0);
    const bumpTex = new THREE.CanvasTexture(c2);
    bumpTex.wrapS = bumpTex.wrapT = THREE.RepeatWrapping;
    bumpTex.repeat.copy(tex.repeat);

    mat.emissiveMap = emissiveTex;
    mat.emissiveIntensity = 0.34;
    mat.bumpMap = bumpTex;
    mat.bumpScale = 0.65;
    mat.needsUpdate = true;
  });

  /* ---- lights ---- */
  scene.add(new THREE.AmbientLight(0x222633, 1.4));
  const key = new THREE.DirectionalLight(0xFFF2DC, 2.4);
  key.position.set(3.2, 2.6, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xC9962E, 3.2);
  rim.position.set(-3.4, 1.4, -3.2);
  scene.add(rim);
  const under = new THREE.DirectionalLight(0x4FE3C1, 0.25);
  under.position.set(0, -3, 1);
  scene.add(under);

  /* ---- embers ---- */
  const embers = emberField({ count: mobile ? 140 : 360, radius: [1.7, 3.6], size: mobile ? 0.045 : 0.05 });
  group.add(embers.points);

  /* ---- layout: ball sits center-right on desktop ---- */
  const layout = () => {
    const wide = canvas.clientWidth > 900;
    const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
    group.position.x = wide ? Math.min(2.3, 1.45 * aspect * 0.92) : 0;
    group.position.y = wide ? -0.12 : 1.05;
    group.scale.setScalar(wide ? 0.92 : 0.56);
  };
  layout();
  window.addEventListener('resize', layout);

  /* ---- pointer parallax ---- */
  let tx = 0, ty = 0, px = 0, py = 0;
  const onPointer = (e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    tx = nx; ty = ny;
  };
  if (!mobile && !reduced) window.addEventListener('pointermove', onPointer, { passive: true });

  const stopResize = autoResize(renderer, camera, canvas);

  const loop = visibilityLoop(canvas, (dt, t) => {
    if (!reduced) {
      ball.rotation.y += dt * 0.16;
      ball.rotation.x = Math.sin(t * 0.18) * 0.06;
      ballGroup.position.y = Math.sin(t * 0.55) * 0.07;
      px = lerp(px, tx, 0.045);
      py = lerp(py, ty, 0.045);
      group.rotation.y = px * 0.14;
      group.rotation.x = py * 0.1;
      embers.update(dt, t);
    }
    renderer.render(scene, camera);
  });

  return {
    /** scroll-linked offset from the hero timeline */
    setScroll(p) {
      group.position.z = p * 1.4;
      group.rotation.z = p * 0.18;
    },
    dispose() {
      loop.dispose();
      stopResize();
      window.removeEventListener('resize', layout);
      window.removeEventListener('pointermove', onPointer);
      disposeObject(scene);
      env.dispose();
      renderer.dispose();
    },
  };
}
