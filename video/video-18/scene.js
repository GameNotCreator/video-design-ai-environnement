// 1%: a bench on a city street. Close on him while the battery runs down; the phone dies, he looks up, and the camera
// pulls back on a city gone back to nature: ruins, vines, trees in the road, a deer. He is eighty.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard, woodPlanks, ground } from './px.js';
import { mat, mesh, box } from './kit.js';
import { sky } from './fx.js';
import { makePerson, WALK, walkFrame } from './people.js';
import { T } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

function facade(ruin, seed, cols) {   // 32 x 64 px: wall, window grid; ruin = dark, broken, vines
  const P = new PX(32, 64), E = new PX(32, 64), R = ramp(ruin ? ['#1e2420', '#2c332c', '#3a423a', '#4a5248'] : cols, .45), V = ramp(['#1a3a14', '#2a5a1e', '#3e7a2a', '#5a9a36'], .45);
  P.fill((x, y) => R(.5 + (fbm(x * .2, y * .1, seed) - .5) * .3 + (h2(x, y, seed) - .5) * .12, x, y));
  for (let wy = 4; wy < 60; wy += 8) for (let wx = 3; wx < 30; wx += 7) {
    const lit = !ruin && h2(wx, wy, seed) > .45, broken = ruin && h2(wx, wy, seed + 1) > .4;
    for (let y = wy; y < wy + 5; y++) for (let x = wx; x < wx + 4; x++) {
      const c = ruin ? (broken && (x + y) % 3 === 0 ? [40, 46, 40] : [8, 10, 10]) : lit ? [250, 214, 140] : [70, 90, 120];
      P.set(x, y, c); if (lit) E.set(x, y, [200, 160, 90]);
    }
  }
  if (ruin) for (let k = 0; k < 9; k++) { let x = Math.floor(h2(k, 1, seed) * 32), len = 20 + Math.floor(h2(k, 2, seed) * 40); for (let y = 0; y < len; y++) { x += Math.round((h2(k, y, seed) - .5) * 1.6); for (let dx = -1; dx <= 1; dx++) if (h2(x + dx, y, k) > .3) P.set(x + dx, y, V(.3 + h2(x, y, k) * .7, x, y)); } }
  return { P: P.done(), E: E.done() };
}
function treeTex(seed) { const W = 56, H = 76, P = new PX(W, H), bark = ramp(['#1e1510', '#3a2a1e', '#54402c'], .22), crown = ramp(['#12301a', '#1e5028', '#2e7a36', '#4a9e46'], .45); for (let y = 40; y < H; y++) for (let x = 25; x < 31; x++) P.set(x, y, bark(x === 25 ? .2 : .6, x, y)); P.fill((x, y) => { const d = Math.hypot((x - 28) / 25, (y - 26) / 22) + (fbm(x * .18, y * .18, seed + 5) - .5) * .5; return d < 1 ? crown(.8 - d * .55 + (h2(x, y, seed + 2) - .5) * .3, x, y) : null; }); P.outline(.25); return texOf(P.done()); }
function bushTex(seed) { const P = new PX(30, 16), G = ramp(['#12301a', '#1e5028', '#2e7a36', '#4a8a3a'], .45); P.fill((x, y) => { const d = Math.hypot((x - 15) / 15, (y - 16) / 15) + (fbm(x * .3, y * .3, seed) - .5) * .4; return d < 1 ? G(.75 - d * .5 + (h2(x, y, seed) - .5) * .3, x, y) : null; }); P.outline(.25); return texOf(P.done()); }
function deerTex(step) {
  const P = new PX(30, 26), B = ramp(['#3a2414', '#5a3a20', '#7e5630', '#a07448'], .45);
  P.fill((x, y) => { const body = Math.hypot((x - 13) / 9, (y - 13) / 4.5) < 1, neck = x > 19 && x < 24 && y > 5 && y < 13 && x - 19 > (13 - y) * .3, head = Math.hypot((x - 24) / 3.4, (y - 5) / 2.4) < 1; return body || neck || head ? B(.65 - (y - 8) * .03, x, y) : null; });
  const legs = step ? [[6, 1], [10, -1], [16, 1], [19, -1]] : [[6, -1], [10, 1], [16, -1], [19, 1]];
  for (const [lx, d] of legs) for (let y = 17; y < 26; y++) P.set(lx + (y > 21 ? d : 0), y, B(.35, lx, y));
  for (const [x, y] of [[22, 2], [21, 1], [21, 0], [23, 1], [24, 0], [25, 2], [26, 1], [27, 0], [26, 0]]) P.set(x, y, [200, 180, 150]);
  P.set(26, 5, [20, 16, 14]); P.set(6, 11, [230, 220, 210]); P.outline(.3); return texOf(P.done());
}

export function build() {
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2('#a8b8c8', .03);
  const SK = sky({ top: '#3a6aa8', mid: '#7aa4d0', hor: '#c8d8e4', moonI: 0 }); scene.add(SK.mesh);
  const city = new THREE.Group(), ruins = new THREE.Group(); scene.add(city, ruins);
  // ground: asphalt + pavement / grass with cracks
  const asph = (() => { const P = new PX(96, 96), G = ramp(['#2a2a2e', '#38383e', '#46464c', '#56565c'], .45); P.fill((x, y) => G(.5 + (h2(x, y, 3) - .5) * .4 + ((y % 48) === 24 && (x % 16) < 8 ? .9 : 0), x, y)); return P.done(); })();
  const road = mesh(new THREE.BoxGeometry(60, .2, 30).translate(0, -.1, -6), mat(asph)); city.add(road);
  const grass = mesh(new THREE.BoxGeometry(60, .2, 30).translate(0, -.1, -6), mat(ground(96, 96, { grass: ['#1a2a12', '#2a4018', '#3e5a22', '#56742e', '#6e8a3a'], mask: () => 1, seed: 21 }))); ruins.add(grass);
  // buildings on the far side of the street (both states)
  const BCOL = [['#5a4a40', '#6e5c50', '#847062', '#9a8676'], ['#3e4a5a', '#4e5c6e', '#607084', '#748498'], ['#6a5a3e', '#80704e', '#968460', '#ac9a74']];
  for (let i = 0; i < 7; i++) {
    const w = 3 + h2(i, 1, 4) * 1.5, h = 6 + h2(i, 2, 4) * 7, x = -10 + i * 3.4, z = -7 - h2(i, 3, 4) * 1.2;
    const n = facade(false, i + 1, BCOL[i % 3]), r = facade(true, i + 1);
    const mN = new THREE.MeshStandardMaterial({ map: texOf(n.P), emissiveMap: texOf(n.E), emissive: '#ffffff', emissiveIntensity: .6, roughness: .9 });
    const mR = new THREE.MeshStandardMaterial({ map: texOf(r.P), roughness: 1 });
    const bN = new THREE.Mesh(new THREE.BoxGeometry(w, h, 2.5).translate(0, h / 2, 0), mN); bN.position.set(x, 0, z); bN.castShadow = bN.receiveShadow = true; city.add(bN);
    const hr = h * (.55 + .45 * h2(i, 5, 4)); const bR = new THREE.Mesh(new THREE.BoxGeometry(w, hr, 2.5).translate(0, hr / 2, 0), mR); bR.position.set(x, 0, z); bR.rotation.z = (h2(i, 6, 4) - .5) * .06; bR.castShadow = bR.receiveShadow = true; ruins.add(bR);
  }
  // street furniture: the bench (stays), the lamp (lit / bent), cars (gone), trees and bushes in the ruins
  const wood = mat(woodPlanks(48, 48, { pw: 5, len: 48, seed: 3, cols: ['#2a1a10', '#4a2e1a', '#6e4626', '#8e6034'] })), iron = new THREE.MeshStandardMaterial({ color: '#16161c', roughness: .5, metalness: .6 });
  const bench = new THREE.Group();
  for (let i = 0; i < 3; i++) { const s = box(1.8, .04, .12, wood); s.position.set(0, .44, -.12 + i * .14); bench.add(s); }
  for (let i = 0; i < 2; i++) { const s = box(1.8, .1, .04, wood); s.position.set(0, .62 + i * .16, -.24); s.rotation.x = -.15; bench.add(s); }
  for (const x of [-.8, .8]) { const l = box(.06, .44, .4, iron); l.position.set(x, 0, -.05); bench.add(l); }
  scene.add(bench);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.05, .07, 3.4, 8).translate(0, 1.7, 0), iron); pole.position.set(1.6, 0, -.6); city.add(pole);
  const poleR = pole.clone(); poleR.rotation.z = .5; poleR.position.set(1.6, 0, -.6); ruins.add(poleR);
  const carM = ['#7a2a2a', '#2a4a6a', '#c8c0b0'].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .5, metalness: .3 }));
  [[-4.5, -3.2, 0], [3.5, -4.4, 1], [8, -3.2, 2]].forEach(([x, z, k]) => { const c = new THREE.Group(); const b = box(2.0, .55, .9, carM[k]); b.position.y = .2; c.add(b); const tp = box(1.1, .4, .85, carM[k]); tp.position.set(-.1, .75, 0); c.add(tp); c.position.set(x, 0, z); city.add(c); const rc = c.clone(); rc.traverse(o => { if (o.isMesh) o.material = new THREE.MeshStandardMaterial({ color: '#4a3a2a', roughness: 1 }); }); rc.rotation.z = .05; ruins.add(rc); });
  [[-6, -4.6, 1, 4.2], [5.8, -5.2, 2, 4.8], [-1.8, -5.6, 3, 3.6], [10, -5, 4, 4.4]].forEach(([x, z, s, h]) => { const b = billboard(treeTex(s), h * .75, h); b.position.set(x, 0, z); ruins.add(b); });
  [[-2.6, -1.2, 1], [2.6, -1.6, 2], [-5, -2.2, 3], [4.6, -2.6, 4], [0.4, -3.4, 5], [-3.6, -.4, 6]].forEach(([x, z, s]) => { const b = billboard(bushTex(s), 1.6, .85); b.position.set(x, 0, z); ruins.add(b); });
  const deerT = [deerTex(0), deerTex(1)], deer = billboard(deerT[0], 1.1, .95); ruins.add(deer);
  // light
  const sun = new THREE.DirectionalLight('#fff0d0', 2.6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, far: 60 }); sun.shadow.bias = -.0008; scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight('#b8cce8', '#2a2a1e', 1.2); scene.add(hemi);
  const fill = new THREE.PointLight('#e8e0f0', 1.4, 6, 2); fill.position.set(.8, 1.6, 2.2); scene.add(fill);
  const phoneL = new THREE.PointLight('#8fc0ff', 1.0, 1.5, 2); scene.add(phoneL);
  // him (young, then old), passers-by in the living city
  const young = makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark', shoe: 'sneaker' }, { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, off: { pose: 'phone', off: 1, still: 1 } });
  const old = makePerson({ top: 'red', bottom: 'jean', hair: 'hairWhite', beard: 6, skin: 'skinOld', hunch: 1, shoe: 'sneaker' }, { look: { pose: 'look' }, blink: { pose: 'look', blink: 1 } });
  for (const h of [young, old]) { h.root.position.set(-.2, 0, .2); h.shadow.visible = false; scene.add(h.root); }
  const PF = { ...WALK };
  const walkers = [['teal', 'hairBlond', -1], ['mustard', 'hairBrown', 1], ['navy', 'hairDark', -1], ['purple', 'hairBrown', 1]].map(([top, hair, dir], i) => { const p = makePerson({ top, bottom: 'jean', hair, hairStyle: i % 2 ? 'long' : 'short', shoe: 'shoe' }, PF); city.add(p.root); return { p, dir, i }; });
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    const ruin = t >= T.dead; city.visible = !ruin; ruins.visible = ruin;
    // camera: close on him while the battery runs down; then a slow pull back on the ruins
    if (t < T.wide) { const u = eio(seg(t, 0, T.dead)); cam.position.set(lerp(.9, .75, u), lerp(1.35, 1.3, u), lerp(2.9, 2.5, u)); cam.lookAt(-.1, lerp(1.12, 1.02, u), .1); cam.fov = 44; }
    else { const u = eio(seg(t, T.wide, T.wide + 3.2)); cam.position.set(lerp(.75, 1.3, u), lerp(1.3, 1.75, u), lerp(2.5, 5.4, u)); cam.lookAt(lerp(-.1, -.3, u), lerp(1.02, 1.25, u), lerp(.1, -1.5, u)); cam.fov = lerp(44, 56, u); }
    cam.updateProjectionMatrix();
    // look: bright day in the city; golden, hazy afternoon in the ruins
    if (!ruin) { sun.color.set('#fff0d0'); sun.intensity = 2.6; sun.position.set(6, 12, 8); hemi.color.set('#b8cce8'); hemi.intensity = 1.2; scene.fog.color.set('#a8b8c8'); scene.fog.density = .03; SK.u.top.value.set('#3a6aa8'); SK.u.mid.value.set('#7aa4d0'); SK.u.hor.value.set('#c8d8e4'); }
    else { sun.color.set('#ffc890'); sun.intensity = 2.4; sun.position.set(-10, 6, 4); hemi.color.set('#c8d0a0'); hemi.intensity = 1.1; scene.fog.color.set('#c8c09a'); scene.fog.density = .035; SK.u.top.value.set('#6a8aa8'); SK.u.mid.value.set('#c8b890'); SK.u.hor.value.set('#f0d8a8'); }
    // him
    young.root.visible = !ruin; old.root.visible = ruin;
    if (!ruin) { young.frame(t >= T.dead - .05 ? 'off' : (t % 2.9 < .1 ? 'blink' : 'phone')); young.face(cam); phoneL.intensity = 1.0; phoneL.position.copy(young.local(25, 18)).add(_v.set(.2, .05, .2)); }
    else { old.frame(t % 3.3 < .12 ? 'blink' : 'look'); old.face(cam); phoneL.intensity = 0; }
    // people walking by behind him (only in the living city)
    walkers.forEach(({ p, dir, i }) => { const x = ((t * .9 + i * 3.1) % 12) - 6; p.root.position.set(dir > 0 ? x : -x, 0, -1.6 - i * .45); p.frame(walkFrame(t + i * .3)); p.face(cam, dir < 0); });
    // the deer crosses the old road
    const du = seg(t, T.deer, T.deer + 4); deer.visible = ruin; deer.material.map = deerT[Math.floor(t * 5) % 2]; deer.position.set(lerp(-3.4, -1.3, du), 0, -1.2); deer.lookAt(cam.position.x, 0, cam.position.z); if (du >= 1) deer.material.map = deerT[0];
    post.dof.focus = cam.position.distanceTo(_v.set(-.2, 1.0, .2)); post.dof.aper = t < T.wide ? 70 : lerp(70, 20, seg(t, T.wide, T.wide + 3)); post.dof.maxCoc = 14;
    renderer.toneMappingExposure = 1.1; post.bloom.strength = .4; post.bloom.threshold = .85;
  }
  return { scene, update };
}
