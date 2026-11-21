// The statue: a bench in a park. He sits down to scroll for five minutes; the seasons, the snow, the kids, the pigeons
// and the years go by, and he turns to stone. Built on the park of video-3 (bench, trees, seasons).
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard, ground, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { sky, particles } from './fx.js';
import { makePerson, WALK, walkFrame } from './people.js';
import { T, seasonAt } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

function treeTex(season, seed = 1) {
  const W = 56, H = 76, P = new PX(W, H), bark = ramp(['#1e1510', '#3a2a1e', '#54402c'], .22);
  const C = { spring: ['#2a4a24', '#4a7e36', '#8abf5e', '#f0c8dc'], summer: ['#12301a', '#1e5028', '#2e7a36', '#4a9e46'], autumn: ['#5a2410', '#9a4a16', '#d07a24', '#eab040'] }[season];
  for (let y = 40; y < H; y++) for (let x = 25; x < 31; x++) P.set(x, y, bark(x === 25 ? .2 : .6, x, y));
  for (const [x1, y1] of [[12, 22], [44, 20], [28, 6], [18, 34], [38, 33]]) { P.line(28, 46, x1, y1, bark(.5, 0, 0)); P.line(27, 46, x1 - 1, y1, bark(.35, 0, 0)); }
  if (C) { const crown = ramp(C, .45); P.fill((x, y) => { const d = Math.hypot((x - 28) / 25, (y - 26) / 22) + (fbm(x * .18, y * .18, seed + 5) - .5) * .5; if (d >= 1) return null; return crown(.8 - d * .55 + (h2(x, y, seed + 2) - .5) * .3, x, y); }); }
  else for (let k = 0; k < 70; k++) { const x = 6 + Math.floor(h2(k, 1, seed) * 44), y = 6 + Math.floor(h2(k, 2, seed) * 34); P.set(x, y, [226, 232, 240]); }
  P.outline(.25); return texOf(P.done());
}
function bushTex(season, seed) {
  const P = new PX(30, 16), C = { spring: ['#1e3a1c', '#2f5e2a', '#5a8a3a'], summer: ['#12301a', '#1e5028', '#2e7a36'], autumn: ['#4a2a12', '#7a4a1a', '#a87024'], winter: ['#6a7480', '#a8b2bc', '#dce4ea'] }[season], G = ramp(C, .45);
  P.fill((x, y) => { const d = Math.hypot((x - 15) / 15, (y - 16) / 15) + (fbm(x * .3, y * .3, seed) - .5) * .4; return d < 1 ? G(.75 - d * .5 + (h2(x, y, seed) - .5) * .3, x, y) : null; });
  P.outline(.25); return texOf(P.done());
}
const grassMask = s => ({ spring: ['#0f1a10', '#1a301c', '#2a4a28', '#3e6a34', '#5a8a44'], summer: ['#0e1a0e', '#18301a', '#264a24', '#38662e', '#4e8238'], autumn: ['#1a1a0e', '#2e3018', '#4a4a24', '#6a6430', '#8a7a3a'], winter: ['#6a7480', '#8a96a2', '#aab6c2', '#c8d2dc', '#e4ecf2'] }[s]);
function moundTex() { const P = new PX(40, 30), S = ramp(['#9aa6b8', '#c4ccd8', '#e2e8f0', '#f8fbff'], .45); P.fill((x, y) => { const d = Math.hypot((x - 20) / 20, (y - 30) / 26) + (fbm(x * .3, y * .3, 3) - .5) * .25; return d < 1 ? S(.95 - d * .5 - (x / 40) * .2, x, y) : null; }); P.outline(.2); return texOf(P.done()); }
function capTex() { const P = new PX(14, 6), S = ramp(['#c4ccd8', '#e8eef4', '#ffffff'], .45); P.fill((x, y) => { const d = Math.hypot((x - 7) / 7, (y - 6) / 5.5); return d < 1 ? S(.9 - d * .4, x, y) : null; }); return texOf(P.done()); }
function birdTex() { const P = new PX(9, 7), G = ramp(['#3a3c46', '#6a6c78', '#9a9ca8', '#c8c8d0'], .45); P.fill((x, y) => { const body = Math.hypot((x - 4) / 4, (y - 4.5) / 2.5) < 1, head = Math.hypot((x - 7) / 1.8, (y - 2) / 1.8) < 1; return body || head ? G(head ? .55 : .75 - y * .06, x, y) : null; }); P.set(8, 2, [210, 150, 60]); P.set(7, 1, [20, 20, 24]); P.set(3, 7 - 1, [200, 120, 100]); P.outline(.3); return texOf(P.done()); }
function nestTex() { const P = new PX(14, 6), B = ramp(['#2a1a0e', '#4a3018', '#6e4a26', '#8e6634'], .45); P.fill((x, y) => { const d = Math.hypot((x - 7) / 7, (y - 1) / 5); return d < 1 && y > 0 ? B(.5 + (h2(x, y, 4) - .5) * .7, x, y) : null; }); P.outline(.3); return texOf(P.done()); }

export function build() {
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2('#8aa0b8', .03);
  const SK = sky({ top: '#3a6aa8', mid: '#7aa4d0', hor: '#c8d8e4', moonI: 0 }); scene.add(SK.mesh);
  const SEAS = ['spring', 'summer', 'autumn', 'winter'];
  const gMaps = {}; SEAS.forEach(s => { gMaps[s] = mat(ground(96, 96, { grass: grassMask(s), mask: () => 1, seed: 13 })); });
  const lawn = mesh(new THREE.BoxGeometry(40, .2, 40).translate(0, -.1, 0), gMaps.spring); scene.add(lawn);
  const gravel = (() => { const P = new PX(96, 48), G = ramp(['#4a443c', '#6a6256', '#8a8070', '#a89e8a'], .45); P.fill((x, y) => G(.5 + (h2(x, y, 3) - .5) * .5 + (fbm(x * .2, y * .2, 4) - .5) * .3, x, y)); return P.done(); })();
  const path = mesh(new THREE.BoxGeometry(40, .04, 1.5).translate(0, 0, 1.3), mat(gravel)); path.receiveShadow = true; scene.add(path);
  // bench (wood, then stone)
  const wood = mat(woodPlanks(48, 48, { pw: 5, len: 48, seed: 3, cols: ['#2a1a10', '#4a2e1a', '#6e4626', '#8e6034'] }));
  const iron = new THREE.MeshStandardMaterial({ color: '#16161c', roughness: .5, metalness: .6 });
  const bench = new THREE.Group();
  for (let i = 0; i < 3; i++) { const s = box(1.8, .04, .12, wood); s.position.set(0, .44, -.12 + i * .14); bench.add(s); }
  for (let i = 0; i < 2; i++) { const s = box(1.8, .1, .04, wood); s.position.set(0, .62 + i * .16, -.24); s.rotation.x = -.15; bench.add(s); }
  for (const x of [-.8, .8]) { const l = box(.06, .44, .4, iron); l.position.set(x, 0, -.05); bench.add(l); const b = box(.05, .5, .05, iron); b.position.set(x, .44, -.24); bench.add(b); }
  bench.children.forEach(c => { c.userData.m = c.material; });
  scene.add(bench);
  const stoneM = new THREE.MeshStandardMaterial({ color: '#8a8682', roughness: .95 });
  const plinth = box(2.2, .22, .9, stoneM); plinth.position.set(0, 0, -.05); plinth.visible = false; scene.add(plinth);
  const post = box(.5, .55, .12, stoneM); post.position.set(.95, 0, .75); post.visible = false; scene.add(post);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(.4, .22), new THREE.MeshStandardMaterial({ color: '#8a6a34', roughness: .4, metalness: .6 })); plate.position.set(.95, .4, .815); plate.visible = false; scene.add(plate);
  const trees = [[-.3, -2.4, 3.6, 4.9, 1], [3.9, -4.6, 3.0, 4.1, 2], [-4.4, -3.8, 3.2, 4.4, 3], [6.5, -7, 3.4, 4.6, 4], [-7, -7.5, 3.4, 4.6, 5]].map(([x, z, w, h, seed]) => {
    const v = {}; SEAS.forEach(s => { const b = billboard(treeTex(s, seed), w, h); b.position.set(x, 0, z); b.visible = false; scene.add(b); v[s] = b; }); return v;
  });
  const bushes = [[-2.2, -1.2, 1], [2.6, -1.4, 2], [-3.6, .1, 3], [4.6, -.4, 4]].map(([x, z, seed]) => { const v = {}; SEAS.forEach(s => { const b = billboard(bushTex(s, seed), 1.4, .75); b.position.set(x, 0, z); b.visible = false; scene.add(b); v[s] = b; }); return v; });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.05, .07, 3.2, 8).translate(0, 1.6, 0), iron); pole.position.set(1.35, 0, -.45); pole.castShadow = true; scene.add(pole);
  const lampHead = new THREE.Mesh(new THREE.BoxGeometry(.28, .34, .28), new THREE.MeshStandardMaterial({ color: '#2a2a30' })); lampHead.position.set(1.35, 3.3, -.45); scene.add(lampHead);
  for (let i = 0; i < 9; i++) { const h = 6 + h2(i, 1, 7) * 9, w = 3 + h2(i, 2, 7) * 3; const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 2), new THREE.MeshBasicMaterial({ color: '#56677e' })); b.position.set(-22 + i * 5.5, h / 2, -26 - h2(i, 3, 7) * 4); scene.add(b); }
  const sun = new THREE.DirectionalLight('#fff0d0', 2.4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, far: 60 }); sun.shadow.bias = -.0008; scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight('#b8cce8', '#2a2a1e', 1.1); scene.add(hemi);
  const fill = new THREE.PointLight('#c8d4f0', 1.2, 7, 2); fill.position.set(.6, 1.7, 2.2); scene.add(fill);
  const phoneL = new THREE.PointLight('#8fc0ff', .8, 1.6, 2); scene.add(phoneL);
  // him: the student, the mossy student, the statue (same pose, the phone always lit)
  const PH = { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 } };
  const heroes = [
    makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark', shoe: 'sneaker' }, PH),
    makePerson({ top: 'moss', bottom: 'moss', hair: 'hairDark', beard: 1, shoe: 'shoe' }, PH),
    makePerson({ skin: 'stone', top: 'stone', bottom: 'stone', hair: 'stone', shoe: 'stone' }, { phone: { pose: 'phone', blink: 1 } }),
  ];
  heroes.forEach(h => { h.root.position.set(-.1, 0, .2); h.shadow.visible = false; scene.add(h.root); });
  // snow mound, snow cap, carrot nose
  const mound = billboard(moundTex(), 1.25, .95); scene.add(mound);
  const cap = billboard(capTex(), .48, .2); scene.add(cap);
  const carrot = new THREE.Mesh(new THREE.ConeGeometry(.025, .14, 6).rotateZ(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#e07a20', roughness: .7 })); scene.add(carrot);
  // kids
  const KF = { stand: { pose: 'stand' }, wave: { pose: 'wave', mouth: 1 }, ...WALK };
  const kids = [makePerson({ top: 'teal', bottom: 'navy', hair: 'hairBlond', shoe: 'sneaker' }, KF), makePerson({ top: 'mustard', bottom: 'jean', hair: 'hairBrown', hairStyle: 'long', shoe: 'sneaker' }, KF)];
  kids.forEach(k => { k.root.scale.setScalar(.72); scene.add(k.root); });
  // pigeons, nest
  const bT = birdTex(), birds = [[.55, .48, .15], [.85, .48, .05], [-1.2, .02, .9], [1.6, .02, .7]].map(([x, y, z]) => { const b = billboard(bT, .3, .23); b.position.set(x, y, z); scene.add(b); return b; });
  const headBird = billboard(bT, .3, .23); scene.add(headBird);
  const nest = billboard(nestTex(), .46, .2); scene.add(nest);
  // weather
  const snow = particles(260, (i, t, o) => { const r = h2(i, 1, 2), q = h2(i, 2, 2); o.x = -4 + r * 8 + Math.sin(t * .8 + i) * .2; o.y = 5 - ((t * (.6 + q * .4) + q * 5) % 5); o.z = -3 + h2(i, 3, 2) * 6; o.a = .9; o.s = .035; o.r = o.g = o.b = 1; }, { soft: 1, blend: THREE.NormalBlending });
  const leaves = particles(60, (i, t, o) => { const r = h2(i, 1, 4), q = h2(i, 2, 4), life = (t * .5 + q) % 1; o.x = -.3 + (r - .5) * 3 + life * 1.2 + Math.sin(t * 2 + i) * .25; o.y = 3.8 - life * 3.8; o.z = -2.2 + (h2(i, 3, 4) - .5) * 2 + life * 2.2; o.a = .95; o.s = .05; o.r = .78; o.g = .38 + r * .2; o.b = .1; }, { blend: THREE.NormalBlending });
  scene.add(snow, leaves);
  const LOOK = {
    spring: { sun: '#fff2d8', si: 2.6, hemi: '#b8cce8', hi: 1.1, fog: '#9ab0c8', sky: ['#3a6aa8', '#7aa4d0', '#c8d8e4'], sp: [8, 12, 6] },
    summer: { sun: '#fff6e0', si: 3.0, hemi: '#c0d4f0', hi: 1.2, fog: '#a6bcd0', sky: ['#2e64b0', '#6aa0dc', '#d0e0ec'], sp: [4, 14, 6] },
    autumn: { sun: '#ffc88a', si: 2.4, hemi: '#d0b89a', hi: .9, fog: '#b09a84', sky: ['#4a5a8a', '#c8906a', '#f0c08a'], sp: [-9, 7, 5] },
    winter: { sun: '#dce6f4', si: 1.4, hemi: '#aab8cc', hi: 1.0, fog: '#a8b4c4', sky: ['#5a6a82', '#98a8bc', '#c8d0da'], sp: [6, 9, 8] },
  };
  const _v = new THREE.Vector3();

  function update(t, shot, cam, postFx, renderer) {
    // camera: a medium shot of the bench, slowly closer; for the plaque, lower and a little wider
    if (t < T.plaque) { const u = eio(seg(t, 0, T.plaque)); cam.position.set(lerp(.6, .5, u), lerp(1.5, 1.42, u), lerp(4.4, 3.7, u)); cam.lookAt(lerp(-.05, -.05, u), lerp(.95, .9, u), 0); cam.fov = 46; }
    else { const u = eo(seg(t, T.plaque, T.plaque + 1.5)); cam.position.set(lerp(.5, .7, u), lerp(1.42, 1.25, u), lerp(3.7, 4.2, u)); cam.lookAt(.1, lerp(.9, 1.05, u), 0); cam.fov = 48; }
    cam.updateProjectionMatrix();
    const S = seasonAt(t), L = LOOK[S];
    trees.forEach(v => SEAS.forEach(s => { v[s].visible = s === (S === 'winter' ? 'winter' : S); }));
    bushes.forEach(v => SEAS.forEach(s => { v[s].visible = s === S; }));
    lawn.material = gMaps[S];
    sun.color.set(L.sun); sun.intensity = L.si; sun.position.set(...L.sp); hemi.color.set(L.hemi); hemi.intensity = L.hi;
    scene.fog.color.set(L.fog); SK.u.top.value.set(L.sky[0]); SK.u.mid.value.set(L.sky[1]); SK.u.hor.value.set(L.sky[2]);
    snow.visible = S === 'winter'; leaves.visible = S === 'autumn'; snow.userData.update(t); leaves.userData.update(t);
    // which him
    const k = t < T.moss ? 0 : t < T.stone ? 1 : 2; heroes.forEach((h, i) => { h.root.visible = i === k; });
    const H = heroes[k]; H.frame(k === 2 ? 'phone' : (t % 2.9 < .1 ? 'blink' : 'phone')); H.face(cam);
    phoneL.position.copy(H.local(25, 18)).add(_v.set(.2, .1, .3)); phoneL.intensity = .8;
    // the bench turns to stone with him
    const stone = t >= T.stone; bench.children.forEach(c => { c.material = stone ? stoneM : c.userData.m; });
    plinth.visible = stone; post.visible = plate.visible = t >= T.pigeons; if (stone) H.root.position.y = .22; else H.root.position.y = 0; bench.position.y = stone ? .22 : 0;
    // winter: snow builds up into a mound, the kids give him a carrot nose; spring: it melts
    const build = ss(seg(t, 5.3, 7.2)) * (1 - ss(seg(t, T.melt, T.melt + .6)));
    mound.visible = build > .01; mound.scale.set(1, build, 1); mound.position.copy(H.root.position).add(_v.set(.05, 0, .25)); mound.lookAt(cam.position.x, mound.position.y, cam.position.z);
    cap.visible = build > .2; cap.position.copy(H.local(17, 3.5)); cap.lookAt(cam.position.x, cap.position.y, cam.position.z);
    carrot.visible = t >= T.carrot && t < T.melt + .4; carrot.position.copy(H.local(24, 11)); carrot.rotation.y = H.root.rotation.y;
    kids.forEach((kd, i) => {
      const a = T.kids + i * .25, b = a + .7, c = 7.6, d = 8.4; kd.root.visible = t >= a && t < d;
      if (!kd.root.visible) return;
      let x, f, flip = false;
      if (t < b) { x = lerp(-3.4 + i * .3, -.8 - i * .4, seg(t, a, b)); f = walkFrame(t + i * .2); }
      else if (t < c) { x = -.8 - i * .4; f = (Math.floor(t * 3 + i) % 2) ? 'wave' : 'stand'; }
      else { x = lerp(-.8 - i * .4, -3.6, seg(t, c, d)); f = walkFrame(t + i * .2); flip = true; }
      kd.root.position.set(x, 0, .75 + i * .2); kd.frame(f); kd.face(cam, flip);
    });
    // pigeons and the nest
    birds.forEach((b, i) => { b.visible = t >= T.melt + .3 + i * .15; b.position.y = (i < 2 ? .48 : .02) + (stone && i < 2 ? .22 : 0); b.lookAt(cam.position.x, b.position.y, cam.position.z); });
    nest.visible = t >= T.nest; nest.position.copy(H.local(17, 2.5)); nest.lookAt(cam.position.x, nest.position.y, cam.position.z);
    headBird.visible = t >= T.melt + .8; headBird.position.copy(H.local(16, t >= T.nest ? -2.5 : 1.5)); headBird.lookAt(cam.position.x, headBird.position.y, cam.position.z);
    postFx.dof.focus = cam.position.distanceTo(_v.copy(H.root.position).setY(.8)); postFx.dof.aper = 140; postFx.dof.maxCoc = 16;
    renderer.toneMappingExposure = 1.1; postFx.bloom.strength = .45; postFx.bloom.threshold = .85;
  }
  return { scene, update };
}
