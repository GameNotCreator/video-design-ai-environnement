// Can I cheat it? EP. 1: a student's bedroom at night. He sits on the bed with a phone on Nuclear lock and tries three ways out.
// Cold set (moonlight, the night window); the screens and, at the end, the desk lamp are the practicals that carry the story.
import * as THREE from 'three';
import { PX, ramp, hex, h2, texOf, glow, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson, WALK, walkFrame } from './people.js';
import { makePhone, makeLaptop, lockScreen, offScreen, bootScreen, homeScreen, deskScreen } from './screens.js';
import { T, remainAt, SESSION } from './story.js';
import { seg, clamp, lerp, eio, eo, ei } from '/core/lib.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerpV = (a, b, u) => a.clone().lerp(b, u);
function wallp() { const P = new PX(96, 72), R = ramp(['#1c2234', '#262e46', '#323c58', '#3e4a6a'], .45); P.fill((x, y) => R(.42 + ((x % 12) === 0 ? .14 : 0) + (h2(x, y, 3) - .5) * .1 + (y / 72) * .08, x, y)); return P.done(); }
function quilt() { const P = new PX(48, 24), A = ramp(['#16304a', '#21466a', '#2e5d86', '#4878a0'], .45), B = ramp(['#2a2638', '#3a3550', '#4c4668', '#62608a'], .45); P.fill((x, y) => ((Math.floor(x / 6) + Math.floor(y / 6)) % 2 ? A : B)(.5 + (x % 6 === 0 || y % 6 === 0 ? -.18 : 0) + (h2(x, y, 8) - .5) * .12, x, y)); return P.done(); }
function plainTex(cols, w = 24, h = 24, seed = 1) { const P = new PX(w, h), R = ramp(cols, .45); P.fill((x, y) => R(.5 + (h2(x, y, seed) - .5) * .25, x, y)); return P.done(); }
function nightView() {   // the window: deep blue sky, stars, the block opposite with a few lit windows
  const P = new PX(30, 25), sky = ramp(['#070b1c', '#0c1430', '#142048', '#1d2c5e'], .45);
  P.fill((x, y) => sky(.15 + y / 25 * .6, x, y));
  for (let i = 0; i < 16; i++) P.set(Math.floor(h2(i, 1, 4) * 30), Math.floor(h2(i, 2, 4) * 11), h2(i, 3, 4) > .5 ? [220, 226, 255] : [140, 150, 200]);
  P.ellipse(23.5, 4.5, 2.2, 2.2, [232, 236, 255]);
  for (const [x0, x1, top] of [[0, 9, 13], [10, 17, 16], [18, 30, 11]]) for (let y = top; y < 25; y++) for (let x = x0; x < x1; x++) P.set(x, y, [16, 18, 30]);
  for (let i = 0; i < 22; i++) { const x = Math.floor(h2(i, 5, 2) * 29), y = 12 + Math.floor(h2(i, 6, 2) * 12); if (P.get(x, y)) { const c = P.get(x, y); if (c[0] === 16) P.set(x, y, h2(i, 7, 2) > .4 ? [255, 196, 110] : [150, 186, 255]); } }
  return P.done();
}
function posterTex() { const P = new PX(12, 17); P.fill((x, y) => [196, 186, 160]); for (let y = 2; y < 15; y++) for (let x = 1; x < 11; x++) P.set(x, y, y < 9 ? [70, 96, 140] : [52, 70, 64]); for (let x = 1; x < 11; x++) { const hgt = 9 - Math.abs(x - 6) * 1.1; for (let y = Math.max(3, Math.round(hgt)); y < 9; y++) P.set(x, y, [36, 48, 60]); } P.ellipse(8, 4.5, 1.2, 1.2, [236, 222, 170]); return P.done(); }

export function buildRoom() {
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2('#0c1020', .04); scene.background = new THREE.Color('#05060c');
  scene.add(mesh(new THREE.BoxGeometry(7, .2, 6).translate(0, -.1, -.4), mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 12, cols: ['#140e0c', '#22180f', '#33241a', '#453222', '#58402a'] }))));
  const wm = mat(wallp());
  const back = box(7, 3.2, .2, wm, { cast: false }); back.position.set(0, 0, -2.1); scene.add(back);
  const right = box(.2, 3.2, 5, wm, { cast: false }); right.position.set(1.85, 0, -.6); scene.add(right);
  // window on the back wall + frame
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.0), new THREE.MeshBasicMaterial({ map: texOf(nightView()), fog: false })); win.position.set(-1.0, 1.62, -1.99); scene.add(win);
  const frameM = new THREE.MeshStandardMaterial({ color: '#c8c0b0', roughness: .8 });
  for (const [w, h, x, y] of [[1.28, .06, -1.0, 2.12], [1.28, .06, -1.0, 1.1], [.06, 1.04, -1.64, 1.6], [.06, 1.04, -.36, 1.6], [.04, 1.0, -1.0, 1.6]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, .05), frameM); f.position.set(x, y, -1.97); scene.add(f); }
  const sill = new THREE.Mesh(new THREE.BoxGeometry(1.4, .04, .14), frameM); sill.position.set(-1.0, 1.07, -1.93); scene.add(sill);
  const moonG = glow('#8aa0e0', 1.6, .35); moonG.position.set(-1.0, 1.62, -1.9); scene.add(moonG);
  // poster on the right wall, shelf over the desk
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(.5, .7), new THREE.MeshStandardMaterial({ map: texOf(posterTex()), roughness: .9 })); poster.rotation.y = -Math.PI / 2; poster.position.set(1.74, 1.7, -.55); scene.add(poster);
  const woodM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 6, nails: false, cols: ['#1e140e', '#33231a', '#4a3424', '#5e4430'] }));
  const shelf = box(.9, .04, .22, woodM); shelf.position.set(1.05, 1.62, -1.88); scene.add(shelf);
  const bookCols = ['#3a4a6a', '#5a4a3a', '#3e5a4a', '#6a5a30', '#4a3a5a', '#2e3e5e'];
  for (let i = 0; i < 7; i++) { const h = .18 + h2(i, 1, 9) * .08, b = box(.05, h, .17, new THREE.MeshStandardMaterial({ color: bookCols[i % 6], roughness: .9 })); b.position.set(.7 + i * .065, 1.66, -1.88); scene.add(b); }
  // bed: frame, quilt, pillow; the untouched textbooks on it
  const bedF = box(2.0, .3, 1.0, woodM); bedF.position.set(-1.1, 0, -1.45); scene.add(bedF);
  const mattress = box(1.96, .22, .96, mat(quilt())); mattress.position.set(-1.1, .3, -1.45); scene.add(mattress);
  const pillow = box(.36, .1, .6, mat(plainTex(['#8c8a9c', '#a8a6b8', '#c4c2d2', '#dcdae6']))); pillow.position.set(-1.85, .52, -1.45); scene.add(pillow);
  [['#2e4a7a', .05, 0], ['#4a6a3e', .045, .02], ['#7a6230', .055, -.015]].forEach(([c, h, dx], i) => { const b = box(.3, h, .22, new THREE.MeshStandardMaterial({ color: c, roughness: .85 })); b.position.set(-1.32 + dx, .52 + [0, .05, .095][i], -1.12); b.rotation.y = dx * 6; scene.add(b); });
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshStandardMaterial({ map: texOf(plainTex(['#2a2236', '#3a3048', '#4a3e5a'], 38, 24, 4)), roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(-.1, .005, -.3); rug.receiveShadow = true; scene.add(rug);
  // desk, chair, lamp, the book he will open
  const desk = box(.8, .04, 1.1, woodM); desk.position.set(1.05, .72, -1.25); scene.add(desk);
  for (const [x, z] of [[.69, -1.75], [1.41, -1.75], [.69, -.75], [1.41, -.75]]) { const l = box(.05, .72, .05, woodM); l.position.set(x, 0, z); scene.add(l); }
  const chair = new THREE.Group(); const cs = box(.42, .05, .42, woodM); cs.position.y = .46; chair.add(cs); const cb = box(.05, .5, .42, woodM); cb.position.set(-.2, .5, 0); chair.add(cb);
  for (const [x, z] of [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]]) { const l = box(.04, .46, .04, woodM); l.position.set(x, 0, z); chair.add(l); }
  chair.position.set(.3, 0, -1.08); scene.add(chair);
  const lampG = new THREE.Group(); const lb = new THREE.Mesh(new THREE.CylinderGeometry(.08, .09, .03, 12), new THREE.MeshStandardMaterial({ color: '#2a2a30', roughness: .5 })); lb.position.y = .015; lampG.add(lb);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .4, 6), lb.material); stem.position.y = .22; lampG.add(stem);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(.12, .14, 12, 1, true), new THREE.MeshStandardMaterial({ color: '#d8c8a0', roughness: .7, side: THREE.DoubleSide, emissive: '#ffb860', emissiveIntensity: 0 })); shade.position.y = .44; lampG.add(shade);
  lampG.position.set(1.28, .74, -1.62); scene.add(lampG);
  const lampL = new THREE.PointLight('#ffc27a', 0, 5.5, 1.5); lampL.position.set(1.18, 1.12, -1.4); lampL.castShadow = true; lampL.shadow.mapSize.set(1024, 1024); lampL.shadow.bias = -.004; scene.add(lampL);
  const lampGl = glow('#ffc070', .5, 1.2); lampGl.position.set(1.28, 1.12, -1.6); scene.add(lampGl);
  const bookC = box(.26, .04, .2, new THREE.MeshStandardMaterial({ color: '#2e4a7a', roughness: .85 })); bookC.position.set(.7, .74, -.84); bookC.rotation.y = .2; scene.add(bookC);
  const bookO = new THREE.Group(); const pageM = new THREE.MeshStandardMaterial({ color: '#e8e0cc', roughness: .9 });
  for (const s of [-1, 1]) { const p = box(.24, .012, .3, pageM); p.position.set(s * .125, 0, 0); p.rotation.z = -s * .05; bookO.add(p); }
  bookO.position.set(.72, .745, -.9); bookO.rotation.y = -.35; bookO.visible = false; scene.add(bookO);
  // lights
  const hemi = new THREE.HemisphereLight('#5a6a9a', '#20161a', 1.5); scene.add(hemi);
  const moon = new THREE.DirectionalLight('#7f95d6', .75); moon.position.set(-1.6, 3.2, -3.4); moon.target.position.set(-.3, 0, 0); moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024);
  Object.assign(moon.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 }); moon.shadow.bias = -.002; scene.add(moon); scene.add(moon.target);
  const fill = new THREE.PointLight('#c8c8e0', 1.6, 6, 1.6); scene.add(fill);
  // the hero: red fez, red hoodie
  const hero = makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark', hat: 'fez' }, {
    hold: { pose: 'sitshow', smile: 1 }, holdB: { pose: 'sitshow', blink: 1 }, holdN: { pose: 'sitshow' }, holdW: { pose: 'sitshow', brow: 1 },
    desk: { pose: 'sitdesk' }, deskB: { pose: 'sitdesk', blink: 1 }, deskM: { pose: 'sitdesk', mouth: 1 },
    read: { pose: 'sitread' }, readB: { pose: 'sitread', blink: 1 }, stand: { pose: 'stand' }, ...WALK,
  });
  scene.add(hero.root);
  const phone = makePhone(); scene.add(phone.group);
  const phoneG = glow('#ff7a5a', .5, .9); scene.add(phoneG);
  const laptop = makeLaptop(); laptop.group.position.set(.92, .74, -1.12); laptop.group.rotation.y = -.6; scene.add(laptop.group);
  const lapG = glow('#ff7a5a', .7, .8); scene.add(lapG);

  const PH0 = V3(-.31, 1.23, -.78), BED = V3(-.7, 0, -.82), SEAT = V3(.3, 0, -1.08), BEDSPOT = V3(-1.02, .535, -.92);
  const _q = new THREE.Quaternion(), _qf = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, .35)), _v = new THREE.Vector3();
  const RED_L = new THREE.Color('#ff6a4a'), COLD_L = new THREE.Color('#9db8ff');

  function phoneState(t) {
    if (t < T.press + .3) return { m: 'lock', a: 9 };
    if (t < T.off) return { m: 'lock', a: 9, fade: seg(t, T.press + .3, T.off) };
    if (t < T.boot) return { m: 'off' };
    if (t < T.relock) return { m: 'boot', a: t - T.boot };
    if (t < T.home) return { m: 'lock', a: t - T.relock };
    if (t < T.relock2) return { m: 'home' };
    return { m: 'lock', a: t - T.relock2 };
  }

  function update(t, cam, post, renderer) {
    // —— the hero ——
    let pos = BED.clone(), fr, flip = false;
    if (t < T.stand) {
      const worried = (t > T.relock + .2 && t < T.relock + 1.6) || (t > T.relock2 + .2 && t < T.relock2 + 1.8);
      fr = worried ? 'holdW' : ((t + 1.4) % 3.1 < .1 ? 'holdB' : t < T.try1 ? 'hold' : 'holdN');
    } else if (t < T.sitDesk) { const u = seg(t, T.stand + .1, T.sitDesk); pos = lerpV(BED, SEAT, u); fr = t < T.stand + .1 ? 'stand' : walkFrame(t); }
    else if (t < T.book) { pos = SEAT.clone(); fr = (t > T.lock3 + .9 && t < T.lock3 + 1.8 && Math.floor(t * 4) % 2) ? 'deskM' : (t % 2.7 < .1 ? 'deskB' : 'desk'); }
    else { pos = SEAT.clone(); fr = t % 3.3 < .1 ? 'readB' : 'read'; }
    hero.root.position.copy(pos); hero.frame(fr);
    // —— camera ——
    const ph = PH0;
    const S1p = V3(-.12, 1.95, 2.9), S1l = V3(-.5, 1.1, -.8);
    const insL = V3(-.4, 1.16, -.79), insP = insL.clone().add(V3(.12, .28, 1.45));
    const deskP = V3(.5, 1.8, 1.5), deskL = V3(.62, .95, -1.05);
    const lapP = V3(.56, 1.72, 1.85), lapL = V3(.68, .98, -1.1);
    const wideP = V3(.1, 4.4, 3.4), wideL = V3(-.05, .55, -1.0);
    let P, L, fov = 40, focusTo = PH0;
    if (t < T.try1) { const u = seg(t, 0, T.try1); P = lerpV(S1p, S1p.clone().add(V3(-.04, -.06, -.25)), u); L = S1l; }
    else if (t < T.try3) { const u = eio(seg(t, T.try1, T.try1 + .7)); const S1e = S1p.clone().add(V3(-.04, -.06, -.25)); const drift = V3(lerp(0, -.08, seg(t, T.try2, T.try3)), 0, 0);
      P = lerpV(S1e, insP.clone().add(drift), u); L = lerpV(S1l, insL, u); fov = lerp(40, 38, u); }
    else if (t < T.pull) { const u = eio(seg(t, T.try3, T.sitDesk + .2)), v = eio(seg(t, T.lock3 - .9, T.lock3 + .1));
      const a = lerpV(insP, deskP, u), b = lerpV(insL, deskL, u); P = lerpV(a, lapP, v); L = lerpV(b, lapL, v); focusTo = v > .5 ? laptop.group.position : hero.root.position.clone().setY(1); }
    else { const u = eio(seg(t, T.pull, T.pull + 2.6)); P = lerpV(lapP, wideP, u).add(V3(0, 0, -seg(t, T.pull + 2.6, T.card) * .25)); L = lerpV(lapL, wideL, u); fov = lerp(40, 48, u); focusTo = hero.root.position.clone().setY(.9); }
    cam.position.copy(P); cam.lookAt(L); cam.fov = fov; cam.updateProjectionMatrix();
    post.dof.focus = cam.position.distanceTo(focusTo); post.dof.aper = 70; post.dof.maxCoc = 12;
    renderer.toneMappingExposure = t > T.pull ? 1.75 : 1.5; scene.fog.density = t > T.pull ? .018 : .04; post.bloom.strength = .45; post.bloom.threshold = .82;
    hero.face(cam, flip);
    // —— the phone: held up to be read, then tossed on the bed ——
    const ps = phoneState(t), rem = remainAt(t);
    phone.scr.paint(P => {
      if (ps.m === 'lock') { lockScreen(P, rem, SESSION.total, ps.a); if (ps.fade) for (let y = 0; y < P.h; y++) for (let x = 0; x < P.w; x++) { const c = P.get(x, y); P.set(x, y, c.slice(0, 3).map(v => Math.round(v * (1 - ps.fade)))); } }
      else if (ps.m === 'off') offScreen(P);
      else if (ps.m === 'boot') bootScreen(P, ps.a);
      else homeScreen(P, t, { jiggle: t >= T.jiggle && t < T.tapApp ? 1 : 0, gone: seg(t, T.poof, T.poof + .35), tap: t >= T.tapApp - .12 ? 9 : -1 });
    });
    const held = hero.local(28.5, 13).add(_v.copy(cam.position).sub(hero.root.position).setY(0).normalize().multiplyScalar(.1));
    if (t < T.stand) { phone.group.position.copy(held); phone.group.quaternion.copy(cam.quaternion); if (t > T.press && t < T.press + .3) phone.group.rotateZ(-.06); }
    else { const u = eio(seg(t, T.stand, T.stand + .45)), p = lerpV(held, BEDSPOT, u); p.y += Math.sin(u * Math.PI) * .25; phone.group.position.copy(p); _q.copy(cam.quaternion).slerp(_qf, u); phone.group.quaternion.copy(_q); }
    const pOn = ps.m === 'lock' ? 1 - (ps.fade || 0) : ps.m === 'home' ? 1 : ps.m === 'boot' ? .25 : 0, pCold = ps.m === 'home' || ps.m === 'boot';
    const flash = ps.m === 'lock' ? Math.max(0, 1 - ps.a / .5) : 0;
    phone.light.color.copy(pCold ? COLD_L : RED_L); phone.light.intensity = (pCold ? .6 : .8) * pOn + flash * 1.2;
    phone.mat.color.setScalar(pCold ? .92 : 1);
    phoneG.position.copy(phone.group.position); phoneG.material.color.copy(pCold ? COLD_L : RED_L).multiplyScalar(.5 * pOn + flash * .8); phoneG.scale.setScalar(.45 + flash * .4);
    // —— the laptop: lid opens, cold desktop, then the same lock and the same countdown ——
    const lu = eio(seg(t, T.lid, T.lidOpen)); laptop.setOpen(lu);
    const lm = t < T.lid + .25 ? 'off' : t < T.lock3 ? 'desk' : 'lock';
    laptop.scr.paint(P => { if (lm === 'off') offScreen(P); else if (lm === 'desk') deskScreen(P, t); else lockScreen(P, rem, SESSION.total, t - T.lock3); });
    const lflash = lm === 'lock' ? Math.max(0, 1 - (t - T.lock3) / .6) : 0;
    laptop.light.color.copy(lm === 'desk' ? COLD_L : RED_L); laptop.light.intensity = lm === 'off' ? 0 : (lm === 'desk' ? 1.0 : .7) + lflash * 1.0;
    laptop.pivot.updateMatrixWorld(); lapG.position.copy(laptop.pivot.localToWorld(_v.set(0, .15, .05))); lapG.material.color.copy(lm === 'desk' ? COLD_L : RED_L).multiplyScalar(lm === 'off' ? 0 : .45 + lflash); lapG.scale.setScalar(.6 + lflash * .5);
    // —— the book and the lamp (the turn: the warm light takes over) ——
    bookC.visible = t < T.book; bookO.visible = t >= T.book;
    const lamp = t < T.lamp ? 0 : 1; lampL.intensity = 7 * lamp; shade.material.emissiveIntensity = 1.4 * lamp; lampGl.material.color.set('#ffc070').multiplyScalar(lamp * 1.1);
    // front fill follows the hero (a billboard lit from behind stays black); dims while the phone is off
    const off = t >= T.off && t < T.relock ? 1 - .7 * clamp(Math.min(seg(t, T.off, T.off + .15), 1 - seg(t, T.boot, T.relock))) : 1;
    fill.position.copy(hero.root.position).add(_v.set(.5, 1.4, 1.9)); fill.intensity = 1.5 * off;
    hemi.intensity = 1.5 * (.55 + .45 * off) + .3 * lamp;
    return { wide: t >= T.pull + 1.2 };
  }
  return { scene, update, hero };
}
