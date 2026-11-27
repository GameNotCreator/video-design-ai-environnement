// "Le sommeil": the cut-away house, two identical floors. 11 p.m., class at 8 the next morning: upstairs he scrolls
// until 3 a.m. (desk, bed, the dark); downstairs he locks his phone, turns the lamp off and sleeps. 8 a.m.: both floors
// become the same lecture hall. "Who knows the answer?" Upstairs he is asleep in his seat; downstairs he stands, hand up.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson, walkFrame, WALK } from './people.js';
import { T, phaseAt } from './story.js';
import { seg, eio, lerp } from '/core/lib.js';

const FY = [2.25, 0];   // floor heights: [upstairs, downstairs]
function wallTex(cols, s) { const P = new PX(64, 64), R = ramp(cols, .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, s) - .5) * .25 + (h2(x, y, s) - .5) * .1, x, y)); return P.done(); }
function blanketTex() { const P = new PX(48, 30), R = ramp(['#1c2236', '#2a3350', '#3c4870', '#56658e'], .45); P.fill((x, y) => R(.5 + .2 * Math.sin(x * .5 + Math.sin(y * .3) * 2) + (h2(x, y, 4) - .5) * .2 + ((x + y) % 8 === 0 ? -.15 : 0), x, y)); return P.done(); }
function stoneTex() { const P = new PX(64, 32), R = ramp(['#1a1816', '#2a2622', '#3a342e', '#4a433a'], .45); P.fill((x, y) => { const row = y >> 3, off = (row % 2) * 6, edge = (y % 8 === 0) || ((x + off) % 12 === 0); return R(edge ? .15 : .5 + (h2(x >> 2, y >> 2, 3) - .5) * .4, x, y); }); return P.done(); }
function sketchTex() {   // the idea: a phone drawn in pen on a cream note, three cards on its screen
  const P = new PX(17, 17); P.fill((x, y) => (x === 0 || x === 16 || y === 0 || y === 16) ? [190, 180, 140] : [236, 226, 180]);
  for (let y = 3; y < 15; y++) { P.set(5, y, [40, 46, 80]); P.set(11, y, [40, 46, 80]); } for (let x = 5; x < 12; x++) { P.set(x, 3, [40, 46, 80]); P.set(x, 14, [40, 46, 80]); }
  for (const y of [5, 8, 11]) for (let x = 7; x < 10; x++) P.set(x, y, [60, 90, 150]);
  return P.done();
}
function noteTex(s) { const P = new PX(17, 17); P.fill((x, y) => (x === 0 || x === 16 || y === 0 || y === 16) ? [190, 180, 140] : [236, 226, 180]); for (let y = 4; y < 14; y += 3) for (let x = 3; x < 14; x++) if (h2(x, y, s) > .3) P.set(x, y, [40, 46, 80]); if (s % 2) for (let k = 0; k < 6; k++) P.set(4 + k, 12 - k, [60, 90, 150]); return P.done(); }
function codeTex() { const P = new PX(34, 22); P.fill(() => [16, 20, 30]); for (let y = 2; y < 21; y += 2) { const ind = (y % 6 === 0 ? 4 : 2) + Math.floor(h2(1, y, 3) * 3), len = 6 + Math.floor(h2(y, 2, 5) * 18); for (let x = ind; x < Math.min(32, ind + len); x++) P.set(x, y, h2(x >> 2, y, 7) > .55 ? [120, 200, 180] : [150, 170, 220]); } return P.done(); }
function appTex() {   // the lecture slide: a title bar, a curve on axes, three bullet lines
  const P = new PX(64, 36); P.fill(() => [236, 234, 226]);
  for (let x = 4; x < 40; x++) { P.set(x, 4, [40, 50, 90]); P.set(x, 5, [40, 50, 90]); }
  for (let y = 10; y < 32; y++) P.set(6, y, [60, 60, 70]); for (let x = 6; x < 34; x++) P.set(x, 31, [60, 60, 70]);
  for (let x = 7; x < 33; x++) { const y = Math.round(30 - 18 / (1 + Math.exp(-(x - 19) / 3))); P.set(x, y, [60, 100, 170]); P.set(x, y + 1, [60, 100, 170]); }
  for (const y of [12, 18, 24]) { P.set(40, y, [40, 50, 90]); for (let x = 43; x < 43 + 8 + (y % 5) * 2; x++) P.set(x, y, [90, 96, 110]); }
  return P.done();
}
function bannerTex() { const P = new PX(48, 6); P.fill((x, y) => (y === 0 || y === 5) ? [150, 120, 60] : [32, 36, 60]); for (let x = 6; x < 42; x++) if (x % 3 && h2(x, 1, 3) > .2) { P.set(x, 2, [216, 190, 130]); P.set(x, 3, [216, 190, 130]); } return P.done(); }

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#070912');
  for (let i = 0; i < 40; i++) { const s = glow('#dfe8ff', .05 + h2(i, 3, 1) * .05, 1.2); s.position.set(-6 + h2(i, 1, 1) * 12, -1 + h2(i, 2, 1) * 8, -6); scene.add(s); }
  const stone = mat(stoneTex()); const found = box(3.6, 1.8, 2.6, stone); found.position.set(0, -2.05, -1.1); scene.add(found);
  const slabM = new THREE.MeshStandardMaterial({ color: '#241c18', roughness: .9 }), trimM = new THREE.MeshBasicMaterial({ color: '#d8c28e' });
  for (const y of [-.25, 2.0, 4.25]) { const s = box(3.5, .25, 2.5, slabM); s.position.set(0, y, -1.1); scene.add(s); const tr = box(3.5, .025, .02, trimM); tr.position.set(0, y + .11, .16); scene.add(tr); }
  const sketch = texOf(sketchTex()), app = texOf(appTex()), code = texOf(codeTex()), banner = texOf(bannerTex());
  const floors = FY.map((y0, f) => {
    const g = new THREE.Group(); g.position.y = y0; scene.add(g);
    const wood = mesh(new THREE.BoxGeometry(3.2, .02, 2.25).translate(0, .01, -1.1), mat(woodPlanks(96, 64, { pw: 6, len: 48, seed: 3 + f, cols: ['#1a120e', '#2c1e16', '#43301f', '#5a4128', '#6e5032'] }))); g.add(wood);
    // —— his bedroom (the year of the project) ——
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
    // the idea, sketched on a note above the desk; downstairs the notes multiply, month after month
    const cards = Array.from({ length: 6 }, (_, i) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(.17, .17), new THREE.MeshStandardMaterial({ map: i === 0 ? sketch : texOf(noteTex(i + 3 * f)), roughness: .95 })); p.position.set(.62 + (i % 3) * .26, 1.6 - Math.floor(i / 3) * .22 + (h2(i, 2, 4) - .5) * .04, -2.185); p.rotation.z = (h2(i, 5, 2) - .5) * .16; p.visible = i === 0; bed.add(p); return p; });
    // the laptop: closed upstairs; open downstairs, code on the screen
    const lapM = new THREE.MeshStandardMaterial({ color: '#2a2c34', roughness: .5, metalness: .3 });
    const lapBase = box(.34, .02, .24, lapM); lapBase.position.set(1.05, .745, -1.05); bed.add(lapBase);
    const lid = new THREE.Mesh(new THREE.PlaneGeometry(.34, .22), new THREE.MeshBasicMaterial({ map: code })); lid.position.set(1.05, .87, -1.17); lid.rotation.x = -.18; lid.visible = false; bed.add(lid);
    const lidBack = box(.34, .015, .24, lapM); lidBack.position.set(1.05, .767, -1.05); bed.add(lidBack);
    const screenL = new THREE.PointLight('#9fc8ff', 0, 1.6, 2); screenL.position.set(1.0, .95, -.9); g.add(screenL);
    const facedown = box(.08, .015, .15, new THREE.MeshStandardMaterial({ color: '#16161c', roughness: .4 })); facedown.position.set(.68, .745, -.85); facedown.visible = false; bed.add(facedown);
    const lampL = new THREE.PointLight('#ffcf90', 2.2, 2.6, 1.5); lampL.position.set(1.2, 1.2, -.9); g.add(lampL);
    const moonL = new THREE.PointLight('#8aa0e0', .8, 3, 1.5); moonL.position.set(-.1, 1.3, -1.6); g.add(moonL);
    // —— 8 a.m.: the lecture hall (the big screen with the slide, the lectern, a row of seats) ——
    const demo = new THREE.Group(); demo.visible = false; g.add(demo);
    const dM = mat(wallTex(['#4a4438', '#5c5446', '#6e6656', '#807866'], 9 + f));
    const db = box(3.2, 2.0, .1, dM); db.position.set(0, 0, -2.25); demo.add(db);
    for (const x of [-1.65, 1.65]) { const sw = box(.1, 2.0, 2.4, dM); sw.position.set(x, 0, -1.1); demo.add(sw); }
    const stageM = mat(woodPlanks(64, 32, { pw: 8, len: 64, seed: 11 + f, nails: false, cols: ['#2a1c14', '#3e2a1c', '#563c28', '#6e4e34'] }));
    const platform = box(2.3, .16, 1.05, stageM); platform.position.set(.5, 0, -1.65); demo.add(platform);
    const scrFrame = box(1.24, .74, .04, new THREE.MeshStandardMaterial({ color: '#0c0e14' })); scrFrame.position.set(.45, .92, -2.18); demo.add(scrFrame);
    const scrOff = new THREE.Mesh(new THREE.PlaneGeometry(1.16, .66), new THREE.MeshBasicMaterial({ color: '#1a2036' })); scrOff.position.set(.45, 1.29, -2.155); demo.add(scrOff);
    const scrOn = new THREE.Mesh(new THREE.PlaneGeometry(1.16, .66), new THREE.MeshBasicMaterial({ map: app })); scrOn.position.set(.45, 1.29, -2.15); demo.add(scrOn);
    const ban = new THREE.Mesh(new THREE.PlaneGeometry(1.5, .19), new THREE.MeshStandardMaterial({ map: banner, roughness: .8 })); ban.position.set(.45, 1.8, -2.18); demo.add(ban);
    const podium = box(.34, .78, .3, new THREE.MeshStandardMaterial({ color: '#3a3020', roughness: .7 })); podium.position.set(1.32, .16, -1.4); demo.add(podium);
    const chairM = new THREE.MeshStandardMaterial({ color: '#2c3040', roughness: .8 });
    for (const x of [-1.3, -.48]) { const c = box(.34, .05, .34, chairM); c.position.set(x, .42, -.85); demo.add(c); const cb = box(.34, .4, .05, chairM); cb.position.set(x - .17, .44, -.85); cb.rotation.y = Math.PI / 2; demo.add(cb); const cl = box(.04, .42, .04, chairM); cl.position.set(x, 0, -.85); demo.add(cl); }
    const spotL = new THREE.SpotLight('#fff0d8', 0, 6, .5, .6, 1.2); spotL.position.set(.4, 3.2, .4); spotL.target.position.set(.35, .2, -1.5); g.add(spotL, spotL.target);
    const roomL = new THREE.PointLight('#8a9ad0', 0, 4.5, 1.2); roomL.position.set(-.6, 1.8, -.2); g.add(roomL);
    const scrL = new THREE.PointLight('#a0c0ff', 0, 2.4, 1.5); scrL.position.set(.45, 1.2, -1.7); g.add(scrL);
    const trophy = new THREE.Group(); const gold = new THREE.MeshStandardMaterial({ color: '#d8b04a', metalness: .7, roughness: .3, emissive: '#3a2a08' });
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(.06, .035, .1, 12), gold); cup.position.y = .09; trophy.add(cup); const stem = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .06, 8), gold); stem.position.y = .03; trophy.add(stem);
    trophy.visible = false; g.add(trophy);   // unused here
    // —— him, the student next to him, the professor ——
    const hero = makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark', shoe: 'sneaker' }, {
      phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, tired: { pose: 'phone', bob: 1, blink: 1 }, laugh: { pose: 'sitlaugh' },
      sit: { pose: 'sit' }, listen: { pose: 'sit', smile: 1 }, doze: { pose: 'sit', doze: 1, blink: 1 }, doze2: { pose: 'sit', doze: 1, blink: 1, bob: 1 },
      woke: { pose: 'look' }, hand: { pose: 'wave', smile: 1 }, talk: { pose: 'wave', mouth: 1 },
    });
    const pal = makePerson({ top: 'green', bottom: 'jean', hair: 'hairBrown', hairStyle: 'long', shoe: 'sneaker' }, {
      sit: { pose: 'sit' }, smile: { pose: 'sit', smile: 1 }, laugh: { pose: 'sittalk', mouth: 1, smile: 1 },
    });
    const host = makePerson({ top: 'navy', bottom: 'navy', suit: 1, hair: 'hairGrey', glasses: 1, shoe: 'shoe' }, {
      stand: { pose: 'stand' }, talk: { pose: 'talk', mouth: 1 }, smile: { pose: 'stand', smile: 1 },
    });
    for (const P of [hero, pal, host]) { P.shadow.visible = false; g.add(P.root); }
    const phoneL = new THREE.PointLight('#8fc0ff', 1.0, 1.4, 2); g.add(phoneL);
    return { g, bed, demo, lump, cards, lid, screenL, facedown, lampL, lampG, moonL, scrOn, spotL, roomL, scrL, trophy, hero, pal, host, phoneL };
  });
  scene.add(new THREE.HemisphereLight('#7080b0', '#1c1418', 1.3));
  const fill = new THREE.PointLight('#c0c8e8', 3.0, 20, 1.2); fill.position.set(0, 2.3, 5); scene.add(fill);
  const _v = new THREE.Vector3(), alt = (t, r, k = 0) => Math.floor(t * r + k) % 2;

  function update(t, shot, cam, post, renderer) {
    const u = eio(seg(t, 0, T.end)); cam.position.set(0, 2.17, lerp(13.2, 12.9, u)); cam.lookAt(0, 2.17, -1); cam.fov = 24.0; cam.updateProjectionMatrix();
    const ph = phaseAt(t), hall = ph >= 4;
    floors.forEach((F, f) => {
      const up = f === 0, H = F.hero, Pl = F.pal, Ho = F.host;
      F.bed.visible = !hall; F.demo.visible = hall; Pl.root.visible = Ho.root.visible = hall; F.trophy.visible = false;
      F.cards.forEach(c => { c.visible = false; }); F.lid.visible = false; F.screenL.intensity = 0;
      let pos = [.22, .02, -1.0], fr = 'phone', vis = true;
      if (!hall) {
        F.spotL.intensity = F.roomL.intensity = F.scrL.intensity = 0;
        const lamp = up ? ph < 3 : t < T.bed; F.lampL.intensity = lamp ? 2.2 : 0; F.lampG.visible = lamp; F.moonL.intensity = lamp ? .8 : 1.3;
        F.lump.visible = !up && t >= T.bed;
        if (up) {
          if (ph >= 1) pos = [-.7, .02, -.95];
          fr = ph === 2 ? 'laugh' : ph === 3 ? 'tired' : (t % 2.9 < .1 ? 'blink' : 'phone');
          F.facedown.visible = false;
        } else {
          F.facedown.visible = t >= T.down;
          if (t >= T.bed) vis = false; else if (t >= T.down) fr = 'sit';
        }
      } else {
        F.lampL.intensity = 0; F.lampG.visible = false; F.moonL.intensity = 0; F.lump.visible = false; F.facedown.visible = false;
        F.spotL.intensity = 4; F.roomL.intensity = 3.0; F.scrL.intensity = 1.2;
        const answer = ph >= 5, asking = (t >= T.ask && t < 11.0) || (up && t >= 11.1 && t < 13.9) || (!up && answer && t < 16.9);
        Ho.root.position.set(1.34, .16, -1.75); Ho.frame(asking ? (alt(t, 3) ? 'talk' : 'stand') : 'smile'); Ho.face(cam, true);
        Pl.root.position.set(-1.3, .02, -.82); Pl.face(cam, false);
        pos = [-.48, .02, -.82];
        if (up) {
          fr = answer ? 'woke' : t >= T.ask ? (alt(t, 1.2) ? 'doze2' : 'doze') : 'doze';
          Pl.frame(answer ? (alt(t, 2.5) ? 'laugh' : 'smile') : 'sit');
        } else {
          if (t >= 13.4) { fr = alt(t, 2.5) && answer ? 'talk' : 'hand'; pos = [-.48, 0, -.82]; } else fr = 'listen';
          Pl.frame(answer ? 'smile' : 'sit');
        }
      }
      H.root.visible = vis; H.root.position.set(...pos); H.frame(fr); H.face(cam, false);
      const lit = vis && !hall && ['phone', 'blink', 'tired', 'laugh'].includes(fr);
      F.phoneL.intensity = lit ? 1.0 : 0; if (lit) F.phoneL.position.copy(H.local(25, 18)).add(_v.set(.2, .05, .2));
    });
    post.dof.focus = cam.position.distanceTo(_v.set(0, 2.1, -1.0)); post.dof.aper = 2; post.dof.maxCoc = 3;
    renderer.toneMappingExposure = 1.25; post.bloom.strength = .3; post.bloom.threshold = .88;
  }
  return { scene, update };
}
