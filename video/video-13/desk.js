// How it works EP. 1: a student's desk at night, rain on the window, four screens all pinging (iPhone, Mac, iPad, Windows PC).
// One tap on the phone and every screen locks, one after the other, from cold blue to the warm lock; then the desk lamp takes over.
import * as THREE from 'three';
import { PX, ramp, h2, texOf, glow, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson } from './people.js';
import { makePhone, makeLaptop, makeSlab, lockScreen, deskScreen, feedScreen, pcScreen, startScreen } from './screens.js';
import { T, remainAt, SESSION } from './story.js';
import { seg, clamp, lerp, eio, eo } from '/core/lib.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerpV = (a, b, u) => a.clone().lerp(b, u);
function wallp() { const P = new PX(96, 72), R = ramp(['#1a2030', '#242c42', '#303a54', '#3c4866'], .45); P.fill((x, y) => R(.42 + ((y % 18) === 0 ? .12 : 0) + (h2(x, y, 5) - .5) * .1 + (y / 72) * .08, x, y)); return P.done(); }
function plainTex(cols, w = 24, h = 24, seed = 1) { const P = new PX(w, h), R = ramp(cols, .45); P.fill((x, y) => R(.5 + (h2(x, y, seed) - .5) * .25, x, y)); return P.done(); }
// the rainy window: deep sky, the block opposite, drops running down the glass (redrawn every frame from t)
function makeWindow() {
  const W = 42, H = 22, base = new PX(W, H), sky = ramp(['#070b1c', '#0c1430', '#142048', '#1d2c5e'], .45);
  base.fill((x, y) => sky(.12 + y / H * .6, x, y));
  for (const [x0, x1, top] of [[0, 11, 9], [12, 22, 6], [24, 33, 11], [34, 42, 8]]) for (let y = top; y < H; y++) for (let x = x0; x < x1; x++) base.set(x, y, [15, 17, 30]);
  for (let i = 0; i < 40; i++) { const x = Math.floor(h2(i, 5, 7) * W), y = 6 + Math.floor(h2(i, 6, 7) * (H - 6)), c = base.get(x, y); if (c && c[0] === 15) base.set(x, y, h2(i, 7, 7) > .45 ? [255, 196, 110] : [150, 186, 255]); }
  base.done(); const B = new Uint8ClampedArray(base.d.data);
  const P = new PX(W, H), tex = texOf(P.c);
  return { tex, paint(t) {
    P.d.data.set(B);
    for (let i = 0; i < 26; i++) { const x = Math.floor(h2(i, 1, 3) * W), sp = 6 + h2(i, 2, 3) * 8, y0 = ((h2(i, 3, 3) * H + t * sp) % (H + 4)) - 2;
      for (let k = 0; k < 3; k++) { const y = Math.floor(y0) - k; if (y >= 0 && y < H) { const c = P.get(x, y) || [20, 24, 40]; P.set(x, y, c.slice(0, 3).map((v, j) => Math.min(255, v + [70, 80, 110][j] * (1 - k / 3)))); } } }
    P.done(); tex.needsUpdate = true; } };
}

export function buildRoom() {
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2('#0c1020', .03); scene.background = new THREE.Color('#05060c');
  scene.add(mesh(new THREE.BoxGeometry(7, .2, 6).translate(0, -.1, -.4), mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 21, cols: ['#140e0c', '#22180f', '#33241a', '#453222', '#58402a'] }))));
  const wm = mat(wallp());
  const back = box(7, 3.2, .2, wm, { cast: false }); back.position.set(0, 0, -2.05); scene.add(back);
  const right = box(.2, 3.2, 5, wm, { cast: false }); right.position.set(1.75, 0, -.6); scene.add(right);
  const win = makeWindow(); const winM = new THREE.Mesh(new THREE.PlaneGeometry(1.75, .92), new THREE.MeshBasicMaterial({ map: win.tex, fog: false })); winM.position.set(.35, 1.92, -1.94); scene.add(winM);
  const frameM = new THREE.MeshStandardMaterial({ color: '#c8c0b0', roughness: .8 });
  for (const [w, h, x, y] of [[1.83, .05, .35, 2.4], [1.83, .05, .35, 1.44], [.05, .98, -.54, 1.92], [.05, .98, 1.24, 1.92], [.035, .92, .35, 1.92]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, .05), frameM); f.position.set(x, y, -1.92); scene.add(f); }
  const winGl = glow('#7a90d0', 1.8, .25); winGl.position.set(.35, 1.92, -1.85); scene.add(winGl);
  const woodM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 8, nails: false, cols: ['#1e140e', '#33231a', '#4a3424', '#5e4430'] }));
  // desk, chair, shelf, lamp, notebook, mug
  const desk = box(1.9, .04, .95, woodM); desk.position.set(.3, .72, -1.25); scene.add(desk);
  for (const [x, z] of [[-.62, -1.68], [1.22, -1.68], [-.62, -.82], [1.22, -.82]]) { const l = box(.05, .72, .05, woodM); l.position.set(x, 0, z); scene.add(l); }
  const chair = new THREE.Group(); const cs = box(.42, .05, .42, woodM); cs.position.y = .46; chair.add(cs); const cb = box(.05, .5, .42, woodM); cb.position.set(-.2, .5, 0); chair.add(cb);
  for (const [x, z] of [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]]) { const l = box(.04, .46, .04, woodM); l.position.set(x, 0, z); chair.add(l); }
  chair.position.set(-.52, 0, -.5); scene.add(chair);
  const shelf = box(.7, .04, .22, woodM); shelf.position.set(-1.2, 1.55, -1.88); scene.add(shelf);
  const bookCols = ['#3a4a6a', '#5a4a3a', '#3e5a4a', '#6a5a30', '#4a3a5a', '#2e3e5e'];
  for (let i = 0; i < 8; i++) { const h = .17 + h2(i, 1, 4) * .08, b = box(.05, h, .17, new THREE.MeshStandardMaterial({ color: bookCols[i % 6], roughness: .9 })); b.position.set(-1.5 + i * .065, 1.59, -1.88); scene.add(b); }
  const lampG = new THREE.Group(); const lb = new THREE.Mesh(new THREE.CylinderGeometry(.08, .09, .03, 12), new THREE.MeshStandardMaterial({ color: '#2a2a30', roughness: .5 })); lb.position.y = .015; lampG.add(lb);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .4, 6), lb.material); stem.position.y = .22; lampG.add(stem);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(.12, .14, 12, 1, true), new THREE.MeshStandardMaterial({ color: '#d8c8a0', roughness: .7, side: THREE.DoubleSide, emissive: '#ffb860', emissiveIntensity: 0 })); shade.position.y = .44; lampG.add(shade);
  lampG.position.set(-.42, .74, -1.5); scene.add(lampG);
  const lampL = new THREE.PointLight('#ffc27a', 0, 5.5, 1.5); lampL.position.set(-.36, 1.12, -1.3); lampL.castShadow = true; lampL.shadow.mapSize.set(1024, 1024); lampL.shadow.bias = -.004; scene.add(lampL);
  const lampGl = glow('#ffc070', .5, 1.2); lampGl.position.set(-.42, 1.12, -1.48); scene.add(lampGl);
  const note = box(.24, .015, .32, new THREE.MeshStandardMaterial({ color: '#e8e0cc', roughness: .9 })); note.position.set(-.08, .74, -.98); note.rotation.y = .25; scene.add(note);
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(.045, .04, .1, 10), new THREE.MeshStandardMaterial({ color: '#c8c0b0', roughness: .6 })); mug.position.set(.72, .79, -.86); mug.castShadow = true; scene.add(mug);
  // lights
  const hemi = new THREE.HemisphereLight('#5a6a9a', '#20161a', 1.4); scene.add(hemi);
  const moon = new THREE.DirectionalLight('#7f95d6', .55); moon.position.set(.4, 3.0, -3.6); moon.target.position.set(0, 0, 0); scene.add(moon); scene.add(moon.target);
  const fill = new THREE.PointLight('#c8c8e0', 1.4, 6, 1.6); scene.add(fill);
  // the devices, all facing the wide camera
  const WIDE = V3(.38, 2.75, 3.3);
  const laptop = makeLaptop(); laptop.group.position.set(.32, .74, -1.0); laptop.group.lookAt(WIDE.x, .74, WIDE.z); laptop.setOpen(1); scene.add(laptop.group);
  const mon = makeSlab({ w: .62, h: .36, px: 40, py: 24, bez: .035, d: .03, reach: 2.6 }); mon.group.position.set(.62, 1.22, -1.55); mon.group.lookAt(WIDE.x, 1.22, WIDE.z); scene.add(mon.group);
  const monStand = box(.06, .3, .06, new THREE.MeshStandardMaterial({ color: '#202026', roughness: .5 })); monStand.position.set(.62, .74, -1.58); scene.add(monStand);
  const monFoot = box(.24, .015, .16, monStand.material); monFoot.position.set(.62, .74, -1.58); scene.add(monFoot);
  const tower = box(.2, .46, .44, new THREE.MeshStandardMaterial({ color: '#1c1c22', roughness: .5 })); tower.position.set(1.02, 0, -1.3); scene.add(tower);
  const led = glow('#d8e4ff', .06, 1.4); led.position.set(1.02, .4, -1.07); scene.add(led);
  const ipad = makeSlab({ w: .24, h: .32, px: 24, py: 32, bez: .025, reach: 1.6 }); ipad.group.position.set(1.0, .94, -1.02); ipad.group.lookAt(WIDE.x, 1.1, WIDE.z); scene.add(ipad.group);
  const ipStand = box(.14, .1, .1, new THREE.MeshStandardMaterial({ color: '#3a3a42', roughness: .5 })); ipStand.position.set(1.0, .74, -1.06); scene.add(ipStand);
  const phone = makePhone(); scene.add(phone.group);
  const devs = { phone, mac: laptop, ipad, pc: mon };
  const glows = {}; for (const k of Object.keys(devs)) { glows[k] = glow('#9db8ff', .6, .8); scene.add(glows[k]); }
  // the hero
  const hero = makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark', hat: 'fez' }, {
    show: { pose: 'sitshow' }, showB: { pose: 'sitshow', blink: 1 }, showW: { pose: 'sitshow', brow: 1 }, showS: { pose: 'sitshow', smile: 1 },
    write: { pose: 'sitread' }, writeB: { pose: 'sitread', blink: 1 },
  });
  scene.add(hero.root);

  const SEAT = V3(-.5, 0, -.42), PH0 = V3(-.105, 1.233, -.452), DESKPH = V3(-.3, .745, -.86);
  const _q = new THREE.Quaternion(), _qf = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, -.3)), _v = new THREE.Vector3();
  const RED_L = new THREE.Color('#ff6a4a'), COLD_L = new THREE.Color('#9db8ff');
  const DOWN = T.lamp - 1.0;   // he puts the phone down, then writes
  const ANCH = { phone: () => phone.group.position.clone().add(V3(0, .25, 0)), mac: () => V3(.32, .7, -.78), ipad: () => V3(1.0, .72, -.82), pc: () => V3(.62, 1.5, -1.55) };

  function update(t, cam, post, renderer) {
    // —— camera: wide (all four screens) → push to the phone for the tap → rising pull-back while the screens lock → settle ——
    const W0p = V3(.3, 2.3, 3.0), W0l = V3(.12, 1.0, -.95), Pp = PH0.clone().add(V3(.22, .2, 1.3)), Pl = PH0.clone().add(V3(.04, -.04, 0));
    const W1p = WIDE, W1l = V3(.2, .98, -1.0), W2p = V3(.05, 2.4, 2.75), W2l = V3(-.12, .95, -1.05);
    let P, L, fov = 46, focus = PH0;
    if (t < T.push) { const u = seg(t, 0, T.push); P = lerpV(W0p, W0p.clone().add(V3(-.04, -.05, -.18)), u); L = W0l; focus = V3(.2, 1.0, -.9); }
    else if (t < T.pull) { const u = eio(seg(t, T.push, T.tap - .15)); const W0e = W0p.clone().add(V3(-.04, -.05, -.18)); P = lerpV(W0e, Pp, u); L = lerpV(W0l, Pl, u); fov = lerp(46, 40, u); }
    else if (t < DOWN + .6) { const u = eo(seg(t, T.pull, T.pc + .7)); P = lerpV(Pp, W1p, u); L = lerpV(Pl, W1l, u); fov = lerp(40, 46, u); focus = lerpV(PH0, V3(.4, 1.0, -1.1), u); }
    else { const u = eio(seg(t, DOWN + .6, T.card)); P = lerpV(W1p, W2p, u); L = lerpV(W1l, W2l, u); fov = 46; focus = V3(-.3, .95, -.8); }
    cam.position.copy(P); cam.lookAt(L); cam.fov = fov; cam.updateProjectionMatrix();
    // —— hero ——
    let fr;
    if (t < DOWN + .25) fr = (t + .9) % 2.9 < .1 ? 'showB' : t < T.tap ? 'showW' : t > T.pc + .3 ? 'showS' : 'show';
    else fr = t % 3.1 < .1 ? 'writeB' : 'write';
    hero.root.position.copy(SEAT); hero.frame(fr); hero.face(cam);
    // —— phone: held up beside his face; the tap; put down on the desk ——
    const held = hero.local(28.5, 13).add(_v.copy(cam.position).sub(hero.root.position).setY(0).normalize().multiplyScalar(.1));
    if (t < DOWN) { phone.group.position.copy(held); phone.group.quaternion.copy(cam.quaternion); if (t > T.tap - .08 && t < T.tap + .12) phone.group.rotateX(-.05); }
    else { const u = eio(seg(t, DOWN, DOWN + .45)), p = lerpV(held, DESKPH, u); p.y += Math.sin(u * Math.PI) * .12; phone.group.position.copy(p); _q.copy(cam.quaternion).slerp(_qf, u); phone.group.quaternion.copy(_q); }
    const rem = remainAt(t);
    phone.scr.paint(P => { if (t < T.start) feedScreen(P, t, 0); else if (t < T.tap) startScreen(P, SESSION.total, t < T.tap - .14 ? -(t - T.start) - .01 : t - (T.tap - .14)); else lockScreen(P, rem, SESSION.total, t - T.tap); });
    laptop.scr.paint(P => (t < T.mac ? deskScreen(P, t) : lockScreen(P, rem, SESSION.total, t - T.mac)));
    ipad.scr.paint(P => (t < T.ipad ? feedScreen(P, t, 2, { per: .95, notif: .7 }) : lockScreen(P, rem, SESSION.total, t - T.ipad)));
    mon.scr.paint(P => (t < T.pc ? pcScreen(P, t) : lockScreen(P, rem, SESSION.total, t - T.pc)));
    // —— each screen's light: cold until it locks, then the warm lock (a flash as it slams in) ——
    const lockAt = { phone: T.tap, mac: T.mac, ipad: T.ipad, pc: T.pc }, base = { phone: .7, mac: 1.1, ipad: .8, pc: 1.4 };
    let cold = 0;
    for (const [k, d] of Object.entries(devs)) {
      const locked = t >= lockAt[k], fl = locked ? Math.max(0, 1 - (t - lockAt[k]) / .5) : 0; if (!locked) cold++;
      d.light.color.copy(locked ? RED_L : COLD_L); d.light.intensity = locked ? .45 + fl * 1.4 : base[k] * (.85 + .15 * Math.sin(t * 7 + base[k] * 9));
      d.mat.color.setScalar(locked ? 1 : .95);
      d.group.updateMatrixWorld(); glows[k].position.copy(d.group.localToWorld(_v.set(0, k === 'mac' ? .17 : 0, .03)));
      if (k === 'mac') { laptop.pivot.updateMatrixWorld(); glows[k].position.copy(laptop.pivot.localToWorld(_v.set(0, .15, .04))); }
      glows[k].material.color.copy(locked ? RED_L : COLD_L).multiplyScalar(locked ? .3 + fl * .9 : .35); glows[k].scale.setScalar((k === 'pc' ? .9 : .55) + fl * .4);
    }
    const lamp = t < T.lamp ? 0 : 1; lampL.intensity = 7 * lamp; shade.material.emissiveIntensity = 1.4 * lamp; lampGl.material.color.set('#ffc070').multiplyScalar(lamp * 1.1);
    hemi.intensity = 1.2 + .5 * cold / 4 + .35 * lamp; hemi.color.set(cold ? '#5a6a9a' : '#6a6070');
    fill.position.copy(hero.root.position).add(_v.set(.6, 1.4, 1.9)); fill.intensity = 1.3 + .9 * lamp; fill.color.set(lamp ? '#f0d8c0' : '#c8c8e0');
    win.paint(t);
    // labels: each device's anchor projected to the 1080 x 1920 frame
    cam.updateMatrixWorld();
    const labels = Object.keys(ANCH).map(id => { const v = ANCH[id]().project(cam); return { id, x: (v.x * .5 + .5) * 1080, y: (-v.y * .5 + .5) * 1920, below: id === 'mac' || id === 'ipad' }; });
    post.dof.focus = cam.position.distanceTo(focus); post.dof.aper = 60; post.dof.maxCoc = 10;
    renderer.toneMappingExposure = 1.8; scene.fog.density = .025; post.bloom.strength = .45; post.bloom.threshold = .82;
    return { wide: t > DOWN + .6, labels };
  }
  return { scene, update, hero };
}
