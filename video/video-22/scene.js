// Take a break?: his bedroom. The screen-time reminder pops up after 3 hours, 3 days, 3 years, 63 years; every time
// he taps "Remind me later". He grows a beard, greys, the room decays, and in the end a skeleton taps the button.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson, SPX } from './people.js';
import { T, POPS, stageAt } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

function wallTex(cols, s) { const P = new PX(64, 64), R = ramp(cols, .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, s) - .5) * .25 + (h2(x, y, s) - .5) * .1, x, y)); return P.done(); }
function blanketTex() { const P = new PX(48, 30), R = ramp(['#1c2236', '#2a3350', '#3c4870', '#56658e'], .45); P.fill((x, y) => R(.5 + .2 * Math.sin(x * .5 + Math.sin(y * .3) * 2) + (h2(x, y, 4) - .5) * .2 + ((x + y) % 8 === 0 ? -.15 : 0), x, y)); return P.done(); }
function plantTex(state) { const P = new PX(16, 22), pot = ramp(['#5a2a1a', '#8a4a2a', '#a86a3a'], .45), L = state === 0 ? ['#1e4a1c', '#2e6a2a', '#4a8a3a'] : state === 1 ? ['#4a4a1a', '#7a6a2a', '#a08a3a'] : ['#3a2a1a', '#5a4024', '#6a5030'], G = ramp(L, .45);
  for (let y = 15; y < 22; y++) for (let x = 4; x < 12; x++) P.set(x, y, pot(x === 4 ? .2 : .6, x, y));
  const droop = state * 3; for (let k = 0; k < 7; k++) { const a = -1.3 + k * .43; for (let r = 0; r < 8; r++) { const x = Math.round(8 + Math.sin(a) * r), y = Math.round(15 - Math.cos(a) * r * (1 - state * .25) + (r > 4 ? droop * (r - 4) / 4 : 0)); if (y < 15 && y >= 0) P.set(x, y, G(.4 + r * .06, x, y)); } }
  P.outline(.3); return texOf(P.done()); }
function webTex() { const P = new PX(24, 24), c = [200, 205, 215]; for (let i = 0; i < 24; i++) { P.set(i, 0, c); P.set(0, i, c); P.set(i, i, c); if (i < 18) { P.set(i, Math.floor(i / 2), c); P.set(Math.floor(i / 2), i, c); } } for (let r = 5; r < 24; r += 6) for (let a = 0; a <= r; a++) P.set(a, r - a, c); return texOf(P.done()); }
function skeletonTex() {   // 34 x 50, sitting on the bed edge, phone up (same frame as the people)
  const P = new PX(34, 50), E = new PX(34, 50), B = ramp(['#8a8478', '#b8b2a4', '#dcd6c8', '#f2ece0'], .45);
  P.ellipse(19, 10, 4.6, 5, (x, y, dx, dy) => B(.75 - dy * .2, x, y)); P.rect(17, 9, 2, 2, [20, 16, 14]); P.rect(21, 9, 2, 2, [20, 16, 14]); P.set(20, 12, [40, 34, 30]); for (let x = 17; x < 23; x++) if (x % 2) P.set(x, 14, [40, 34, 30]);
  for (let y = 15; y < 33; y++) P.set(16, y, B(.6, 16, y));
  for (let r = 0; r < 5; r++) { const y = 18 + r * 2.4; for (let x = 12; x < 21 - r * .3; x++) P.set(x, Math.round(y), B(.7, x, y)); }
  P.rect(12, 31, 9, 3, B(.6, 0, 0));
  for (let x = 13; x < 25; x++) P.set(x, 33, B(.65, x, 33)); for (let y = 33; y < 47; y++) P.set(23, y, B(.6, 23, y)); for (let x = 21; x < 27; x++) P.set(x, 47, B(.5, x, 47));
  for (const [x, y] of [[19, 18], [21, 19], [22, 20], [23, 21], [24, 20], [25, 18], [26, 16]]) P.set(x, y, B(.7, x, y));
  for (let j = 0; j < 8; j++) for (let i = 0; i < 5; i++) { const edge = i === 0 || i === 4 || j === 0 || j === 7; const c = edge ? [20, 22, 30] : [122, 168, 240]; P.set(25 + i, 9 + j, c); if (!edge) E.set(25 + i, 9 + j, [60, 84, 120]); }
  P.outline(.3); return { tex: texOf(P.done()), em: texOf(E.done()) };
}

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#05060c');
  scene.add(mesh(new THREE.BoxGeometry(6, .2, 5).translate(0, -.1, 0), mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 3, cols: ['#1a120e', '#2c1e16', '#43301f', '#5a4128', '#6e5032'] }))));
  const wM = mat(wallTex(['#2a2c3c', '#343850', '#404660', '#4c5470'], 2));
  const back = box(6, 3, .2, wM); back.position.set(0, 0, -2.1); scene.add(back);
  const left = box(.2, 3, 5, wM); left.position.set(-2.6, 0, 0); scene.add(left);
  const skyM = new THREE.MeshBasicMaterial({ color: '#0a1028', fog: false }), sky = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.0), skyM); sky.position.set(.5, 1.75, -1.99); scene.add(sky);
  const frameM = new THREE.MeshStandardMaterial({ color: '#2a2018', roughness: .9 });
  for (const [w, h, x, y] of [[1.32, .06, .5, 2.25], [1.32, .06, .5, 1.25], [.06, 1.06, -.13, 1.75], [.06, 1.06, 1.13, 1.75], [.04, 1.0, .5, 1.75]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .06), frameM); b.position.set(x, y, -1.97); scene.add(b); }
  const woodM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 6, nails: false, cols: ['#1e140e', '#33231a', '#4a3424', '#5e4430'] }));
  const bedF = box(2.0, .3, 1.1, woodM); bedF.position.set(-1.45, 0, -1.4); scene.add(bedF);
  const matr = box(1.95, .16, 1.05, mat(blanketTex())); matr.position.set(-1.45, .3, -1.4); scene.add(matr);
  const pillow = box(.5, .12, .7, new THREE.MeshStandardMaterial({ color: '#b8b4c4', roughness: 1 })); pillow.position.set(-2.2, .46, -1.4); scene.add(pillow);
  const desk = box(1.1, .05, .6, woodM); desk.position.set(.6, .72, -1.6); scene.add(desk);
  for (const [x, z] of [[.1, -1.85], [1.1, -1.85], [.1, -1.35], [1.1, -1.35]]) { const l = box(.05, .72, .05, woodM); l.position.set(x, 0, z); scene.add(l); }
  const plants = [0, 1, 2].map(s => { const b = billboard(plantTex(s), .45, .62); b.position.set(.95, .745, -1.6); scene.add(b); return b; });
  const webT = webTex(), webs = [[-2.49, 2.6, -1.95, 1.0], [1.8, 2.6, -1.99, .8], [-2.49, .6, .4, .6]].map(([x, y, z, s]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: webT, transparent: true, alphaTest: .5, opacity: .9 })); m.position.set(x, y, z); if (x < -2.4) m.rotation.y = Math.PI / 2; scene.add(m); return m; });
  const junk = [[-.6, .005, -.4], [-.2, .005, -.1], [.3, .005, -.5], [-1.9, .005, .2]].map(([x, y, z], i) => { const b = box(.4, .05 + i * .02, .4, new THREE.MeshStandardMaterial({ color: ['#a86a3a', '#c8c0b0', '#8a5a3a', '#6a6a70'][i], roughness: 1 })); b.position.set(x, y, z); b.rotation.y = i; scene.add(b); return b; });
  const hemi = new THREE.HemisphereLight('#5a6a9a', '#1c1418', 1.5); scene.add(hemi);
  const fill = new THREE.PointLight('#a0b0e0', 2.6, 7, 1.5); fill.position.set(.8, 1.8, 1.6); scene.add(fill);
  const winL = new THREE.PointLight('#c8d8ff', 1.5, 6, 1.4); winL.position.set(.5, 1.8, -1.4); scene.add(winL);
  const L = (o) => makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark', ...o }, { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 } });
  const ages = [L({}), L({ beard: 1 }), L({ beard: 4 }), L({ beard: 5, hair: 'hairGrey', hunch: 1 }), L({ beard: 6, hair: 'hairWhite', hunch: 1, skin: 'skinOld' })];
  ages.forEach(h => { h.root.position.set(-1.0, .02, -.95); h.shadow.visible = false; scene.add(h.root); });
  const sk = skeletonTex(), skel = billboard(sk.tex, 34 * SPX, 50 * SPX, { em: sk.em, emCol: '#ffffff', emI: 2 }); skel.position.set(-1.0, .02, -.95); scene.add(skel);
  const phoneL = new THREE.PointLight('#8fc0ff', 1.0, 1.4, 2); scene.add(phoneL);
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    const st = stageAt(t);
    const u = eio(seg(t, 0, T.txt)); cam.position.set(lerp(.55, .35, u), lerp(1.4, 1.35, u), lerp(2.3, 1.7, u)); cam.lookAt(lerp(-.7, -.8, u), lerp(1.05, 1.0, u), -1.0); cam.fov = 50; cam.updateProjectionMatrix();
    // him at every age: the montage between the third and the last reminder runs grey → white → bones
    let k = Math.min(st, 2); if (t >= T.age && t < T.bones) k = t < T.age + .5 ? 3 : 4;
    const bones = t >= T.bones; ages.forEach((h, i) => { h.root.visible = !bones && i === k; }); skel.visible = bones;
    if (!bones) { const h = ages[k]; h.frame(t % 2.9 < .1 ? 'blink' : 'phone'); h.face(cam); phoneL.position.copy(h.local(25, 18)).add(_v.set(.2, .05, .2)); }
    else { skel.lookAt(cam.position.x, skel.position.y, cam.position.z); phoneL.position.set(-.75, 1.2, -.75); }
    // the room decays: plant, junk, webs; the window: night, then days, then grey years
    plants.forEach((p, i) => { p.visible = i === Math.min(st, 2); p.lookAt(cam.position.x, p.position.y, cam.position.z); });
    junk.forEach((j, i) => { j.visible = st >= 1 && i < st + 1; });
    webs.forEach((w, i) => { w.visible = st >= 2 + (i > 0 ? 1 : 0) || bones; });
    skyM.color.set(['#0a1028', '#6a8ab0', '#8a9aa8', '#5a6070', '#3a3e48'][Math.min(st, 4)]); winL.intensity = st === 0 ? .8 : 1.6;
    hemi.intensity = bones ? 1.0 : 1.5;
    post.dof.focus = cam.position.distanceTo(_v.set(-1.0, 1.0, -.95)); post.dof.aper = 40; post.dof.maxCoc = 10;
    renderer.toneMappingExposure = bones ? 1.1 : 1.3; post.bloom.strength = bones ? .25 : .4; post.bloom.threshold = bones ? .95 : .82; phoneL.intensity = bones ? .35 : 1.0;
  }
  return { scene, update };
}
