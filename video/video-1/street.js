// The crossing at night: road along z (traffic comes from -z toward the camera), zebra across it, the hero walks +x.
import * as THREE from 'three';
import { PX, ramp, h2, fbm, texOf, glow, blob } from './px.js';
import { mat, mesh, box, mats, windowMat } from './kit.js';
import { sky, particles, flick } from './fx.js';
import { makeStudent } from './student.js';
import { T, HX, LANE_X, WALK_FPS, carFront } from './story.js';
import { track, seg, ss, eio, clamp, lerp } from '/core/lib.js';

// —— Surfaces (24 px/m) ——
function asphalt(w, h, s = 21) {
  const P = new PX(w, h), R = ramp(['#0b0c11', '#14161d', '#1d2028', '#282b34', '#353844'], .45);
  P.fill((x, y) => { let v = .38 + (fbm(x * .2, y * .2, s) - .5) * .5 + (h2(x, y, s) - .5) * .35; if (h2(x, y, s + 3) > .985) v += .35; if (fbm(x * .05, y * .05, s + 7) > .66) v -= .12; return R(v, x, y); });
  return P.done();
}
function pavement(w, h, s = 31) {
  const P = new PX(w, h), R = ramp(['#24242b', '#33333b', '#45444d', '#5a5862', '#6f6c75'], .45);
  P.fill((x, y) => { const gx = x % 24, gy = y % 24; let v = .5 + (fbm(x * .15, y * .15, s) - .5) * .4 + (h2(x >> 3, y >> 3, s) - .5) * .15; if (gx === 0 || gy === 0) v = .12; else if (gx === 1 || gy === 1) v += .12; return R(v, x, y); });
  return P.done();
}
function paint(w, h, s = 41) {
  const P = new PX(w, h), R = ramp(['#6e6d69', '#a3a198', '#c9c6b9', '#e2dfd2'], .45);
  P.fill((x, y) => { const wear = fbm(x * .12, y * .12, s); if (wear < .3 && h2(x, y, s) > .4) return null; return R(.62 + (h2(x, y, s + 1) - .5) * .4 - (wear < .38 ? .25 : 0), x, y); });
  return P.done();
}
function paintMat(c) { const m = new THREE.MeshStandardMaterial({ map: texOf(c), roughness: .8, transparent: false, alphaTest: .5, polygonOffset: true, polygonOffsetFactor: -2 }); return m; }

// pedestrian signal face: amber raised hand (lit), walker below (off)
function signalFace() {
  const P = new PX(12, 20), E = new PX(12, 20), A = ramp(['#5a2000', '#c25a08', '#ff9a1c', '#ffd27a'], .22), O = ramp(['#0a0a0d', '#16161c', '#22222a'], .22);
  P.fill((x, y) => (x === 0 || x === 11 || y === 0 || y === 19 || y === 10) ? O(.9, x, y) : O(.25, x, y));
  const hand = [[4, 3], [5, 2], [6, 2], [7, 3], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5], [4, 6], [5, 6], [6, 6], [7, 6], [8, 5], [5, 7], [6, 7], [7, 7], [5, 8], [6, 8], [7, 8], [3, 3], [8, 3], [5, 3], [6, 3]];
  for (const [x, y] of hand) { const c = A(.7 + h2(x, y, 2) * .25, x, y); P.set(x, y, c); E.set(x, y, c); }
  const walker = [[6, 12], [5, 13], [6, 13], [6, 14], [5, 15], [6, 15], [7, 15], [6, 16], [5, 17], [7, 17], [4, 18], [8, 18]];
  for (const [x, y] of walker) P.set(x, y, [44, 50, 54]);
  return { map: texOf(P.done()), em: texOf(E.done()) };
}

// car body textures (cool slate paint, never red)
function carSkin(w, h, s = 51) {
  const P = new PX(w, h), R = ramp(['#0e1218', '#1a222c', '#2a3542', '#3e4c5c', '#5b6c7e'], .45);
  P.fill((x, y) => R(.45 + (1 - y / h) * .25 + (h2(x, y, s) - .5) * .12, x, y));
  return P.done();
}

export function buildStreet() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#131d31', .022);
  const SK = sky({ top: '#04060f', mid: '#0c1530', hor: '#22324e', moonDir: new THREE.Vector3(.4, .5, -1), moonI: .6 }); scene.add(SK.mesh);
  const moon = new THREE.DirectionalLight('#8fa8e0', .55); moon.position.set(12, 30, -18); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
  Object.assign(moon.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, far: 80 }); moon.shadow.bias = -.0008;
  const hemi = new THREE.HemisphereLight('#3a4c7a', '#0a0a12', 1.0);
  scene.add(moon, hemi);

  // —— Ground: road, kerbs, pavements ——
  const MM = mats();
  const road = mesh(new THREE.BoxGeometry(8, .2, 140).translate(0, -.1, -45), mat(asphalt(96, 96)));
  scene.add(road);
  const pave = mat(pavement(96, 96));
  for (const s of [-1, 1]) {
    const p = mesh(new THREE.BoxGeometry(5, .16, 140).translate(s * 6.5, .08 - .1, -45), pave); p.position.y = .1; scene.add(p);
    const kerb = box(.22, .2, 140, mat(pavement(24, 24, 77)), { cast: false }); kerb.position.set(s * 4.06, -.04, -45); scene.add(kerb);
  }
  // zebra stripes (along z, spaced along x) + stop line + dashed centre line
  const pm = paintMat(paint(24, 72));
  for (let x = -3.5; x <= 3.6; x += 1) { const s = new THREE.Mesh(new THREE.PlaneGeometry(.55, 3.0), pm); s.rotation.x = -Math.PI / 2; s.position.set(x, .004, 0); s.receiveShadow = true; scene.add(s); }
  const stop = new THREE.Mesh(new THREE.PlaneGeometry(3.8, .3), paintMat(paint(48, 8, 43))); stop.rotation.x = -Math.PI / 2; stop.position.set(-2, .004, -2.6); stop.receiveShadow = true; scene.add(stop);
  const dm = paintMat(paint(6, 48, 47));
  for (let z = -4; z > -100; z -= 4.5) { const d = new THREE.Mesh(new THREE.PlaneGeometry(.14, 2.2), dm); d.rotation.x = -Math.PI / 2; d.position.set(0, .004, z); d.receiveShadow = true; scene.add(d); }
  for (let z = 4; z < 22; z += 4.5) { const d = new THREE.Mesh(new THREE.PlaneGeometry(.14, 2.2), dm); d.rotation.x = -Math.PI / 2; d.position.set(0, .004, z); scene.add(d); }

  // —— Buildings both sides, windows facing the road ——
  const dark = new THREE.MeshStandardMaterial({ color: '#0b0d14', roughness: .5, emissive: '#05070c' });
  const walls = [MM.wall2, MM.wall3, MM.wall2];
  const winList = [];
  let k = 0;
  for (const s of [-1, 1]) {
    for (let z = 14; z > -100; k++) {
      const len = 6 + h2(k, 1, 3) * 5, h = 6 + Math.floor(h2(k, 2, 3) * 4) * 2.4, wdt = 7, cz = z - len / 2;
      const b = box(wdt, h, len - .3, walls[k % 3]); b.position.set(s * (9 + wdt / 2), 0, cz); scene.add(b);
      const roofTrim = box(wdt + .3, .25, len, MM.beam, { cast: false }); roofTrim.position.set(s * (9 + wdt / 2), h, cz); scene.add(roofTrim);
      const floors = Math.floor((h - 1) / 2.4), cols = Math.max(2, Math.floor(len / 2.2));
      for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
        const on = h2(k * 7 + f, c, 9) > .42, q = new THREE.Mesh(new THREE.PlaneGeometry(.8, 1.05), on ? windowMat() : dark);
        q.position.set(s * (9 - .02), 1.6 + f * 2.4, cz - len / 2 + (c + .5) * len / cols); q.rotation.y = -s * Math.PI / 2; scene.add(q); if (on) winList.push(q);
      }
      z -= len;
    }
  }

  // —— Street lamps (warm sodium practicals) ——
  const lamps = [];
  const poleM = new THREE.MeshStandardMaterial({ color: '#2a2c33', roughness: .6 });
  for (const [x, z, sh] of [[-4.55, 2.4, true], [4.55, -14, false], [-4.55, -30, false], [4.55, -48, false]]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.07, .09, 5, 8).translate(0, 2.5, 0), poleM); pole.position.set(x, 0, z); pole.castShadow = true; scene.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.1, .08, .08), poleM); arm.position.set(x - Math.sign(x) * .5, 4.95, z); scene.add(arm);
    const head = new THREE.Mesh(new THREE.BoxGeometry(.5, .12, .25), new THREE.MeshStandardMaterial({ color: '#ffd29a', emissive: '#ffb860', emissiveIntensity: 3 })); head.position.set(x - Math.sign(x) * 1.0, 4.88, z); scene.add(head);
    const L = new THREE.PointLight('#ffb35c', sh ? 26 : 16, 13, 1.6); L.position.set(x - Math.sign(x) * 1.0, 4.7, z);
    if (sh) { L.castShadow = true; L.shadow.mapSize.set(1024, 1024); L.shadow.bias = -.004; }
    scene.add(L); const g = glow('#ffc070', 1.6, 1.3); g.position.copy(L.position); scene.add(g); lamps.push({ L, g, base: L.intensity });
  }

  // —— Pedestrian signal across the road: amber hand ——
  const SF = signalFace();
  const sig = new THREE.Group();
  const spole = new THREE.Mesh(new THREE.CylinderGeometry(.05, .06, 2.2, 8).translate(0, 1.1, 0), poleM); spole.castShadow = true; sig.add(spole);
  const sbox = new THREE.Mesh(new THREE.BoxGeometry(.32, .52, .2), new THREE.MeshStandardMaterial({ color: '#15161b' })); sbox.position.y = 2.45; sig.add(sbox);
  const sface = new THREE.Mesh(new THREE.PlaneGeometry(.3, .5), new THREE.MeshStandardMaterial({ map: SF.map, emissiveMap: SF.em, emissive: '#ffffff', emissiveIntensity: 2.6 })); sface.position.set(0, 2.45, .101); sig.add(sface);
  sig.position.set(4.45, 0, -1.75); sig.rotation.y = -Math.PI / 2 + .55; scene.add(sig);
  const sGlow = glow('#ff9a2a', .9, 1.1); sGlow.position.set(4.3, 2.5, -1.6); scene.add(sGlow);
  const sLight = new THREE.PointLight('#ff9a2a', 1.6, 4, 2); sLight.position.set(4.1, 2.4, -1.4); scene.add(sLight);

  // —— Hero ——
  const hero = makeStudent(); scene.add(hero.root);
  const phoneL = new THREE.PointLight('#8fc0ff', 1.6, 2.2, 2); scene.add(phoneL);      // the screen's cold light on the face
  const phoneG = glow('#9cc8ff', .35, .9); scene.add(phoneG);
  const fill = new THREE.PointLight('#9fb2e8', 1.4, 7, 2); scene.add(fill);             // cool front fill (billboards need it)

  // —— Car: slate hatchback, headlights toward +z ——
  const car = new THREE.Group();
  const cm = new THREE.MeshStandardMaterial({ map: texOf(carSkin(24, 24)), roughness: .45, metalness: .3 });
  const glass = new THREE.MeshStandardMaterial({ color: '#0a0d14', roughness: .15, metalness: .6 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, .7, 4.1).translate(0, .62, 0), cm); body.castShadow = true; car.add(body);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.6, .55, 2.2).translate(0, 1.24, -.35), glass); cab.castShadow = true; car.add(cab);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.62, .08, 2.0).translate(0, 1.55, -.45), cm); car.add(roof);
  const wheelM = new THREE.MeshStandardMaterial({ color: '#0b0b0e', roughness: .9 });
  for (const [x, z] of [[-.85, 1.3], [.85, 1.3], [-.85, -1.35], [.85, -1.35]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.33, .33, .26, 12).rotateZ(Math.PI / 2), wheelM); w.position.set(x, .33, z); car.add(w); }
  const hlM = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fff4e0', emissiveIntensity: 6 });
  const heads = [], beams = [];
  for (const x of [-.62, .62]) {
    const q = new THREE.Mesh(new THREE.BoxGeometry(.34, .14, .04), hlM); q.position.set(x, .72, 2.06); car.add(q);
    const g = glow('#fff2d8', 1.2, 2.2); g.position.set(x, .72, 2.15); g.material.depthTest = false; g.renderOrder = 6; car.add(g); heads.push(g);
    const sp = new THREE.SpotLight('#fff1dc', 0, 70, .42, .55, 1.2); sp.position.set(x, .75, 2.1); sp.target.position.set(x * 1.5, 0, 22); car.add(sp, sp.target); beams.push(sp);
  }
  beams[0].castShadow = true; beams[0].shadow.mapSize.set(1024, 1024); beams[0].shadow.bias = -.002;
  car.position.set(LANE_X, 0, -60); scene.add(car);

  // dust in the lamp light (has a source: the lamp pool)
  const dust = particles(70, (i, t, o) => { const r = h2(i, 1, 5), q = h2(i, 2, 5); o.x = -4 + (r - .5) * 4 + Math.sin(t * .3 + i) * .2; o.y = .6 + ((q * 4 + t * .08 * (r + .3)) % 4); o.z = 2 + (h2(i, 3, 5) - .5) * 4; o.a = .35; o.s = .025; o.r = 1; o.g = .8; o.b = .55; }, { soft: 1 });
  scene.add(dust);

  // camera paths
  const P2 = track([[0, [2.0, 3.0, 4.2]], [1, [3.2, 13.5, 15.5]]]);           // wide: from hero-relative to world, blended below
  const L2 = track([[0, [0, .85, 0]], [1, [-1.4, 0, -5.5]]]);
  const P3 = track([[6.4, [1.6, 3.6, 7.2]], [8.3, [.2, 2.7, 4.7]]]);
  const L3 = track([[6.4, [-1.9, .9, -3.5]], [8.3, [-1.9, 1.15, -1.2]]]);
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    // hero
    const x = HX(t), walking = t < T.look;
    hero.root.position.set(x, 0, 0);
    hero.frame(t >= T.flinch ? 'flinch' : t >= T.look ? 'look' : walking ? ['w0', 'w1', 'w2', 'w3'][Math.floor(t * WALK_FPS) % 4] : 'idle');
    if (x > -4.05) hero.root.position.y = 0; else hero.root.position.y = .16;     // on the pavement / on the road
    // camera
    const hp = hero.root.position;
    if (shot.id === 'walk') {
      const u = seg(t, 0, 3.2);
      cam.position.set(hp.x + lerp(2.1, 1.7, u), lerp(2.55, 2.35, u), lerp(3.9, 3.3, u)); cam.fov = 40;
      cam.lookAt(hp.x + .3, .78, 0);
    } else if (shot.id === 'wide') {
      const u = eio(seg(t, 3.2, 6.4)), a = P2(0), b = P2(1), la = L2(0), lb = L2(1);
      cam.position.set(lerp(hp.x + a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)); cam.fov = lerp(40, 46, u);
      cam.lookAt(lerp(hp.x + la[0], lb[0], u), lerp(la[1], lb[1], u), lerp(la[2], lb[2], u));
    } else {
      cam.position.set(...P3(t)); cam.fov = 44; cam.lookAt(...L3(t));
    }
    cam.updateProjectionMatrix();
    hero.face(cam);
    // phone light follows the screen; dies when he looks up
    const pp = hero.phonePos(), toCam = cam.position.clone().sub(pp).setY(0).normalize();
    const scr = t < T.look ? 1 : .35;
    phoneL.position.copy(pp).addScaledVector(toCam, .4); phoneL.intensity = 1.6 * scr * (1 + .06 * Math.sin(t * 5.1)); phoneG.position.copy(pp); phoneG.material.opacity = .9 * scr;
    fill.position.set(x + 1.2, 1.7, 2.2);
    // lamps breathe a little (sodium hum)
    lamps.forEach((l, i) => { l.L.intensity = l.base * (1 + .03 * Math.sin(t * 6 + i)); });
    // car
    const zf = carFront(t); car.position.z = zf - 2.05;
    const brake = clamp((t - T.screech) / .25), near = clamp(seg(zf, -45, -1));
    car.rotation.x = -.03 * brake;                                  // nose dips under braking
    beams.forEach(b => { b.intensity = 70 + 150 * near * near; });
    heads.forEach(g => { const s = 1.0 + 1.1 * Math.pow(near, 4); g.scale.set(s, s, 1); g.material.opacity = 1; });
    dust.userData.update(t);
    // post
    post.dof.focus = cam.position.distanceTo(_v.copy(hp).setY(.9)); post.dof.aper = shot.id === 'wide' ? 300 : 220; post.dof.maxCoc = 22;
    const glare = shot.id === 'car' ? Math.pow(seg(t, 7.8, 8.3), 2.4) : 0;
    renderer.toneMappingExposure = 1.15 + glare * 2.4;
    post.bloom.strength = .6 + glare * .9; post.bloom.threshold = .85 - glare * .35;
    post.vig.uniforms.amt.value = .62;
  }
  return { scene, update, hero };
}
