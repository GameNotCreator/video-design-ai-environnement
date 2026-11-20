// EP. 5 "You": a student's bedroom the night before an exam (23:00 → 07:58), then the exam hall at 8:00.
// One scene, two sets far apart (room at the origin, exam hall at x = 40): only the active set is visible.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard, woodPlanks, blob } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson, WALK, walkFrame } from './people.js';
import { T, CLOCK } from './story.js';
import { seg, ss, clamp, lerp, eio, eo } from '/core/lib.js';

const EX = 40;   // exam hall offset
function wallTex(cols, s) { const P = new PX(64, 64), R = ramp(cols, .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, s) - .5) * .25 + (h2(x, y, s) - .5) * .1, x, y)); return P.done(); }
function blanketTex() { const P = new PX(48, 30), R = ramp(['#1c2236', '#2a3350', '#3c4870', '#56658e'], .45); P.fill((x, y) => R(.5 + .2 * Math.sin(x * .5 + Math.sin(y * .3) * 2) + (h2(x, y, 4) - .5) * .2 + ((x + y) % 8 === 0 ? -.15 : 0), x, y)); return P.done(); }
function rugTex() { const P = new PX(48, 36), R = ramp(['#2a2028', '#40303a', '#5a4450', '#76606a'], .45); P.fill((x, y) => { const b = x < 3 || y < 3 || x > 44 || y > 32; return R(b ? .8 : .45 + ((x >> 2) + (y >> 2)) % 2 * .1 + (h2(x, y, 7) - .5) * .2, x, y); }); return P.done(); }
function posterTex(seed, cols) { const P = new PX(18, 26), R = ramp(cols, .45); P.fill((x, y) => R(.25 + (y / 26) * .3 + (Math.hypot(x - 9, y - 9 - seed) < 5 ? .5 : 0) + (y > 18 && x % 4 < 2 ? .2 : 0), x, y)); return P.done(); }
function paperTex(kind) {   // 'blank' | 'written' | 'F'
  const P = new PX(20, 28); P.fill((x, y) => (x === 0 || x === 19 || y === 0 || y === 27) ? [170, 166, 156] : [238, 234, 224]);
  for (let x = 2; x < 12; x++) P.set(x, 2, [60, 60, 70]);   // name line
  if (kind === 'written') for (let y = 5; y < 26; y += 2) for (let x = 2; x < 18; x++) if (h2(x, y, 3) > .25) P.set(x, y, [40, 46, 80]);
  if (kind === 'F') { const F = [[0, 0, 7, 2], [0, 0, 2, 14], [0, 6, 5, 2]], R = [196, 25, 25]; for (const [a, b, w, h] of F) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) P.set(6 + a + x, 8 + b + y, R); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; P.set(Math.round(9.5 + Math.cos(a) * 8), Math.round(15 + Math.sin(a) * 9), R); } }
  return P.done();
}
function boardTex() { const P = new PX(96, 40), R = ramp(['#141c18', '#1c2822', '#24342c', '#2e4036'], .45); P.fill((x, y) => R(.5 + (fbm(x * .1, y * .2, 4) - .5) * .4, x, y)); for (let y = 6; y < 34; y += 6) for (let x = 8; x < 88; x++) if (h2(x, y, 9) > .35 && (x % 23) < 18) P.set(x, y, [176, 184, 178]); for (let x = 0; x < 96; x++) { P.set(x, 0, [90, 64, 40]); P.set(x, 39, [90, 64, 40]); } return P.done(); }
function canTex() { const P = new PX(4, 7); P.fill((x, y) => y === 0 ? [160, 160, 170] : (y === 3 ? [220, 220, 230] : (x === 0 ? [30, 70, 60] : [50, 120, 100]))); return texOf(P.done()); }

export function buildNight() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#05060c');
  const room = new THREE.Group(), hall = new THREE.Group(); scene.add(room, hall); hall.position.x = EX;

  // ——————————————— the bedroom ———————————————
  room.add(mesh(new THREE.BoxGeometry(6, .2, 5).translate(0, -.1, 0), mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 3, cols: ['#1a120e', '#2c1e16', '#43301f', '#5a4128', '#6e5032'] }))));
  const wM = mat(wallTex(['#1c2030', '#262c40', '#323a52', '#3e4862'], 2));
  const back = box(6, 3, .2, wM); back.position.set(0, 0, -2.1); room.add(back);
  const left = box(.2, 3, 5, wM); left.position.set(-2.6, 0, 0); room.add(left);
  // window in the back wall, with the sky behind it (night → dawn)
  const skyM = new THREE.MeshBasicMaterial({ color: '#0a1028', fog: false }), sky = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.0), skyM); sky.position.set(.4, 1.75, -1.99); room.add(sky);
  const frameM = new THREE.MeshStandardMaterial({ color: '#2a2018', roughness: .9 });
  for (const [w, h, x, y] of [[1.42, .06, .4, 2.25], [1.42, .06, .4, 1.25], [.06, 1.06, -.27, 1.75], [.06, 1.06, 1.07, 1.75], [.04, 1.0, .4, 1.75], [1.3, .04, .4, 1.75]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .06), frameM); b.position.set(x, y, -1.97); room.add(b); }
  const moon = glow('#c8d8ff', .5, 1.2); moon.position.set(.8, 2.05, -1.98); room.add(moon);
  const winStars = []; for (let i = 0; i < 9; i++) { const s = glow('#dfe8ff', .05, 1.5); s.position.set(-.15 + h2(i, 1, 2) * 1.1, 1.35 + h2(i, 2, 2) * .8, -1.985); room.add(s); winStars.push(s); }
  // bed against the back wall, blanket, pillow
  const woodM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 6, nails: false, cols: ['#1e140e', '#33231a', '#4a3424', '#5e4430'] }));
  const bedF = box(2.0, .3, 1.1, woodM); bedF.position.set(-1.45, 0, -1.4); room.add(bedF);
  const matr = box(1.95, .16, 1.05, mat(blanketTex())); matr.position.set(-1.45, .3, -1.4); room.add(matr);
  const pillow = box(.5, .12, .7, new THREE.MeshStandardMaterial({ color: '#b8b4c4', roughness: 1 })); pillow.position.set(-2.2, .46, -1.4); room.add(pillow);
  const head = box(.08, .9, 1.1, woodM); head.position.set(-2.46, 0, -1.4); room.add(head);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.3), mat(rugTex())); rug.rotation.x = -Math.PI / 2; rug.position.set(-.6, .005, -.1); rug.receiveShadow = true; room.add(rug);
  // posters
  [[-1.6, 1.8, 0, ['#141a2c', '#283a5e', '#4a6ea0', '#a0c0e0']], [-.9, 1.7, 3, ['#24142e', '#3e2450', '#7c58a0', '#c8a8e0']]].forEach(([x, y, s, c]) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(.42, .6), mat(posterTex(s, c))); p.position.set(x, y, -1.99); room.add(p); });
  // the desk with the laptop and the exam note
  const desk = box(1.2, .05, .6, woodM); desk.position.set(.45, .72, -1.6); room.add(desk);
  for (const [x, z] of [[-.1, -1.85], [1.0, -1.85], [-.1, -1.35], [1.0, -1.35]]) { const l = box(.05, .72, .05, woodM); l.position.set(x, 0, z); room.add(l); }
  const lapM = new THREE.MeshStandardMaterial({ color: '#30323c', roughness: .6 });
  const lapB = box(.42, .02, .3, lapM); lapB.position.set(.3, .77, -1.55); room.add(lapB);
  const lapS = new THREE.Group(); lapS.position.set(.3, .79, -1.7); lapS.rotation.x = -.25; room.add(lapS);
  const lapBack = box(.42, .29, .015, lapM); lapS.add(lapBack);
  const scrM = new THREE.MeshBasicMaterial({ color: '#2a3a5a' }), scr = new THREE.Mesh(new THREE.PlaneGeometry(.38, .25), scrM); scr.position.set(0, .145, .009); lapS.add(scr);
  const noteM = new THREE.MeshStandardMaterial({ color: '#e0c860', roughness: 1, emissive: '#3a3010' }), note = new THREE.Mesh(new THREE.PlaneGeometry(.1, .1), noteM); note.position.set(.12, .2, .012); note.rotation.z = .08; lapS.add(note);
  for (let i = 0; i < 3; i++) { const ln = new THREE.Mesh(new THREE.PlaneGeometry(.07, .008), new THREE.MeshBasicMaterial({ color: '#3a2a10' })); ln.position.set(.12, .225 - i * .02, .013); ln.rotation.z = .08; lapS.add(ln); }
  const books = [['#5a3030', .1], ['#2e4a5a', .07], ['#4a4a2a', .09]].map(([c, h], i) => { const b = box(.22, h, .3, new THREE.MeshStandardMaterial({ color: c, roughness: .9 })); b.position.set(.82, .745 + [0, .1, .17][i], -1.6); b.rotation.y = i * .2; room.add(b); return b; });
  const lampOff = box(.08, .35, .08, new THREE.MeshStandardMaterial({ color: '#202028' })); lampOff.position.set(-.05, .745, -1.75); room.add(lampOff);
  // nightstand + alarm clock (amber digits)
  const ns = box(.4, .5, .4, woodM); ns.position.set(-2.25, 0, -.55); room.add(ns);
  const clk = box(.18, .09, .07, new THREE.MeshStandardMaterial({ color: '#141418' })); clk.position.set(-2.25, .5, -.5); room.add(clk);
  const clkD = new THREE.Mesh(new THREE.PlaneGeometry(.14, .05), new THREE.MeshBasicMaterial({ color: '#ffb040' })); clkD.position.set(-2.25, .545, -.464); room.add(clkD);
  const clkG = glow('#ffa030', .3, .8); clkG.position.set(-2.25, .55, -.43); room.add(clkG);
  // energy cans piling up with the night (one per clock tick)
  const canT = canTex(); const cans = [[-2.15, .5, -.68], [-2.33, .5, -.66], [.05, .745, -1.45], [-1.8, .005, -.2], [-1.5, .005, -.05], [.62, .745, -1.42], [-2.0, .005, .1]].map(([x, y, z]) => { const c = billboard(canT, .07, .12, {}); c.position.set(x, y, z); c.visible = false; room.add(c); return c; });
  // lights: cold night ambience, the phone on his face, the clock, the dawn through the window
  const hemi = new THREE.HemisphereLight('#5a6a9a', '#1c1418', 1.5); room.add(hemi);
  const moonL = new THREE.DirectionalLight('#8aa0e0', .8); moonL.position.set(1.4, 3.2, -3.4); moonL.target.position.set(-.8, 0, 0); moonL.castShadow = true; moonL.shadow.mapSize.set(1024, 1024); moonL.shadow.camera.left = -4; moonL.shadow.camera.right = 4; moonL.shadow.camera.top = 4; moonL.shadow.camera.bottom = -4; moonL.shadow.bias = -.002; room.add(moonL, moonL.target);
  const dawnL = new THREE.PointLight('#ffb878', 0, 7, 1.3); dawnL.position.set(.4, 1.8, -1.3); room.add(dawnL);
  const fill = new THREE.PointLight('#a0b0e0', 2.6, 7, 1.5); fill.position.set(.8, 1.8, 1.6); room.add(fill);
  const scrL = new THREE.PointLight('#8090c0', .5, 1.5, 2); scrL.position.set(.3, 1.0, -1.4); room.add(scrL);
  // him, on the edge of the bed
  const hero = makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark' }, { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, tired: { pose: 'phone', bob: 1 }, look: { pose: 'look' } });
  hero.root.position.set(-1.0, .02, -.95); hero.root.userData.char = 'hero'; hero.shadow.visible = false; room.add(hero.root);
  const heroL = new THREE.PointLight('#8fc0ff', 1.0, 1.4, 2); room.add(heroL);

  // ——————————————— the exam hall (x = EX) ———————————————
  hall.add(mesh(new THREE.BoxGeometry(9, .2, 8).translate(0, -.1, -1), mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 12, cols: ['#2a1e16', '#40301f', '#58422c', '#6e5638', '#86704a'] }))));
  const hW = mat(wallTex(['#4a4840', '#5e5a50', '#726e62', '#888476'], 7));
  const hb = box(9, 3.6, .2, hW); hb.position.set(0, 0, -4.2); hall.add(hb);
  const hl = box(.2, 3.6, 8, hW); hl.position.set(-4.4, 0, -1); hall.add(hl);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.5), mat(boardTex())); board.position.set(.4, 1.8, -4.09); hall.add(board);
  // wall clock
  const wc = new THREE.Mesh(new THREE.CircleGeometry(.24, 24), new THREE.MeshStandardMaterial({ color: '#e8e4d8', roughness: .8 })); wc.position.set(-1.9, 2.4, -4.08); hall.add(wc);
  const handM = new THREE.MeshBasicMaterial({ color: '#202020' }), hh = new THREE.Mesh(new THREE.PlaneGeometry(.025, .13).translate(0, .065, 0), handM), mh = new THREE.Mesh(new THREE.PlaneGeometry(.018, .19).translate(0, .095, 0), handM);
  hh.position.set(-1.9, 2.4, -4.07); mh.position.set(-1.9, 2.4, -4.065); hall.add(hh, mh);
  // daylight windows in the left wall
  for (let i = 0; i < 3; i++) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.5), new THREE.MeshBasicMaterial({ color: '#dfe8f0', fog: false })); w.position.set(-4.29, 1.9, -3 + i * 2); w.rotation.y = Math.PI / 2; hall.add(w); }
  const sun = new THREE.DirectionalLight('#fff0dc', 2.2); sun.position.set(-6, 5, 1); sun.target.position.set(0, 0, -1); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -6; sun.shadow.camera.right = 6; sun.shadow.camera.top = 6; sun.shadow.camera.bottom = -6; sun.shadow.bias = -.002; hall.add(sun, sun.target);
  hall.add(new THREE.HemisphereLight('#d8e0f0', '#5a4a3a', 1.3));
  // desks in rows: students write, he dozes over a blank sheet
  const deskM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 8, nails: false, cols: ['#3a2a1c', '#56402a', '#705838', '#8a7048'] }));
  const written = texOf(paperTex('written')), blankT = texOf(paperTex('blank')), FT = texOf(paperTex('F'));
  const students = [], looks = [['teal', 'hairBlond'], ['mustard', 'hairBrown'], ['navy', 'hairDark'], ['green', 'hairDark'], ['purple', 'hairBrown'], ['grey', 'hairBlond'], ['teal', 'hairDark'], ['beige', 'hairBrown']];
  const W8 = { w0: { pose: 'write', step: 0 }, w1: { pose: 'write', step: 1 } };
  let heroDesk = null, k = 0;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const x = -2.4 + c * 1.9, z = -3.0 + r * 1.6;
    const d = box(.75, .05, .5, deskM); d.position.set(x + .55, .7, z); hall.add(d); const dl = box(.06, .7, .06, deskM); dl.position.set(x + .55, 0, z); hall.add(dl);
    const isHero = r === 1 && c === 1;
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(.2, .28), new THREE.MeshStandardMaterial({ map: isHero ? blankT : written, roughness: .95 })); paper.rotation.set(-Math.PI / 2, 0, isHero ? .88 : -.15); paper.position.set(x + .5, .755, z); hall.add(paper);
    const seat = box(.4, .05, .4, deskM); seat.position.set(x - .05, .42, z); hall.add(seat);
    if (isHero) { heroDesk = { x, z, paper }; continue; }
    const [top, hair] = looks[k++ % looks.length];
    const s = makePerson({ top, bottom: 'jean', hair, shoe: 'shoe', hairStyle: k % 3 === 0 ? 'long' : 'short' }, W8); s.root.position.set(x, 0, z - .02); s.shadow.visible = false; hall.add(s.root); students.push(s);
  }
  const heroX = makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark' }, { stare: { pose: 'sit' }, doze: { pose: 'sit', blink: 1, bob: 2, doze: 1 }, doze2: { pose: 'sit', blink: 1, bob: 3, doze: 1 } });
  heroX.root.position.set(heroDesk.x, 0, heroDesk.z - .02); heroX.shadow.visible = false; hall.add(heroX.root);
  const proctor = makePerson({ top: 'navy', bottom: 'navy', hair: 'hairGrey', glasses: 1, shoe: 'shoe' }, { stand: { pose: 'stand' }, talk: { pose: 'talk', mouth: 1 }, ...WALK });
  hall.add(proctor.root);

  const _v = new THREE.Vector3();
  function update(t, shot, cam, post, renderer) {
    const inRoom = shot.id === 'room'; room.visible = inRoom; hall.visible = !inRoom;
    if (inRoom) {
      // the night: 0 at 23:00, 1 at 07:58 (dawn grows only over the last ticks)
      const night = clamp((t - T.lapse) / (T.alarm - T.lapse)), dawn = ss(seg(t, 6.2, T.alarm + .2));
      skyM.color.setRGB(lerp(.02, .95, dawn) * (1 - .25 * dawn) + .02, lerp(.03, .62, dawn), lerp(.1, .5, dawn)); moon.material.opacity = 1 - dawn; winStars.forEach(s => s.material.opacity = 1 - dawn);
      dawnL.intensity = 4.5 * dawn; moonL.intensity = .8 * (1 - dawn) + .2; hemi.intensity = 1.5 + .5 * dawn; hemi.color.set(dawn > .5 ? '#c0a080' : '#5a6a9a');
      const tick = CLOCK.filter(([a]) => a > 0 && a <= t && a <= T.alarm).length; cans.forEach((c, i) => { c.visible = i < tick; c.lookAt(cam.position.x, c.position.y, cam.position.z); });
      // camera: a wide of the room that pushes in through the night, then close on him when the alarm goes
      if (t < T.alarm) { const u = eio(seg(t, 0, T.alarm)); cam.position.set(lerp(.55, .4, u), lerp(1.55, 1.45, u), lerp(2.4, 1.95, u)); cam.lookAt(lerp(-.5, -.55, u), lerp(1.0, .98, u), -1.1); cam.fov = 52; }
      else { const u = eo(seg(t, T.alarm, T.exam)); cam.position.set(lerp(.3, .2, u), 1.3, lerp(1.6, 1.4, u)); cam.lookAt(-.85, 1.15, -.95); cam.fov = 48; }
      cam.updateProjectionMatrix();
      const f = t >= T.look ? 'look' : (t % 3.1 < .1 ? 'blink' : (t > 6.0 ? 'tired' : 'phone')); hero.frame(f); hero.face(cam);
      heroL.position.copy(hero.local(25, 18)).add(_v.set(.2, .05, .2)); heroL.intensity = t < T.look ? 1.0 : .25;
      // the alarm: the clock pulses
      const ring = t >= T.alarm && t < T.exam && Math.floor((t - T.alarm) * 4) % 2 === 0; clkD.material.color.set(ring ? '#ffd080' : '#c07020'); clkG.scale.setScalar(ring ? .5 : .25);
      post.dof.focus = cam.position.distanceTo(hero.root.position.clone().setY(1.0)); post.dof.aper = t < T.alarm ? 40 : 70; post.dof.maxCoc = 10;
      renderer.toneMappingExposure = 1.3 + .1 * dawn; post.bloom.strength = .45; post.bloom.threshold = .8;
      scene.background.set('#05060c'); scene.fog = null;
    } else {
      // the hall: wide on the rows, then down on his blank sheet
      const hx = EX + heroDesk.x, hz = heroDesk.z;
      if (t < T.pens) { const u = eio(seg(t, T.exam, T.pens)); cam.position.set(EX + lerp(1.8, 1.4, u), lerp(2.3, 2.0, u), lerp(1.9, 1.3, u)); cam.lookAt(EX + lerp(-.2, .1, u), .8, lerp(-1.6, -1.0, u)); cam.fov = 52; }
      else { const u = eo(seg(t, T.pens, T.pens + 1.0)); cam.position.set(hx + lerp(1.45, 1.3, u), lerp(1.45, 1.4, u), hz + lerp(.95, .8, u)); cam.lookAt(hx + .25, .7, hz - .05); cam.fov = 50; }
      cam.updateProjectionMatrix();
      students.forEach((s, i) => { s.frame(t >= T.pens ? 'w0' : (Math.floor(t * 6 + i * 1.7) % 2 ? 'w1' : 'w0')); s.face(cam); });
      heroX.frame(t < T.doze ? 'stare' : (Math.floor(t * 1.2) % 2 ? 'doze2' : 'doze')); heroX.face(cam);
      heroDesk.paper.material.map = t >= T.grade ? FT : blankT;
      // the proctor walks the front, then stops by his desk
      let px = -3.2, pf = walkFrame(t), pflip = false;
      if (t < T.pens) px = lerp(-3.2, hx - EX + 1.2, seg(t, T.exam, T.pens - .1)); else { px = hx - EX + 1.2; pf = t < T.pens + 1.2 && Math.floor(t * 3) % 2 ? 'talk' : 'stand'; pflip = true; }
      proctor.root.position.set(EX + px, 0, t < T.pens ? -.65 : hz + .4); proctor.frame(pf); proctor.face(cam, pflip);
      // wall clock: 8:00 → 10:00
      const hrs = 8 + 2 * seg(t, T.exam, T.pens); mh.rotation.z = -(hrs % 1) * Math.PI * 2; hh.rotation.z = -(hrs / 12) * Math.PI * 2;
      post.dof.focus = cam.position.distanceTo(_v.set(hx + (t < T.pens ? 0 : .25), .9, hz)); post.dof.aper = t < T.pens ? 30 : 22; post.dof.maxCoc = 10;
      renderer.toneMappingExposure = 1.1; post.bloom.strength = .3; post.bloom.threshold = .9;
      scene.background.set('#202020'); scene.fog = null;
    }
  }
  return { scene, update, hero };
}
