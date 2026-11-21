// How it works EP. 1 (v2): a café in daylight. At a table by the shop window, his phone, MacBook and iPad all ping.
// One tap on the phone and the three screens lock one after the other, the same padlock and the same countdown; then he writes.
import * as THREE from 'three';
import { PX, ramp, h2, texOf, glow, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { beamCard, particles } from './fx.js';
import { makePerson } from './people.js';
import { makePhone, makeLaptop, makeSlab, lockScreen, deskScreen, feedScreen, startScreen } from './screens.js';
import { T, remainAt, SESSION } from './story.js';
import { seg, lerp, eio, eo } from '/core/lib.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerpV = (a, b, u) => a.clone().lerp(b, u);
function tiles() { const P = new PX(48, 48); P.fill((x, y) => { const k = (Math.floor(x / 8) + Math.floor(y / 8)) % 2, n = (h2(x, y, 6) - .5) * 14, e = (x % 8 === 0 || y % 8 === 0) ? -18 : 0; return (k ? [214, 200, 176] : [150, 92, 64]).map(v => Math.round(v + n + e)); }); return P.done(); }
function bricks() { const P = new PX(96, 72); P.fill((x, y) => { const row = Math.floor(y / 6), off = row % 2 ? 6 : 0, mortar = y % 6 === 5 || (x + off) % 12 === 11, b = h2(Math.floor((x + off) / 12), row, 3);
  return mortar ? [196, 184, 166] : [[176, 104, 74], [160, 92, 66], [188, 120, 86], [150, 86, 62]][Math.floor(b * 4)].map(v => Math.round(v + (h2(x, y, 9) - .5) * 10)); }); return P.done(); }
function plaster() { const P = new PX(96, 96), R = ramp(['#c8b89c', '#d8caae', '#e6dac2', '#efe6d4'], .45); P.fill((x, y) => R(.55 + (h2(x, y, 3) - .5) * .16, x, y)); return P.done(); }
function street() {   // the shop window: sky, the terraced houses across the street, a tree, the pavement
  const P = new PX(44, 30), sky = ramp(['#a4c6ea', '#bcd6f2', '#d2e4f6'], .45); P.fill((x, y) => sky(.9 - y / 30 * .6, x, y));
  const fac = [[0, 12, 7, [214, 196, 168]], [12, 22, 4, [196, 150, 120]], [22, 34, 8, [222, 210, 188]], [34, 44, 5, [176, 160, 140]]];
  for (const [x0, x1, top, c] of fac) { for (let y = top; y < 24; y++) for (let x = x0; x < x1; x++) P.set(x, y, c); for (let y = top + 2; y < 22; y += 5) for (let x = x0 + 2; x < x1 - 2; x += 4) P.rect(x, y, 2, 3, [110, 130, 160]); }
  P.ellipse(29, 14, 6, 6, (x, y, dx, dy) => [[66, 110, 58], [86, 132, 70], [108, 152, 82]][dy < -.3 ? 2 : dy < .3 ? 1 : 0]); P.rect(28, 19, 2, 5, [90, 64, 44]);
  for (let y = 24; y < 30; y++) for (let x = 0; x < 44; x++) P.set(x, y, y === 24 ? [150, 146, 140] : [186, 180, 170]);
  return P.done();
}
function menuBoard() { const P = new PX(20, 26); P.fill(() => [34, 38, 36]); for (let y = 3; y < 24; y += 3) { const w = 6 + Math.floor(h2(y, 1, 2) * 9); for (let x = 2; x < 2 + w; x++) if (h2(x, y, 5) > .15) P.set(x, y, [214, 214, 204]); P.set(17, y, [232, 220, 170]); } for (let x = 0; x < 20; x++) { P.set(x, 0, [120, 84, 52]); P.set(x, 25, [120, 84, 52]); } return P.done(); }

export function buildRoom() {
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2('#efe4d2', .012); scene.background = new THREE.Color('#efe4d2');
  scene.add(mesh(new THREE.BoxGeometry(10, .2, 8).translate(0, -.1, -.8), mat(tiles())));
  const back = box(10, 3.6, .3, mat(bricks()), { cast: false }); back.position.set(0, 0, -3.0); scene.add(back);
  const left = box(.3, 3.6, 8, mat(plaster()), { cast: false }); left.position.set(-3.0, 0, -.8); scene.add(left);
  // the shop window on the back wall (left half), its frame, the sun through it
  const win = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.8), new THREE.MeshBasicMaterial({ map: texOf(street()), fog: false })); win.position.set(-1.2, 1.75, -2.84); scene.add(win);
  const frameM = new THREE.MeshStandardMaterial({ color: '#2e3a34', roughness: .6 });
  for (const [w, h, x, y] of [[2.7, .08, -1.2, 2.68], [2.7, .08, -1.2, .82], [.08, 1.9, -2.53, 1.75], [.08, 1.9, .13, 1.75], [.05, 1.8, -1.2, 1.75]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, .08), frameM); f.position.set(x, y, -2.8); scene.add(f); }
  const winGl = glow('#fff6e0', 2.8, .2); winGl.position.set(-1.2, 1.75, -2.7); scene.add(winGl);
  const SUN = V3(.45, -.55, 1).normalize(), beams = [-1.85, -.55].map(x => { const b = beamCard(3.4, 1.0, 1.7, '#fff0cc', { k: .3, fall: 1.1 }); scene.add(b); return { b, o: V3(x, 1.95, -2.75) }; });
  // the counter (right, back): wooden front, espresso machine, cups, the chalk menu board on the wall; a barista
  const oak = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 14, nails: false, cols: ['#5a3e28', '#74502f', '#8e643c', '#a8784a'] }));
  const counter = box(2.2, 1.0, .6, oak); counter.position.set(1.9, 0, -2.35); scene.add(counter);
  const ctop = box(2.3, .05, .7, new THREE.MeshStandardMaterial({ color: '#d8d2c4', roughness: .5 })); ctop.position.set(1.9, 1.0, -2.35); scene.add(ctop);
  const machine = box(.5, .42, .35, new THREE.MeshStandardMaterial({ color: '#b8bcc4', metalness: .6, roughness: .3 })); machine.position.set(1.55, 1.05, -2.45); scene.add(machine);
  for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.04, .035, .08, 10), new THREE.MeshStandardMaterial({ color: '#f2ede2', roughness: .5 })); c.position.set(2.1 + i * .1, 1.09, -2.3); scene.add(c); }
  const menu = new THREE.Mesh(new THREE.PlaneGeometry(.8, 1.04), new THREE.MeshStandardMaterial({ map: texOf(menuBoard()), roughness: .9 })); menu.position.set(1.9, 2.05, -2.84); scene.add(menu);
  // pendant bulbs (warm accents, on in the day as in any café)
  const bulbs = [[-.1, -.7], [1.9, -2.3], [.9, -1.6]].map(([x, z]) => { const cord = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .9, 4), new THREE.MeshBasicMaterial({ color: '#202020' })); cord.position.set(x, 3.15, z); scene.add(cord);
    const g = glow('#ffc070', .28, 1.3); g.position.set(x, 2.68, z); scene.add(g); const b = new THREE.Mesh(new THREE.SphereGeometry(.04, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffe2a8' })); b.position.set(x, 2.68, z); scene.add(b); return g; });
  // plants
  const plantM = new THREE.MeshStandardMaterial({ color: '#3e6e3a', roughness: .9 }), potM = new THREE.MeshStandardMaterial({ color: '#b06a44', roughness: .8 });
  for (const [x, z, s] of [[-2.65, -2.4, 1], [.45, -2.55, .8], [-2.6, .4, .9]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.16 * s, .12 * s, .3 * s, 10), potM); p.position.set(x, .15 * s, z); scene.add(p);
    for (let k = 0; k < 5; k++) { const l = new THREE.Mesh(new THREE.SphereGeometry(.16 * s, 6, 5), plantM); l.position.set(x + (h2(k, 1, z * 10) - .5) * .25 * s, .45 * s + h2(k, 2, x * 10) * .4 * s, z + (h2(k, 3, 7) - .5) * .2); l.castShadow = true; scene.add(l); } }
  // tables and chairs
  const table = (x, z, w = 1.0, d = .8) => { const g = new THREE.Group(); const top = box(w, .05, d, oak); top.position.y = .72; g.add(top); const l = box(.08, .72, .08, oak); g.add(l); const f = box(.4, .03, .4, oak); g.add(f); g.position.set(x, 0, z); scene.add(g); };
  const chair = (x, z) => { const g = new THREE.Group(); const s = box(.42, .05, .42, oak); s.position.y = .46; g.add(s); const b = box(.05, .5, .42, oak); b.position.set(-.2, .5, 0); g.add(b); g.position.set(x, 0, z); scene.add(g); };
  table(-.1, -.65); chair(-.78, -.6); table(1.55, -1.75, .8, .7);
  // customers at the back table, the barista behind the counter
  const others = [[1.1, -1.75, 'teal', 'hairBrown', 'sittalk', 'long'], [2.05, -1.72, 'mustard', 'hairDark', 'sit', 'short'], [1.95, -2.75, 'white', 'hairBlond', 'stand', 'bun']].map(([x, z, top, hair, pose, hs], i) => {
    const p = makePerson({ top, bottom: i === 2 ? 'black' : 'navy', hair, hairStyle: hs, shoe: 'shoe' }, { a: { pose }, b: { pose, blink: 1 }, m: { pose, mouth: 1 } }); p.root.position.set(x, 0, z); scene.add(p.root);
    if (pose !== 'stand') chair(x - .02, z); return p; });
  // his table: MacBook, iPad on a stand, a cup, a notebook
  const laptop = makeLaptop(); laptop.group.position.set(-.08, .745, -.78); laptop.setOpen(1); scene.add(laptop.group);
  const ipad = makeSlab({ w: .24, h: .32, px: 24, py: 32, bez: .025, reach: 1.4 }); ipad.group.position.set(.3, .93, -.88); scene.add(ipad.group);
  const ipStand = box(.14, .1, .1, new THREE.MeshStandardMaterial({ color: '#3a3a42', roughness: .5 })); ipStand.position.set(.3, .745, -.92); scene.add(ipStand);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(.05, .042, .09, 12), new THREE.MeshStandardMaterial({ color: '#f2ede2', roughness: .5 })); cup.position.set(.28, .79, -.42); cup.castShadow = true; scene.add(cup);
  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .01, 14), cup.material); saucer.position.set(.28, .75, -.42); scene.add(saucer);
  const note = box(.24, .015, .32, new THREE.MeshStandardMaterial({ color: '#efe8d6', roughness: .9 })); note.position.set(-.35, .745, -.42); note.rotation.y = .3; scene.add(note);
  // lights: daylight from the shop window, warm fill
  const hemi = new THREE.HemisphereLight('#eaf0ff', '#a07a5a', 1.35); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff0d8', 2.2); sun.position.set(-3.2, 5.5, -6.5); sun.target.position.set(0, 0, -.5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: .5, far: 20 }); sun.shadow.bias = -.0015; scene.add(sun); scene.add(sun.target);
  const fill = new THREE.PointLight('#fff4e6', .9, 6, 1.6); scene.add(fill);
  const dust = particles(60, (i, t, o) => { const w = i % 2 ? -1.85 : -.55, u = h2(i, 1, 7), v = ((h2(i, 2, 7) + t * (.012 + h2(i, 3, 7) * .02)) % 1);
    o.x = w + (u - .5) * .9 + v * 1.4; o.y = 2.2 - v * 1.9 + Math.sin(t * .5 + i * 1.7) * .04; o.z = -2.6 + v * 2.4; o.s = .012 + h2(i, 4, 7) * .012; o.a = .5 * Math.sin(Math.PI * v); o.r = 1; o.g = .95; o.b = .82; }, { soft: 1 });
  scene.add(dust);
  // the hero
  const hero = makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark', hat: 'fez' }, {
    show: { pose: 'sitshow' }, showB: { pose: 'sitshow', blink: 1 }, showW: { pose: 'sitshow', brow: 1 }, showS: { pose: 'sitshow', smile: 1 },
    write: { pose: 'sitread' }, writeB: { pose: 'sitread', blink: 1 },
  });
  hero.root.position.set(-.78, 0, -.57); scene.add(hero.root);
  const phone = makePhone(); scene.add(phone.group);
  const devs = { phone, mac: laptop, ipad }, lockAt = { phone: T.tap, mac: T.mac, ipad: T.ipad };
  const glows = {}; for (const k of Object.keys(devs)) { glows[k] = glow('#9db8ff', .5, .6); scene.add(glows[k]); }

  const PH0 = V3(-.41, 1.233, -.55), DOWNP = V3(-.42, .76, -.34);
  const S1p = V3(.3, 2.4, 3.5), S1l = V3(-.3, 1.0, -.7);
  const INp = PH0.clone().add(V3(.1, .14, .95)), INl = PH0.clone().add(V3(0, .02, 0));
  const MEDp = V3(.3, 2.05, 2.5), MEDl = V3(-.2, .95, -.75), ENDp = V3(.75, 2.75, 3.9), ENDl = V3(-.05, 1.0, -1.1);
  laptop.group.lookAt(MEDp.x, .745, MEDp.z); ipad.group.lookAt(MEDp.x, 1.1, MEDp.z);
  const _q = new THREE.Quaternion(), _qf = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, -.3)), _v = new THREE.Vector3();
  const RED_L = new THREE.Color('#ff6a4a'), COLD_L = new THREE.Color('#9db8ff');

  function update(t, cam, post, renderer) {
    // —— camera: medium (the whole situation) → close on the phone for the tap → pull back while the screens lock → slow pull-out on the café ——
    let P, L, fov = 42, focus = V3(-.4, 1.0, -.6);
    if (t < T.push) { const u = seg(t, 0, T.push); P = lerpV(S1p, S1p.clone().add(V3(-.04, -.05, -.2)), u); L = S1l; }
    else if (t < T.pull) { const u = eio(seg(t, T.push, T.tap - .15)), S1e = S1p.clone().add(V3(-.04, -.05, -.2)); P = lerpV(S1e, INp, u); L = lerpV(S1l, INl, u); fov = lerp(42, 38, u); focus = PH0; }
    else if (t < T.down + .3) { const u = eo(seg(t, T.pull, T.ipad + .5)); P = lerpV(INp, MEDp, u); L = lerpV(INl, MEDl, u); fov = lerp(38, 42, u); focus = lerpV(PH0, V3(.0, .95, -.8), u); }
    else { const u = eio(seg(t, T.down + .3, T.card)); P = lerpV(MEDp, ENDp, u); L = lerpV(MEDl, ENDl, u); fov = 42; focus = V3(-.5, .95, -.6); }
    cam.position.copy(P); cam.lookAt(L); cam.fov = fov; cam.updateProjectionMatrix();
    // —— people ——
    hero.frame(t < T.down + .2 ? ((t + .9) % 2.9 < .1 ? 'showB' : t < T.tap ? 'showW' : t > T.ipad + .3 ? 'showS' : 'show') : (t % 3.1 < .1 ? 'writeB' : 'write'));
    hero.face(cam);
    others.forEach((p, i) => { p.frame((t + i * 1.1) % 3.2 < .1 ? 'b' : (i === 0 && Math.floor(t * 3) % 2) ? 'm' : 'a'); p.face(cam); });
    // —— the phone: held up beside his face; the tap; laid on the table ——
    const held = hero.local(28.5, 13).add(_v.copy(cam.position).sub(hero.root.position).setY(0).normalize().multiplyScalar(.1));
    if (t < T.down) { phone.group.position.copy(held); phone.group.quaternion.copy(cam.quaternion); if (t > T.tap - .08 && t < T.tap + .12) phone.group.rotateX(-.05); }
    else { const u = eio(seg(t, T.down, T.down + .45)), p = lerpV(held, DOWNP, u); p.y += Math.sin(u * Math.PI) * .1; phone.group.position.copy(p); _q.copy(cam.quaternion).slerp(_qf, u); phone.group.quaternion.copy(_q); }
    const rem = remainAt(t);
    phone.scr.paint(P2 => { if (t < T.start) feedScreen(P2, t, 0); else if (t < T.tap) startScreen(P2, SESSION.total, t < T.tap - .14 ? -(t - T.start) - .01 : t - (T.tap - .14)); else lockScreen(P2, rem, SESSION.total, t - T.tap); });
    laptop.scr.paint(P2 => (t < T.mac ? deskScreen(P2, t) : lockScreen(P2, rem, SESSION.total, t - T.mac)));
    ipad.scr.paint(P2 => (t < T.ipad ? feedScreen(P2, t, 2, { per: .95, notif: .7 }) : lockScreen(P2, rem, SESSION.total, t - T.ipad)));
    for (const [k, d] of Object.entries(devs)) {
      const locked = t >= lockAt[k], fl = locked ? Math.max(0, 1 - (t - lockAt[k]) / .5) : 0;
      d.light.color.copy(locked ? RED_L : COLD_L); d.light.intensity = locked ? .3 + fl * 1.0 : .45;
      d.group.updateMatrixWorld(); if (k === 'mac') { laptop.pivot.updateMatrixWorld(); glows[k].position.copy(laptop.pivot.localToWorld(_v.set(0, .15, .04))); } else glows[k].position.copy(d.group.localToWorld(_v.set(0, 0, .03)));
      glows[k].material.color.copy(locked ? RED_L : COLD_L).multiplyScalar(locked ? .15 + fl * .8 : .12); glows[k].scale.setScalar(.45 + fl * .4);
    }
    bulbs.forEach((g, i) => g.scale.setScalar(.28 * (1 + .03 * Math.sin(t * 2 + i))));
    for (const { b, o } of beams) { const k = b.userData.aim(o, SUN, cam); b.material.uniforms.k.value = .3 * k; b.material.uniforms.t.value = t; }
    dust.userData.update(t);
    fill.position.copy(hero.root.position).add(_v.set(.6, 1.4, 1.9));
    post.dof.focus = cam.position.distanceTo(focus); post.dof.aper = 60; post.dof.maxCoc = 10;
    renderer.toneMappingExposure = 1.0; post.bloom.strength = .28; post.bloom.threshold = .92;
    return { wide: t > T.down + 1.2 };
  }
  return { scene, update, hero };
}
