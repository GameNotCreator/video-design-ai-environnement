// The park: a bench on a gravel path, a big tree behind it, a lamp post. His friend's life walks past in seasons.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard, ground, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { sky, particles } from './fx.js';
import { makePerson, WALK, walkFrame, R } from './people.js';
import { T, LINES, WALKS, seasonAt } from './story.js';
import { track, seg, ss, eio, clamp, lerp } from '/core/lib.js';

function treeTex(season, seed = 1) {   // spring, summer, autumn, winter (bare + snow), dusk (autumn thinning)
  const W = 56, H = 76, P = new PX(W, H), bark = ramp(['#1e1510', '#3a2a1e', '#54402c'], .22);
  const C = { spring: ['#2a4a24', '#4a7e36', '#8abf5e', '#f0c8dc'], summer: ['#12301a', '#1e5028', '#2e7a36', '#4a9e46'], autumn: ['#5a2410', '#9a4a16', '#d07a24', '#eab040'], dusk: ['#4a2010', '#7a3a14', '#b0621e', '#d09034'] }[season];
  for (let y = 40; y < H; y++) for (let x = 25; x < 31; x++) P.set(x, y, bark(x === 25 ? .2 : .6, x, y));
  for (const [x1, y1] of [[12, 22], [44, 20], [28, 6], [18, 34], [38, 33]]) { P.line(28, 46, x1, y1, bark(.5, 0, 0)); P.line(27, 46, x1 - 1, y1, bark(.35, 0, 0)); }
  if (C) {
    const crown = ramp(C, .45), thin = season === 'dusk' ? .35 : 0;
    P.fill((x, y) => { const d = Math.hypot((x - 28) / 25, (y - 26) / 22) + (fbm(x * .18, y * .18, seed + 5) - .5) * .5; if (d >= 1) return null; if (thin && h2(x, y, seed) < thin) return null; return crown(.8 - d * .55 + (h2(x, y, seed + 2) - .5) * .3, x, y); });
  } else for (let k = 0; k < 70; k++) { const x = 6 + Math.floor(h2(k, 1, seed) * 44), y = 6 + Math.floor(h2(k, 2, seed) * 34); P.set(x, y, [226, 232, 240]); }
  P.outline(.25); return texOf(P.done());
}
function bushTex(season, seed) {
  const P = new PX(30, 16), C = { spring: ['#1e3a1c', '#2f5e2a', '#5a8a3a'], summer: ['#12301a', '#1e5028', '#2e7a36'], autumn: ['#4a2a12', '#7a4a1a', '#a87024'], winter: ['#6a7480', '#a8b2bc', '#dce4ea'], dusk: ['#3a2210', '#5a3a18', '#7a5420'] }[season], G = ramp(C, .45);
  P.fill((x, y) => { const d = Math.hypot((x - 15) / 15, (y - 16) / 15) + (fbm(x * .3, y * .3, seed) - .5) * .4; return d < 1 ? G(.75 - d * .5 + (h2(x, y, seed) - .5) * .3, x, y) : null; });
  P.outline(.25); return texOf(P.done());
}
function grassMask(season) { return { spring: ['#0f1a10', '#1a301c', '#2a4a28', '#3e6a34', '#5a8a44'], summer: ['#0e1a0e', '#18301a', '#264a24', '#38662e', '#4e8238'], autumn: ['#1a1a0e', '#2e3018', '#4a4a24', '#6a6430', '#8a7a3a'], winter: ['#6a7480', '#8a96a2', '#aab6c2', '#c8d2dc', '#e4ecf2'], dusk: ['#141408', '#222414', '#34381e', '#4a4e28', '#626232'] }[season]; }

export function buildPark() {
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2('#8aa0b8', .03);
  const SK = sky({ top: '#3a6aa8', mid: '#7aa4d0', hor: '#c8d8e4', moonI: 0 }); scene.add(SK.mesh);
  // ground per season (swap maps)
  const SEAS = ['spring', 'summer', 'autumn', 'winter', 'dusk'];
  const gMaps = {}; SEAS.forEach(s => { const m = mat(ground(96, 96, { grass: grassMask(s), mask: () => 1, seed: 13 })); gMaps[s] = m; });
  const lawn = mesh(new THREE.BoxGeometry(40, .2, 40).translate(0, -.1, 0), gMaps.spring); scene.add(lawn);
  const gravel = (() => { const P = new PX(96, 48), G = ramp(['#4a443c', '#6a6256', '#8a8070', '#a89e8a'], .45); P.fill((x, y) => G(.5 + (h2(x, y, 3) - .5) * .5 + (fbm(x * .2, y * .2, 4) - .5) * .3, x, y)); return P.done(); })();
  const path = mesh(new THREE.BoxGeometry(40, .04, 1.5).translate(0, .0, 1.3), mat(gravel)); path.receiveShadow = true; scene.add(path);
  // bench
  const wood = mat(woodPlanks(48, 48, { pw: 5, len: 48, seed: 3, cols: ['#2a1a10', '#4a2e1a', '#6e4626', '#8e6034'] }));
  const iron = new THREE.MeshStandardMaterial({ color: '#16161c', roughness: .5, metalness: .6 });
  const bench = new THREE.Group();
  for (let i = 0; i < 3; i++) { const s = box(1.8, .04, .12, wood); s.position.set(0, .44, -.12 + i * .14); bench.add(s); }
  for (let i = 0; i < 2; i++) { const s = box(1.8, .1, .04, wood); s.position.set(0, .62 + i * .16, -.24); s.rotation.x = -.15; bench.add(s); }
  for (const x of [-.8, .8]) { const l = box(.06, .44, .4, iron); l.position.set(x, 0, -.05); bench.add(l); const b = box(.05, .5, .05, iron); b.position.set(x, .44, -.24); bench.add(b); }
  scene.add(bench);
  // trees, bushes
  const trees = [[-.3, -2.4, 3.6, 4.9, 1], [3.9, -4.6, 3.0, 4.1, 2], [-4.4, -3.8, 3.2, 4.4, 3], [6.5, -7, 3.4, 4.6, 4], [-7, -7.5, 3.4, 4.6, 5]].map(([x, z, w, h, seed]) => {
    const v = {}; ['spring', 'summer', 'autumn', 'winter', 'dusk'].forEach(s => { const b = billboard(treeTex(s === 'winter' ? 'winter' : s, seed), w, h); b.position.set(x, 0, z); b.visible = false; scene.add(b); v[s] = b; }); return v;
  });
  const bushes = [[-2.2, -1.2, 1], [2.6, -1.4, 2], [-3.6, .1, 3], [4.6, -.4, 4]].map(([x, z, seed]) => { const v = {}; SEAS.forEach(s => { const b = billboard(bushTex(s, seed), 1.4, .75); b.position.set(x, 0, z); b.visible = false; scene.add(b); v[s] = b; }); return v; });
  // lamp post
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.05, .07, 3.2, 8).translate(0, 1.6, 0), iron); pole.position.set(1.35, 0, -.45); pole.castShadow = true; scene.add(pole);
  const lampHeadM = new THREE.MeshStandardMaterial({ color: '#2a2a30', emissive: '#ffb860', emissiveIntensity: 0 });
  const lampHead = new THREE.Mesh(new THREE.BoxGeometry(.28, .34, .28), lampHeadM); lampHead.position.set(1.35, 3.3, -.45); scene.add(lampHead);
  const lamp = new THREE.PointLight('#ffb35c', 0, 9, 1.5); lamp.position.set(1.25, 3.1, -.2); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -.003; scene.add(lamp);
  const lampG = glow('#ffc070', 1.3, 1.2); lampG.position.set(1.35, 3.3, -.45); lampG.visible = false; scene.add(lampG);
  // distant city silhouettes
  for (let i = 0; i < 9; i++) { const h = 6 + h2(i, 1, 7) * 9, w = 3 + h2(i, 2, 7) * 3; const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 2), new THREE.MeshBasicMaterial({ color: '#56677e' })); b.position.set(-22 + i * 5.5, h / 2, -26 - h2(i, 3, 7) * 4); scene.add(b); }
  // lights
  const sun = new THREE.DirectionalLight('#fff0d0', 2.4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, far: 60 }); sun.shadow.bias = -.0008; scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight('#b8cce8', '#2a2a1e', 1.1); scene.add(hemi);
  const fill = new THREE.PointLight('#c8d4f0', 1.0, 7, 2); fill.position.set(.6, 1.7, 2.2); scene.add(fill);
  const phoneL = new THREE.PointLight('#8fc0ff', 1.0, 1.8, 2); scene.add(phoneL);

  // people
  const hero = makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark', shoe: 'sneaker' }, { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, look: { pose: 'look' } });
  const heroB = makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark', beard: 1, shoe: 'sneaker' }, { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, look: { pose: 'look' } });
  for (const h of [hero, heroB]) { h.root.position.set(-.55, 0, .12); h.root.userData.char = 'hero'; h.shadow.visible = false; scene.add(h.root); }
  const F = { stand: { pose: 'stand' }, wave: { pose: 'wave', mouth: 1 }, talk: { pose: 'talk', mouth: 1 }, kick: { pose: 'kick' }, ...WALK };
  const alex = makePerson({ top: 'teal', bottom: 'jean', hair: 'hairBrown' }, F);
  const pal = makePerson({ top: 'mustard', bottom: 'grey', hair: 'hairBlond' }, F);
  const grad = makePerson({ gown: 1, gradCap: 1, hair: 'hairBrown', shoe: 'shoe' }, F);
  const groom = makePerson({ top: 'black', bottom: 'black', suit: 1, hair: 'hairBrown', shoe: 'shoe' }, F);
  const bride = makePerson({ dress: 1, top: 'white', hair: 'hairBlond', hairStyle: 'bun', veil: 1, shoe: 'shoe' }, F);
  const dad = makePerson({ top: 'green', bottom: 'jean', hair: 'hairBrown', beard: 1, shoe: 'shoe' }, { ...F, p0: { pose: 'push', step: 0 }, p1: { pose: 'push', step: 1, bob: -1 }, p2: { pose: 'push', step: 2 }, p3: { pose: 'push', step: 3, bob: -1 }, pstand: { pose: 'push' } });
  [alex, pal, grad, groom, bride, dad].forEach(p => scene.add(p.root));
  const ball = new THREE.Mesh(new THREE.SphereGeometry(.11, 10, 8), new THREE.MeshStandardMaterial({ color: '#e8e8e8', roughness: .6 })); ball.castShadow = true; scene.add(ball);
  // pram
  const pram = new THREE.Group(), pm = new THREE.MeshStandardMaterial({ color: '#2c3754', roughness: .7 });
  const pb = new THREE.Mesh(new THREE.BoxGeometry(.7, .32, .42).translate(0, .52, 0), pm); pb.castShadow = true; pram.add(pb);
  const hood = new THREE.Mesh(new THREE.CylinderGeometry(.21, .21, .42, 12, 1, false, 0, Math.PI).rotateX(Math.PI / 2).rotateZ(Math.PI / 2), pm); hood.position.set(.22, .68, 0); pram.add(hood);
  for (const [x, z] of [[-.25, -.2], [.25, -.2], [-.25, .2], [.25, .2]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, .04, 10).rotateX(Math.PI / 2), iron); w.position.set(x, .11, z); pram.add(w); }
  const handle = new THREE.Mesh(new THREE.BoxGeometry(.04, .5, .4), iron); handle.position.set(-.38, .82, 0); handle.rotation.z = .5; pram.add(handle);
  scene.add(pram);
  // weather
  const snow = particles(260, (i, t, o) => { const r = h2(i, 1, 2), q = h2(i, 2, 2); o.x = -6 + r * 12 + Math.sin(t * .8 + i) * .2; o.y = 6 - ((t * (.6 + q * .4) + q * 6) % 6); o.z = -4 + h2(i, 3, 2) * 8; o.a = .9; o.s = .035; o.r = o.g = o.b = 1; }, { soft: 1, blend: THREE.NormalBlending });
  const leaves = particles(60, (i, t, o) => { const r = h2(i, 1, 4), q = h2(i, 2, 4), life = (t * .35 + q) % 1; o.x = -.3 + (r - .5) * 3 + life * 1.5 + Math.sin(t * 2 + i) * .25; o.y = 3.8 - life * 3.8; o.z = -2.2 + (h2(i, 3, 4) - .5) * 2 + life * 1.5; o.a = .95; o.s = .05; o.r = .78; o.g = .38 + r * .2; o.b = .1; }, { blend: THREE.NormalBlending });
  scene.add(snow, leaves);

  const LOOK = {
    spring: { sun: '#fff2d8', si: 2.6, hemi: '#b8cce8', hi: 1.1, fog: '#9ab0c8', sky: ['#3a6aa8', '#7aa4d0', '#c8d8e4'], sp: [8, 12, 6] },
    summer: { sun: '#fff6e0', si: 3.0, hemi: '#c0d4f0', hi: 1.2, fog: '#a6bcd0', sky: ['#2e64b0', '#6aa0dc', '#d0e0ec'], sp: [4, 14, 6] },
    autumn: { sun: '#ffc88a', si: 2.4, hemi: '#d0b89a', hi: .9, fog: '#b09a84', sky: ['#4a5a8a', '#c8906a', '#f0c08a'], sp: [-9, 7, 5] },
    winter: { sun: '#dce6f4', si: 1.4, hemi: '#aab8cc', hi: 1.0, fog: '#a8b4c4', sky: ['#5a6a82', '#98a8bc', '#c8d0da'], sp: [6, 9, 8] },
    dusk: { sun: '#ff9a5a', si: 1.2, hemi: '#5a5a7a', hi: .6, fog: '#3a3a52', sky: ['#141a34', '#4a3a5a', '#c87a5a'], sp: [-12, 3, -4] },
  };
  const CP = track([[0, [.55, 1.75, 3.4]], [3.1, [.7, 1.9, 3.7]], [5.6, [2.0, 5.4, 9.4]], [16.4, [1.5, 4.9, 8.6]], [18.2, [1.2, 2.5, 4.6]], [19.4, [.9, 1.45, 3.0]], [24.5, [.8, 1.45, 3.1]]]);
  const CL = track([[0, [.04, .9, -.9]], [3.1, [.1, .88, -.8]], [5.6, [.45, .35, -.55]], [16.4, [.25, .35, -.55]], [18.2, [-.2, .75, -.2]], [19.4, [-.25, .95, -.1]], [24.5, [-.25, .97, -.1]]]);
  const FOV = t => lerp(46, 42, seg(t, 3.1, 5.6)) - 2 * seg(t, 18.2, 19.4);
  const _v = new THREE.Vector3(), cA = new THREE.Color(), cB = new THREE.Color();

  // walker position: walk in from xa to stop at xs, stand, walk out to xb
  function walker(p, k, t, xs, z, xa = -4.6, xb = 6.5) {
    const [a, b, c, d] = WALKS[k];
    if (t < a || t > d) { p.root.visible = false; return null; }
    p.root.visible = true;
    let x, mode;
    if (t < b) { x = lerp(xa, xs, (t - a) / (b - a)); mode = 'walk'; } else if (t < c) { x = xs; mode = 'stand'; } else { x = lerp(xs, xb, (t - c) / (d - c)); mode = 'walk'; }
    p.root.position.set(x, 0, z); return mode;
  }

  function update(t, shot, cam, post, renderer) {
    cam.position.set(...CP(t)); cam.fov = FOV(t); cam.updateProjectionMatrix(); cam.lookAt(...CL(t));
    const S = seasonAt(t).id, L = LOOK[S];
    // dusk → night after 16.6
    const night = seg(t, 16.8, 19.0);
    trees.forEach(v => SEAS.forEach(s => { v[s].visible = s === S; }));
    bushes.forEach(v => SEAS.forEach(s => { v[s].visible = s === S; }));
    lawn.material = gMaps[S];
    sun.color.set(L.sun); sun.intensity = L.si * (1 - night); sun.position.set(...L.sp); hemi.color.set(L.hemi); hemi.intensity = L.hi * (1 - .75 * night);
    scene.fog.color.set(L.fog).lerp(cA.set('#0c1020'), night);
    SK.u.top.value.set(L.sky[0]).lerp(cB.set('#04060e'), night); SK.u.mid.value.set(L.sky[1]).lerp(cB.set('#0a0f22'), night); SK.u.hor.value.set(L.sky[2]).lerp(cB.set('#1a2034'), night);
    snow.visible = S === 'winter'; leaves.visible = S === 'dusk'; snow.userData.update(t); leaves.userData.update(t);
    const lampK = seg(t, T.lampOn, T.lampOn + .12) * (1 + .03 * Math.sin(t * 9));
    lamp.intensity = 14 * lampK; lampHeadM.emissiveIntensity = 3 * lampK; lampG.visible = lampK > 0;
    // hero
    const H = t < 13.6 ? hero : heroB; hero.root.visible = H === hero; heroB.root.visible = H === heroB;
    H.frame(t >= T.lookUp ? 'look' : (Math.floor(t / 2.7) % 3 === 2 && (t % 2.7) < .12) ? 'blink' : 'phone'); H.face(cam);
    const pp = H.local(25, 18); phoneL.position.copy(pp).add(_v.set(.2, .1, .3)); phoneL.intensity = t < T.lookUp ? 1.0 : .25;
    fill.intensity = 1.0 * (1 - .6 * night);
    // football in spring: Alex waves at him, then both leave
    if (t < 6.0) {
      alex.root.visible = pal.root.visible = true;
      const leave = seg(t, 4.0, 6.0);
      alex.root.position.set(lerp(1.0, 7, leave), 0, -1.9); pal.root.position.set(lerp(2.7, 8.5, leave), 0, -2.6);
      alex.frame(leave > 0 ? walkFrame(t) : t < 3.15 ? (Math.floor(t * 3) % 2 ? 'wave' : 'talk') : 'stand'); alex.face(cam, leave === 0);
      pal.frame(leave > 0 ? walkFrame(t + .3) : (Math.floor(t * 2.2) % 2 ? 'kick' : 'stand')); pal.face(cam, true);
      const bt = (t * .9) % 1, bx = lerp(2.5, 1.3, Math.abs(bt * 2 - 1));
      ball.visible = leave === 0; ball.position.set(bx, .11 + Math.abs(Math.sin(t * 6)) * .25, -2.25);
    } else { alex.root.visible = pal.root.visible = false; ball.visible = false; }
    // graduate, couple, pram — each stops by the bench (x ~ .9) facing him
    let m = walker(grad, 'grad', t, .85, 1.15); if (m) { grad.frame(m === 'walk' ? walkFrame(t) : (Math.floor(t * 2.5) % 2 ? 'wave' : 'talk')); grad.face(cam, m === 'stand'); }
    m = walker(groom, 'wed', t, .75, 1.05); if (m) { groom.frame(m === 'walk' ? walkFrame(t) : 'talk'); groom.face(cam, m === 'stand'); }
    m = walker(bride, 'wed', t, 1.45, 1.35); if (m) { bride.frame(m === 'walk' ? walkFrame(t + .2) : 'stand'); bride.face(cam, m === 'stand'); }
    m = walker(dad, 'pram', t, 1.6, 1.2, -5.2, 6.0); if (m) { dad.frame(m === 'walk' ? ['p0', 'p1', 'p2', 'p3'][Math.floor(t * 7) % 4] : 'pstand'); dad.face(cam, m === 'stand'); }
    pram.visible = dad.root.visible; if (pram.visible) { const fwd = m === 'stand' ? -.62 : .62; pram.position.set(dad.root.position.x + fwd, 0, 1.2); pram.rotation.y = m === 'stand' ? Math.PI : 0; }
    // post
    post.dof.focus = cam.position.distanceTo(_v.copy(H.root.position).setY(.8)); post.dof.aper = t > 18 ? 160 : 240; post.dof.maxCoc = 20;
    renderer.toneMappingExposure = 1.1 + .25 * night;
    post.bloom.strength = .5 + .3 * night; post.bloom.threshold = .85;
  }
  return { scene, update, hero: { get root() { return hero.root.visible ? hero.root : heroB.root; } } };
}
