import * as THREE from 'three';
import { createRenderer, gradientEnv, autoResize, disposeObject, glowTexture, emberField } from './engine.js';
import { visibilityLoop, isMobile, prefersReducedMotion } from '../lib/utils.js';

/**
 * Procedural stadium bowl: instanced seats around an elliptical tier
 * stack, glowing light towers, fog, embers, slow orbiting camera.
 */
export function initStadium(canvas) {
  const reduced = prefersReducedMotion();
  const mobile = isMobile();

  const renderer = createRenderer(canvas);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05060C, 0.026);

  const camera = new THREE.PerspectiveCamera(44, 2, 0.1, 120);

  const env = gradientEnv(renderer);
  scene.environment = env;

  /* ---- seats: one InstancedMesh ---- */
  const SEGS = mobile ? 96 | 0 : 168;
  const TIERS = 3;
  const ROWS = mobile ? 4 : 6;
  const count = SEGS * TIERS * ROWS;

  const seatGeo = new THREE.BoxGeometry(0.34, 0.3, 0.26);
  const seatMat = new THREE.MeshStandardMaterial({ metalness: 0.25, roughness: 0.75 });
  const seats = new THREE.InstancedMesh(seatGeo, seatMat, count);

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const navy = [0x121A2E, 0x0E1424, 0x1A2440, 0x0B0F1C];
  let idx = 0;
  for (let tier = 0; tier < TIERS; tier++) {
    for (let row = 0; row < ROWS; row++) {
      const a = 15 + tier * 4.6 + row * 0.62;     // ellipse semi-major
      const b = 10.5 + tier * 3.6 + row * 0.52;   // semi-minor
      const y = 1.4 + tier * 3.4 + row * 0.5;
      for (let s = 0; s < SEGS; s++) {
        const th = (s / SEGS) * Math.PI * 2;
        dummy.position.set(Math.cos(th) * a, y, Math.sin(th) * b);
        dummy.lookAt(0, y - 1.5, 0);
        dummy.updateMatrix();
        seats.setMatrixAt(idx, dummy.matrix);
        const gold = Math.random() < 0.06;
        color.setHex(gold ? 0xC9962E : navy[(Math.random() * navy.length) | 0]);
        if (gold) color.multiplyScalar(1.6);
        seats.setColorAt(idx, color);
        idx++;
      }
    }
  }
  scene.add(seats);

  /* ---- bowl shell rings ---- */
  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x0A0D16, metalness: 0.5, roughness: 0.6, side: THREE.DoubleSide,
  });
  for (let tier = 0; tier < TIERS; tier++) {
    const ring = new THREE.Mesh(
      new THREE.CylinderGeometry(16.6 + tier * 4.6, 15.2 + tier * 4.6, 2.6, 48, 1, true),
      shellMat
    );
    ring.position.y = 0.6 + tier * 3.4;
    ring.scale.z = 0.72;
    scene.add(ring);
  }
  // roof rim with gold trim
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(21, 0.22, 6, 64),
    new THREE.MeshStandardMaterial({ color: 0xC9962E, metalness: 0.85, roughness: 0.3, envMapIntensity: 1.4 })
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 12.4;
  rim.scale.set(1, 0.74, 1);
  scene.add(rim);

  /* ---- pitch ---- */
  const pc = document.createElement('canvas');
  pc.width = 512; pc.height = 330;
  const pctx = pc.getContext('2d');
  pctx.fillStyle = '#0B1812';
  pctx.fillRect(0, 0, 512, 330);
  for (let i = 0; i < 12; i++) {
    pctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.022)' : 'transparent';
    pctx.fillRect((i * 512) / 12, 0, 512 / 12, 330);
  }
  pctx.strokeStyle = 'rgba(235,240,235,0.4)';
  pctx.lineWidth = 3;
  pctx.strokeRect(26, 26, 460, 278);
  pctx.beginPath(); pctx.moveTo(256, 26); pctx.lineTo(256, 304); pctx.stroke();
  pctx.beginPath(); pctx.arc(256, 165, 46, 0, Math.PI * 2); pctx.stroke();
  pctx.strokeRect(26, 96, 62, 138); pctx.strokeRect(424, 96, 62, 138);
  const pitchTex = new THREE.CanvasTexture(pc);
  pitchTex.colorSpace = THREE.SRGBColorSpace;
  pitchTex.anisotropy = 4;
  const pitch = new THREE.Mesh(
    new THREE.PlaneGeometry(21, 13.6),
    new THREE.MeshStandardMaterial({ map: pitchTex, roughness: 0.9, metalness: 0 })
  );
  pitch.rotation.x = -Math.PI / 2;
  scene.add(pitch);

  /* ---- light towers ---- */
  const glow = glowTexture('rgba(255,243,214,1)');
  const towerPos = [[-13, 14.5, -9], [13, 14.5, -9], [-13, 14.5, 9], [13, 14.5, 9]];
  for (const [x, y, z] of towerPos) {
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glow, color: 0xFFF3D6, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    spr.position.set(x, y, z);
    spr.scale.setScalar(7);
    scene.add(spr);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glow, color: 0xC9962E, transparent: true, opacity: 0.4,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    halo.position.set(x, y, z);
    halo.scale.setScalar(15);
    scene.add(halo);

    const light = new THREE.SpotLight(0xFFEFC9, 480, 50, Math.PI / 4.6, 0.7, 1.8);
    light.position.set(x, y, z);
    light.target.position.set(0, 0, 0);
    scene.add(light, light.target);
  }
  scene.add(new THREE.AmbientLight(0x10131F, 2.2));
  scene.add(new THREE.HemisphereLight(0x1A2238, 0x0A0C12, 1.1));

  /* ---- drifting embers above the bowl ---- */
  const embers = emberField({ count: mobile ? 110 : 260, radius: [4, 16], size: 0.16 });
  embers.points.position.y = 7;
  scene.add(embers.points);

  const stopResize = autoResize(renderer, camera, canvas);

  let angle = Math.PI * 0.12;
  const loop = visibilityLoop(canvas, (dt, t) => {
    if (!reduced) angle += dt * 0.05;
    camera.position.set(Math.cos(angle) * 26.5, 10.5 + Math.sin(t * 0.16) * 0.7, Math.sin(angle) * 21);
    camera.lookAt(0, 2.2, 0);
    if (!reduced) embers.update(dt, t);
    renderer.render(scene, camera);
  }, { margin: '200px' });

  return {
    dispose() {
      loop.dispose();
      stopResize();
      disposeObject(scene);
      env.dispose();
      renderer.dispose();
    },
  };
}
