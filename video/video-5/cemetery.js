// The funeral in the rain: an open coffin on trestles, black umbrellas, every mourner (and the priest) on their phone.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard, ground, woodPlanks, rock } from './px.js';
import { mat, mesh, box } from './kit.js';
import { sky, rain } from './fx.js';
import { makePerson, PAL } from './people.js';
import { T, LINES } from './story.js';
import { track, seg, ss, clamp, lerp, eio } from '/core/lib.js';

const INK = hex('#1a1016');
// him, lying in the coffin, seen from above: head at -x, red hoodie, hands crossed on the phone (56 x 18 px)
function lying() {
  const P = new PX(56, 18), E = new PX(56, 18);
  const S = ramp(['#8a7a74', '#a8968e', '#c4b2a8', '#dccac0'], .22), Hd = PAL.red, J = PAL.jean, Hr = PAL.hairDark, Sh = PAL.sneaker;
  P.ellipse(8, 9, 5.5, 5.2, (x, y, dx, dy) => Hr(.5 - dx * .2, x, y));                         // hair
  P.ellipse(9.5, 9, 3.8, 4.2, (x, y, dx, dy) => S(.6 - Math.abs(dy) * .2, x, y));              // pale face, eyes closed
  const lid_ = [58, 44, 48]; P.set(8, 7, lid_); P.set(9, 7, lid_); P.set(8, 11, lid_); P.set(9, 11, lid_); P.set(11, 9, S(.3, 0, 0)); P.set(12, 8, [96, 70, 72]); P.set(12, 9, [96, 70, 72]); P.set(12, 10, [96, 70, 72]);
  P.poly([[14, 2], [34, 2], [36, 16], [14, 16]], (x, y) => Hd(.6 - Math.abs(y - 9) * .03 + ((x + y) % 6 === 0 ? -.1 : 0), x, y));   // hoodie
  for (let y = 4; y < 15; y++) for (let x = 35; x < 51; x++) P.set(x, y, J(y === 9 || y === 10 ? .2 : .55 - (y < 9 ? 0 : .12), x, y));
  for (const y0 of [4, 11]) for (let y = y0; y < y0 + 4; y++) for (let x = 51; x < 55; x++) P.set(x, y, Sh(.7, x, y));
  // crossed hands holding the phone on the chest (screen up, lit)
  P.rect(20, 6, 3, 3, S(.55, 0, 0)); P.rect(20, 10, 3, 3, S(.55, 0, 0));
  for (let y = 6; y < 13; y++) for (let x = 23; x < 27; x++) { const c = y === 6 || y === 12 || x === 23 || x === 26 ? PAL.phone(.4, 0, 0) : PAL.glow(.55 + (h2(x, y, 4) - .5) * .3, x, y); P.set(x, y, c); if (!(y === 6 || y === 12 || x === 23 || x === 26)) E.set(x, y, c); }
  P.outline(.3);
  return { map: texOf(P.done()), em: texOf(E.done()) };
}
function grave(seed) { const P = new PX(16, 22), R = ramp(['#2a2c32', '#44464e', '#62646c', '#82848a'], .45); P.fill((x, y) => { const r = 8, inside = y > 6 || Math.hypot(x - 7.5, y - 7) < r; if (!inside) return null; let v = .5 + (fbm(x * .3, y * .3, seed) - .5) * .5; if (y === 9 && x > 3 && x < 12) v = .2; if (y === 12 && x > 4 && x < 11) v = .25; if (h2(x, y, seed) > .9) v -= .2; return R(v, x, y); }); P.outline(.25); return texOf(P.done()); }
function wreath() { const P = new PX(14, 14), G = ramp(['#14281a', '#22402a', '#386a40'], .22); P.fill((x, y) => { const d = Math.hypot((x + .5 - 7) / 6.5, (y + .5 - 7) / 6.5); if (d < .5 || d > 1) return null; return h2(x, y, 3) > .85 ? [230, 226, 220] : G(.6 - d * .3, x, y); }); P.outline(.3); return texOf(P.done()); }

export function buildCemetery() {
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2('#5a6270', .06);
  const SK = sky({ top: '#3a4250', mid: '#5a6270', hor: '#7a828c', moonI: 0 }); scene.add(SK.mesh);
  scene.add(mesh(new THREE.BoxGeometry(40, .2, 40).translate(0, -.1, 0), mat(ground(96, 96, { grass: ['#0e140e', '#18221a', '#243224', '#30402e', '#3e5038'], mask: () => 1, seed: 21 }))));
  // graves
  for (let i = 0; i < 22; i++) { const x = -7 + (i % 8) * 2 + (h2(i, 1, 3) - .5) * .5, z = -3.2 - Math.floor(i / 8) * 2.4 + (h2(i, 2, 3) - .5) * .5; const g = billboard(grave(i), .55, .75); g.position.set(x, 0, z); scene.add(g); }
  for (let i = 0; i < 6; i++) { const g = billboard(grave(40 + i), .55, .75); g.position.set(i < 3 ? -4.5 + i * 1.2 : 3 + (i - 3) * 1.3, 0, 1.8 + h2(i, 4, 3) * .6); scene.add(g); }
  // coffin on trestles (lid leaning), open grave behind
  const wood = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 7, nails: false, cols: ['#140c08', '#24160e', '#3a2416', '#52341e'] }));
  const cof = new THREE.Group();
  const base = box(2.0, .08, .62, wood); base.position.y = .6; cof.add(base);
  for (const [w, d, x, z] of [[2.0, .06, 0, -.3], [2.0, .06, 0, .3], [.06, .62, -1.0, 0], [.06, .62, 1.0, 0]]) { const s = box(w, .28, d, wood); s.position.set(x, .62, z); cof.add(s); }
  const satin = new THREE.Mesh(new THREE.PlaneGeometry(1.9, .54), new THREE.MeshStandardMaterial({ color: '#d8d2ca', roughness: .6 })); satin.rotation.x = -Math.PI / 2; satin.position.set(0, .685, 0); cof.add(satin);
  const L = lying(); const body = new THREE.Mesh(new THREE.PlaneGeometry(1.87, .6), new THREE.MeshStandardMaterial({ map: L.map, emissiveMap: L.em, emissive: '#ffffff', emissiveIntensity: .75, alphaTest: .5, transparent: true })); body.rotation.x = -Math.PI / 2; body.position.set(0, .7, 0); cof.add(body);
  const lid = box(2.0, .06, .64, wood); lid.position.set(0, .9, -.55); lid.rotation.x = 1.15; cof.add(lid);
  for (const x of [-.7, .7]) { const tr = box(.06, .6, .5, new THREE.MeshStandardMaterial({ color: '#2a2a30' })); tr.position.set(x, 0, 0); cof.add(tr); }
  const wr = billboard(wreath(), .5, .5); wr.position.set(.95, .62, .42); cof.add(wr);
  const notif = new THREE.Mesh(new THREE.PlaneGeometry(.11, .045), new THREE.MeshBasicMaterial({ color: '#eaf2ff', transparent: true, opacity: 0 })); notif.rotation.x = -Math.PI / 2; notif.position.set(-.18, .705, -.05); cof.add(notif);
  const phoneL = new THREE.PointLight('#8fc0ff', .6, 1.2, 2); phoneL.position.set(-.17, .95, 0); cof.add(phoneL);
  cof.rotation.y = -Math.PI / 2;   // head away from the camera: the overhead shot sees him whole
  scene.add(cof);

  // mourners (all scrolling), priest, the girl filming
  const F = { ph: { pose: 'standphone' }, ph2: { pose: 'standphone', blink: 1 }, stand: { pose: 'stand' }, film: { pose: 'film' }, talk: { pose: 'talk', mouth: 1 } };
  const looks = [
    { top: 'black', bottom: 'black', hair: 'hairDark', shoe: 'shoe' }, { top: 'black', bottom: 'black', hair: 'hairBrown', hairStyle: 'long', shoe: 'shoe' },
    { top: 'navy', bottom: 'black', hair: 'hairGrey', beard: 1, shoe: 'shoe' }, { top: 'black', bottom: 'grey', hair: 'hairBlond', hairStyle: 'bun', shoe: 'shoe' },
    { top: 'black', bottom: 'black', hair: 'hairDark', glasses: 1, shoe: 'shoe' }, { top: 'grey', bottom: 'black', hair: 'hairBrown', shoe: 'shoe' },
  ];
  const spots = [[-.6, -1.05], [.2, -1.15], [1.0, -1.0], [1.7, -.45], [-1.7, .55], [.1, -1.8]];
  const umbM = new THREE.MeshStandardMaterial({ color: '#0e0e12', roughness: .4, side: THREE.DoubleSide });
  const mourners = looks.map((l, i) => {
    const p = makePerson(l, F); p.root.position.set(spots[i][0], 0, spots[i][1]); scene.add(p.root);
    const u = new THREE.Group(); const can = new THREE.Mesh(new THREE.ConeGeometry(.62, .28, 10, 1, true), umbM); can.position.y = 2.0; can.castShadow = true; u.add(can);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .8, 6), umbM); st.position.y = 1.6; u.add(st); u.position.set(spots[i][0] - .12, 0, spots[i][1] + .05); scene.add(u);
    const pl = new THREE.PointLight('#8fc0ff', .45, 1.0, 2); scene.add(pl); return { p, pl, seed: i * 1.7 };
  });
  const priest = makePerson({ gown: 1, hair: 'hairWhite', hairStyle: 'bald', shoe: 'shoe' }, F); priest.root.position.set(-1.45, 0, -.35); scene.add(priest.root);
  const collar = null;
  const priestL = new THREE.PointLight('#8fc0ff', .5, 1.0, 2); scene.add(priestL);
  const girl = makePerson({ top: 'black', bottom: 'black', hair: 'hairBlond', hairStyle: 'long', shoe: 'shoe' }, F); girl.root.position.set(1.55, 0, .75); scene.add(girl.root);
  const girlL = new THREE.PointLight('#8fc0ff', .45, 1.0, 2); scene.add(girlL);
  const recDot = glow('#ff3020', .05, 2); recDot.visible = false; scene.add(recDot);

  // light: overcast, rain
  const sun = new THREE.DirectionalLight('#b8c4d8', 1.3); sun.position.set(-4, 10, 5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, far: 40 }); sun.shadow.bias = -.0008; scene.add(sun);
  const hemi = new THREE.HemisphereLight('#9aa6b8', '#1a1e1a', 1.0); scene.add(hemi);
  const fill = new THREE.PointLight('#c8d0e8', .8, 6, 2); fill.position.set(.3, 1.8, 2.4); scene.add(fill);
  const R = rain(900, [-5, 0, -4, 5, 6, 4], { speed: 18, len: .5, opacity: .3 }); scene.add(R);

  const CP = track([[0, [-.75, 1.75, 2.2]], [3.0, [-.6, 1.85, 2.5]], [7.5, [1.8, 4.6, 6.6]], [7.6, [2.9, 1.75, 3.0]], [10.9, [2.6, 1.7, 2.6]], [11.0, [.05, 2.6, .55]], [15.5, [.0, 1.85, .38]], [20, [.0, 1.8, .36]]]);
  const CL = track([[0, [-1.2, 1.15, -.4]], [3.0, [-1.1, 1.1, -.4]], [7.5, [.0, .55, -.4]], [7.6, [1.15, 1.2, .3]], [10.9, [1.0, 1.1, .2]], [11.0, [-.05, .7, .0]], [15.5, [-.08, .7, .0]], [20, [-.08, .7, .0]]]);
  const shotOf = t => t < 7.55 ? 0 : t < 10.95 ? 1 : 2;
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    // cameras: priest → rising wide → the girl → straight down into the coffin
    const s = shotOf(t);
    if (s === 0) { const u = eio(seg(t, 3.0, 7.5)); const a = CP(Math.min(t, 3.0)), b = [1.8, 4.6, 6.6], la = CL(Math.min(t, 3.0)), lb = [.0, .55, -.4]; cam.position.set(...a.map((v, i) => lerp(v, b[i], u))); cam.lookAt(...la.map((v, i) => lerp(v, lb[i], u))); cam.fov = lerp(44, 46, u); }
    else if (s === 1) { const u = seg(t, 7.6, 10.9); cam.position.set(lerp(2.9, 2.6, u), lerp(1.75, 1.7, u), lerp(3.0, 2.6, u)); cam.lookAt(lerp(1.15, 1.0, u), lerp(1.2, 1.1, u), lerp(.3, .2, u)); cam.fov = 44; }
    else { const u = eio(seg(t, 11.0, 15.5)); cam.position.set(0, lerp(3.7, 3.0, u), lerp(.75, .55, u)); cam.lookAt(0, .7, lerp(-.05, -.1, u)); cam.fov = 40; }
    cam.updateProjectionMatrix();
    // people
    mourners.forEach(({ p, pl, seed }) => { p.frame((t + seed) % 3.3 < .12 ? 'ph2' : 'ph'); p.face(cam, seed > 4); const q = p.local(25, 18); pl.position.copy(q).add(_v.set(.15, .05, .2)); });
    const praying = LINES[0]; priest.frame(t >= praying.a && t < praying.b && Math.floor(t * 3) % 2 ? 'talk' : 'ph'); priest.face(cam, false);
    priestL.position.copy(priest.local(25, 18)).add(_v.set(.15, .05, .2)); priestL.intensity = t < praying.b ? .25 : .5;
    const filming = t >= 7.9 && t < T.swipe; girl.frame(filming ? 'film' : 'ph'); girl.face(cam, true);
    girlL.position.copy(girl.local(filming ? 28 : 25, filming ? 12 : 18)).add(_v.set(-.1, .05, .2));
    recDot.visible = filming && Math.floor(t * 2) % 2 === 0; recDot.position.copy(girl.local(29, 10)).add(_v.set(0, 0, .02));
    // the phone in the coffin: a notification lands, it buzzes; nobody looks
    const pingK = t >= T.ping ? Math.min(1, (t - T.ping) / .15) * (1 - seg(t, T.ping + 3.2, T.ping + 3.6)) : 0;
    notif.material.opacity = .95 * pingK;
    const bz = t >= T.buzz && t < T.buzz + .5 ? Math.sin(t * 160) * .004 : 0; notif.position.z = -.05 + bz; body.position.z = bz * .5;
    phoneL.intensity = .6 + .5 * pingK;
    R.userData.update(t, [-2.5, 0]);
    // post
    const fp = s === 2 ? _v.set(0, .7, -.1) : s === 1 ? girl.root.position.clone().setY(1.2) : priest.root.position.clone().setY(1.2);
    post.dof.focus = cam.position.distanceTo(fp); post.dof.aper = s === 2 ? 90 : 200; post.dof.maxCoc = 18;
    renderer.toneMappingExposure = 1.15; post.bloom.strength = .5; post.bloom.threshold = .85;
    post.vig.uniforms.sat.value = .82;   // grey day: only his hoodie keeps its colour
  }
  return { scene, update, hero: { root: cof } };
}
