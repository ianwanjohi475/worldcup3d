import * as THREE from 'three';
import { createRenderer, gradientEnv, autoResize, emberField, disposeObject, glowTexture } from './engine.js';
import { visibilityLoop, isMobile, prefersReducedMotion, lerp, asset } from '../lib/utils.js';

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

  new THREE.TextureLoader().load(asset('assets/hero-ball-texture.png'), (tex) => {
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

  /* ---- shockwave ring (fired on kick) ---- */
  const ringGeo = new THREE.RingGeometry(1.3, 1.42, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xF4D58D, transparent: true, opacity: 0, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ballGroup.add(ring);
  let ringT = -1;

  /* ---- kick ember burst ---- */
  const burstN = mobile ? 70 : 150;
  const burstGeo = new THREE.BufferGeometry();
  const burstPos = new Float32Array(burstN * 3);
  burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPos, 3));
  const burstMat = new THREE.PointsMaterial({
    size: 0.06, map: glowTexture(), color: 0xF4D58D, transparent: true, opacity: 0,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  const burst = new THREE.Points(burstGeo, burstMat);
  ballGroup.add(burst);
  const burstVel = Array.from({ length: burstN }, () => new THREE.Vector3());
  let burstT = -1;

  /* ---- pointer parallax + drag-to-spin + click-to-kick ---- */
  let tx = 0, ty = 0, px = 0, py = 0;
  let spinV = 0, spinX = 0;            // user-imparted angular velocity (inertia)
  let dragging = false, moved = false, lastX = 0, lastY = 0;
  const rayc = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  const overBall = (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    rayc.setFromCamera(ndc, camera);
    return rayc.intersectObject(ball).length > 0;
  };
  const kick = () => {
    spinV += (Math.random() < 0.5 ? -1 : 1) * 0.42 + 0.3;
    spinX += (Math.random() - 0.5) * 0.5;
    ballGroup.position.y += 0.18;
    ringT = 0; burstT = 0;
    for (let i = 0; i < burstN; i++) {
      const a = Math.random() * Math.PI * 2, e = Math.acos(2 * Math.random() - 1);
      const sp = 1.6 + Math.random() * 2.4;
      burstVel[i].set(Math.sin(e) * Math.cos(a), Math.cos(e), Math.sin(e) * Math.sin(a)).multiplyScalar(sp);
      burstPos[i * 3] = burstPos[i * 3 + 1] = burstPos[i * 3 + 2] = 0;
    }
    burstGeo.attributes.position.needsUpdate = true;
  };
  const onPointer = (e) => {
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
    if (dragging) {
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      spinV = dx * 0.01;
      spinX = dy * 0.008;
      ball.rotation.y += spinV;
      ball.rotation.x += spinX;
      lastX = e.clientX; lastY = e.clientY;
    } else {
      canvas.style.cursor = overBall(e) ? 'grab' : 'default';
    }
  };
  const onDown = (e) => { if (overBall(e)) { dragging = true; moved = false; lastX = e.clientX; lastY = e.clientY; canvas.style.cursor = 'grabbing'; } };
  const onUp = (e) => {
    if (dragging && !moved) kick();
    dragging = false;
    canvas.style.cursor = overBall(e) ? 'grab' : 'default';
  };
  if (!reduced) {
    window.addEventListener('pointermove', onPointer, { passive: true });
    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
  }

  const stopResize = autoResize(renderer, camera, canvas);

  const loop = visibilityLoop(canvas, (dt, t) => {
    if (!reduced) {
      if (!dragging) {
        ball.rotation.y += dt * 0.16 + spinV;
        ball.rotation.x += spinX;
        spinV *= 0.95;                 // inertia decay
        spinX *= 0.92;
      }
      ball.rotation.x += (Math.sin(t * 0.18) * 0.06 - ball.rotation.x) * 0.005;
      ballGroup.position.y += (Math.sin(t * 0.55) * 0.07 - ballGroup.position.y) * 0.1;
      px = lerp(px, tx, 0.045);
      py = lerp(py, ty, 0.045);
      group.rotation.y = px * 0.14;
      group.rotation.x = py * 0.1;
      embers.update(dt, t);

      if (ringT >= 0) {
        ringT += dt * 1.6;
        const s = 1 + ringT * 1.5;
        ring.scale.setScalar(s);
        ringMat.opacity = Math.max(0, 0.7 * (1 - ringT));
        if (ringT >= 1) ringT = -1;
      }
      if (burstT >= 0) {
        burstT += dt;
        const p = burstGeo.attributes.position.array;
        for (let i = 0; i < burstN; i++) {
          p[i * 3] += burstVel[i].x * dt;
          p[i * 3 + 1] += burstVel[i].y * dt;
          p[i * 3 + 2] += burstVel[i].z * dt;
          burstVel[i].multiplyScalar(0.94);
        }
        burstGeo.attributes.position.needsUpdate = true;
        burstMat.opacity = Math.max(0, 1 - burstT / 1.1);
        if (burstT >= 1.1) burstT = -1;
      }
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
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      disposeObject(scene);
      env.dispose();
      renderer.dispose();
    },
  };
}
