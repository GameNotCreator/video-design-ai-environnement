// "Le permis": the cut-away house, two identical floors. The three months before the test: upstairs he scrolls (desk,
// bed, the dark); downstairs he locks his phone and learns the road signs (they cover the wall), recites them, sleeps.
// Test day: both floors become the same street with the driving-school car. "Park right here": upstairs he knocks the
// cone over and the examiner shakes his head; downstairs he parks, gets out and holds up his pink licence.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson } from './people.js';
import { T, phaseAt } from './story.js';
import { seg, eio, lerp } from '/core/lib.js';

const FY = [2.25, 0];   // floor heights: [upstairs, downstairs]
function wallTex(cols, s) { const P = new PX(64, 64), R = ramp(cols, .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, s) - .5) * .25 + (h2(x, y, s) - .5) * .1, x, y)); return P.done(); }
function blanketTex() { const P = new PX(48, 30), R = ramp(['#1c2236', '#2a3350', '#3c4870', '#56658e'], .45); P.fill((x, y) => R(.5 + .2 * Math.sin(x * .5 + Math.sin(y * .3) * 2) + (h2(x, y, 4) - .5) * .2 + ((x + y) % 8 === 0 ? -.15 : 0), x, y)); return P.done(); }
function stoneTex() { const P = new PX(64, 32), R = ramp(['#1a1816', '#2a2622', '#3a342e', '#4a433a'], .45); P.fill((x, y) => { const row = y >> 3, off = (row % 2) * 6, edge = (y % 8 === 0) || ((x + off) % 12 === 0); return R(edge ? .15 : .5 + (h2(x >> 2, y >> 2, 3) - .5) * .4, x, y); }); return P.done(); }
function signTex(s) {   // a road sign card: blue round (arrow), white triangle (warning), blue square (P); no red
  const P = new PX(15, 15), k = s % 3; P.fill(() => [236, 232, 222]);
  if (k === 0) { P.ellipse(7, 7, 6, 6, () => [40, 90, 170]); for (let y = 4; y < 11; y++) P.set(7, y, [240, 240, 240]); P.set(6, 5, [240, 240, 240]); P.set(8, 5, [240, 240, 240]); P.set(5, 6, [240, 240, 240]); P.set(9, 6, [240, 240, 240]); }
  else if (k === 1) { P.poly([[7, 1], [14, 13], [0, 13]], () => [30, 30, 36]); P.poly([[7, 4], [12, 12], [2, 12]], () => [244, 240, 230]); for (let y = 6; y < 10; y++) P.set(7, y, [30, 30, 36]); P.set(7, 11, [30, 30, 36]); }
  else { P.rect(2, 2, 11, 11, [40, 90, 170]); for (let y = 4; y < 11; y++) P.set(5, y, [240, 240, 240]); for (let x = 5; x < 9; x++) { P.set(x, 4, [240, 240, 240]); P.set(x, 7, [240, 240, 240]); } P.set(9, 5, [240, 240, 240]); P.set(9, 6, [240, 240, 240]); }
  return texOf(P.done());
}
function streetTex() {   // the other side of the street: a grey-beige building, rows of windows, a shop front
  const P = new PX(96, 60), R = ramp(['#4e4a4a', '#66605c', '#7e7670', '#968c84'], .45);
  P.fill((x, y) => R(.55 + (fbm(x * .15, y * .15, 3) - .5) * .25 + (h2(x, y, 6) - .5) * .1, x, y));
  for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) { const x0 = 4 + c * 16, y0 = 5 + r * 14; for (let y = y0; y < y0 + 9; y++) for (let x = x0; x < x0 + 8; x++) P.set(x, y, (x === x0 + 4 || y === y0 + 4) ? [60, 56, 54] : (h2(c, r, 4) > .6 ? [214, 196, 150] : [44, 52, 70])); }
  for (let y = 36; y < 56; y++) for (let x = 10; x < 86; x++) P.set(x, y, y < 40 ? [54, 66, 84] : (x % 19 === 0 ? [50, 46, 44] : [70, 84, 100]));
  for (let x = 0; x < 96; x++) for (let y = 56; y < 60; y++) P.set(x, y, [120, 116, 110]);
  return P.done();
}
function roadTex() { const P = new PX(64, 48), R = ramp(['#232428', '#2e3034', '#3a3c42', '#46484e'], .45); P.fill((x, y) => (y >= 30 && y < 32 && (x % 16) < 9) ? [210, 206, 196] : y < 8 ? [110, 106, 100] : R(.5 + (h2(x, y, 9) - .5) * .35, x, y)); return P.done(); }
function licenceTex() { const P = new PX(16, 10); P.fill((x, y) => (x === 0 || x === 15 || y === 0 || y === 9) ? [200, 130, 150] : [240, 184, 200]); P.rect(2, 2, 4, 6, [120, 110, 120]); for (let x = 7; x < 14; x++) { P.set(x, 3, [140, 90, 110]); if (x < 12) P.set(x, 6, [140, 90, 110]); } return texOf(P.done()); }

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#070912');
  for (let i = 0; i < 40; i++) { const s = glow('#dfe8ff', .05 + h2(i, 3, 1) * .05, 1.2); s.position.set(-6 + h2(i, 1, 1) * 12, -1 + h2(i, 2, 1) * 8, -6); scene.add(s); }
  const stone = mat(stoneTex()); const found = box(3.6, 1.8, 2.6, stone); found.position.set(0, -2.05, -1.1); scene.add(found);
  const slabM = new THREE.MeshStandardMaterial({ color: '#241c18', roughness: .9 }), trimM = new THREE.MeshBasicMaterial({ color: '#d8c28e' });
  for (const y of [-.25, 2.0, 4.25]) { const s = box(3.5, .25, 2.5, slabM); s.position.set(0, y, -1.1); scene.add(s); const tr = box(3.5, .025, .02, trimM); tr.position.set(0, y + .11, .16); scene.add(tr); }
  const street = texOf(streetTex()), road = texOf(roadTex()), licence = licenceTex();
  const floors = FY.map((y0, f) => {
    const g = new THREE.Group(); g.position.y = y0; scene.add(g);
    const wood = mesh(new THREE.BoxGeometry(3.2, .02, 2.25).translate(0, .01, -1.1), mat(woodPlanks(96, 64, { pw: 6, len: 48, seed: 3 + f, cols: ['#1a120e', '#2c1e16', '#43301f', '#5a4128', '#6e5032'] }))); g.add(wood);
    // —— his bedroom (the three months before) ——
    const bed = new THREE.Group(); g.add(bed);
    const wM = mat(wallTex(['#1c2030', '#262c40', '#323a52', '#3e4862'], 2 + f));
    const back = box(3.2, 2.0, .1, wM); back.position.set(0, 0, -2.25); bed.add(back);
    for (const x of [-1.65, 1.65]) { const sw = box(.1, 2.0, 2.4, wM); sw.position.set(x, 0, -1.1); bed.add(sw); }
    const woodM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 6 + f, nails: false, cols: ['#1e140e', '#33231a', '#4a3424', '#5e4430'] }));
    const bf = box(.95, .3, 1.9, woodM); bf.position.set(-1.05, 0, -1.2); bed.add(bf);
    const mt = box(.92, .14, 1.86, mat(blanketTex())); mt.position.set(-1.05, .3, -1.2); bed.add(mt);
    const pil = box(.7, .1, .35, new THREE.MeshStandardMaterial({ color: '#b8b4c4', roughness: 1 })); pil.position.set(-1.05, .44, -1.95); bed.add(pil);
    const lump = new THREE.Group(); lump.add(new THREE.Mesh(new THREE.CapsuleGeometry(.2, 1.0, 4, 8).rotateX(Math.PI / 2), mat(blanketTex()))); lump.children[0].position.set(0, .56, -1.0);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), new THREE.MeshStandardMaterial({ color: '#1f1619', roughness: .9 })); hair.position.set(0, .58, -1.85); lump.add(hair); lump.position.x = -1.05; bed.add(lump);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(.8, .6), new THREE.MeshBasicMaterial({ color: '#0a1028' })); win.position.set(-.1, 1.32, -2.19); bed.add(win);
    const frM = new THREE.MeshStandardMaterial({ color: '#2a2018', roughness: .9 });
    for (const [w, h, x, y] of [[.88, .05, -.1, 1.63], [.88, .05, -.1, 1.02], [.05, .66, -.52, 1.32], [.05, .66, .32, 1.32], [.03, .6, -.1, 1.32]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .05), frM); b.position.set(x, y, -2.18); bed.add(b); }
    const moon = glow('#c8d8ff', .25, 1.0); moon.position.set(.1, 1.5, -2.18); bed.add(moon);
    const desk = box(1.05, .05, .62, woodM); desk.position.set(1.05, .72, -1.05); bed.add(desk);
    for (const [x, z] of [[.6, -1.3], [1.5, -1.3], [.6, -.8], [1.5, -.8]]) { const l = box(.05, .72, .05, woodM); l.position.set(x, 0, z); bed.add(l); }
    const chair = box(.4, .05, .4, woodM); chair.position.set(.22, .42, -1.02); bed.add(chair);
    for (const [x, z] of [[.05, -1.19], [.39, -1.19], [.05, -.85], [.39, -.85]]) { const l = box(.04, .42, .04, woodM); l.position.set(x, 0, z); bed.add(l); }
    const lampB = box(.06, .32, .06, new THREE.MeshStandardMaterial({ color: '#202028' })); lampB.position.set(1.42, .745, -1.25); bed.add(lampB);
    const lampG = glow('#ffc070', .3, 1.0); lampG.position.set(1.36, 1.1, -1.2); bed.add(lampG);
    // the road signs he learns: they cover the wall above the desk, month after month
    const cards = Array.from({ length: 8 }, (_, i) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(.15, .15), new THREE.MeshStandardMaterial({ map: signTex(i + f), roughness: .95 })); p.position.set(.55 + (i % 4) * .24, 1.62 - Math.floor(i / 4) * .2 + (h2(i, 2, 4) - .5) * .04, -2.185); p.rotation.z = (h2(i, 5, 2) - .5) * .16; p.visible = false; bed.add(p); return p; });
    const facedown = box(.08, .015, .15, new THREE.MeshStandardMaterial({ color: '#16161c', roughness: .4 })); facedown.position.set(.68, .745, -.85); facedown.visible = false; bed.add(facedown);
    const lampL = new THREE.PointLight('#ffcf90', 2.2, 2.6, 1.5); lampL.position.set(1.2, 1.2, -.9); g.add(lampL);
    const moonL = new THREE.PointLight('#8aa0e0', .8, 3, 1.5); moonL.position.set(-.1, 1.3, -1.6); g.add(moonL);
    // —— test day: the street and the driving-school car ——
    const town = new THREE.Group(); town.visible = false; g.add(town);
    const sb = box(3.2, 2.0, .1, new THREE.MeshStandardMaterial({ map: street, roughness: .95 })); sb.position.set(0, 0, -2.25); town.add(sb);
    const sideM = mat(wallTex(['#4e4a4a', '#66605c', '#7e7670', '#968c84'], 11 + f));
    for (const x of [-1.65, 1.65]) { const sw = box(.1, 2.0, 2.4, sideM); sw.position.set(x, 0, -1.1); town.add(sw); }
    const asphalt = mesh(new THREE.BoxGeometry(3.2, .022, 2.25).translate(0, .012, -1.1), new THREE.MeshStandardMaterial({ map: road, roughness: .95 })); town.add(asphalt);
    const curb = box(3.2, .1, .3, new THREE.MeshStandardMaterial({ color: '#8a8680', roughness: .9 })); curb.position.set(0, 0, -2.05); town.add(curb);
    const cone = new THREE.Group(); const cm = new THREE.Mesh(new THREE.ConeGeometry(.13, .44, 14), new THREE.MeshStandardMaterial({ color: '#c86a2a', roughness: .7 })); cm.position.y = .22; cone.add(cm);
    const cb = box(.28, .03, .28, new THREE.MeshStandardMaterial({ color: '#2a2a2e' })); cone.add(cb); cone.position.set(.86, .02, -.6); town.add(cone);
    const car = new THREE.Group(); town.add(car);
    const bodyM = new THREE.MeshStandardMaterial({ color: '#7a8a96', roughness: .5, metalness: .2 }), darkM = new THREE.MeshStandardMaterial({ color: '#1c1e24', roughness: .6 });
    const lower = box(1.9, .5, .95, bodyM); lower.position.set(0, .2, -1.05); car.add(lower);
    const roof = box(1.3, .07, .95, bodyM); roof.position.set(-.15, 1.72, -1.05); car.add(roof);
    for (const [x, rz, h] of [[.85, .42, 1.1], [-.78, -.1, 1.03], [-.08, 0, 1.03]]) { const p = box(.07, h, .08, bodyM); p.position.set(x, .7, -.6); p.rotation.z = rz; car.add(p); }
    const sign = box(.36, .13, .14, new THREE.MeshStandardMaterial({ color: '#3a5a9a', roughness: .6 })); sign.position.set(-.15, 1.79, -1.05); car.add(sign);
    for (const x of [-.58, .58]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.23, .23, .14, 18), darkM); w.rotation.x = Math.PI / 2; w.position.set(x, .23, -.56); car.add(w); const hub = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .15, 12), new THREE.MeshStandardMaterial({ color: '#a8acb4', metalness: .5, roughness: .4 })); hub.rotation.x = Math.PI / 2; hub.position.set(x, .23, -.555); car.add(hub); }
    const head = glow('#fff2cc', .12, 1.2); head.position.set(.96, .52, -.62); car.add(head);
    const card = new THREE.Mesh(new THREE.PlaneGeometry(.18, .11), new THREE.MeshBasicMaterial({ map: licence })); card.visible = false; g.add(card);
    const sunL = new THREE.PointLight('#fff0dc', 0, 4.5, 1.1); sunL.position.set(-.4, 1.9, -.1); g.add(sunL);
    // —— him and the examiner ——
    const hero = makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark', shoe: 'sneaker' }, {
      phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, tired: { pose: 'phone', bob: 1, blink: 1 }, laugh: { pose: 'sitlaugh' },
      w0: { pose: 'write', step: 0 }, w1: { pose: 'write', step: 1 }, rep: { pose: 'sittalk', mouth: 1 }, rep2: { pose: 'sittalk' },
      drive: { pose: 'sit' }, oops: { pose: 'sit', mouth: 1, blink: 1 }, lost: { pose: 'sit', blink: 1, bob: 1 }, card: { pose: 'wave', smile: 1 },
    });
    const exam = makePerson({ top: 'navy', bottom: 'navy', suit: 1, hair: 'hairGrey', glasses: 1, shoe: 'shoe' }, {
      sit: { pose: 'sit' }, talk: { pose: 'sittalk', mouth: 1 }, smile: { pose: 'sit', smile: 1 }, no: { pose: 'sittalk', blink: 1 },
    });
    for (const P of [hero, exam]) { P.shadow.visible = false; g.add(P.root); }
    const phoneL = new THREE.PointLight('#8fc0ff', 1.0, 1.4, 2); g.add(phoneL);
    return { g, bed, town, lump, cards, facedown, cone, car, card, lampL, lampG, moonL, sunL, hero, exam, phoneL };
  });
  scene.add(new THREE.HemisphereLight('#7080b0', '#1c1418', 1.3));
  const fill = new THREE.PointLight('#c0c8e8', 3.0, 20, 1.2); fill.position.set(0, 2.3, 5); scene.add(fill);
  const _v = new THREE.Vector3(), alt = (t, r, k = 0) => Math.floor(t * r + k) % 2;

  function update(t, shot, cam, post, renderer) {
    const u = eio(seg(t, 0, T.end)); cam.position.set(0, 2.17, lerp(13.2, 12.9, u)); cam.lookAt(0, 2.17, -1); cam.fov = 24.0; cam.updateProjectionMatrix();
    const ph = phaseAt(t), test = ph >= 4;
    floors.forEach((F, f) => {
      const up = f === 0, H = F.hero, E = F.exam;
      F.bed.visible = !test; F.town.visible = test; F.sunL.intensity = test ? 3.4 : 0; E.root.visible = test; F.card.visible = false;
      let pos = [.22, .02, -1.0], fr = 'phone', vis = true, flip = false;
      if (!test) {
        F.lampL.intensity = ph < 3 ? 2.2 : 0; F.lampG.visible = ph < 3; F.moonL.intensity = ph >= 3 ? 1.3 : .8;
        F.lump.visible = !up && ph >= 3;
        if (up) {
          if (ph >= 1) pos = [-.7, .02, -.95];
          fr = ph === 2 ? 'laugh' : ph === 3 ? 'tired' : (t % 2.9 < .1 ? 'blink' : 'phone');
          F.facedown.visible = false; F.cards.forEach(c => { c.visible = false; });
        } else {
          F.facedown.visible = t >= T.down && ph < 3;
          F.cards.forEach((c, i) => { c.visible = ph >= 1 && (ph >= 2 ? true : i < 4 && t >= 3.0 + i * .3); });
          if (ph >= 3) vis = false;
          else if (ph === 2) fr = alt(t, 3) ? 'rep' : 'rep2';
          else if (t >= T.down) fr = alt(t, 4) ? 'w0' : 'w1';
        }
      } else {
        F.lampL.intensity = 0; F.lampG.visible = false; F.moonL.intensity = 0; F.lump.visible = false;
        // the car pulls in: upstairs too far (the cone goes over), downstairs it stops in time
        const k = eio(seg(t, T.park, T.bump)), cx = lerp(-.85, up ? -.17 : -.45, k); F.car.position.x = cx;
        const tip = up ? eio(seg(t, T.bump, T.bump + .35)) : 0; F.cone.rotation.z = -1.35 * tip; F.cone.position.set(.86 + .16 * tip, .02, -.6);
        const asking = t >= 8.2 && t < 11.0, verdict = ph >= 5;
        E.root.position.set(cx - .38, .05, -1.18);
        if (up) {
          pos = [cx + .22, .05, -1.0]; fr = t >= T.bump && t < 13.5 ? 'oops' : verdict ? 'lost' : 'drive';
          E.frame(asking ? (alt(t, 3) ? 'talk' : 'sit') : verdict ? 'no' : 'sit'); E.face(cam, verdict ? alt(t, 4) === 1 : false);
        } else if (!verdict) {
          pos = [cx + .22, .05, -1.0]; fr = 'drive';
          E.frame(asking ? (alt(t, 3) ? 'talk' : 'sit') : 'sit'); E.face(cam, false);
        } else {   // out of the car, the pink licence held up
          pos = [1.0, 0, -.3]; fr = 'card';
          E.frame(alt(t, 2.5) ? 'talk' : 'smile'); E.face(cam, false);
        }
      }
      H.root.visible = vis; H.root.position.set(...pos); H.frame(fr); H.face(cam, flip);
      if (fr === 'card') { F.card.visible = true; F.card.position.copy(H.local(24, 6)).add(_v.set(0, 0, .06)); F.card.rotation.y = H.root.rotation.y; }
      const lit = vis && ['phone', 'blink', 'tired', 'laugh'].includes(fr);
      F.phoneL.intensity = lit ? 1.0 : 0; if (lit) F.phoneL.position.copy(H.local(25, 18)).add(_v.set(.2, .05, .2));
    });
    post.dof.focus = cam.position.distanceTo(_v.set(0, 2.1, -1.0)); post.dof.aper = 2; post.dof.maxCoc = 3;
    renderer.toneMappingExposure = 1.25; post.bloom.strength = .3; post.bloom.threshold = .88;
  }
  return { scene, update };
}
