// Can I cheat it? EP. 1 (v2): a university library in daylight. He sits at the end of a long reading table with his phone on Nuclear lock
// and tries three ways out: restart, delete the app, the laptop. Sun through three tall windows, dust in the beams, students reading.
import * as THREE from 'three';
import { PX, ramp, h2, texOf, glow, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { beamCard, particles } from './fx.js';
import { makePerson } from './people.js';
import { makePhone, makeLaptop, lockScreen, offScreen, bootScreen, homeScreen, deskScreen } from './screens.js';
import { T, remainAt, SESSION } from './story.js';
import { seg, clamp, lerp, eio, eo } from '/core/lib.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerpV = (a, b, u) => a.clone().lerp(b, u);
function plaster() { const P = new PX(96, 96), R = ramp(['#b9ab92', '#cbbfa6', '#dad0ba', '#e6ddc9'], .45); P.fill((x, y) => R(.55 + (h2(x, y, 3) - .5) * .16 + ((y % 48) === 0 ? -.2 : 0), x, y)); return P.done(); }
function spines(seed) {   // a bookcase face: four shelves of book spines, muted colours, a few gaps
  const P = new PX(24, 56), cols = [[92, 60, 44], [60, 78, 96], [112, 96, 58], [70, 90, 70], [120, 76, 64], [84, 70, 100], [140, 120, 90], [52, 60, 72]];
  P.fill((x, y) => [62, 42, 28]);
  for (let s = 0; s < 4; s++) { const y0 = 2 + s * 14; let x = 1; let k = 0;
    while (x < 23) { const w = 1 + Math.floor(h2(x, s, seed) * 2.2), hgt = 9 + Math.floor(h2(x, s + 9, seed) * 4), c = cols[Math.floor(h2(k++, s, seed + 1) * 8)];
      if (h2(x, s, seed + 5) > .9) { x += 2; continue; }
      for (let i = 0; i < w && x + i < 23; i++) for (let y = y0 + 12 - hgt; y < y0 + 12; y++) P.set(x + i, y, c.map(v => Math.round(v * (i === 0 ? 1.15 : 1) * (y === y0 + 12 - hgt ? 1.2 : 1)))); x += w; }
    for (let x2 = 0; x2 < 24; x2++) { P.set(x2, y0 + 12, [96, 66, 42]); P.set(x2, y0 + 13, [44, 30, 20]); } }
  return P.done();
}
function dayView() {   // what the tall windows show: pale sky, a few clouds, tree tops, the building across the quad
  const P = new PX(26, 48), sky = ramp(['#9cc0e8', '#b4d0f0', '#cce0f6', '#e2eefa'], .45);
  P.fill((x, y) => sky(.95 - y / 48 * .6, x, y));
  for (let i = 0; i < 3; i++) P.ellipse(5 + i * 8 + h2(i, 1, 2) * 3, 8 + i * 3, 4, 1.6, [246, 248, 252]);
  for (let y = 30; y < 48; y++) for (let x = 0; x < 26; x++) P.set(x, y, [196, 176, 150]);
  for (let y = 33; y < 48; y += 5) for (let x = 2; x < 26; x += 6) P.rect(x, y, 3, 3, [120, 140, 170]);
  for (let i = 0; i < 9; i++) P.ellipse(h2(i, 3, 4) * 26, 30 + h2(i, 4, 4) * 6, 3 + h2(i, 5, 4) * 2.5, 3, (x, y, dx, dy) => [[70, 110, 60], [90, 132, 72], [112, 152, 84]][dy < -.2 ? 2 : dy < .3 ? 1 : 0]);
  return P.done();
}

export function buildRoom() {
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2('#efe6d6', .012); scene.background = new THREE.Color('#efe6d6');
  scene.add(mesh(new THREE.BoxGeometry(10, .2, 8).translate(0, -.1, -.8), mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 4, cols: ['#4a3220', '#6a4a2e', '#86603a', '#9c7448', '#b08858'] }))));
  const wm = mat(plaster());
  const back = box(10, 4, .3, wm, { cast: false }); back.position.set(0, 0, -3.15); scene.add(back);
  const left = box(.3, 4, 8, wm, { cast: false }); left.position.set(-3.35, 0, -.8); scene.add(left);
  // three tall windows on the back wall, sun beams and pools of light on the floor
  const view = texOf(dayView()), frameM = new THREE.MeshStandardMaterial({ color: '#5a3e28', roughness: .8 });
  const WINX = [-2.0, 0.1, 2.2], beams = [], pools = [];
  const SUN = V3(.42, -.62, 1).normalize();
  for (const x of WINX) {
    const v = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.0), new THREE.MeshBasicMaterial({ map: view, fog: false, color: '#ffffff' })); v.position.set(x, 2.1, -2.99); scene.add(v);
    for (const [w, h, dx, y] of [[1.2, .07, 0, 3.1], [1.2, .07, 0, 1.1], [.07, 2.0, -.57, 2.1], [.07, 2.0, .57, 2.1], [.04, 2.0, 0, 2.1], [1.1, .04, 0, 2.5]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, .08), frameM); f.position.set(x + dx, y, -2.96); scene.add(f); }
    const g = glow('#fff6e0', 2.2, .22); g.position.set(x, 2.1, -2.9); scene.add(g);
    const b = beamCard(3.6, 1.2, 1.9, '#fff0cc', { k: .16, fall: 1.1 }); scene.add(b); beams.push({ b, o: V3(x, 2.15, -2.9) });
  }
  // bookcases: between the windows and along the left wall
  const caseM = s => new THREE.MeshStandardMaterial({ map: texOf(spines(s)), roughness: .9 });
  for (const [x, s] of [[-.95, 1], [1.15, 2], [3.2, 3]]) { const c = new THREE.Mesh(new THREE.BoxGeometry(.85, 2.6, .35), [frameM, frameM, frameM, frameM, caseM(s), frameM]); c.position.set(x, 1.3, -2.85); c.castShadow = c.receiveShadow = true; scene.add(c); }
  for (const [z, s] of [[-2.2, 4], [-1.2, 5], [-.2, 6]]) { const c = new THREE.Mesh(new THREE.BoxGeometry(.35, 2.6, .9), [caseM(s), frameM, frameM, frameM, frameM, frameM]); c.position.set(-3.0, 1.3, z); c.castShadow = c.receiveShadow = true; scene.add(c); }
  const oak = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 11, nails: false, cols: ['#6a4a2e', '#86603a', '#a07448', '#b88a58'] }));
  const table = (x, z, len) => { const g = new THREE.Group(); const top = box(len, .05, .95, oak); top.position.y = .73; g.add(top);
    for (const [dx, dz] of [[-len / 2 + .08, -.4], [len / 2 - .08, -.4], [-len / 2 + .08, .4], [len / 2 - .08, .4]]) { const l = box(.07, .73, .07, oak); l.position.set(dx, 0, dz); g.add(l); }
    g.position.set(x, 0, z); scene.add(g); return g; };
  table(.65, -.75, 2.6); table(.9, -2.05, 2.6);
  const chair = (x, z) => { const g = new THREE.Group(); const s = box(.42, .05, .42, oak); s.position.y = .46; g.add(s); const b = box(.05, .5, .42, oak); b.position.set(-.2, .5, 0); g.add(b); g.position.set(x, 0, z); scene.add(g); };
  chair(-.95, -.75);
  // things on his table: the closed laptop, books (one he will open), a green reading lamp (off in daylight)
  const bookM = c => new THREE.MeshStandardMaterial({ color: c, roughness: .85 });
  [['#2e4a7a', .05], ['#4a6a3e', .045], ['#7a6230', .05]].forEach(([c, h], i) => { const b = box(.3, h, .22, bookM(c)); b.position.set(.55 + i * .02, .755 + [0, .05, .095][i], -1.0); b.rotation.y = .15 * (i - 1); scene.add(b); });
  const bookC = box(.26, .04, .2, bookM('#5a3a5e')); bookC.position.set(.05, .755, -.55); bookC.rotation.y = .3; scene.add(bookC);
  const bookO = new THREE.Group(); const pageM = new THREE.MeshStandardMaterial({ color: '#f0e8d6', roughness: .9 });
  for (const s of [-1, 1]) { const p = box(.24, .012, .3, pageM); p.position.set(s * .125, 0, 0); p.rotation.z = -s * .05; bookO.add(p); }
  bookO.position.set(.05, .76, -.55); bookO.rotation.y = -.3; bookO.visible = false; scene.add(bookO);
  const lampG = new THREE.Group(); const lb = new THREE.Mesh(new THREE.CylinderGeometry(.07, .08, .03, 10), new THREE.MeshStandardMaterial({ color: '#8a6a30', metalness: .4, roughness: .4 })); lampG.add(lb);
  const ls = new THREE.Mesh(new THREE.CylinderGeometry(.01, .01, .3, 6), lb.material); ls.position.y = .16; lampG.add(ls);
  const lh = new THREE.Mesh(new THREE.CylinderGeometry(.06, .13, .1, 12, 1, true), new THREE.MeshStandardMaterial({ color: '#2e5a3e', roughness: .5, side: THREE.DoubleSide })); lh.position.set(.05, .32, 0); lh.rotation.z = .5; lampG.add(lh);
  for (const x of [1.4, .9]) { const c = lampG.clone(); c.position.set(x, .76, x > 1 ? -1.1 : -2.3); scene.add(c); }
  // other students: two reading at the back table, one at the shelves
  const others = [[.4, -2.05, 'teal', 'hairBlond', 'sitread'], [1.6, -2.05, 'mustard', 'hairBrown', 'sitread'], [-2.35, -2.25, 'purple', 'hairDark', 'stand']].map(([x, z, top, hair, pose], i) => {
    const p = makePerson({ top, bottom: 'navy', hair, shoe: 'shoe', hairStyle: i === 1 ? 'long' : 'short' }, { a: { pose }, b: { pose, blink: 1 } }); p.root.position.set(x, 0, z); scene.add(p.root);
    if (pose === 'sitread') chair(x - .02, z); return p; });
  // lights: daylight
  const hemi = new THREE.HemisphereLight('#e6eeff', '#9a7a5a', 1.35); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff0d8', 2.3); sun.position.set(-2.4, 6, -7); sun.target.position.set(.4, 0, -.5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: .5, far: 20 }); sun.shadow.bias = -.0015; scene.add(sun); scene.add(sun.target);
  const fill = new THREE.PointLight('#fff4e6', .9, 6, 1.6); scene.add(fill);
  const dust = particles(90, (i, t, o) => { const w = WINX[i % 3], u = h2(i, 1, 7), v = ((h2(i, 2, 7) + t * (.012 + h2(i, 3, 7) * .02)) % 1);
    o.x = w + (u - .5) * 1.0 + v * 1.4 + Math.sin(t * .3 + i) * .05; o.y = 2.3 - v * 2.0 + Math.sin(t * .5 + i * 1.7) * .04; o.z = -2.8 + v * 2.6; o.s = .012 + h2(i, 4, 7) * .012; o.a = .55 * Math.sin(Math.PI * v); o.r = 1; o.g = .95; o.b = .82; }, { soft: 1 });
  scene.add(dust);
  // the hero: red fez, red hoodie
  const hero = makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark', hat: 'fez' }, {
    show: { pose: 'sitshow', smile: 1 }, showN: { pose: 'sitshow' }, showB: { pose: 'sitshow', blink: 1 }, showW: { pose: 'sitshow', brow: 1 },
    desk: { pose: 'sitdesk' }, deskW: { pose: 'sitdesk', brow: 1 }, read: { pose: 'sitread' }, readB: { pose: 'sitread', blink: 1 },
  });
  hero.root.position.set(-.95, 0, -.72); scene.add(hero.root);
  const phone = makePhone(); scene.add(phone.group);
  const laptop = makeLaptop(); laptop.group.position.set(-.38, .755, -.86); scene.add(laptop.group);

  const PH0 = V3(-.57, 1.23, -.66), DOWN = V3(-.6, .762, -.42);
  const _q = new THREE.Quaternion(), _qf = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, .2)), _v = new THREE.Vector3();
  const RED_L = new THREE.Color('#ff6a4a'), COLD_L = new THREE.Color('#9db8ff');
  const S1p = V3(.3, 2.55, 3.85), S1l = V3(-.6, 1.05, -.9);
  const INp = PH0.clone().add(V3(.1, .14, .92)), INl = PH0.clone().add(V3(0, .02, 0));
  const LAPp = V3(.3, 1.5, .55), LAPl = V3(-.42, .95, -.86);
  const WIDEp = V3(1.3, 4.5, 5.5), WIDEl = V3(.1, .85, -1.25);
  laptop.group.lookAt(LAPp.x, .755, LAPp.z);

  function phoneState(t) {
    if (t < T.press + .15) return { m: 'lock', a: 9 };
    if (t < T.off) return { m: 'lock', a: 9, fade: seg(t, T.press + .15, T.off) };
    if (t < T.boot) return { m: 'off' };
    if (t < T.relock) return { m: 'boot', a: t - T.boot };
    if (t < T.home) return { m: 'lock', a: t - T.relock };
    if (t < T.relock2) return { m: 'home' };
    return { m: 'lock', a: t - T.relock2 };
  }

  function update(t, cam, post, renderer) {
    // —— camera: medium (the whole situation) → close on the phone (tries 1 and 2) → the laptop (try 3) → rising pull-back to the library ——
    let P, L, fov = 40, focus = PH0;
    if (t < T.try1) { const u = seg(t, 0, T.try1); P = lerpV(S1p, S1p.clone().add(V3(-.06, -.08, -.35)), u); L = S1l; focus = V3(-.7, 1.1, -.72); }
    else if (t < T.try3) { const u = eio(seg(t, T.try1, T.try1 + .55)), S1e = S1p.clone().add(V3(-.06, -.08, -.35)), drift = V3(lerp(0, -.05, seg(t, T.try2, T.try3)), 0, 0);
      P = lerpV(S1e, INp.clone().add(drift), u); L = lerpV(S1l, INl, u); fov = lerp(40, 38, u); }
    else if (t < T.pull) { const u = eio(seg(t, T.try3, T.lid)); P = lerpV(INp, LAPp, u); L = lerpV(INl, LAPl, u); fov = 38; focus = lerpV(PH0, V3(-.38, .9, -.86), u); }
    else { const u = eio(seg(t, T.pull, T.pull + 2.8)); P = lerpV(LAPp, WIDEp, u).add(V3(0, 0, -seg(t, T.pull + 2.8, T.card) * .3)); L = lerpV(LAPl, WIDEl, u); fov = lerp(38, 44, u); focus = V3(-.8, .9, -.72); }
    cam.position.copy(P); cam.lookAt(L); cam.fov = fov; cam.updateProjectionMatrix();
    // —— the hero ——
    let fr;
    if (t < T.down) { const w = (t > T.relock + .15 && t < T.relock + 1.3) || (t > T.relock2 + .15 && t < T.relock2 + 1.3); fr = w ? 'showW' : (t + 1.2) % 3.1 < .1 ? 'showB' : t < T.try1 ? 'show' : 'showN'; }
    else if (t < T.book) fr = t > T.lock3 + .1 ? 'deskW' : 'desk';
    else fr = (t + .4) % 3.3 < .1 ? 'readB' : 'read';
    hero.frame(fr); hero.face(cam);
    others.forEach((p, i) => { p.frame((t + i * 1.3) % 3.4 < .1 ? 'b' : 'a'); p.face(cam); });
    // —— the phone: held up beside his face, then laid on the table ——
    const ps = phoneState(t), rem = remainAt(t);
    phone.scr.paint(P2 => {
      if (ps.m === 'lock') { lockScreen(P2, rem, SESSION.total, ps.a); if (ps.fade) for (let y = 0; y < P2.h; y++) for (let x = 0; x < P2.w; x++) { const c = P2.get(x, y); P2.set(x, y, c.slice(0, 3).map(v => Math.round(v * (1 - ps.fade)))); } }
      else if (ps.m === 'off') offScreen(P2);
      else if (ps.m === 'boot') bootScreen(P2, ps.a);
      else homeScreen(P2, t, { jiggle: t >= T.jiggle && t < T.tapApp ? 1 : 0, gone: seg(t, T.poof, T.poof + .35), tap: t >= T.tapApp - .12 ? 9 : -1 });
    });
    const held = hero.local(28.5, 13).add(_v.copy(cam.position).sub(hero.root.position).setY(0).normalize().multiplyScalar(.1));
    if (t < T.down) { phone.group.position.copy(held); phone.group.quaternion.copy(cam.quaternion); if (t > T.press && t < T.press + .25) phone.group.rotateZ(-.05); }
    else { const u = eio(seg(t, T.down, T.down + .4)); phone.group.position.copy(lerpV(held, DOWN, u)); _q.copy(cam.quaternion).slerp(_qf, u); phone.group.quaternion.copy(_q); }
    const pOn = ps.m === 'lock' ? 1 - (ps.fade || 0) : ps.m === 'home' ? 1 : ps.m === 'boot' ? .3 : 0, pCold = ps.m === 'home' || ps.m === 'boot';
    const flash = ps.m === 'lock' ? Math.max(0, 1 - ps.a / .5) : 0;
    phone.light.color.copy(pCold ? COLD_L : RED_L); phone.light.intensity = .35 * pOn + flash * .8; phone.mat.color.setScalar(1);
    // —— the laptop: lid opens, cold desktop, then the same lock and the same countdown ——
    laptop.setOpen(eio(seg(t, T.lid, T.lidOpen)));
    const lm = t < T.lid + .25 ? 'off' : t < T.lock3 ? 'desk' : 'lock';
    laptop.scr.paint(P2 => { if (lm === 'off') offScreen(P2); else if (lm === 'desk') deskScreen(P2, t); else lockScreen(P2, rem, SESSION.total, t - T.lock3); });
    const lflash = lm === 'lock' ? Math.max(0, 1 - (t - T.lock3) / .6) : 0;
    laptop.light.color.copy(lm === 'desk' ? COLD_L : RED_L); laptop.light.intensity = lm === 'off' ? 0 : .5 + lflash;
    bookC.visible = t < T.book; bookO.visible = t >= T.book;
    // —— daylight: beams aimed at the camera each frame, dust, fill on the hero ——
    for (const { b, o } of beams) { const k = b.userData.aim(o, SUN, cam); b.material.uniforms.k.value = .3 * k; b.material.uniforms.t.value = t; }
    dust.userData.update(t);
    fill.position.copy(hero.root.position).add(_v.set(.6, 1.4, 1.9));
    post.dof.focus = cam.position.distanceTo(focus); post.dof.aper = 60; post.dof.maxCoc = 10;
    renderer.toneMappingExposure = 1.0; post.bloom.strength = .28; post.bloom.threshold = .92;
    return { wide: t >= T.pull + 1.6 };
  }
  return { scene, update, hero };
}
