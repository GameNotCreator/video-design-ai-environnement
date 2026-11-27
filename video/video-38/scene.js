// "Erasmus": the cut-away house, two identical floors. The six months before Madrid: upstairs he scrolls (desk, bed,
// the dark, an empty suitcase the night before); downstairs he locks his phone, writes flashcards (they cover the wall),
// repeats a Spanish podcast in his earbuds, packs and sleeps. Madrid: both floors become the same café terrace. Upstairs
// he points at the menu and ends up alone with his phone; downstairs he orders, and Lucía comes over to his table.
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
function cardTex(s) {   // a flashcard: a word on top, its translation below (pixel dashes)
  const P = new PX(16, 11); P.fill((x, y) => (x === 0 || x === 15 || y === 0 || y === 10) ? [170, 166, 156] : [240, 236, 226]);
  const w = 6 + Math.floor(h2(s, 1, 3) * 6); for (let x = 2; x < 2 + w; x++) P.set(x, 3, [40, 46, 80]); for (let x = 2; x < 2 + w; x++) P.set(x, 4, [40, 46, 80]);
  for (let x = 2; x < 12; x++) if (h2(x, s, 5) > .3) P.set(x, 7, [120, 110, 100]);
  return texOf(P.done());
}
function facadeTex() {   // Madrid: ochre plaster, two windows with shutters, the café door and its sign
  const P = new PX(96, 60), R = ramp(['#7a5a3a', '#96744e', '#b08c62', '#c8a678'], .45), Sh = ramp(['#24342a', '#34483a', '#48604e', '#5e7a64'], .3);
  P.fill((x, y) => R(.55 + (fbm(x * .15, y * .15, 7) - .5) * .3 + (h2(x, y, 2) - .5) * .12 - (y > 56 ? .25 : 0), x, y));
  for (const wx of [8, 70]) {
    for (let y = 8; y < 30; y++) for (let x = wx + 4; x < wx + 16; x++) P.set(x, y, (x === wx + 10 || y === 18) ? [70, 56, 44] : [26, 24, 34]);
    for (let y = 8; y < 30; y++) for (let x = 0; x < 4; x++) { P.set(wx + x, y, Sh(.6 - (y % 3 === 0 ? .25 : 0), x, y)); P.set(wx + 16 + x, y, Sh(.6 - (y % 3 === 0 ? .25 : 0), x, y)); }
    for (let x = wx; x < wx + 20; x++) { P.set(x, 31, [60, 50, 44]); if (x % 2 === 0) P.set(x, 33, [60, 50, 44]); P.set(x, 35, [60, 50, 44]); }
  }
  for (let y = 26; y < 60; y++) for (let x = 38; x < 58; x++) P.set(x, y, (x === 48 || x === 38 || x === 57) ? [40, 26, 18] : [62 + (y % 4 === 0 ? -10 : 0), 40, 26]);
  for (let y = 18; y < 24; y++) for (let x = 34; x < 62; x++) P.set(x, y, [36, 34, 40]);
  for (let x = 37; x < 59; x++) if (h2(x, 1, 9) > .35) P.set(x, 21, [232, 214, 170]);
  return P.done();
}
function awningTex() { const P = new PX(32, 6); P.fill((x, y) => (Math.floor(x / 2) % 2 ? [228, 220, 200] : [176, 140, 84]).map(v => v - (y === 5 ? 30 : 0))); return P.done(); }
function plantTex() { const P = new PX(16, 24); for (let y = 0; y < 24; y++) for (let x = 0; x < 16; x++) { const d = Math.hypot(x - 8, (y - 8) * .8); if (y < 16 && d < 7 && h2(x, y, 2) > .2) P.set(x, y, [40 + (y * 3), 90 + h2(x, y, 3) * 40, 50]); if (y >= 16 && x > 4 && x < 12) P.set(x, y, [150, 90, 60]); } return P.done(); }

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#070912');
  for (let i = 0; i < 40; i++) { const s = glow('#dfe8ff', .05 + h2(i, 3, 1) * .05, 1.2); s.position.set(-6 + h2(i, 1, 1) * 12, -1 + h2(i, 2, 1) * 8, -6); scene.add(s); }
  const stone = mat(stoneTex()); const found = box(3.6, 1.8, 2.6, stone); found.position.set(0, -2.05, -1.1); scene.add(found);
  const slabM = new THREE.MeshStandardMaterial({ color: '#241c18', roughness: .9 }), trimM = new THREE.MeshBasicMaterial({ color: '#d8c28e' });
  for (const y of [-.25, 2.0, 4.25]) { const s = box(3.5, .25, 2.5, slabM); s.position.set(0, y, -1.1); scene.add(s); const tr = box(3.5, .025, .02, trimM); tr.position.set(0, y + .11, .16); scene.add(tr); }
  const facade = texOf(facadeTex()), awn = texOf(awningTex()), plantT = texOf(plantTex());
  const floors = FY.map((y0, f) => {
    const g = new THREE.Group(); g.position.y = y0; scene.add(g);
    const wood = mesh(new THREE.BoxGeometry(3.2, .02, 2.25).translate(0, .01, -1.1), mat(woodPlanks(96, 64, { pw: 6, len: 48, seed: 3 + f, cols: ['#1a120e', '#2c1e16', '#43301f', '#5a4128', '#6e5032'] }))); g.add(wood);
    // —— his bedroom (the six months before) ——
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
    // the flashcards: they cover the wall above the desk, month after month
    const cards = Array.from({ length: 8 }, (_, i) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(.2, .14), new THREE.MeshStandardMaterial({ map: cardTex(i + 3 * f), roughness: .95 })); p.position.set(.55 + (i % 4) * .24, 1.62 - Math.floor(i / 4) * .2 + (h2(i, 2, 4) - .5) * .04, -2.185); p.rotation.z = (h2(i, 5, 2) - .5) * .16; p.visible = false; bed.add(p); return p; });
    const facedown = box(.08, .015, .15, new THREE.MeshStandardMaterial({ color: '#16161c', roughness: .4 })); facedown.position.set(.68, .745, -.85); facedown.visible = false; bed.add(facedown);
    // the suitcase the night before: open and empty upstairs, closed and standing by the door downstairs
    const caseM = new THREE.MeshStandardMaterial({ color: '#3a4a5a', roughness: .7 });
    const caseOpen = new THREE.Group(); const cb0 = box(.55, .12, .38, caseM); caseOpen.add(cb0); const lid = box(.55, .38, .04, caseM); lid.position.set(0, .1, -.2); lid.rotation.x = -.25; caseOpen.add(lid);
    const inside = box(.5, .02, .33, new THREE.MeshStandardMaterial({ color: '#1a1e26', roughness: 1 })); inside.position.y = .11; caseOpen.add(inside); caseOpen.position.set(-.05, .02, -.55); caseOpen.visible = false; bed.add(caseOpen);
    const caseShut = box(.4, .6, .22, caseM); caseShut.position.set(-.35, .02, -1.85); caseShut.visible = false; bed.add(caseShut);
    const handle = box(.14, .04, .04, new THREE.MeshStandardMaterial({ color: '#1a1a20' })); handle.position.set(-.35, .64, -1.85); handle.visible = false; bed.add(handle);
    const lampL = new THREE.PointLight('#ffcf90', 2.2, 2.6, 1.5); lampL.position.set(1.2, 1.2, -.9); g.add(lampL);
    const moonL = new THREE.PointLight('#8aa0e0', .8, 3, 1.5); moonL.position.set(-.1, 1.3, -1.6); g.add(moonL);
    // —— Madrid: the café terrace ——
    const madrid = new THREE.Group(); madrid.visible = false; g.add(madrid);
    const fM = new THREE.MeshStandardMaterial({ map: facade, roughness: .95 });
    const fb = box(3.2, 2.0, .1, fM); fb.position.set(0, 0, -2.25); madrid.add(fb);
    const sideM = mat(wallTex(['#7a5a3a', '#96744e', '#b08c62', '#c8a678'], 11 + f));
    for (const x of [-1.65, 1.65]) { const sw = box(.1, 2.0, 2.4, sideM); sw.position.set(x, 0, -1.1); madrid.add(sw); }
    const awning = new THREE.Mesh(new THREE.BoxGeometry(3.1, .03, .55), new THREE.MeshStandardMaterial({ map: awn, roughness: .9 })); awning.position.set(0, 1.62, -1.95); awning.rotation.x = .35; madrid.add(awning);
    const tiles = mesh(new THREE.BoxGeometry(3.2, .022, 2.25).translate(0, .012, -1.1), mat(wallTex(['#5a4a3e', '#6e5a4a', '#806a56', '#927a64'], 3 + f))); madrid.add(tiles);
    const tM = new THREE.MeshStandardMaterial({ color: '#c8c4bc', roughness: .5, metalness: .3 });
    const tables = [-.82, .68].map(x => { const top = new THREE.Mesh(new THREE.CylinderGeometry(.28, .28, .03, 20), tM); top.position.set(x, .72, -1.3); madrid.add(top); const leg = box(.05, .7, .05, tM); leg.position.set(x, 0, -1.3); madrid.add(leg); return top; });
    for (const x of [-1.2, -.45, .3, 1.05]) { const ch = box(.32, .04, .32, tM); ch.position.set(x, .42, -1.3); madrid.add(ch); const cl = box(.04, .42, .04, tM); cl.position.set(x, 0, -1.3); madrid.add(cl); }
    const cupM = new THREE.MeshStandardMaterial({ color: '#f0ece4', roughness: .4 });
    for (const x of [-.95, -.7]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.035, .03, .06, 12), cupM); c.position.set(x, .765, -1.25); madrid.add(c); }
    const menu = new THREE.Mesh(new THREE.PlaneGeometry(.12, .17), new THREE.MeshStandardMaterial({ color: '#f0e8d8', roughness: .9 })); menu.position.set(.76, .82, -1.35); madrid.add(menu);
    const myCup = new THREE.Mesh(new THREE.CylinderGeometry(.035, .03, .06, 12), cupM); myCup.position.set(.58, .765, -1.25); myCup.visible = false; madrid.add(myCup);
    const plant = new THREE.Mesh(new THREE.PlaneGeometry(.4, .6), new THREE.MeshStandardMaterial({ map: plantT, transparent: true, alphaTest: .5, side: THREE.DoubleSide })); plant.position.set(1.4, .3, -1.9); madrid.add(plant);
    const sunL = new THREE.PointLight('#ffe0b0', 0, 4.5, 1.1); sunL.position.set(-.6, 1.9, -.2); g.add(sunL);
    // —— him, the waiter, Lucía and Pablo ——
    const hero = makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark', shoe: 'sneaker', buds: 1 }, {
      phone: { pose: 'phone', nobuds: 1 }, blink: { pose: 'phone', blink: 1, nobuds: 1 }, tired: { pose: 'phone', bob: 1, blink: 1, nobuds: 1 }, laugh: { pose: 'sitlaugh', nobuds: 1 },
      w0: { pose: 'write', step: 0, nobuds: 1 }, w1: { pose: 'write', step: 1, nobuds: 1 }, rep: { pose: 'sittalk', mouth: 1 }, rep2: { pose: 'sittalk' },
      sit: { pose: 'sit', nobuds: 1 }, talk: { pose: 'sittalk', mouth: 1, smile: 1, nobuds: 1 }, smile: { pose: 'sit', smile: 1, nobuds: 1 },
      point: { pose: 'sitpoint', nobuds: 1 }, lost: { pose: 'sit', blink: 1, bob: 1, nobuds: 1 },
    });
    const waiter = makePerson({ top: 'white', bottom: 'black', hair: 'hairBrown', beard: 1, shoe: 'shoe' }, { stand: { pose: 'stand' }, ask: { pose: 'talk', mouth: 1 }, smile: { pose: 'stand', smile: 1 } });
    const lucia = makePerson({ top: 'teal', bottom: 'jean', hair: 'hairDark', hairStyle: 'long', shoe: 'shoe' }, { sit: { pose: 'sit' }, talk: { pose: 'sittalk', mouth: 1, smile: 1 }, smile: { pose: 'sit', smile: 1 } });
    const pablo = makePerson({ top: 'beige', bottom: 'jean', hair: 'hairBrown', beard: 1, shoe: 'sneaker' }, { sit: { pose: 'sit' }, talk: { pose: 'sittalk', mouth: 1, smile: 1 }, smile: { pose: 'sit', smile: 1 } });
    for (const P of [hero, waiter, lucia, pablo]) { P.shadow.visible = false; g.add(P.root); }
    const phoneL = new THREE.PointLight('#8fc0ff', 1.0, 1.4, 2); g.add(phoneL);
    return { g, bed, madrid, lump, cards, facedown, caseOpen, caseShut, handle, lampL, lampG, moonL, sunL, myCup, hero, waiter, lucia, pablo, phoneL };
  });
  scene.add(new THREE.HemisphereLight('#7080b0', '#1c1418', 1.3));
  const fill = new THREE.PointLight('#c0c8e8', 3.0, 20, 1.2); fill.position.set(0, 2.3, 5); scene.add(fill);
  const _v = new THREE.Vector3(), alt = (t, r, k = 0) => Math.floor(t * r + k) % 2;

  function update(t, shot, cam, post, renderer) {
    const u = eio(seg(t, 0, T.end)); cam.position.set(0, 2.17, lerp(13.2, 12.9, u)); cam.lookAt(0, 2.17, -1); cam.fov = 24.0; cam.updateProjectionMatrix();
    const ph = phaseAt(t), abroad = ph >= 4;
    floors.forEach((F, f) => {
      const up = f === 0, H = F.hero, W = F.waiter, L = F.lucia, P = F.pablo;
      F.bed.visible = !abroad; F.madrid.visible = abroad; F.sunL.intensity = abroad ? 3.4 : 0;
      W.root.visible = L.root.visible = P.root.visible = abroad;
      let pos = [.22, .02, -1.0], fr = 'phone', vis = true, flip = false;
      if (!abroad) {
        F.lampL.intensity = ph < 3 ? 2.2 : 0; F.lampG.visible = ph < 3; F.moonL.intensity = ph >= 3 ? 1.3 : .8;
        F.lump.visible = !up && ph >= 3; F.caseOpen.visible = up && ph >= 3; F.caseShut.visible = F.handle.visible = !up && ph >= 3;
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
        const verdict = ph >= 5, asking = t >= 8.2 && t < 11.0;
        pos = [.3, .02, -1.25];
        W.root.visible = !verdict; W.root.position.set(1.22, 0, -1.1); W.frame(asking ? (alt(t, 3) ? 'ask' : 'stand') : t >= T.point && !up ? 'smile' : 'stand'); W.face(cam, true);
        F.myCup.visible = verdict;
        if (!verdict) {
          L.root.position.set(-1.2, .02, -1.25); L.frame(alt(t, 1.6) ? 'talk' : 'smile'); L.face(cam, false);
          P.root.position.set(-.45, .02, -1.25); P.frame(alt(t, 1.6, 1) ? 'talk' : 'sit'); P.face(cam, true);
          if (up) fr = t >= T.point ? (alt(t, 2) ? 'point' : 'lost') : 'sit';
          else fr = t >= T.point ? (alt(t, 3) ? 'talk' : 'smile') : 'sit';
        } else if (up) {   // alone with his phone; the two of them laugh at the next table
          L.root.position.set(-1.2, .02, -1.25); L.frame(alt(t, 2.2) ? 'talk' : 'smile'); L.face(cam, false);
          P.root.position.set(-.45, .02, -1.25); P.frame(alt(t, 2.2, 1) ? 'talk' : 'smile'); P.face(cam, true);
          fr = t % 2.9 < .1 ? 'blink' : 'phone';
        } else {          // Lucía has come over to his table; Pablo turns his chair towards them
          L.root.position.set(1.05, .02, -1.25); L.frame(alt(t, 2.4) ? 'talk' : 'smile'); L.face(cam, true);
          P.root.position.set(-.45, .02, -1.25); P.frame(alt(t, 2.4, 1) ? 'talk' : 'smile'); P.face(cam, false);
          fr = alt(t, 2.4, 1) ? 'talk' : 'smile';
        }
      }
      H.root.visible = vis; H.root.position.set(...pos); H.frame(fr); H.face(cam, flip);
      const lit = vis && ['phone', 'blink', 'tired', 'laugh'].includes(fr);
      F.phoneL.intensity = lit ? 1.0 : 0; if (lit) F.phoneL.position.copy(H.local(25, 18)).add(_v.set(.2, .05, .2));
    });
    post.dof.focus = cam.position.distanceTo(_v.set(0, 2.1, -1.0)); post.dof.aper = 2; post.dof.maxCoc = 3;
    renderer.toneMappingExposure = 1.25; post.bloom.strength = .3; post.bloom.threshold = .88;
  }
  return { scene, update };
}
