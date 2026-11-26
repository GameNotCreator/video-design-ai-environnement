// "Partiels": a cut-away house with two identical floors, the same student in each. Night: upstairs he scrolls (desk,
// then bed, then the dark), downstairs he locks his phone, writes, goes to bed at one. Exam day: both floors turn into
// the exam hall: upstairs a blank sheet, downstairs a full one. Then the marked papers (drawn in extra.js).
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson } from './people.js';
import { T, phaseAt } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

const FY = [2.25, 0];   // floor heights: [upstairs, downstairs]
function wallTex(cols, s) { const P = new PX(64, 64), R = ramp(cols, .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, s) - .5) * .25 + (h2(x, y, s) - .5) * .1, x, y)); return P.done(); }
function blanketTex() { const P = new PX(48, 30), R = ramp(['#1c2236', '#2a3350', '#3c4870', '#56658e'], .45); P.fill((x, y) => R(.5 + .2 * Math.sin(x * .5 + Math.sin(y * .3) * 2) + (h2(x, y, 4) - .5) * .2 + ((x + y) % 8 === 0 ? -.15 : 0), x, y)); return P.done(); }
function stoneTex() { const P = new PX(64, 32), R = ramp(['#1a1816', '#2a2622', '#3a342e', '#4a433a'], .45); P.fill((x, y) => { const row = y >> 3, off = (row % 2) * 6, edge = (y % 8 === 0) || ((x + off) % 12 === 0); return R(edge ? .15 : .5 + (h2(x >> 2, y >> 2, 3) - .5) * .4, x, y); }); return P.done(); }
function boardTex() { const P = new PX(96, 40), R = ramp(['#141c18', '#1c2822', '#24342c', '#2e4036'], .45); P.fill((x, y) => R(.5 + (fbm(x * .1, y * .2, 4) - .5) * .4, x, y)); for (let y = 6; y < 34; y += 6) for (let x = 8; x < 88; x++) if (h2(x, y, 9) > .35 && (x % 23) < 18) P.set(x, y, [176, 184, 178]); for (let x = 0; x < 96; x++) { P.set(x, 0, [90, 64, 40]); P.set(x, 39, [90, 64, 40]); } return P.done(); }
function paperTex(kind) {
  const P = new PX(20, 28); P.fill((x, y) => (x === 0 || x === 19 || y === 0 || y === 27) ? [170, 166, 156] : [238, 234, 224]);
  for (let x = 2; x < 12; x++) P.set(x, 2, [60, 60, 70]);
  if (kind === 'written') for (let y = 5; y < 26; y += 2) for (let x = 2; x < 18; x++) if (h2(x, y, 3) > .25) P.set(x, y, [40, 46, 80]);
  return texOf(P.done());
}

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#070912');
  for (let i = 0; i < 40; i++) { const s = glow('#dfe8ff', .05 + h2(i, 3, 1) * .05, 1.2); s.position.set(-6 + h2(i, 1, 1) * 12, -1 + h2(i, 2, 1) * 8, -6); scene.add(s); }
  // the house: foundation, floor slabs (the middle one is the split line, with a gold trim), roof
  const stone = mat(stoneTex()); const found = box(3.6, 1.8, 2.6, stone); found.position.set(0, -2.05, -1.1); scene.add(found);
  const slabM = new THREE.MeshStandardMaterial({ color: '#241c18', roughness: .9 }), trimM = new THREE.MeshBasicMaterial({ color: '#d8c28e' });
  for (const y of [-.25, 2.0, 4.25]) { const s = box(3.5, .25, 2.5, slabM); s.position.set(0, y, -1.1); scene.add(s); const tr = box(3.5, .025, .02, trimM); tr.position.set(0, y + .11, .16); scene.add(tr); }
  const floors = FY.map((y0, f) => {
    const g = new THREE.Group(); g.position.y = y0; scene.add(g);
    g.add(mesh(new THREE.BoxGeometry(3.2, .02, 2.25).translate(0, .01, -1.1), mat(woodPlanks(96, 64, { pw: 6, len: 48, seed: 3 + f, cols: ['#1a120e', '#2c1e16', '#43301f', '#5a4128', '#6e5032'] }))));
    const wM = mat(wallTex(['#1c2030', '#262c40', '#323a52', '#3e4862'], 2 + f));
    const back = box(3.2, 2.0, .1, wM); back.position.set(0, 0, -2.25); g.add(back);
    for (const x of [-1.65, 1.65]) { const sw = box(.1, 2.0, 2.4, wM); sw.position.set(x, 0, -1.1); g.add(sw); }
    // —— bedroom ——
    const bed = new THREE.Group(); g.add(bed);
    const woodM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 6 + f, nails: false, cols: ['#1e140e', '#33231a', '#4a3424', '#5e4430'] }));
    const bf = box(.95, .3, 1.9, woodM); bf.position.set(-1.05, 0, -1.2); bed.add(bf);
    const mt = box(.92, .14, 1.86, mat(blanketTex())); mt.position.set(-1.05, .3, -1.2); bed.add(mt);
    const pil = box(.7, .1, .35, new THREE.MeshStandardMaterial({ color: '#b8b4c4', roughness: 1 })); pil.position.set(-1.05, .44, -1.95); bed.add(pil);
    const lump = new THREE.Group(); lump.add(new THREE.Mesh(new THREE.CapsuleGeometry(.2, 1.0, 4, 8).rotateX(Math.PI / 2), mat(blanketTex()))); lump.children[0].position.set(0, .56, -1.0);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), new THREE.MeshStandardMaterial({ color: '#1f1619', roughness: .9 })); hair.position.set(0, .58, -1.85); lump.add(hair); lump.position.x = -1.05; bed.add(lump);
    const skyM = new THREE.MeshBasicMaterial({ color: '#0a1028' }), win = new THREE.Mesh(new THREE.PlaneGeometry(.8, .6), skyM); win.position.set(-.1, 1.32, -2.19); bed.add(win);
    const frM = new THREE.MeshStandardMaterial({ color: '#2a2018', roughness: .9 });
    for (const [w, h, x, y] of [[.88, .05, -.1, 1.63], [.88, .05, -.1, 1.02], [.05, .66, -.52, 1.32], [.05, .66, .32, 1.32], [.03, .6, -.1, 1.32]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .05), frM); b.position.set(x, y, -2.18); bed.add(b); }
    const moon = glow('#c8d8ff', .25, 1.0); moon.position.set(.1, 1.5, -2.18); bed.add(moon);
    const desk = box(1.05, .05, .62, woodM); desk.position.set(1.05, .72, -1.05); bed.add(desk);
    for (const [x, z] of [[.6, -1.3], [1.5, -1.3], [.6, -.8], [1.5, -.8]]) { const l = box(.05, .72, .05, woodM); l.position.set(x, 0, z); bed.add(l); }
    const chair = box(.4, .05, .4, woodM); chair.position.set(.22, .42, -1.02); bed.add(chair);
    const lampB = box(.06, .32, .06, new THREE.MeshStandardMaterial({ color: '#202028' })); lampB.position.set(1.42, .745, -1.25); bed.add(lampB);
    const lampG = glow('#ffc070', .3, 1.0); lampG.position.set(1.36, 1.1, -1.2); bed.add(lampG);
    [['#5a3030', .08], ['#2e4a5a', .06], ['#4a4a2a', .07]].forEach(([c, h], i) => { const b = box(.24, h, .32, new THREE.MeshStandardMaterial({ color: c, roughness: .9 })); b.position.set(1.3, .745 + [0, .08, .14][i], -.95); b.rotation.y = i * .25; bed.add(b); });
    const sheets = [0, 1, 2].map(i => { const p = new THREE.Mesh(new THREE.PlaneGeometry(.2, .28), new THREE.MeshStandardMaterial({ map: paperTex('written'), roughness: .95 })); p.rotation.set(-Math.PI / 2, 0, .2 - i * .25); p.position.set(.88 + i * .02, .748 + i * .004, -1.0 + i * .03); p.visible = false; bed.add(p); return p; });
    const facedown = box(.08, .015, .15, new THREE.MeshStandardMaterial({ color: '#16161c', roughness: .4 })); facedown.position.set(.68, .745, -.85); facedown.visible = false; bed.add(facedown);
    const lampL = new THREE.PointLight('#ffcf90', 2.2, 2.6, 1.5); lampL.position.set(1.2, 1.2, -.9); g.add(lampL);
    const moonL = new THREE.PointLight('#8aa0e0', .8, 3, 1.5); moonL.position.set(-.1, 1.3, -1.6); g.add(moonL);
    // —— exam hall ——
    const exam = new THREE.Group(); exam.visible = false; g.add(exam);
    const board = new THREE.Mesh(new THREE.PlaneGeometry(2.0, .8), mat(boardTex())); board.position.set(.1, 1.32, -2.19); exam.add(board);
    const dM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 8, nails: false, cols: ['#3a2a1c', '#56402a', '#705838', '#8a7048'] }));
    const myDesk = box(.75, .05, .5, dM); myDesk.position.set(.85, .7, -1.0); exam.add(myDesk); const md = box(.06, .7, .06, dM); md.position.set(.85, 0, -1.0); exam.add(md);
    const seat = box(.4, .05, .4, dM); seat.position.set(.28, .42, -1.02); exam.add(seat);
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(.2, .28), new THREE.MeshStandardMaterial({ map: paperTex(f === 0 ? 'blank' : 'written'), roughness: .95 })); paper.rotation.set(-Math.PI / 2, 0, .9); paper.position.set(.8, .755, -1.0); exam.add(paper);
    const W8 = { w0: { pose: 'write', step: 0 }, w1: { pose: 'write', step: 1 } };
    const mate = makePerson({ top: f ? 'teal' : 'mustard', bottom: 'jean', hair: f ? 'hairBlond' : 'hairBrown', hairStyle: 'long', shoe: 'shoe' }, W8); mate.root.position.set(-1.25, 0, -1.45); mate.shadow.visible = false; exam.add(mate.root);
    const od = box(.75, .05, .5, dM); od.position.set(-.72, .7, -1.45); exam.add(od); const odl = box(.06, .7, .06, dM); odl.position.set(-.72, 0, -1.45); exam.add(odl);
    const dayL = new THREE.PointLight('#fff0dc', 0, 4, 1.2); dayL.position.set(0, 1.9, -.4); g.add(dayL);
    // —— him ——
    const hero = makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark', shoe: 'sneaker' }, {
      phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, tired: { pose: 'phone', bob: 1, blink: 1 }, laugh: { pose: 'sitlaugh' },
      w0: { pose: 'write', step: 0 }, w1: { pose: 'write', step: 1 }, doze: { pose: 'sit', blink: 1, bob: 2, doze: 1 }, doze2: { pose: 'sit', bob: 1 },
      look: { pose: 'look', nophone: 1 }, wave: { pose: 'wave', smile: 1, mouth: 1 },
    });
    hero.shadow.visible = false; g.add(hero.root);
    const phoneL = new THREE.PointLight('#8fc0ff', 1.0, 1.4, 2); g.add(phoneL);
    return { g, bed, exam, lump, sheets, facedown, skyM, lampL, lampG, moonL, dayL, hero, mate, phoneL };
  });
  scene.add(new THREE.HemisphereLight('#7080b0', '#1c1418', 1.3));
  const fill = new THREE.PointLight('#c0c8e8', 3.0, 20, 1.2); fill.position.set(0, 2.3, 5); scene.add(fill);
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    const u = eio(seg(t, 0, T.end)); cam.position.set(0, 2.17, lerp(13.2, 12.9, u)); cam.lookAt(0, 2.17, -1); cam.fov = 24.0; cam.updateProjectionMatrix();
    const ph = phaseAt(t), examDay = ph >= 4;
    floors.forEach((F, f) => {
      const up = f === 0, H = F.hero; F.bed.visible = !examDay; F.exam.visible = examDay;
      F.dayL.intensity = examDay ? 3.2 : 0; F.skyM.color.set(examDay ? '#c8dce8' : '#0a1028');
      let pos = [.22, .02, -1.0], fr = 'phone', flip = false, vis = true, ph1 = up && !examDay ? (t % 2.9 < .1 ? 'blink' : 'phone') : 'phone';
      if (!examDay) {
        // night: upstairs desk → bed → dark; downstairs lock → write → asleep
        const lampOn = up ? ph < 3 : ph < 3; F.lampL.intensity = lampOn ? 2.2 : 0; F.lampG.visible = lampOn; F.moonL.intensity = ph >= 3 ? 1.3 : .8;
        F.lump.visible = !up && ph >= 3;
        if (up) { if (ph >= 1) pos = [-.7, .02, -.95]; fr = ph === 2 ? 'laugh' : ph === 3 ? 'tired' : ph1; F.sheets.forEach(s => { s.visible = false; }); F.facedown.visible = false; }
        else {
          F.facedown.visible = t >= T.down && ph < 3; F.sheets.forEach((s, i) => { s.visible = ph >= i + 1 && ph < 3 || (ph >= 1 && i === 0 && t >= T.down + 1); });
          if (ph >= 3) vis = false; else if (t >= T.down) fr = Math.floor(t * 4) % 2 ? 'w0' : 'w1'; else fr = 'phone';
        }
      } else {
        F.lampL.intensity = 0; F.lampG.visible = false; F.moonL.intensity = 0; F.lump.visible = false;
        pos = [.28, .02, -1.0];
        F.mate.frame(Math.floor(t * 3 + f) % 2 ? 'w0' : 'w1'); F.mate.face(cam);
        if (up) fr = ph === 5 ? 'look' : (Math.floor(t * 1.2) % 3 === 0 ? 'doze' : 'doze2');
        else if (ph === 5) { fr = 'wave'; pos = [.1, 0, -.8]; } else fr = Math.floor(t * 4) % 2 ? 'w0' : 'w1';
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
