import * as THREE from 'three';
import { createRenderer, autoResize, disposeObject, glowTexture } from './engine.js';
import { visibilityLoop, isMobile, prefersReducedMotion, lerp } from '../lib/utils.js';
import { TEAMS, LATLNG, HOST_IDS, byId } from '../data/teams.js';

const R = 2;
const DEG = Math.PI / 180;

function toVec3(lat, lng, radius = R) {
  const phi = (90 - lat) * DEG;
  const theta = (lng + 180) * DEG;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * Interactive constellation globe: dotted sphere, 48 nation markers,
 * animated arcs flowing to the three hosts. Drag to spin (inertia),
 * hover for a tooltip, click a marker to jump to that team's card.
 */
export function initGlobe(canvas, { tooltip, onPick } = {}) {
  const reduced = prefersReducedMotion();
  const mobile = isMobile();

  const renderer = createRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 2, 0.1, 100);
  camera.position.set(0, 0.4, 6.4);

  const world = new THREE.Group();
  scene.add(world);

  /* ---- glowing core + atmosphere ---- */
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(R * 0.985, 48, 48),
    new THREE.MeshStandardMaterial({ color: 0x0A0F1E, metalness: 0.3, roughness: 0.85, emissive: 0x0B1430, emissiveIntensity: 0.6 })
  );
  world.add(core);

  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.16, 48, 48),
    new THREE.ShaderMaterial({
      transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { c: { value: new THREE.Color(0xC9962E) } },
      vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `varying vec3 vN; uniform vec3 c; void main(){ float i = pow(0.72 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(c, clamp(i,0.0,1.0)*0.9); }`,
    })
  );
  world.add(atmo);

  /* ---- dotted sphere grid ---- */
  const dotCount = mobile ? 900 : 1700;
  const dotPos = new Float32Array(dotCount * 3);
  for (let i = 0; i < dotCount; i++) {
    // fibonacci sphere for even coverage
    const y = 1 - (i / (dotCount - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const phi = i * Math.PI * (3 - Math.sqrt(5));
    dotPos[i * 3] = Math.cos(phi) * rad * R * 1.002;
    dotPos[i * 3 + 1] = y * R * 1.002;
    dotPos[i * 3 + 2] = Math.sin(phi) * rad * R * 1.002;
  }
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
  const dots = new THREE.Points(dotGeo, new THREE.PointsMaterial({
    size: 0.026, color: 0x2A3656, transparent: true, opacity: 0.6, sizeAttenuation: true,
  }));
  world.add(dots);

  /* ---- markers ---- */
  const glow = glowTexture('rgba(244,213,141,1)', 'rgba(201,150,46,0)');
  const hostGlow = glowTexture('rgba(120,235,210,1)', 'rgba(79,227,193,0)');
  const markerGroup = new THREE.Group();
  world.add(markerGroup);
  const markers = [];
  const dotGeoM = new THREE.SphereGeometry(0.032, 12, 12);

  for (const team of TEAMS) {
    const ll = LATLNG[team.id];
    if (!ll) continue;
    const isHost = HOST_IDS.includes(team.id);
    const pos = toVec3(ll[0], ll[1], R * 1.01);
    const mat = new THREE.MeshBasicMaterial({ color: isHost ? 0x6FF0D6 : 0xF4D58D });
    const pin = new THREE.Mesh(dotGeoM, mat);
    pin.position.copy(pos);
    pin.scale.setScalar(isHost ? 1.5 : 1);
    pin.userData = { team, isHost, base: isHost ? 1.5 : 1 };
    markerGroup.add(pin);

    const spr = new THREE.Sprite(new THREE.SpriteMaterial({
      map: isHost ? hostGlow : glow, color: 0xffffff, transparent: true,
      opacity: isHost ? 0.95 : 0.7, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    spr.position.copy(pos);
    spr.scale.setScalar(isHost ? 0.5 : 0.32);
    markerGroup.add(spr);
    markers.push({ pin, spr, team, isHost, pos });
  }

  /* ---- arcs: every nation → nearest host ---- */
  const hostPts = HOST_IDS.map((id) => ({ id, v: toVec3(...LATLNG[id]) }));
  const arcs = [];
  const travelers = [];
  const travelTex = glowTexture('rgba(255,243,214,1)', 'rgba(201,150,46,0)');

  for (const team of TEAMS) {
    if (HOST_IDS.includes(team.id) || !LATLNG[team.id]) continue;
    const from = toVec3(...LATLNG[team.id]);
    let host = hostPts[0], best = Infinity;
    for (const h of hostPts) { const d = from.distanceTo(h.v); if (d < best) { best = d; host = h; } }
    const to = host.v;
    const mid = from.clone().add(to).multiplyScalar(0.5).normalize().multiplyScalar(R * (1.25 + best * 0.16));
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
      color: 0xC9962E, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    world.add(line);
    arcs.push({ curve, line });
  }

  // a handful of glowing travelers flowing along random arcs
  const TRAVELERS = mobile ? 6 : 12;
  for (let i = 0; i < TRAVELERS; i++) {
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({
      map: travelTex, color: 0xFFE9B8, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    spr.scale.setScalar(0.22);
    world.add(spr);
    travelers.push({ spr, arc: (Math.random() * arcs.length) | 0, t: Math.random(), speed: 0.18 + Math.random() * 0.22 });
  }

  scene.add(new THREE.AmbientLight(0xffffff, 1.2));
  const key = new THREE.PointLight(0xF4D58D, 40, 30);
  key.position.set(5, 4, 6);
  scene.add(key);

  /* ---- interaction: drag to spin, hover, click ---- */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let dragging = false, moved = false;
  let last = { x: 0, y: 0 };
  let vel = { x: 0, y: -0.0016 };       // idle auto-spin
  let target = { x: 0, y: 0 };
  let hover = null;

  const setPointer = (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    return r;
  };

  const onDown = (e) => { dragging = true; moved = false; last = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture?.(e.pointerId); };
  const onMove = (e) => {
    const r = setPointer(e);
    if (dragging) {
      const dx = e.clientX - last.x, dy = e.clientY - last.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      vel.y = dx * 0.005;
      vel.x = dy * 0.005;
      world.rotation.y += vel.y;
      world.rotation.x = Math.max(-0.9, Math.min(0.9, world.rotation.x + vel.x));
      last = { x: e.clientX, y: e.clientY };
    } else {
      // hover test
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects(markers.map((m) => m.pin));
      const m = hits[0]?.object?.userData?.team;
      if (m && tooltip) {
        hover = hits[0].object;
        const t = m;
        tooltip.innerHTML = `<b>${t.name}</b><span>${t.star.name} · OVR ${t.ovr}${HOST_IDS.includes(t.id) ? ' · Host' : ''}</span>`;
        tooltip.style.left = `${e.clientX - r.left}px`;
        tooltip.style.top = `${e.clientY - r.top}px`;
        tooltip.classList.add('is-on');
        canvas.style.cursor = 'pointer';
      } else {
        hover = null;
        tooltip?.classList.remove('is-on');
        canvas.style.cursor = 'grab';
      }
    }
  };
  const onUp = (e) => {
    if (dragging && !moved) {
      // treat as click → pick marker
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects(markers.map((m) => m.pin));
      if (hits[0]) onPick?.(hits[0].object.userData.team);
    }
    dragging = false;
  };
  canvas.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  canvas.style.cursor = 'grab';

  const stopResize = autoResize(renderer, camera, canvas);
  const tmpV = new THREE.Vector3();

  const loop = visibilityLoop(canvas, (dt, t) => {
    if (!dragging) {
      if (!reduced) world.rotation.y += vel.y;
      // ease auto-spin back when idle
      vel.y = lerp(vel.y, -0.0016, 0.02);
      vel.x = lerp(vel.x, 0, 0.06);
      world.rotation.x = lerp(world.rotation.x, 0, 0.02);
    }
    // marker pulse
    for (const m of markers) {
      const s = m.pin.userData.base * (1 + (m.pin === hover ? 0.9 : 0) + (m.isHost ? Math.sin(t * 2.2) * 0.12 : 0));
      m.pin.scale.setScalar(lerp(m.pin.scale.x, s, 0.2));
      m.spr.scale.setScalar(lerp(m.spr.scale.x, (m.isHost ? 0.5 : 0.32) * (m.pin === hover ? 1.5 : 1) * (1 + (m.isHost ? Math.sin(t * 2.2) * 0.12 : 0)), 0.2));
    }
    // travelers
    if (!reduced) for (const tr of travelers) {
      tr.t += dt * tr.speed;
      if (tr.t > 1) { tr.t = 0; tr.arc = (Math.random() * arcs.length) | 0; }
      arcs[tr.arc].curve.getPoint(tr.t, tmpV);
      tr.spr.position.copy(tmpV);
      tr.spr.material.opacity = Math.sin(tr.t * Math.PI) * 0.9;
    }
    renderer.render(scene, camera);
  }, { margin: '200px' });

  return {
    spinTo(team) {
      const ll = LATLNG[team.id];
      if (!ll) return;
      // rotate so the marker faces camera
      target.y = -((ll[1] + 180) * DEG) - Math.PI / 2;
    },
    dispose() {
      loop.dispose();
      stopResize();
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      disposeObject(scene);
      glow.dispose(); hostGlow.dispose(); travelTex.dispose();
      renderer.dispose();
    },
  };
}
