// "Premiers pas": the living room. His baby girl lets go of the coffee table and walks to him; he scrolls on the sofa.
// Then the years jump (6, 12, 18): she grows, he grows a beard and greys, the window changes light; she leaves with a
// suitcase. He looks up at an empty room.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson, WALK, walkFrame, SPX } from './people.js';
import { T, JUMPS, phaseAt } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

function wallTex() { const P = new PX(64, 64), R = ramp(['#4a4236', '#5a5244', '#6a6252', '#7a7262'], .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, 5) - .5) * .22 + (h2(x, y, 5) - .5) * .1, x, y)); return P.done(); }
function sofaTex() { const P = new PX(32, 16), R = ramp(['#22303a', '#2e404c', '#3c5260', '#4c6474'], .45); P.fill((x, y) => R(.5 + (h2(x, y, 8) - .5) * .3 + ((x % 8) === 0 ? -.2 : 0), x, y)); return P.done(); }
function rugTex() { const P = new PX(48, 32), R = ramp(['#5a2e22', '#7a4232', '#9a5a40', '#b87a58'], .45); P.fill((x, y) => { const b = x < 3 || y < 3 || x > 44 || y > 28; return R(b ? .25 : .55 + (((x >> 3) + (y >> 3)) % 2) * .12 + (h2(x, y, 4) - .5) * .2, x, y); }); return P.done(); }
// her drawing at six: a house, a sun, three people holding hands (dad, mum, her)
function drawingTex() {
  const P = new PX(30, 22); P.fill((x, y) => [246, 242, 232]);
  const C = (x, y, c) => P.set(x, y, hex(c));
  for (let x = 20; x < 27; x++) for (let y = 3; y < 7; y++) if ((x - 23) ** 2 + (y - 5) ** 2 < 6) C(x, y, '#f0b020');
  for (let x = 3; x < 11; x++) for (let y = 9; y < 15; y++) C(x, y, x === 3 || x === 10 || y === 14 ? '#c03020' : '#e8c070');
  for (let i = 0; i < 5; i++) { C(3 + i, 9 - i, '#c03020'); C(10 - i, 9 - i, '#c03020'); }
  [[14, '#2a3a8a', 7], [18, '#8a3a9a', 7], [22, '#c41919', 5]].forEach(([x, c, h]) => { C(x, 18 - h, c); C(x, 19 - h, c); for (let y = 20 - h; y < 18; y++) C(x, y, c); C(x - 1, 18, c); C(x + 1, 18, c); });
  for (let x = 14; x < 23; x++) C(x, 15, '#8a5a3a');
  for (let x = 0; x < 30; x++) C(x, 20, '#5a9a4a');
  return P.done();
}
// the window: the sky changes with the years (evening, morning, afternoon, dusk, night)
const SKY = ['#3a3466', '#a8c8e6', '#c8dce6', '#d88a58', '#10142a'];

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#06060a');
  scene.add(mesh(new THREE.BoxGeometry(7, .2, 6).translate(0, -.1, 0), mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 11, cols: ['#2a1c14', '#40291c', '#583a26', '#704c32', '#8a603e'] }))));
  const wM = mat(wallTex()); const back = box(7, 3, .2, wM); back.position.set(0, 0, -2.2); scene.add(back);
  const left = box(.2, 3, 6, wM); left.position.set(-2.4, 0, 0); scene.add(left);
  // window above the sofa
  const winM = new THREE.MeshBasicMaterial({ color: SKY[0] }), win = new THREE.Mesh(new THREE.PlaneGeometry(.9, .7), winM); win.position.set(0, 1.95, -2.09); scene.add(win);
  const frM = new THREE.MeshStandardMaterial({ color: '#d8d0c0', roughness: .8 });
  for (const [w, h, x, y] of [[1.0, .06, 0, 2.3], [1.0, .06, 0, 1.6], [.06, .76, -.47, 1.95], [.06, .76, .47, 1.95], [.04, .7, 0, 1.95]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .06), frM); b.position.set(x, y, -2.07); scene.add(b); }
  const winL = new THREE.PointLight('#c8d8ff', 0, 5, 1.4); winL.position.set(0, 1.9, -1.6); scene.add(winL);
  // the front door (she leaves through it)
  const doorM = new THREE.MeshStandardMaterial({ color: '#6a4a30', roughness: .8 }), door = new THREE.Group(); const dp = box(.9, 2.0, .06, doorM); dp.position.x = .45; door.add(dp); door.position.set(1.15, 0, -2.08); scene.add(door);
  const doorLight = new THREE.PointLight('#fff0d8', 0, 4, 1.4); doorLight.position.set(1.6, 1.2, -1.8); scene.add(doorLight);
  // sofa
  const sofaM = mat(sofaTex());
  const seat = box(1.9, .42, .85, sofaM); seat.position.set(-.1, 0, -1.2); scene.add(seat);
  const backr = box(1.9, .45, .22, sofaM); backr.position.set(-.1, .42, -1.55); scene.add(backr);
  for (const x of [-1.1, .9]) { const a = box(.18, .6, .85, sofaM); a.position.set(x, 0, -1.2); scene.add(a); }
  // the coffee table she pulls herself up on, the rug, her toys (only while she is little)
  const tabM = new THREE.MeshStandardMaterial({ color: '#7a5634', roughness: .7 });
  const top = box(.7, .05, .42, tabM); top.position.set(.6, .3, .35); scene.add(top);
  for (const [x, z] of [[.28, .17], [.92, .17], [.28, .53], [.92, .53]]) { const l = box(.05, .3, .05, tabM); l.position.set(x, 0, z); scene.add(l); }
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.3), mat(rugTex())); rug.rotation.x = -Math.PI / 2; rug.position.set(.05, .005, -.1); scene.add(rug);
  const toys = new THREE.Group(); ['#d84a3a', '#3a7ad8', '#e8c040', '#4ab070'].forEach((c, i) => { const b = box(.08, .08, .08, new THREE.MeshStandardMaterial({ color: c, roughness: .9 })); b.position.set(-.55 + i * .1 + h2(i, 1, 2) * .05, 0, .25 - h2(i, 2, 2) * .12); b.rotation.y = i * .7; toys.add(b); }); scene.add(toys);
  const bag = box(.22, .26, .1, new THREE.MeshStandardMaterial({ color: '#c84a6a', roughness: .9 })); bag.position.set(.62, 0, -.95); bag.rotation.y = -.3; scene.add(bag);
  // lights
  const hemi = new THREE.HemisphereLight('#c0b8d0', '#2a1c14', 1.5); scene.add(hemi);
  const lamp = new THREE.PointLight('#ffcf90', 3.5, 6, 1.5); lamp.position.set(-1.3, 1.9, -.9); scene.add(lamp);
  const lampG = glow('#ffc070', .3, .9); lampG.position.copy(lamp.position); scene.add(lampG);
  const fill = new THREE.PointLight('#e8e0f0', 2.2, 7, 1.5); fill.position.set(.6, 1.8, 2.4); scene.add(fill);
  const phoneL = new THREE.PointLight('#8fc0ff', .8, 1.3, 2); scene.add(phoneL);

  // him: four ages of beard, the last one greying
  const HF = { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, look: { pose: 'look' } };
  const heroes = [0, 1, 3, 5].map((b, i) => makePerson({ top: 'red', bottom: 'grey', hair: i === 3 ? 'hairGrey' : 'hairDark', beard: b || undefined, shoe: 'sneaker' }, HF));
  heroes.forEach(h => { h.root.position.set(-.3, .02, -1.05); h.shadow.visible = false; scene.add(h.root); });
  // her: same purple at every age (one, six, twelve, eighteen), scaled to her height
  const PUSH = { p0: { pose: 'push', step: 0 }, p1: { pose: 'push', step: 1, bob: -1 }, p2: { pose: 'push', step: 2 }, p3: { pose: 'push', step: 3, bob: -1 } };
  const baby = makePerson({ top: 'purple', bottom: 'purple', hair: 'hairBrown', small: 3, shoe: 'sneaker' }, { hold: { pose: 'stand' }, reach: { pose: 'wave', mouth: 1 }, ...PUSH });
  const six = makePerson({ dress: 1, top: 'purple', hair: 'hairBrown', hairStyle: 'long', hairUp: 1, shoe: 'shoe' }, { talk: { pose: 'talk', mouth: 1, smile: 1 }, show: { pose: 'talk', smile: 1 }, stand: { pose: 'stand' } });
  const twelve = makePerson({ top: 'purple', bottom: 'jean', hair: 'hairBrown', hairStyle: 'long', shoe: 'sneaker' }, { talk: { pose: 'talk', mouth: 1 }, stand: { pose: 'stand' }, ...WALK });
  const adult = makePerson({ top: 'purple', bottom: 'jean', hair: 'hairBrown', hairStyle: 'long', hairUp: 1, shoe: 'sneaker' }, { stand: { pose: 'stand' }, wave: { pose: 'wave', mouth: 1 }, ...WALK });
  const ages = [[baby, .42], [six, .6], [twelve, .8], [adult, .97]];
  ages.forEach(([p, s]) => { p.root.scale.setScalar(s); scene.add(p.root); });
  // her drawing (held up at six) and her suitcase (at eighteen): children of her root, so they follow and scale
  const drawing = new THREE.Mesh(new THREE.PlaneGeometry(30 * SPX * .75, 22 * SPX * .75), new THREE.MeshBasicMaterial({ map: texOf(drawingTex()), color: '#b8b4ac', side: THREE.DoubleSide }));
  six.root.add(drawing);
  // her travel bag at eighteen, carried at her side (hip height, so it reads above the dialogue box)
  const caseM = new THREE.MeshStandardMaterial({ color: '#a8743e', roughness: .55 }), suitcase = new THREE.Group();
  const cb = new THREE.Mesh(new THREE.BoxGeometry(.5, .3, .24), caseM); cb.position.y = .6; suitcase.add(cb);
  const strapM = new THREE.MeshStandardMaterial({ color: '#3a2414', roughness: .8 });
  for (const x of [-.12, .12]) { const st = new THREE.Mesh(new THREE.BoxGeometry(.03, .16, .03), strapM); st.position.set(x, .8, 0); suitcase.add(st); }
  const grip = new THREE.Mesh(new THREE.BoxGeometry(.27, .03, .03), strapM); grip.position.set(0, .88, 0); suitcase.add(grip);
  scene.add(suitcase);
  // mum, kneeling, arms out: she catches her
  const mum = makePerson({ top: 'mustard', bottom: 'jean', hair: 'hairBrown', hairStyle: 'long', hairUp: 1, shoe: 'shoe' }, { kneel: { pose: 'kneel', open: 1, smile: 1 } });
  mum.root.position.set(.5, 0, -.42); scene.add(mum.root);
  const _v = new THREE.Vector3();
  const shot = (cam, p, l, fov) => { cam.position.set(...p); cam.lookAt(...l); cam.fov = fov; cam.updateProjectionMatrix(); };

  function update(t, _shot, cam, post, renderer) {
    const ph = phaseAt(t), jp = ph >= 1 && ph <= 3 ? JUMPS[ph - 1] : 0;
    // camera: low and close on the first steps; a wider room for the years; dive in on him when he looks up
    if (ph === 0) { const u = eio(seg(t, 0, JUMPS[0])); shot(cam, [lerp(.08, .02, u), lerp(.98, .95, u), lerp(2.45, 2.15, u)], [-.05, .68, -.45], 50); }
    else if (ph < 4) { const u = eio(seg(t, jp, jp + 2.8)), lx = ph === 3 ? lerp(.05, .5, eio(seg(t, T.pack - .4, T.out))) : .05; shot(cam, [lerp(.3, .22, u) + lx * .4, lerp(1.08, 1.04, u), lerp(3.0, 2.8, u)], [lx, .8, -.9], 52); }
    else { const u = eio(seg(t, T.up, T.up + 1.8)); shot(cam, [lerp(.25, .05, u), lerp(1.04, 1.0, u), lerp(2.8, 1.55, u)], [lerp(.05, -.25, u), lerp(.8, .9, u), -1.05], lerp(52, 50, u)); }
    // light and sky per age
    winM.color.set(SKY[ph]); winL.intensity = [0, 2.5, 2.2, 1.2, 0][ph]; winL.color.set(ph === 3 ? '#ffb080' : '#c8d8ff');
    lamp.intensity = [3.5, 1.2, 1.4, 2.8, 1.6][ph]; lampG.visible = ph === 0 || ph >= 3;
    hemi.intensity = [1.5, 1.9, 1.8, 1.4, 1.0][ph];
    toys.visible = ph === 0; bag.visible = ph === 1;
    door.rotation.y = -1.3 * ss(seg(t, T.door, T.door + .4)) * (1 - ss(seg(t, T.shut - .3, T.shut))); doorLight.intensity = 3 * ss(seg(t, T.door, T.door + .4)) * (1 - ss(seg(t, T.shut - .3, T.shut)));
    // him
    heroes.forEach((h, i) => { h.root.visible = i === Math.min(ph, 3); });
    const H = heroes[Math.min(ph, 3)];
    H.frame(ph === 4 ? 'look' : (t % 3.1 < .1 ? 'blink' : 'phone')); H.face(cam);
    phoneL.position.copy(H.local(25, 18)).add(_v.set(.2, .05, .2)); phoneL.intensity = ph === 4 ? .25 : .8;
    // her
    ages.forEach(([p]) => { p.root.visible = false; });
    suitcase.visible = false; drawing.visible = false; mum.root.visible = ph === 0;
    if (ph === 0) {
      mum.frame('kneel'); mum.face(cam, true);
      const A = [.2, .3], B = [-.08, -.58], C = [.3, -.4], W4 = () => ['p0', 'p1', 'p2', 'p3'][Math.floor(t * 3.4) % 4];
      let x, z, f, flip;
      if (t < T.go) { [x, z] = A; f = 'hold'; flip = true; }
      else if (t < T.arrive) { const k = seg(t, T.go, T.arrive); x = lerp(A[0], B[0], k); z = lerp(A[1], B[1], k); f = W4(); flip = true; }
      else if (t < T.turn) { [x, z] = B; f = 'reach'; flip = true; }
      else if (t < T.hug) { const k = seg(t, T.turn, T.hug); x = lerp(B[0], C[0], k); z = lerp(B[1], C[1], k); f = W4(); flip = false; }
      else { [x, z] = C; f = 'p0'; flip = false; }
      baby.root.visible = true; baby.root.position.set(x, 0, z); baby.frame(f); baby.face(cam, flip);
    } else if (ph === 1) {
      six.root.visible = true; six.root.position.set(.22, 0, -.72); six.frame(Math.floor(t * 3) % 2 && t < 8.3 ? 'talk' : 'show'); six.face(cam, true);
      drawing.visible = true; drawing.position.set(-(28 - 17) * SPX, (50 - 24) * SPX, .08);
    } else if (ph === 2) {
      let x = .2, f = Math.floor(t * 3) % 2 && t < 10.2 ? 'talk' : 'stand', flip = true;
      if (t >= T.away) { const k = seg(t, T.away, T.away + 1.0); x = lerp(.2, 1.9, k); f = walkFrame(t); flip = false; }
      twelve.root.visible = x < 1.8; twelve.root.position.set(x, 0, -.72); twelve.frame(f); twelve.face(cam, flip);
    } else if (ph === 3) {
      let x = .28, z = -.75, f = t >= 12.0 && t < 13.2 ? 'wave' : 'stand', flip = true, vis = true;
      if (t >= T.pack) { const k = seg(t, T.pack, T.out); x = lerp(.28, 1.62, k); z = lerp(-.75, -2.0, k); f = walkFrame(t); flip = false; vis = t < T.out; }
      adult.root.visible = vis; adult.root.position.set(x, 0, z); adult.frame(f); adult.face(cam, flip);
      suitcase.visible = vis; suitcase.position.set(x + (flip ? .24 : -.24), 0, z + .08); suitcase.rotation.y = adult.root.rotation.y;
    }
    post.dof.focus = cam.position.distanceTo(_v.set(ph === 4 ? -.3 : -.05, .8, ph === 4 ? -1.05 : -.6)); post.dof.aper = ph === 4 ? 14 : 10; post.dof.maxCoc = 8;
    renderer.toneMappingExposure = ph === 4 ? 1.05 : 1.2; post.bloom.strength = .4; post.bloom.threshold = .85;
  }
  return { scene, update };
}
