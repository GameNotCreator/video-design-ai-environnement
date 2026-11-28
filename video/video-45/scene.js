// "Les amis": the cut-away house, two identical floors. Saturday 8 p.m., his friends go out. Upstairs he stays in his
// room scrolling; at the bar his seat on the sofa stays empty ("Il vient pas, lui ?"). Downstairs he locks his phone and
// goes. 1 a.m., the group photo: upstairs three people on it, downstairs four, him in the middle (photo cards, extra.js).
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
function sofaTex() { const P = new PX(48, 16), R = ramp(['#1c2a2a', '#2a3e3c', '#3c5654', '#527270'], .45); P.fill((x, y) => R(.5 + (h2(x >> 1, y >> 1, 5) - .5) * .25 - (x % 16 === 0 ? .2 : 0), x, y)); return P.done(); }

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#070912');
  for (let i = 0; i < 40; i++) { const s = glow('#dfe8ff', .05 + h2(i, 3, 1) * .05, 1.2); s.position.set(-6 + h2(i, 1, 1) * 12, -1 + h2(i, 2, 1) * 8, -6); scene.add(s); }
  const stone = mat(stoneTex()); const found = box(3.6, 1.8, 2.6, stone); found.position.set(0, -2.05, -1.1); scene.add(found);
  const slabM = new THREE.MeshStandardMaterial({ color: '#241c18', roughness: .9 }), trimM = new THREE.MeshBasicMaterial({ color: '#d8c28e' });
  for (const y of [-.25, 2.0, 4.25]) { const s = box(3.5, .25, 2.5, slabM); s.position.set(0, y, -1.1); scene.add(s); const tr = box(3.5, .025, .02, trimM); tr.position.set(0, y + .11, .16); scene.add(tr); }
  const sofaT = texOf(sofaTex());
  const floors = FY.map((y0, f) => {
    const g = new THREE.Group(); g.position.y = y0; scene.add(g);
    const wood = mesh(new THREE.BoxGeometry(3.2, .02, 2.25).translate(0, .01, -1.1), mat(woodPlanks(96, 64, { pw: 6, len: 48, seed: 3 + f, cols: ['#1a120e', '#2c1e16', '#43301f', '#5a4128', '#6e5032'] }))); g.add(wood);
    // —— his room (Saturday, 8 p.m.) ——
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
    const facedown = box(.08, .015, .15, new THREE.MeshStandardMaterial({ color: '#16161c', roughness: .4 })); facedown.position.set(.68, .745, -.85); facedown.visible = false; bed.add(facedown);
    const lampL = new THREE.PointLight('#ffcf90', 2.4, 3.2, 1.3); lampL.position.set(.4, 1.4, -.4); g.add(lampL);
    const moonL = new THREE.PointLight('#8aa0e0', .8, 3, 1.5); moonL.position.set(-.1, 1.3, -1.6); g.add(moonL);
    // —— the bar: string lights, a long sofa, a low table with glasses ——
    const out = new THREE.Group(); out.visible = false; g.add(out);
    const bM = mat(wallTex(['#2a2030', '#382a3c', '#46364a', '#56445a'], 9 + f));
    const bb = box(3.2, 2.0, .1, bM); bb.position.set(0, 0, -2.25); out.add(bb);
    for (const x of [-1.65, 1.65]) { const sw = box(.1, 2.0, 2.4, bM); sw.position.set(x, 0, -1.1); out.add(sw); }
    for (let i = 0; i < 11; i++) { const x = -1.45 + i * .29, y = 1.78 - Math.sin(i / 10 * Math.PI) * .12, c = ['#ffd890', '#ffb870', '#fff0c0'][i % 3]; const s = glow(c, .09, 1.0); s.position.set(x, y, -2.16); out.add(s); }
    const sM = mat(sofaTex());
    const seat = box(2.1, .38, .55, sM); seat.position.set(-.35, 0, -1.65); out.add(seat);
    const backr = box(2.1, .42, .14, sM); backr.position.set(-.35, .38, -1.9); out.add(backr);
    for (const x of [-1.45, .75]) { const a = box(.12, .55, .55, sM); a.position.set(x, 0, -1.65); out.add(a); }
    const tbl = box(.9, .05, .38, mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 7, nails: false, cols: ['#2a1c14', '#3e2a1c', '#563c28', '#6e4e34'] }))); tbl.position.set(-.35, .36, -.95); out.add(tbl);
    for (const [x, z] of [[-.75, -1.08], [.05, -1.08], [-.75, -.82], [.05, -.82]]) { const l = box(.04, .36, .04, mat(woodPlanks(16, 16, { pw: 16, len: 32, seed: 2, nails: false, cols: ['#2a1c14', '#3e2a1c'] }))); l.position.set(x, 0, z); out.add(l); }
    const glassM = new THREE.MeshStandardMaterial({ color: '#d8c080', roughness: .2, transparent: true, opacity: .8 });
    for (let i = 0; i < 4; i++) { const gl = new THREE.Mesh(new THREE.CylinderGeometry(.03, .025, .1, 10), glassM); gl.position.set(-.7 + i * .22, .435, -.95 + (i % 2) * .05); out.add(gl); }
    const barL = new THREE.PointLight('#ffc890', 0, 4.2, 1.2); barL.position.set(-.3, 1.6, -.35); g.add(barL);
    const flash = glow('#ffffff', .35, 1.6); flash.visible = false; g.add(flash);
    // —— him and his friends ——
    const hero = makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark', shoe: 'sneaker' }, {
      phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, tired: { pose: 'phone', bob: 1, blink: 1 }, laugh: { pose: 'sitlaugh' },
      sit: { pose: 'sit', smile: 1 }, talk: { pose: 'sittalk', mouth: 1, smile: 1 }, stand: { pose: 'stand', smile: 1 }, wave: { pose: 'wave', smile: 1 }, ...WALK,
    });
    const fr = (top, hair, style) => makePerson({ top, bottom: 'jean', hair, hairStyle: style, shoe: 'sneaker' }, {
      sit: { pose: 'sit', smile: 1 }, talk: { pose: 'sittalk', mouth: 1, smile: 1 }, look: { pose: 'sit' }, stand: { pose: 'stand', smile: 1 }, wave: { pose: 'wave', smile: 1 },
      film: { pose: 'film', smile: 1 }, ask: { pose: 'sittalk', mouth: 1 },
    });
    const pals = [fr('mustard', 'hairBrown', 'long'), fr('teal', 'hairBlond'), fr('green', 'hairDark')];
    for (const P of [hero, ...pals]) { P.shadow.visible = false; g.add(P.root); }
    const phoneL = new THREE.PointLight('#8fc0ff', 1.0, 1.4, 2); g.add(phoneL);
    return { g, bed, out, facedown, lampL, lampG, moonL, barL, flash, hero, pals, phoneL };
  });
  scene.add(new THREE.HemisphereLight('#7080b0', '#1c1418', 1.3));
  const fill = new THREE.PointLight('#c0c8e8', 3.0, 20, 1.2); fill.position.set(0, 2.3, 5); scene.add(fill);
  const _v = new THREE.Vector3(), alt = (t, r, k = 0) => Math.floor(t * r + k) % 2;
  // seats on the sofa: her, the friend with the phone, HIS seat, the third friend
  const SEATS = [[-1.15, .02, -1.42], [-.62, .02, -1.42], [-.1, .02, -1.42], [.42, .02, -1.42]];

  function update(t, shot, cam, post, renderer) {
    const u = eio(seg(t, 0, T.end)); cam.position.set(0, 2.17, lerp(13.2, 12.9, u)); cam.lookAt(0, 2.17, -1); cam.fov = 24.0; cam.updateProjectionMatrix();
    const ph = phaseAt(t), atBar = ph >= 1;
    floors.forEach((F, f) => {
      const up = f === 0, H = F.hero, [A, B, C] = F.pals;
      F.bed.visible = !atBar; F.out.visible = atBar; F.barL.intensity = atBar ? 3.2 : 0;
      F.lampL.intensity = atBar ? 0 : 2.4; F.lampG.visible = !atBar; F.moonL.intensity = atBar ? 0 : .8;
      F.flash.visible = false;
      let hp = [.22, .02, -1.0], hf = 'phone', hv = true;
      [A, B, C].forEach(P => { P.root.visible = atBar; });
      if (!atBar) {
        F.facedown.visible = !up && t >= T.down;
        if (!up && t >= T.down) { const k = seg(t, T.leave, 2.9); hp = [lerp(.22, 1.5, k), 0, lerp(-1.0, -.9, k)]; hf = k > 0 ? walkFrame(t) : 'stand'; hv = k < 1; }
        else hf = t % 2.9 < .1 ? 'blink' : 'phone';
      } else {
        F.facedown.visible = false;
        hv = !up; hp = SEATS[2];
        const talk = k => (alt(t, 2.6, k) ? 'talk' : 'sit');
        let fa = talk(0), fb = talk(1), fc = talk(.5), pb = SEATS[1], pc = SEATS[3], bflip = false;
        if (ph === 2) { fa = 'stand'; fb = alt(t, 2) ? 'wave' : 'stand'; fc = 'stand'; hf = alt(t, 2, 1) ? 'wave' : 'stand'; }
        else if (ph >= 4) {
          // 1 a.m.: "isn't he coming?" upstairs; then the group photo, his friend at the front with the phone
          fa = 'sit'; fc = 'sit'; hf = 'sit';
          if (up && t < 11.0) { fb = t >= 8.2 ? (alt(t, 3) ? 'ask' : 'look') : 'sit'; }
          if (t >= 11.1) { const k = seg(t, 11.1, 11.8); pb = [lerp(SEATS[1][0], .95, k), 0, lerp(-1.42, -.75, k)]; fb = k < 1 ? 'stand' : 'film'; bflip = true; }
          if (t >= T.verdict && t < T.verdict + .25) { F.flash.visible = true; F.flash.position.copy(B.local(28, 12)).add(_v.set(0, 0, .1)); }
        } else hf = talk(1.5);
        const atStand = ph === 2;
        A.root.position.set(...(atStand ? [-1.15, 0, -1.1] : SEATS[0])); A.frame(fa); A.face(cam, false);
        B.root.position.set(...(atStand ? [-.62, 0, -1.1] : pb)); B.frame(fb); B.face(cam, bflip);
        C.root.position.set(...(atStand ? [.42, 0, -1.1] : pc)); C.frame(fc); C.face(cam, true);
        if (atStand) hp = [-.1, 0, -1.1];
      }
      H.root.visible = hv; H.root.position.set(...hp); H.frame(hf); H.face(cam, false);
      const lit = hv && ['phone', 'blink', 'tired', 'laugh'].includes(hf);
      F.phoneL.intensity = lit ? 1.0 : 0; if (lit) F.phoneL.position.copy(H.local(25, 18)).add(_v.set(.2, .05, .2));
    });
    post.dof.focus = cam.position.distanceTo(_v.set(0, 2.1, -1.0)); post.dof.aper = 2; post.dof.maxCoc = 3;
    renderer.toneMappingExposure = 1.25; post.bloom.strength = .3; post.bloom.threshold = .88;
  }
  return { scene, update };
}
