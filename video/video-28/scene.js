// Desert island: a speck of sand, a palm, SOS written in stones, him under the palm on one bar of signal. A ship comes,
// honks three times, calls on the radio, waits… and sails away. He looks up at an empty horizon.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard } from './px.js';
import { mat, mesh, box } from './kit.js';
import { sky, particles } from './fx.js';
import { makePerson } from './people.js';
import { T } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

function sandTex() { const P = new PX(96, 96), R = ramp(['#a88a5a', '#c4a670', '#dcc08a', '#ecd6a4'], .45); P.fill((x, y) => R(.55 + (fbm(x * .1, y * .1, 3) - .5) * .4 + (h2(x, y, 4) - .5) * .25, x, y)); return P.done(); }
function waterTex() { const P = new PX(64, 64), R = ramp(['#0e3a5a', '#1a5a80', '#2a7aa0', '#4a9ec0', '#a8dcec'], .45); P.fill((x, y) => { const w = Math.sin((x * .35) + Math.sin(y * .25) * 2) * .5 + .5; return R(.35 + w * .25 + (fbm(x * .15, y * .15, 5) - .5) * .3 + (h2(x, y, 6) > .97 ? .4 : 0), x, y); }); return texOf(P.done(), { repeat: [40, 40] }); }
function sosTex() {   // S O S in dark stones on sand (transparent elsewhere)
  const P = new PX(48, 16), G = [[1, 1, 1], [1, 0, 0], [1, 1, 1], [0, 0, 1], [1, 1, 1]], O = [[1, 1, 1], [1, 0, 1], [1, 0, 1], [1, 0, 1], [1, 1, 1]], st = ramp(['#2a2622', '#4a4440', '#6a625a'], .45);
  [[G, 2], [O, 18], [G, 34]].forEach(([m, x0]) => m.forEach((row, j) => row.forEach((v, i) => { if (v) for (let y = 0; y < 3; y++) for (let x = 0; x < 4; x++) if ((x + y) % 3 !== 2) P.set(x0 + i * 4 + x, 1 + j * 3 + y, st(.3 + h2(x, y, i + j) * .6, x, y)); })));
  return texOf(P.done());
}
function palmTex() {
  const P = new PX(48, 64), bark = ramp(['#4a3420', '#6a4a2c', '#8a6438'], .45), L = ramp(['#1a4a1c', '#2a6a2a', '#3e8a34', '#5aa844'], .45);
  for (let y = 22; y < 64; y++) { const x0 = 22 + Math.round(Math.sin(y * .08) * 3); for (let x = x0; x < x0 + 4; x++) P.set(x, y, bark((y % 4 === 0 ? .2 : .6) + (x === x0 ? -.2 : 0), x, y)); }
  for (let k = 0; k < 7; k++) { const a = -Math.PI + .2 + k * (Math.PI - .4) / 6; for (let r = 0; r < 20; r++) { const x = Math.round(24 + Math.cos(a) * r), y = Math.round(22 + Math.sin(a) * r * .55 + r * r * .02); for (let w = -1; w <= 1; w++) if (y + w >= 0) P.set(x, y + w, L(.4 + r * .02 + w * .1, x, y)); } }
  P.set(22, 24, [90, 60, 30]); P.set(25, 25, [90, 60, 30]); P.outline(.25); return texOf(P.done());
}
function ship() {
  const g = new THREE.Group(), hull = new THREE.MeshStandardMaterial({ color: '#2a2a34', roughness: .6 }), white = new THREE.MeshStandardMaterial({ color: '#e8e8ec', roughness: .5 }), red = new THREE.MeshStandardMaterial({ color: '#6a2a2a', roughness: .6 });
  const h = box(9, 1.4, 2.2, hull); h.position.y = -.4; g.add(h); const h2_ = box(9, .3, 2.2, red); h2_.position.y = -.55; g.add(h2_);
  const cab = box(3, 1.6, 1.8, white); cab.position.set(-1.5, 1.0, 0); g.add(cab); const br = box(1.6, .8, 1.6, white); br.position.set(-1.5, 2.6, 0); g.add(br);
  const fun = new THREE.Mesh(new THREE.CylinderGeometry(.35, .4, 1.4, 10), new THREE.MeshStandardMaterial({ color: '#c8a040', roughness: .5 })); fun.position.set(.6, 1.6, 0); g.add(fun);
  for (let i = 0; i < 5; i++) { const w = box(.3, .25, .05, new THREE.MeshBasicMaterial({ color: '#ffe8a0' })); w.position.set(-2.7 + i * .6, 1.2, .92); g.add(w); }
  return { g, fun };
}

export function build() {
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog('#cfe6f2', 40, 220);
  const SK = sky({ top: '#2a6ab8', mid: '#6aaee0', hor: '#e0f0f6', moonI: 0 }); scene.add(SK.mesh);
  const wt = waterTex(), sea = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({ map: wt, roughness: .35, metalness: .1 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -.05; scene.add(sea);
  const isl = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.8, .5, 32), mat(sandTex())); isl.position.y = -.25; isl.scale.z = .7; isl.receiveShadow = true; scene.add(isl);
  const foam = new THREE.Mesh(new THREE.RingGeometry(3.6, 4.2, 40), new THREE.MeshBasicMaterial({ color: '#f2fafc', transparent: true, opacity: .7 })); foam.rotation.x = -Math.PI / 2; foam.scale.y = .7; foam.position.y = .0; scene.add(foam);
  const sos = new THREE.Mesh(new THREE.PlaneGeometry(1.8, .6), new THREE.MeshStandardMaterial({ map: sosTex(), transparent: true, alphaTest: .5, roughness: 1 })); sos.rotation.x = -Math.PI / 2; sos.position.set(.45, .012, .7); scene.add(sos);
  const palm = billboard(palmTex(), 2.6, 3.4); palm.position.set(-.9, 0, -.7); scene.add(palm);
  const S = ship(); scene.add(S.g);
  const smoke = particles(60, (i, t, o) => { const q = h2(i, 2, 4), life = (t * .4 + q) % 1; const p = S.fun.getWorldPosition(new THREE.Vector3()); o.x = p.x - life * 3; o.y = p.y + .8 + life * 2.5; o.z = p.z + (h2(i, 3, 4) - .5) * .5; o.a = .6 * (1 - life); o.s = .25 + life * .5; o.r = o.g = o.b = .85; }, { soft: 1, blend: THREE.NormalBlending });
  scene.add(smoke);
  const puffs = [0, 1, 2].map(() => { const p = glow('#ffffff', 1, .9); scene.add(p); return p; });
  const sun = new THREE.DirectionalLight('#fff0d8', 2.8); sun.position.set(8, 14, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight('#c0dcf0', '#8a7050', 1.3));
  const fill = new THREE.PointLight('#fff0e0', 1.6, 7, 1.5); fill.position.set(.4, 1.6, 3.4); scene.add(fill);
  const phoneL = new THREE.PointLight('#8fc0ff', .6, 1.2, 2); scene.add(phoneL);
  const hero = makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark', beard: 2, shoe: 'sneaker' }, { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, look: { pose: 'look' } });
  hero.root.position.set(-.35, 0, -.2); hero.shadow.visible = false; scene.add(hero.root);
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    const u = eio(seg(t, 0, T.txt)); cam.position.set(lerp(.8, .6, u), lerp(1.4, 1.3, u), lerp(4.0, 3.4, u)); cam.lookAt(lerp(-.05, -.08, u), lerp(1.2, 1.1, u), -8); cam.fov = 52; cam.updateProjectionMatrix();
    wt.offset.set(t * .01, t * .006);
    // the ship: comes in from the left, stops close, honks, waits, sails off to the right
    const inn = eo(seg(t, T.shipIn, 5.4)), out = seg(t, T.leave, T.leave + 3.6) ** 1.6;
    S.g.position.set(lerp(60, 2.6, inn) - 75 * out, .2, lerp(-70, -24, inn) - 30 * out); S.g.rotation.y = Math.PI + .15 - .3 * out; S.g.visible = t >= T.shipIn - .1;
    smoke.visible = S.g.visible; smoke.userData.update(t);
    puffs.forEach((p, i) => { const a = T.horn + i * .6, k = seg(t, a, a + .5); p.visible = k > 0 && k < 1; p.position.copy(S.fun.getWorldPosition(_v)).add(new THREE.Vector3(0, 1.2 + k, 0)); p.scale.setScalar(1 + 2 * k); p.material.opacity = 1 - k; });
    hero.frame(t >= T.up ? 'look' : (t % 2.9 < .1 ? 'blink' : 'phone')); hero.face(cam);
    phoneL.position.copy(hero.local(25, 18)).add(_v.set(.2, .05, .2)); phoneL.intensity = t < T.up ? .6 : 0;
    palm.lookAt(cam.position.x, palm.position.y, cam.position.z);
    post.dof.focus = cam.position.distanceTo(_v.set(-.3, 1.0, -.2)); post.dof.aper = 6; post.dof.maxCoc = 6;
    renderer.toneMappingExposure = 1.05; post.bloom.strength = .3; post.bloom.threshold = .9;
  }
  return { scene, update };
}
