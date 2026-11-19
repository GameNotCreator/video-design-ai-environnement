// The Christmas table: one dining room, four Christmases. Grandma ages at his side; the last year her chair is empty.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard, woodPlanks, plaster } from './px.js';
import { mat, mesh, box } from './kit.js';
import { particles, flick } from './fx.js';
import { makePerson } from './people.js';
import { T, YEARS, yearAt, LINES } from './story.js';
import { track, seg, ss, clamp, lerp } from '/core/lib.js';

function wallpaper() { const P = new PX(96, 96), R = ramp(['#2a1e1c', '#3e2c26', '#523a30', '#664a3c'], .45); P.fill((x, y) => R(.45 + ((x % 12 < 2) ? .25 : 0) + (Math.hypot((x % 12) - 6, (y % 16) - 8) < 2 ? .2 : 0) + (h2(x, y, 2) - .5) * .15, x, y)); return P.done(); }
function cloth() { const P = new PX(48, 24), R = ramp(['#5a5448', '#7a7262', '#9a927e', '#b4ac96'], .45); P.fill((x, y) => R(.6 + ((x + y) % 6 === 0 ? -.12 : 0) + (h2(x, y, 5) - .5) * .12, x, y)); return P.done(); }
function treeTex() { const P = new PX(30, 44), G = ramp(['#0c2016', '#163a24', '#245a34', '#3a7a44'], .45);
  P.fill((x, y) => { const w = (y - 2) * .32; if (y < 2 || y > 38 || Math.abs(x - 15) > w) return null; return G(.4 + (h2(x, y, 3) - .5) * .4 + ((y % 8) < 2 ? -.15 : 0), x, y); });
  for (let y = 38; y < 44; y++) for (let x = 13; x < 17; x++) P.set(x, y, [58, 40, 28]); P.set(15, 0, [244, 220, 138]); P.set(15, 1, [244, 220, 138]); P.set(14, 1, [216, 176, 74]); P.set(16, 1, [216, 176, 74]);
  P.outline(.3); return texOf(P.done()); }
function photoTex() { const P = new PX(10, 12), fr = [120, 96, 60]; P.fill((x, y) => (x === 0 || y === 0 || x === 9 || y === 11) ? fr : (Math.hypot(x - 5, y - 5) < 2.6 ? [200, 196, 206] : (y > 7 ? [124, 88, 140] : [70, 64, 80]))); return texOf(P.done()); }

export function buildDining() {
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2('#120e10', .03); scene.background = new THREE.Color('#06050a');
  // room: floor, back + left walls, window with snow
  scene.add(mesh(new THREE.BoxGeometry(7, .2, 6).translate(0, -.1, -.5), mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 9, cols: ['#1a100c', '#2e1d14', '#452a1b', '#5c3a24', '#74492b'] }))));
  const wp = mat(wallpaper());
  const bw = (x0, x1, y0, y1) => { const b = box(x1 - x0, y1 - y0, .2, wp); b.position.set((x0 + x1) / 2, y0, -2.6); scene.add(b); };
  bw(-3.5, .4, 0, 3); bw(1.8, 3.5, 0, 3); bw(.4, 1.8, 0, .9); bw(.4, 1.8, 2.2, 3);
  const lw = box(.2, 3, 6, wp); lw.position.set(-3.5, 0, -.5); scene.add(lw);
  const night = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), new THREE.MeshBasicMaterial({ color: '#0e1630', fog: false })); night.position.set(1.1, 1.6, -4.2); scene.add(night);
  const frameM = new THREE.MeshStandardMaterial({ color: '#e8e2d6', roughness: .7 });
  for (const [w, h, x, y] of [[1.4, .07, 1.1, .9], [1.4, .07, 1.1, 2.17], [.07, 1.3, .4, .9], [.07, 1.3, 1.8, .9], [.05, 1.3, 1.1, .9]]) { const f = box(w, h, .1, frameM, { cast: false }); f.position.set(x, y, -2.52); scene.add(f); }
  const snow = particles(160, (i, t, o) => { const r = h2(i, 1, 2), q = h2(i, 2, 2); o.x = -.6 + r * 3.4 + Math.sin(t + i) * .1; o.y = 2.6 - ((t * (.25 + q * .2) + q * 2.6) % 2.6); o.z = -3.0 - h2(i, 3, 2) * 1.2; o.a = .9; o.s = .03; o.r = o.g = o.b = .95; }, { soft: 1, blend: THREE.NormalBlending });
  scene.add(snow);
  // table + cloth + chairs
  const woodM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 6, nails: false, cols: ['#1e140e', '#33231a', '#4a3424', '#5e4430'] }));
  const top = box(2.8, .06, 1.2, mat(cloth())); top.position.set(0, .72, -.6); scene.add(top);
  for (const [x, z] of [[-1.3, -1.1], [1.3, -1.1], [-1.3, -.1], [1.3, -.1]]) { const l = box(.08, .72, .08, woodM); l.position.set(x, 0, z); scene.add(l); }
  const chair = (x, z, ry) => { const g = new THREE.Group(); const s = box(.45, .05, .45, woodM); s.position.y = .45; g.add(s); const b = box(.45, .55, .05, woodM); b.position.set(0, .48, -.2); g.add(b); for (const [lx, lz] of [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]]) { const l = box(.04, .45, .04, woodM); l.position.set(lx, 0, lz); g.add(l); } g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); return g; };
  chair(-1.75, -.6, Math.PI / 2); chair(-.85, -1.45, 0); chair(.05, -1.45, 0); chair(.95, -1.45, 0); chair(1.75, -.6, -Math.PI / 2);
  // food, plates, candles
  const plateM = new THREE.MeshStandardMaterial({ color: '#ece8e0', roughness: .4 });
  const plates = [[-1.15, -.6], [-.85, -.95], [.05, -.95], [.95, -.95], [1.15, -.6]].map(([x, z]) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.13, .11, .02, 16), plateM); p.position.set(x, .76, z); p.receiveShadow = true; scene.add(p); return p; });
  const turkey = new THREE.Mesh(new THREE.SphereGeometry(.22, 14, 10).scale(1.3, .7, 1), new THREE.MeshStandardMaterial({ color: '#8a4a1e', roughness: .5 })); turkey.position.set(.1, .82, -.55); turkey.castShadow = true; scene.add(turkey);
  const flames = [];
  for (const [x, z] of [[-.45, -.6], [.6, -.6]]) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .22, 8), new THREE.MeshStandardMaterial({ color: '#f0e8d0' })); c.position.set(x, .86, z); scene.add(c);
    const L = new THREE.PointLight('#ffb050', .8, 2.5, 1.8); L.position.set(x, 1.05, z + .1); scene.add(L); const g = glow('#ffc070', .25, 1.2); g.position.set(x, 1.0, z); scene.add(g); flames.push({ L, g });
  }
  // grandma's memorial (last year): candle + photo at her place
  const mem = new THREE.Group();
  const mc = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .12, 8), new THREE.MeshStandardMaterial({ color: '#f0e8d0' })); mc.position.set(-.72, .82, -.98); mem.add(mc);
  const mL = new THREE.PointLight('#ffb050', 1.0, 2.2, 1.8); mL.position.set(-.72, .98, -.85); mem.add(mL); const mG = glow('#ffc070', .2, 1.2); mG.position.set(-.72, .93, -.98); mem.add(mG);
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(.18, .22), new THREE.MeshStandardMaterial({ map: photoTex(), roughness: .8 })); photo.position.set(-.92, .87, -1.0); photo.rotation.x = -.2; mem.add(photo);
  const shawl = box(.42, .3, .04, new THREE.MeshStandardMaterial({ color: '#4a2c62', roughness: 1 })); shawl.position.set(-.85, .62, -1.67); mem.add(shawl);
  scene.add(mem);
  // christmas tree with warm lights (no red: red is his)
  const tree = billboard(treeTex(), 1.3, 1.9); tree.position.set(-2.7, 0, -1.9); scene.add(tree);
  const bulbs = []; for (let i = 0; i < 14; i++) { const y = .35 + h2(i, 1, 4) * 1.3, w = (1.8 - y) * .32; const g = glow(i % 2 ? '#ffd890' : '#fff0c8', .12, 1.6); g.position.set(-2.7 + (h2(i, 2, 4) - .5) * w * 1.4, y, -1.75); scene.add(g); bulbs.push(g); }
  const treeL = new THREE.PointLight('#ffd890', 1.6, 4, 1.6); treeL.position.set(-2.5, 1.0, -1.4); scene.add(treeL);
  // lights
  const pend = new THREE.PointLight('#ffc888', 4.5, 7, 1.5); pend.position.set(0, 2.3, -.5); pend.castShadow = true; pend.shadow.mapSize.set(1024, 1024); pend.shadow.bias = -.003; scene.add(pend);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(.12, .3, .22, 12, 1, true), new THREE.MeshStandardMaterial({ color: '#3a2a20', side: THREE.DoubleSide, emissive: '#ffb060', emissiveIntensity: .4 })); shade.position.set(0, 2.45, -.55); scene.add(shade);
  const hemi = new THREE.HemisphereLight('#5a4a5a', '#1a1010', .7); scene.add(hemi);
  const moon = new THREE.DirectionalLight('#6a88d0', .5); moon.position.set(1.2, 4, -6); scene.add(moon);
  const fill = new THREE.PointLight('#c8c0e0', 1.0, 6, 2); fill.position.set(-.6, 1.6, 1.4); scene.add(fill);
  const phoneL = new THREE.PointLight('#8fc0ff', 1.1, 1.8, 2); scene.add(phoneL);

  // family (sitting). hero at the left end facing right; grandma at the far-left seat facing him; parents + sister
  const sit = { sit: { pose: 'sit' }, talk: { pose: 'sittalk', mouth: 1 }, blink: { pose: 'sit', blink: 1 } };
  const hero = makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark' }, { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, look: { pose: 'look' } });
  hero.root.position.set(-1.7, 0, -.55); hero.root.userData.char = 'hero'; hero.shadow.visible = false; scene.add(hero.root);
  const grans = [
    makePerson({ top: 'purple', bottom: 'navy', hair: 'hairGrey', hairStyle: 'bun', skin: 'skinOld', shoe: 'shoe' }, sit),
    makePerson({ top: 'purple', bottom: 'navy', hair: 'hairGrey', hairStyle: 'bun', skin: 'skinOld', glasses: 1, shoe: 'shoe' }, sit),
    makePerson({ top: 'purple', bottom: 'navy', hair: 'hairWhite', hairStyle: 'bun', skin: 'skinOld', glasses: 1, hunch: 2, shoe: 'shoe' }, sit),
  ];
  grans.forEach(g => { g.root.position.set(-.85, 0, -1.35); g.shadow.visible = false; scene.add(g.root); });
  const mom = makePerson({ top: 'teal', bottom: 'navy', hair: 'hairBrown', hairStyle: 'long', shoe: 'shoe' }, sit);
  const dad = makePerson({ top: 'navy', bottom: 'grey', hair: 'hairBrown', beard: 1, shoe: 'shoe' }, sit);
  const sis = makePerson({ top: 'mustard', bottom: 'jean', hair: 'hairBlond', hairStyle: 'long', small: 6 }, sit);
  mom.root.position.set(.05, 0, -1.35); dad.root.position.set(.95, 0, -1.35); sis.root.position.set(1.75, 0, -.55);
  [mom, dad, sis].forEach(p => { p.shadow.visible = false; scene.add(p.root); });

  const CAMS = [
    { P: track([[0, [-.95, 1.8, 2.2]], [6, [-.85, 1.9, 2.45]]]), L: track([[0, [-1.38, .98, -.8]], [6, [-1.35, .95, -.8]]]), fov: 46 },
    { P: track([[6, [1.4, 3.3, 5.0]], [11.6, [1.1, 3.1, 4.7]]]), L: track([[6, [-.2, .75, -.7]], [11.6, [-.25, .75, -.7]]]), fov: 46 },
    { P: track([[11.6, [-.5, 1.95, 2.5]], [17.2, [-.65, 1.85, 2.3]]]), L: track([[11.6, [-1.35, .95, -.85]], [17.2, [-1.38, .95, -.88]]]), fov: 46 },
    { P: track([[17.2, [.7, 2.5, 3.8]], [18.8, [-.45, 1.75, 2.3]], [24.6, [-.55, 1.7, 2.15]]]), L: track([[17.2, [-.7, .8, -.8]], [18.8, [-1.3, .9, -1.0]], [24.6, [-1.32, .9, -1.0]]]), fov: 46 },
  ];
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    const yi = Math.max(0, yearAt(t)), C = CAMS[yi];
    cam.position.set(...C.P(t)); cam.fov = C.fov; cam.updateProjectionMatrix(); cam.lookAt(...C.L(t));
    // grandma per year; the last year her place is a candle, a photo and her shawl
    grans.forEach((g, i) => { g.root.visible = i === Math.min(2, yi) && yi < 3; });
    const G = grans[Math.min(2, yi)];
    const talking = LINES.some(L => L.who === 'GRANDMA' && t >= L.a && t < L.b);
    if (yi < 3) { G.frame(talking ? (Math.floor(t * 3) % 2 ? 'talk' : 'sit') : (t % 3.1 < .12 ? 'blink' : 'sit')); G.face(cam, true); }
    mem.visible = yi === 3;
    plates[1].visible = true;
    for (const p of [mom, dad, sis]) { p.frame(t % 3.7 < .12 ? 'blink' : 'sit'); }
    mom.face(cam, true); dad.face(cam, false); sis.face(cam, true);
    hero.frame(t >= T.lookUp ? 'look' : (t % 2.9 < .1 ? 'blink' : 'phone')); hero.face(cam);
    const pp = hero.local(25, 18); phoneL.position.copy(pp).add(_v.set(.2, .1, .3)); phoneL.intensity = t < T.lookUp ? 1.1 : .2;
    // lights: the last Christmas is quieter
    const last = yi === 3 ? 1 : 0;
    flames.forEach((f, i) => { const k = flick(t, i * 2.3); f.L.intensity = .8 * k * (1 - .5 * last); f.g.scale.setScalar(.25 * k); });
    mL.intensity = 1.0 * flick(t, 7); mG.scale.setScalar(.2 * flick(t, 7));
    bulbs.forEach((b, i) => { const on = .55 + .45 * Math.sin(t * 2.2 + i * 1.7); b.material.opacity = on * (1 - .5 * last); });
    pend.intensity = 4.5 * (1 - .45 * last); hemi.intensity = .7 * (1 - .4 * last); fill.intensity = 1.0 * (1 - .3 * last);
    snow.userData.update(t);
    // focus: the hero, or the empty chair in the last year
    const focusP = yi === 3 && t > T.lookUp - .6 ? _v.set(-.85, .9, -1.2) : _v.copy(hero.root.position).setY(.95);
    post.dof.focus = cam.position.distanceTo(focusP); post.dof.aper = 180; post.dof.maxCoc = 18;
    renderer.toneMappingExposure = 1.15 - .15 * last;
    post.bloom.strength = .55; post.bloom.threshold = .85;
  }
  return { scene, update, hero };
}
