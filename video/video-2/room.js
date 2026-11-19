// The bedroom diorama: two cut-away walls, plank floor, bed against the left wall, window in the back wall.
// The window runs the time-lapse (sun/moon light sweeping the room, sky, seasons on the tree); the room fills with years.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard, woodPlanks, plaster } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makeSitter } from './sitter.js';
import { T, ageAt, stageAt, phaseAt, cyclesAt, sunElev } from './story.js';
import { track, seg, ss, eio, clamp, lerp, eo } from '/core/lib.js';

// 3x5 pixel digits for the wall calendar
const DIG = ['111101101101111', '010110010010111', '111001111100111', '111001111001111', '101101111001001', '111100111001111', '111100111101111', '111001001001001', '111101111101111', '111101111001111'];
function calendar(year) {
  const P = new PX(20, 26), paper = ramp(['#b9b2a2', '#d8d1bf', '#ece6d6'], .45), ink = hex('#2a2632'), band = hex('#2d3f66');
  P.fill((x, y) => (y < 7 ? band : paper(.6 + (h2(x, y, 3) - .5) * .3, x, y)));
  const s = String(year); s.split('').forEach((d, i) => { const g = DIG[+d]; for (let k = 0; k < 15; k++) if (g[k] === '1') P.set(2 + i * 4 + (k % 3), 1 + Math.floor(k / 3), [236, 230, 214]); });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) P.set(3 + c * 3, 10 + r * 4, ink);   // day grid
  return P.done();
}
function plantTex(state) {   // 0 green, 1 drooping brown, 2 dead
  const P = new PX(14, 20), pot = ramp(['#3a2418', '#6a4028', '#8e5a38'], .22);
  const leaf = [ramp(['#1d3a1c', '#2f5e2a', '#4f8a3a', '#7ab24e'], .22), ramp(['#3a2c14', '#6a5226', '#94783a', '#b09a52'], .22), ramp(['#2a2218', '#4a3c2a', '#6a5a44'], .22)][state];
  for (let y = 14; y < 20; y++) for (let x = 3; x < 11; x++) P.set(x, y, pot(x < 5 ? .3 : .7, x, y));
  const stems = state === 2 ? [[7, 13, 6, 9], [7, 13, 9, 10]] : state === 1 ? [[7, 13, 4, 7], [7, 13, 10, 6], [7, 13, 7, 4]] : [[7, 13, 3, 4], [7, 13, 11, 3], [7, 13, 7, 1], [7, 13, 5, 6], [7, 13, 10, 7]];
  for (const [x0, y0, x1, y1] of stems) { P.line(x0, y0, x1, y1, leaf(.4, 0, 0)); if (state < 2) { P.ellipse(x1, y1 + (state ? 1.5 : 0), 1.8, 1.2, (x, y) => leaf(.75 - (y - y1) * .1, x, y)); } }
  P.outline(.3); return texOf(P.done());
}
function treeTex(season) {   // 0 spring, 1 summer, 2 autumn, 3 winter
  const P = new PX(40, 56), bark = ramp(['#1e1510', '#3a2a1e', '#54402c'], .22);
  const crown = [ramp(['#2a4a24', '#4a7e36', '#8abf5e', '#e6c8d8'], .45), ramp(['#163018', '#24502a', '#3a7a36', '#5aa048'], .45), ramp(['#5a2410', '#9a4a16', '#d07a24', '#e8b040'], .45), null][season];
  for (let y = 30; y < 56; y++) for (let x = 18; x < 22; x++) P.set(x, y, bark(x === 18 ? .2 : .6, x, y));
  for (const [x1, y1] of [[10, 18], [30, 16], [20, 6], [14, 26], [27, 27]]) P.line(20, 34, x1, y1, bark(.5, 0, 0));
  if (crown) P.fill((x, y) => { const d = Math.hypot((x - 20) / 17, (y - 20) / 15) + (fbm(x * .2, y * .2, 5) - .5) * .5; return d < 1 ? crown(.8 - d * .55 + (h2(x, y, 2) - .5) * .3, x, y) : null; });
  else for (let k = 0; k < 40; k++) { const x = 6 + Math.floor(h2(k, 1, 9) * 28), y = 6 + Math.floor(h2(k, 2, 9) * 24); P.set(x, y, [226, 232, 240]); }   // snow on bare branches
  P.outline(.25); return texOf(P.done());
}
function cardboard(w, h, s) { const P = new PX(w, h), R = ramp(['#5a4028', '#7e5c3a', '#a07a4e', '#bc9666'], .45); P.fill((x, y) => R(.5 + (fbm(x * .3, y * .3, s) - .5) * .4 - (x === 0 || y === 0 ? .25 : 0), x, y)); return P.done(); }
function blanketTex() { const P = new PX(48, 30), R = ramp(['#1c2236', '#2a3350', '#3c4870', '#56658e'], .45); P.fill((x, y) => R(.5 + .2 * Math.sin(x * .5 + Math.sin(y * .3) * 2) + (h2(x, y, 4) - .5) * .2 + ((x + y) % 8 === 0 ? -.15 : 0), x, y)); return P.done(); }
function rugTex() { const P = new PX(48, 36), R = ramp(['#2a2028', '#40303a', '#5a4450', '#76606a'], .45); P.fill((x, y) => { const b = x < 3 || y < 3 || x > 44 || y > 32; return R(b ? .8 : .45 + ((x >> 2) + (y >> 2)) % 2 * .1 + (h2(x, y, 7) - .5) * .2, x, y); }); return P.done(); }
function posterTex() { const P = new PX(18, 26), R = ramp(['#141a2c', '#283a5e', '#4a6ea0', '#a0c0e0'], .45); P.fill((x, y) => R(.25 + (y / 26) * .3 + (Math.hypot(x - 9, y - 9) < 5 ? .5 : 0) + (y > 18 && x % 4 < 2 ? .2 : 0), x, y)); return P.done(); }
function webTex() { const P = new PX(16, 16), c = [200, 205, 215]; for (let i = 0; i < 16; i++) { P.set(i, 0, c); P.set(0, i, c); P.set(i, i, c); if (i < 12) P.set(i, Math.floor(i / 2), c); if (i < 12) P.set(Math.floor(i / 2), i, c); } for (let r = 4; r < 16; r += 5) for (let a = 0; a <= r; a++) P.set(a, r - a, c); return texOf(P.done()); }

export function buildRoom() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#10131c', .02);
  scene.background = new THREE.Color('#06070b');
  // —— shell ——
  const floor = mesh(new THREE.BoxGeometry(5, .2, 4).translate(0, -.1, -.2), mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 2 })));
  scene.add(floor);
  const wallM = mat(plaster(96, 96, { seed: 8, wall: ['#4a4e5c', '#5e6372', '#727888', '#878d9c'], beams: [] }));
  const BW = { z: -2.3, h: 2.8, x0: -2.5, x1: 2.5, wx0: .25, wx1: 1.45, wy0: 1.0, wy1: 2.2 };
  const wb = (x0, x1, y0, y1) => { const b = box(x1 - x0, y1 - y0, .2, wallM); b.position.set((x0 + x1) / 2, y0, BW.z); scene.add(b); };
  wb(BW.x0, BW.wx0, 0, BW.h); wb(BW.wx1, BW.x1, 0, BW.h); wb(BW.wx0, BW.wx1, 0, BW.wy0); wb(BW.wx0, BW.wx1, BW.wy1, BW.h);
  const lw = box(.2, 2.8, 4, wallM); lw.position.set(-2.6, 0, -.2); scene.add(lw);
  const frameM = new THREE.MeshStandardMaterial({ color: '#2a2226', roughness: .7 });
  for (const [w, h, x, y] of [[1.3, .08, .85, 1.0], [1.3, .08, .85, 2.16], [.08, 1.2, .25, 1.0], [.08, 1.2, 1.45, 1.0], [.05, 1.2, .85, 1.0], [1.2, .05, .85, 1.58]]) {
    const f = box(w, h, .12, frameM, { cast: false }); f.position.set(x, y, BW.z + .02); scene.add(f);
  }
  // outside: sky plane, tree, far rooftops
  const skyM = new THREE.MeshBasicMaterial({ color: '#000', fog: false });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(14, 9), skyM); sky.position.set(.85, 2.5, -7); scene.add(sky);
  const trees = [0, 1, 2, 3].map(s => { const b = billboard(treeTex(s), 2.6, 3.6, { shadow: false }); b.position.set(1.0, -.4, -4.6); b.visible = false; scene.add(b); return b; });
  const roofs = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.6), new THREE.MeshBasicMaterial({ color: '#0c0e16', fog: false })); roofs.position.set(.85, .5, -6.8); scene.add(roofs);

  // —— furniture ——
  const woodM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 6, nails: false, cols: ['#1e140e', '#33231a', '#4a3424', '#5e4430'] }));
  const bedF = box(2.1, .35, 1.15, woodM); bedF.position.set(-1.4, 0, -1.6); scene.add(bedF);
  const matt = box(2.0, .2, 1.05, new THREE.MeshStandardMaterial({ color: '#c9c4bc', roughness: .95 })); matt.position.set(-1.4, .35, -1.6); scene.add(matt);
  const head = box(.12, 1.05, 1.15, woodM); head.position.set(-2.44, 0, -1.6); scene.add(head);
  const blanket = box(1.25, .1, 1.08, mat(blanketTex())); blanket.position.set(-.95, .55, -1.6); scene.add(blanket);
  const pillow = box(.4, .14, .7, new THREE.MeshStandardMaterial({ color: '#d8d4ce', roughness: 1 })); pillow.position.set(-2.18, .55, -1.6); scene.add(pillow);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.6), new THREE.MeshStandardMaterial({ map: texOf(rugTex()), roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(.3, .006, -.2); rug.receiveShadow = true; scene.add(rug);
  const desk = box(1.0, .06, .6, woodM); desk.position.set(1.95, .74, -1.95); scene.add(desk);
  for (const [x, z] of [[1.5, -2.2], [2.4, -2.2], [1.5, -1.7], [2.4, -1.7]]) { const l = box(.05, .74, .05, woodM); l.position.set(x, 0, z); scene.add(l); }
  const mon = box(.5, .32, .04, new THREE.MeshStandardMaterial({ color: '#0e0f14', roughness: .3 })); mon.position.set(2.0, .86, -2.15); scene.add(mon);
  const books = new THREE.Group(); ['#4a3a5a', '#2e4a5a', '#5a4a2e', '#3a5a3e'].forEach((c, i) => { const b = box(.05, .26 - i * .02, .2, new THREE.MeshStandardMaterial({ color: c })); b.position.set(1.55 + i * .06, .77, -1.85); books.add(b); }); scene.add(books);
  const plants = [0, 1, 2].map(s => { const b = billboard(plantTex(s), .32, .45, { shadow: false }); b.position.set(2.32, .77, -1.85); b.visible = false; scene.add(b); return b; });
  const cal = texOf(calendar(2026)); const calM = new THREE.MeshStandardMaterial({ map: cal, roughness: .9 });
  const calQ = new THREE.Mesh(new THREE.PlaneGeometry(.42, .55), calM); calQ.position.set(-1.0, 1.75, BW.z + .11); scene.add(calQ);
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(.6, .86), new THREE.MeshStandardMaterial({ map: texOf(posterTex()), roughness: .9 })); poster.rotation.y = Math.PI / 2; poster.position.set(-2.49, 1.55, -.3); scene.add(poster);
  const webs = [[-2.48, 2.55, -2.18, Math.PI / 4], [2.3, 2.55, -2.18, -Math.PI / 4]].map(([x, y, z, r]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(.5, .5), new THREE.MeshBasicMaterial({ map: webTex(), transparent: true, opacity: 0, alphaTest: .05, depthWrite: false })); m.position.set(x, y, z); m.rotation.y = r; scene.add(m); return m; });
  // —— clutter that piles up with the years ——
  const boxM = mat(cardboard(24, 24, 3)), canM = new THREE.MeshStandardMaterial({ color: '#7c8aa0', roughness: .35, metalness: .6 });
  const clutter = [];
  for (let i = 0; i < 16; i++) {
    const stack = i % 4, col = Math.floor(i / 4), x = -.1 + col * .55 + (h2(i, 1, 4) - .5) * .2, z = -.95 + (h2(i, 2, 4) - .5) * .5;
    const b = box(.42, .05, .42, boxM); b.position.set(x, stack * .052, z); b.rotation.y = (h2(i, 3, 4) - .5) * .5; b.visible = false; scene.add(b);
    clutter.push({ o: b, age: 22 + i * 3.6 });
  }
  for (let i = 0; i < 20; i++) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, .12, 8), canM); const lying = h2(i, 5, 6) > .5;
    c.position.set(-.25 + h2(i, 1, 6) * 2.2, lying ? .035 : .06, -1.0 + h2(i, 2, 6) * 1.7); if (lying) c.rotation.z = Math.PI / 2; c.rotation.y = h2(i, 3, 6) * 3; c.castShadow = true; c.visible = false; scene.add(c);
    clutter.push({ o: c, age: 21 + i * 3.1 });
  }

  // —— lights ——
  const sun = new THREE.DirectionalLight('#ffe2b0', 0); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: .5, far: 30 }); sun.shadow.bias = -.0008; sun.target.position.set(-.6, 0, -.8);
  scene.add(sun, sun.target);
  const moon = new THREE.DirectionalLight('#7f98d8', 0); moon.position.set(-1, 6, -9); moon.target.position.set(-.6, 0, -.8); scene.add(moon, moon.target);
  const hemi = new THREE.HemisphereLight('#7a8cb8', '#1a1418', .5); scene.add(hemi);
  const winGlow = new THREE.PointLight('#ffe0b0', 0, 6, 1.4); winGlow.position.set(.5, 1.7, -1.5); scene.add(winGlow);
  const hero = makeSitter(); hero.root.position.set(-1.92, .55 - 3 * (1 / 30), -1.5); scene.add(hero.root);
  const phoneL = new THREE.PointLight('#8fc0ff', 1.4, 2.0, 2); scene.add(phoneL);
  const phoneG = glow('#9cc8ff', .3, .8); scene.add(phoneG);
  const fill = new THREE.PointLight('#9fb2e8', .9, 6, 2); fill.position.set(-.6, 1.6, .3); scene.add(fill);
  // the falling phone (a small box with a glowing screen)
  const fp = new THREE.Group();
  const fpb = new THREE.Mesh(new THREE.BoxGeometry(.075, .009, .15), new THREE.MeshStandardMaterial({ color: '#0c0d12', roughness: .4 })); fpb.castShadow = true; fp.add(fpb);
  const fpsM = new THREE.MeshStandardMaterial({ color: '#000', emissive: '#9cc8ff', emissiveIntensity: 1.6 });
  const fps = new THREE.Mesh(new THREE.PlaneGeometry(.068, .14), fpsM); fps.rotation.x = -Math.PI / 2; fps.position.y = .0052; fp.add(fps);
  fp.visible = false; scene.add(fp);
  const fpL = new THREE.PointLight('#8fc0ff', 0, 1.6, 2); scene.add(fpL);
  const fpG = glow('#9cc8ff', .25, .8); fpG.visible = false; scene.add(fpG);

  // —— camera ——
  const CP = track([[0, [-.8, 1.8, .95]], [2.8, [-.85, 1.9, 1.1]], [9.0, [2.4, 4.5, 5.4]], [15.0, [-.75, 2.0, 1.2]], [16.4, [-.05, 1.85, 1.45]]]);
  const CL = track([[0, [-2.05, .98, -1.5]], [2.8, [-2.02, .95, -1.48]], [9.0, [-.45, .55, -.95]], [15.0, [-2.0, .95, -1.48]], [16.4, [-1.55, .58, -1.15]]]);
  const FOV = track([[0, [38]], [9.0, [44]], [15.0, [39]], [16.4, [42]]]);
  let calYear = 2026;
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    cam.position.set(...CP(t)); cam.fov = FOV(t)[0]; cam.updateProjectionMatrix(); cam.lookAt(...CL(t));
    const age = ageAt(t), st = stageAt(t), ph = phaseAt(t), el = sunElev(t), cyc = cyclesAt(t);
    const day = clamp(el * 1.6 + .15), dusk = clamp(1 - Math.abs(el) * 3.2) * (el > -.2 ? 1 : 0);
    // sky + window light
    const night = new THREE.Color('#070a18'), noon = new THREE.Color('#8fb4e0'), duskC = new THREE.Color('#e08a5a');
    skyM.color.copy(night).lerp(noon, day).lerp(duskC, dusk * .55);
    const ang = 2 * Math.PI * (ph - .5);
    sun.position.set(.85 + Math.sin(ang) * 6, 1.6 + Math.max(.15, el) * 7, -8); sun.intensity = 4.2 * day; sun.color.set('#fff0d0').lerp(new THREE.Color('#ff9a5a'), dusk);
    winGlow.intensity = 3.2 * day + .8 * dusk;
    // after death the moon stays, everything else goes quiet
    const end = seg(t, T.dark, T.dark + .8);
    moon.intensity = .55 * (1 - day) * (1 - .5 * end);
    hemi.intensity = (.3 + .95 * day) * (1 - .6 * end); hemi.color.set('#3a4878').lerp(new THREE.Color('#d8c6a4'), day); hemi.groundColor.set('#120e14').lerp(new THREE.Color('#4a3a2c'), day);
    // seasons: one per 1.6 day-cycles once time races
    const season = Math.floor(cyc / 1.6) % 4; trees.forEach((tr, i) => { tr.visible = i === season; });
    // calendar
    const year = Math.round(2026 + (age - 19)); if (year !== calYear) { calYear = year; calM.map.image = calendar(year); calM.map.needsUpdate = true; }
    // the room fills with years
    clutter.forEach(c => { c.o.visible = age >= c.age; });
    plants.forEach((p, i) => { p.visible = i === (age < 34 ? 0 : age < 50 ? 1 : 2); });
    webs.forEach(w => { w.material.opacity = .55 * clamp((age - 50) / 15); });
    // hero
    let fr;
    if (t >= T.die) fr = 'dead'; else if (t >= T.nod) fr = 'nod';
    else fr = `a${st}t${Math.floor(t * (st > 3 ? 2.2 : 3.2)) % 2}`;
    hero.frame(fr); hero.face(cam);
    // phone in hand → falling → on the floor
    const hand = hero.local(21 + (st >= 3 ? 1 : 0), 14), alive = t < T.die;
    const phoneOn = t < T.dark ? 1 : 0;
    if (alive) { phoneL.position.copy(hand).add(_v.set(.25, .05, .25)); phoneL.intensity = 1.4 * (t >= T.nod ? .8 : 1); phoneG.position.copy(hand); phoneG.visible = true; fp.visible = false; fpL.intensity = 0; fpG.visible = false; }
    else {
      phoneL.intensity = 0; phoneG.visible = false; fp.visible = true;
      const u = clamp((t - T.die) / (T.land - T.die)), land = new THREE.Vector3(-1.3, .006, -.8);
      const p = hand.clone().lerp(land, u); p.y = lerp(hand.y, land.y, u * u) + Math.sin(u * Math.PI) * .12;
      const bounce = t > T.land ? Math.max(0, Math.sin((t - T.land) * 14) * Math.exp(-(t - T.land) * 9)) * .03 : 0;
      fp.position.copy(p); fp.position.y += bounce; fp.rotation.set(u < 1 ? u * 4.2 : 0, .6, u < 1 ? u * 2.1 : 0);
      const notif = t >= T.ping && t < T.ping + 1.0 ? 1.6 : 1;
      fpsM.emissiveIntensity = 1.6 * phoneOn * notif; fpL.position.copy(fp.position).setY(fp.position.y + .25); fpL.intensity = .9 * phoneOn * notif; fpG.position.copy(fp.position); fpG.visible = phoneOn > 0;
    }
    fill.intensity = .9 * (1 - end * .85);
    // post
    post.dof.focus = cam.position.distanceTo(_v.set(-1.7, .9, -1.5)); post.dof.aper = 120; post.dof.maxCoc = 16;
    renderer.toneMappingExposure = 1.15;
    post.bloom.strength = .55; post.bloom.threshold = .85;
  }
  return { scene, update, hero };
}
