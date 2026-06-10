import * as THREE from 'three';
import { createRenderer, gradientEnv, autoResize, disposeObject, glowTexture } from './engine.js';
import { visibilityLoop, isMobile, prefersReducedMotion } from '../lib/utils.js';

/**
 * ORIGINAL trophy design (deliberately not the FIFA trophy):
 * a low-poly sphere woven from gold ribbons, hovering over an
 * obsidian plinth. Plus a one-shot champion confetti burst.
 */
export function initTrophy(canvas) {
  const reduced = prefersReducedMotion();
  const mobile = isMobile();

  const renderer = createRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 2, 0.1, 60);
  camera.position.set(0, 1.5, 7.4);
  camera.lookAt(0, 0.8, 0);

  const env = gradientEnv(renderer);
  scene.environment = env;

  const root = new THREE.Group();
  root.position.y = 0.35;
  scene.add(root);

  /* ---- woven ribbon sphere ---- */
  const orb = new THREE.Group();
  orb.position.y = 1.45;
  root.add(orb);

  const gold = new THREE.MeshStandardMaterial({
    color: 0xD8A848,
    metalness: 0.85,
    roughness: 0.25,
    envMapIntensity: 1.5,
    flatShading: true,
  });
  const goldDark = new THREE.MeshStandardMaterial({
    color: 0x8C6420,
    metalness: 0.85,
    roughness: 0.32,
    envMapIntensity: 1.2,
    flatShading: true,
  });

  // interleaved great-circle ribbons at woven angles
  const ribbonGeo = new THREE.TorusGeometry(1.15, 0.075, 5, 44);
  const tilts = [
    [0, 0, 0.26], [Math.PI / 3, 0, -0.26], [-Math.PI / 3, 0, 0.26],
    [Math.PI / 2, Math.PI / 5, 0], [Math.PI / 2, -Math.PI / 5, 0],
    [0.32, Math.PI / 2.2, 0], [-0.32, -Math.PI / 2.2, 0],
  ];
  tilts.forEach(([x, y, z], i) => {
    const r = new THREE.Mesh(ribbonGeo, i % 2 ? goldDark : gold);
    r.rotation.set(x, y, z);
    r.scale.setScalar(1 - (i % 3) * 0.035);
    orb.add(r);
  });

  // faceted core glowing through the weave
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.78, 1),
    new THREE.MeshStandardMaterial({
      color: 0x1A1206,
      metalness: 0.6,
      roughness: 0.4,
      emissive: 0xC9962E,
      emissiveIntensity: 0.55,
      flatShading: true,
      envMapIntensity: 0.8,
    })
  );
  orb.add(core);

  /* ---- stem + obsidian base ---- */
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.34, 0.95, 6, 1), gold);
  stem.position.y = 0.18;
  root.add(stem);

  const obsidian = new THREE.MeshStandardMaterial({
    color: 0x0A0B10,
    metalness: 0.7,
    roughness: 0.22,
    envMapIntensity: 1.1,
    flatShading: true,
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.4, 0.5, 8, 1), obsidian);
  base.position.y = -0.5;
  root.add(base);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.045, 5, 8), gold);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.24;
  root.add(ring);

  /* ---- lights ---- */
  scene.add(new THREE.AmbientLight(0x1A1D2A, 1.6));
  const spot = new THREE.SpotLight(0xFFE9B8, 260, 30, Math.PI / 5.5, 0.45, 2);
  spot.position.set(2.5, 7, 4);
  spot.target = orb;
  scene.add(spot);
  const rim = new THREE.DirectionalLight(0xC9962E, 2.6);
  rim.position.set(-4, 2, -4);
  scene.add(rim);

  /* ---- confetti burst (instanced gold flecks) ---- */
  const COUNT = mobile ? 220 : 480;
  const confettiGeo = new THREE.PlaneGeometry(0.07, 0.12);
  const confettiMat = new THREE.MeshBasicMaterial({
    color: 0xF4D58D,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const confetti = new THREE.InstancedMesh(confettiGeo, confettiMat, COUNT);
  confetti.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  confetti.frustumCulled = false;
  scene.add(confetti);

  const palette = [0xF4D58D, 0xC9962E, 0xFFE9B8, 0x8C6420, 0xE9ECF2];
  const colors = new THREE.Color();
  for (let i = 0; i < COUNT; i++) {
    confetti.setColorAt(i, colors.setHex(palette[i % palette.length]));
  }
  const particles = Array.from({ length: COUNT }, () => ({
    pos: new THREE.Vector3(), vel: new THREE.Vector3(), rot: new THREE.Euler(),
    spin: new THREE.Vector3(), life: 0,
  }));
  let confettiActive = false;
  let confettiTime = 0;
  const dummy = new THREE.Object3D();

  // ember sparkle floor
  const sparkGeo = new THREE.BufferGeometry();
  const sparkCount = mobile ? 60 : 130;
  const sp = new Float32Array(sparkCount * 3);
  for (let i = 0; i < sparkCount; i++) {
    sp[i * 3] = (Math.random() - 0.5) * 8;
    sp[i * 3 + 1] = Math.random() * 4 - 0.6;
    sp[i * 3 + 2] = (Math.random() - 0.5) * 5;
  }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({
    size: 0.05, map: glowTexture(), color: 0xC9962E, transparent: true,
    opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  }));
  scene.add(sparks);

  const stopResize = autoResize(renderer, camera, canvas);

  let revealT = 0;
  orb.scale.setScalar(0.001);

  const loop = visibilityLoop(canvas, (dt, t) => {
    if (!reduced) {
      orb.rotation.y += dt * 0.45;
      orb.rotation.x = Math.sin(t * 0.4) * 0.08;
      root.position.y = 0.35 + Math.sin(t * 0.8) * 0.05;
    }
    // trophy assembly reveal
    if (revealT < 1) {
      revealT = Math.min(1, revealT + dt * (reduced ? 10 : 0.8));
      const e = 1 - Math.pow(1 - revealT, 3);
      orb.scale.setScalar(e);
      orb.children.forEach((m, i) => {
        m.rotation.z += (1 - e) * dt * (i % 2 ? 2.2 : -2.2);
      });
    }
    // confetti physics
    if (confettiActive) {
      confettiTime += dt;
      confettiMat.opacity = confettiTime < 2.8 ? 1 : Math.max(0, 1 - (confettiTime - 2.8) / 1.2);
      for (const [i, pt] of particles.entries()) {
        pt.vel.y -= dt * 3.4;            // gravity
        pt.vel.multiplyScalar(0.995);    // drag
        pt.pos.addScaledVector(pt.vel, dt);
        pt.rot.x += pt.spin.x * dt;
        pt.rot.y += pt.spin.y * dt;
        pt.rot.z += pt.spin.z * dt;
        dummy.position.copy(pt.pos);
        dummy.rotation.copy(pt.rot);
        dummy.updateMatrix();
        confetti.setMatrixAt(i, dummy.matrix);
      }
      confetti.instanceMatrix.needsUpdate = true;
      if (confettiTime > 4.2) confettiActive = false;
    }
    renderer.render(scene, camera);
  }, { margin: '60px' });

  return {
    burst() {
      confettiActive = true;
      confettiTime = 0;
      confettiMat.opacity = 1;
      for (const pt of particles) {
        pt.pos.set((Math.random() - 0.5) * 0.6, 1.4 + Math.random() * 0.4, (Math.random() - 0.5) * 0.6);
        const a = Math.random() * Math.PI * 2;
        const power = 2.2 + Math.random() * 3.4;
        pt.vel.set(Math.cos(a) * power * 0.55, 2.6 + Math.random() * 3, Math.sin(a) * power * 0.55);
        pt.spin.set(Math.random() * 8 - 4, Math.random() * 8 - 4, Math.random() * 8 - 4);
      }
    },
    dispose() {
      loop.dispose();
      stopResize();
      disposeObject(scene);
      env.dispose();
      renderer.dispose();
    },
  };
}
