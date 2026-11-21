// Group project: a library table, four names on one project. Three of them work for two weeks (days and nights go
// by, cups and papers pile up); he scrolls. Presentation day: the professor asks him what he did.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson, WALK, walkFrame } from './people.js';
import { T, TICKS, dayAt } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

const EX = 40;
function shelfTex() { const P = new PX(64, 48), W = ramp(['#2a1a10', '#3e2818', '#543820'], .45), C = [[120, 40, 40], [40, 70, 110], [60, 100, 60], [150, 120, 50], [90, 60, 110], [140, 140, 130]]; P.fill((x, y) => W(.5, x, y)); for (let s = 0; s < 4; s++) { const y0 = 2 + s * 12; let x = 2; while (x < 62) { const w = 2 + Math.floor(h2(x, s, 3) * 3), h = 7 + Math.floor(h2(x, s, 4) * 3), c = C[Math.floor(h2(x, s, 5) * C.length)]; for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) P.set(x + xx, y0 + 10 - h + yy, c.map(v => v * (.8 + .2 * (xx === 0 ? 0 : 1)))); x += w + (h2(x, s, 6) > .85 ? 2 : 0); } for (let x2 = 0; x2 < 64; x2++) P.set(x2, y0 + 10, [30, 18, 10]); } return P.done(); }
function wallTex(cols, s) { const P = new PX(64, 64), R = ramp(cols, .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, s) - .5) * .25 + (h2(x, y, s) - .5) * .1, x, y)); return P.done(); }
function slideTex() {   // the projected slide: real text, drawn once
  const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d');
  g.fillStyle = '#f4f0e6'; g.fillRect(0, 0, 640, 360); g.fillStyle = '#2a3a5a'; g.fillRect(0, 0, 640, 70);
  g.fillStyle = '#ffffff'; g.font = '700 40px Figtree'; g.textAlign = 'center'; g.fillText('GROUP 4 · FINAL PROJECT', 320, 50);
  g.fillStyle = '#1a1714'; g.font = '600 38px Figtree'; ['Mia', 'Sam', 'Alex', 'You'].forEach((n, i) => g.fillText(n, 320, 140 + i * 52));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0a0806');
  const lib = new THREE.Group(), cls = new THREE.Group(); scene.add(lib, cls); cls.position.x = EX;
  // ——— library ———
  lib.add(mesh(new THREE.BoxGeometry(8, .2, 6).translate(0, -.1, 0), mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 5, cols: ['#2a1c14', '#3e2a1c', '#543a26', '#6a4a30', '#805a3a'] }))));
  const shelfM = mat(shelfTex()); for (let i = 0; i < 4; i++) { const s = box(1.9, 2.6, .35, shelfM); s.position.set(-2.85 + i * 1.9, 0, -2.6); lib.add(s); }
  const wM = mat(wallTex(['#3a2a22', '#4a362c', '#5a4236', '#6a4e40'], 3)); const bw = box(8, 3.4, .2, wM); bw.position.set(0, 0, -2.9); lib.add(bw);
  const woodM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 6, nails: false, cols: ['#3a2416', '#523420', '#6c462c', '#865a38'] }));
  const table = box(2.6, .06, .9, woodM); table.position.set(.15, .72, -.75); lib.add(table);
  for (const x of [-1.05, 1.35]) { const l = box(.08, .72, .7, woodM); l.position.set(x, 0, -.75); lib.add(l); }
  // seats: three teammates and him, side by side behind the table
  const XS = [-.95, -.1, .75, 1.0];
  const lapM = new THREE.MeshStandardMaterial({ color: '#30323c', roughness: .6 }), scrM = new THREE.MeshBasicMaterial({ color: '#8aa8d8' });
  XS.slice(0, 3).forEach(x => { const b = box(.36, .02, .26, lapM); b.position.set(x + .35, .75, -.62); lib.add(b); const s = new THREE.Mesh(new THREE.PlaneGeometry(.34, .22), scrM); s.position.set(x + .35, .88, -.76); s.rotation.x = -.2; lib.add(s); });
  // things that pile up over the days in front of the three
  const cupM = new THREE.MeshStandardMaterial({ color: '#d8d0c0' }), paperM = new THREE.MeshStandardMaterial({ color: '#ece8dc', roughness: .95 });
  const piles = []; for (let d = 0; d < 4; d++) XS.slice(0, 3).forEach((x, i) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(.04, .035, .1, 8), cupM); c.position.set(x + .05 + d * .07 - (i % 2) * .1, .8, -.45 - (d % 2) * .12); lib.add(c);
    const p = box(.22, .015 + d * .012, .3, paperM); p.position.set(x - .1, .75, -.95 + (d % 2) * .05); p.rotation.y = d * .3; lib.add(p);
    piles.push({ d, objs: [c, p] });
  });
  const lampM = new THREE.MeshStandardMaterial({ color: '#2a3a2a', emissive: '#ffcf7a', emissiveIntensity: 0 });
  [-1.0, 1.0].forEach(x => { const sh = new THREE.Mesh(new THREE.CylinderGeometry(.08, .16, .14, 10), lampM); sh.position.set(x, 1.1, -.95); lib.add(sh); const st = box(.03, .32, .03, lapM); st.position.set(x, .75, -.95); lib.add(st); });
  const lampL = [-1.0, 1.0].map(x => { const L = new THREE.PointLight('#ffcf7a', 0, 3.5, 1.6); L.position.set(x, 1.0, -.7); lib.add(L); return L; });
  const day = new THREE.DirectionalLight('#fff0dc', 1.8); day.position.set(-3, 5, 4); day.castShadow = true; day.shadow.mapSize.set(1024, 1024); Object.assign(day.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 }); lib.add(day);
  const lHemi = new THREE.HemisphereLight('#e0d8c8', '#3a2a1e', 1.4); lib.add(lHemi);
  const lFill = new THREE.PointLight('#f0e0d0', 1.6, 7, 1.6); lFill.position.set(.3, 1.8, 2.2); lib.add(lFill);
  const W = { w0: { pose: 'write', step: 0 }, w1: { pose: 'write', step: 1 }, stand: { pose: 'stand' }, talk: { pose: 'talk', mouth: 1 }, look: { pose: 'stand', blink: 0 }, ...WALK };
  const LOOKS = [{ top: 'teal', bottom: 'jean', hair: 'hairBrown', hairStyle: 'long', shoe: 'shoe' }, { top: 'mustard', bottom: 'navy', hair: 'hairBlond', shoe: 'shoe' }, { top: 'green', bottom: 'jean', hair: 'hairDark', glasses: 1, shoe: 'shoe' }];
  const team = LOOKS.map((L, i) => { const p = makePerson(L, W); p.root.position.set(XS[i], 0, -1.25); p.shadow.visible = false; lib.add(p.root); return p; });
  const HF = { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, sphone: { pose: 'standphone' }, look: { pose: 'stand' } };
  const hero = makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark', shoe: 'sneaker' }, HF); hero.root.position.set(.7, 0, .2); hero.shadow.visible = false; lib.add(hero.root);
  const phoneL = new THREE.PointLight('#8fc0ff', .8, 1.3, 2); scene.add(phoneL);
  // ——— the classroom (presentation) ———
  cls.add(mesh(new THREE.BoxGeometry(9, .2, 8).translate(0, -.1, -1), mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 12, cols: ['#2a1e16', '#40301f', '#58422c', '#6e5638', '#86704a'] }))));
  const cW = mat(wallTex(['#4a4840', '#5e5a50', '#726e62', '#888476'], 7)); const cb = box(9, 3.6, .2, cW); cb.position.set(0, 0, -2.6); cls.add(cb);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.575), new THREE.MeshBasicMaterial({ map: slideTex() })); screen.position.set(0, 2.3, -2.48); cls.add(screen);
  const scrG = new THREE.PointLight('#e8ecff', 2.0, 4, 1.6); scrG.position.set(0, 2.0, -1.8); cls.add(scrG);
  cls.add(new THREE.HemisphereLight('#c8d0e0', '#4a3a2a', 1.4));
  const cFill = new THREE.PointLight('#f0e8e0', 2.2, 8, 1.6); cFill.position.set(.5, 2.2, 2.6); cls.add(cFill);
  const desks = []; for (let i = 0; i < 5; i++) { const d = box(.9, .05, .5, woodM); d.position.set(-2.2 + i * 1.1, .72, 1.9); cls.add(d); desks.push(d); }
  const teamC = LOOKS.map((L, i) => { const p = makePerson(L, W); p.root.position.set(-1.15 + i * .68, 0, -1.6); p.shadow.visible = false; cls.add(p.root); return p; });
  const heroC = makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark', shoe: 'sneaker' }, HF); heroC.root.position.set(.95, 0, -1.45); heroC.shadow.visible = false; cls.add(heroC.root);
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    const inLib = shot.id === 'library'; lib.visible = inLib; cls.visible = !inLib;
    if (inLib) {
      const d = dayAt(t), night = d % 2 === 1;   // the days and nights alternate on every tick
      const u = eio(seg(t, 0, T.pres)); cam.position.set(lerp(.7, .65, u), lerp(2.3, 2.15, u), lerp(4.1, 3.6, u)); cam.lookAt(lerp(.2, .25, u), lerp(.85, .85, u), -.6); cam.fov = 52; cam.updateProjectionMatrix();
      day.intensity = night ? .15 : 1.8; lHemi.intensity = night ? .5 : 1.4; lHemi.color.set(night ? '#4a5070' : '#e0d8c8'); lampL.forEach(L => { L.intensity = night ? 3.5 : 0; }); lampM.emissiveIntensity = night ? 2 : 0; lFill.intensity = night ? .7 : 1.6;
      piles.forEach(p => p.objs.forEach(o => { o.visible = p.d < d; }));
      team.forEach((p, i) => { p.frame(Math.floor(t * 6 + i * 1.7) % 2 ? 'w1' : 'w0'); p.face(cam); if (t >= 3.2 && t < 6.5 && i === 0) p.frame(Math.floor(t * 3) % 2 ? 'talk' : 'w0'); });
      hero.frame(t % 2.9 < .1 ? 'blink' : 'phone'); hero.face(cam); phoneL.position.copy(hero.local(25, 18)).add(_v.set(.2, .05, .2)); phoneL.intensity = .8;
      post.dof.focus = cam.position.distanceTo(_v.set(.3, .9, -.6)); post.dof.aper = 25; post.dof.maxCoc = 10;
      renderer.toneMappingExposure = night ? 1.35 : 1.15;
    } else {
      // the four of them in front of the slide; the professor's question; the three turn to him
      if (t < T.turn) { const u = eio(seg(t, T.pres, T.turn)); cam.position.set(EX + lerp(.05, .2, u), lerp(1.7, 1.6, u), lerp(4.4, 3.7, u)); cam.lookAt(EX + lerp(-.05, .1, u), lerp(1.4, 1.3, u), -1.6); cam.fov = 52; }
      else { const u = eo(seg(t, T.turn, T.turn + .8)); cam.position.set(EX + lerp(.55, .9, u), lerp(1.6, 1.4, u), lerp(2.9, 2.2, u)); cam.lookAt(EX + lerp(.2, .65, u), lerp(1.3, 1.15, u), -1.6); cam.fov = 50; }
      cam.updateProjectionMatrix();
      teamC.forEach((p, i) => { p.frame(t < T.prof && i === 0 && Math.floor(t * 3) % 2 ? 'talk' : 'stand'); p.face(cam, t < T.turn); });
      heroC.frame(t >= T.turn ? 'look' : 'sphone'); heroC.face(cam); phoneL.position.copy(heroC.local(25, 18)).add(_v.set(.2, .05, .2)); phoneL.intensity = t < T.turn ? .8 : 0;
      post.dof.focus = cam.position.distanceTo(_v.set(EX + (t < T.turn ? 0 : 1.0), 1.0, -1.6)); post.dof.aper = 30; post.dof.maxCoc = 10;
      renderer.toneMappingExposure = 1.15;
    }
    post.bloom.strength = .35; post.bloom.threshold = .88;
  }
  return { scene, update };
}
