// Fetch: a living room. His dog drops a ball at his feet and waits; he scrolls. The years go by, the dog grows up,
// grows old, lies down by the ball… and one day there is only the ball.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson } from './people.js';
import { T, TICKS, stageAt } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

function wallTex() { const P = new PX(64, 64), R = ramp(['#3a3236', '#4a4046', '#5a4e56', '#6a5e66'], .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, 5) - .5) * .25 + (h2(x, y, 5) - .5) * .1, x, y)); return P.done(); }
function sofaTex() { const P = new PX(32, 16), R = ramp(['#1a2430', '#243444', '#304a5e', '#3e5e74'], .45); P.fill((x, y) => R(.5 + (h2(x, y, 8) - .5) * .3 + ((x % 8) === 0 ? -.2 : 0), x, y)); return P.done(); }
function rugTex() { const P = new PX(48, 36), R = ramp(['#3a2420', '#5a3428', '#7a4a34', '#9a6448'], .45); P.fill((x, y) => { const b = x < 3 || y < 3 || x > 44 || y > 32; return R(b ? .8 : .45 + ((x >> 2) + (y >> 2)) % 2 * .1 + (h2(x, y, 7) - .5) * .2, x, y); }); return P.done(); }
// the dog: 34 x 26 px, golden; age 0..1 greys the muzzle and the coat; pose 'sit' | 'lie'; wag 0/1; sleep closes the eyes
function dogTex(age, pose, wag, sleep = 0) {
  const P = new PX(34, 26), C = ramp(['#4a2e14', '#7a4e24', '#b07a3e', '#d8a868'].map((c, i) => c), .45), G = ramp(['#6a6460', '#9a948e', '#c8c2bc', '#ecE8e4'], .45);
  const coat = (v, x, y) => { const c = C(v, x, y); return c.map((k, i) => Math.round(k * (1 - .35 * age) + 200 * .35 * age)); };
  const grey = (x, y, v) => age > .3 ? G(v, x, y) : coat(v + .25, x, y);
  if (pose === 'sit') {
    P.fill((x, y) => { const body = Math.hypot((x - 14) / 7.5, (y - 16) / 7) < 1, chest = Math.hypot((x - 19) / 4, (y - 13) / 5) < 1, head = Math.hypot((x - 22) / 4.6, (y - 7) / 4.2) < 1, snout = x >= 24 && x <= 29 && y >= 7 && y <= 10;
      if (snout) return grey(x, y, .7 - (y - 7) * .06); if (head || chest || body) return coat(.75 - (y - 6) * .02 - (x < 12 ? .15 : 0), x, y); return null; });
    for (const lx of [18, 21]) for (let y = 18; y < 25; y++) { P.set(lx, y, coat(.55, lx, y)); P.set(lx + 1, y, coat(.45, lx, y)); }
    for (let x = 8; x < 16; x++) P.set(x, 23, coat(.4, x, 23));
    const ty = wag ? -1 : 1; for (let i = 0; i < 6; i++) P.set(6 - Math.floor(i * .6), 17 + Math.round(ty * i * .9), coat(.6, i, 0));
    for (let y = 4; y < 10; y++) P.set(19, y, coat(.35, 19, y)); P.set(20, 9, coat(.35, 20, 9));   // ear
    P.set(29, 8, [24, 16, 14]); if (sleep) { P.set(23, 6, [60, 40, 30]); P.set(24, 6, [60, 40, 30]); } else P.set(24, 6, [20, 14, 12]);
    if (age > .3) { P.set(23, 5, G(.9, 0, 0)); P.set(25, 5, G(.9, 0, 0)); }
  } else {
    P.fill((x, y) => { const body = Math.hypot((x - 14) / 10, (y - 19) / 4.2) < 1, head = Math.hypot((x - 26) / 4.4, (y - 16) / 3.8) < 1, snout = x >= 28 && x <= 33 && y >= 17 && y <= 20;
      if (snout) return grey(x, y, .7 - (y - 17) * .06); if (head || body) return coat(.72 - (y - 14) * .03, x, y); return null; });
    for (let x = 26; x < 33; x++) { P.set(x, 22, coat(.5, x, 22)); P.set(x, 23, coat(.42, x, 23)); }
    const tx = wag ? -1 : 0; for (let i = 0; i < 6; i++) P.set(3 - i + tx, 20 + (wag ? -Math.floor(i * .4) : 0), coat(.6, i, 0));
    for (let y = 13; y < 19; y++) P.set(24, y, coat(.35, 24, y));
    P.set(33, 18, [24, 16, 14]); if (sleep) { P.set(27, 15, [60, 40, 30]); P.set(28, 15, [60, 40, 30]); } else P.set(28, 15, [20, 14, 12]);
    if (age > .3) { P.set(27, 14, G(.9, 0, 0)); P.set(29, 14, G(.9, 0, 0)); }
  }
  P.outline(.3); return texOf(P.done());
}

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#06060a');
  scene.add(mesh(new THREE.BoxGeometry(7, .2, 6).translate(0, -.1, 0), mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 4, cols: ['#2a1c14', '#40291c', '#583a26', '#704c32', '#8a603e'] }))));
  const wM = mat(wallTex());
  const back = box(7, 3, .2, wM); back.position.set(0, 0, -2.2); scene.add(back);
  const left = box(.2, 3, 6, wM); left.position.set(-2.4, 0, 0); scene.add(left);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.8), mat(rugTex())); rug.rotation.x = -Math.PI / 2; rug.position.set(0, .005, -.2); rug.receiveShadow = true; scene.add(rug);
  const skyM = new THREE.MeshBasicMaterial({ color: '#8ab0d8', fog: false }), sky = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), skyM); sky.position.set(.6, 1.75, -2.09); scene.add(sky);
  const fM = new THREE.MeshStandardMaterial({ color: '#d8d0c4', roughness: .8 });
  for (const [w, h, x, y] of [[1.7, .06, .6, 2.38], [1.7, .06, .6, 1.12], [.06, 1.3, -.22, 1.75], [.06, 1.3, 1.42, 1.75], [.04, 1.2, .6, 1.75]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .06), fM); b.position.set(x, y, -2.06); scene.add(b); }
  const treeM = new THREE.MeshBasicMaterial({ color: '#3a6a34' }), tree = new THREE.Mesh(new THREE.CircleGeometry(.45, 12), treeM); tree.position.set(.9, 1.6, -2.085); scene.add(tree);
  const sofaM = mat(sofaTex());
  const seat = box(2.0, .42, .85, sofaM); seat.position.set(-.3, 0, -1.2); scene.add(seat);
  const backr = box(2.0, .45, .22, sofaM); backr.position.set(-.3, .42, -1.55); scene.add(backr);
  for (const x of [-1.35, .75]) { const a = box(.2, .6, .85, sofaM); a.position.set(x, 0, -1.2); scene.add(a); }
  const woodM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 6, nails: false, cols: ['#2e1e14', '#4a3222', '#644630', '#7e5a3c'] }));
  const shelf = box(.8, 1.6, .3, woodM); shelf.position.set(1.9, 0, -2.0); scene.add(shelf);
  const lampP = box(.05, 1.4, .05, new THREE.MeshStandardMaterial({ color: '#202024' })); lampP.position.set(1.2, 0, -1.6); scene.add(lampP);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(.14, .22, .25, 10), new THREE.MeshStandardMaterial({ color: '#e8d0a0', emissive: '#ffb860', emissiveIntensity: .6 })); shade.position.set(1.2, 1.5, -1.6); scene.add(shade);
  const lamp = new THREE.PointLight('#ffb870', 3, 6, 1.5); lamp.position.set(1.2, 1.45, -1.4); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -.003; scene.add(lamp);
  const hemi = new THREE.HemisphereLight('#b0b8d0', '#2a1a14', 1.5); scene.add(hemi);
  const fill = new THREE.PointLight('#e0d8f0', 2.4, 7, 1.6); fill.position.set(.6, 1.8, 2.2); scene.add(fill);
  const win = new THREE.PointLight('#dfe8ff', 2.0, 6, 1.4); win.position.set(.6, 1.8, -1.6); scene.add(win);
  // the dog bed, the ball
  const bed = new THREE.Mesh(new THREE.CylinderGeometry(.42, .46, .12, 18), new THREE.MeshStandardMaterial({ color: '#6a3a3a', roughness: 1 })); bed.scale.z = .7; bed.position.set(.75, .06, -.35); bed.castShadow = bed.receiveShadow = true; scene.add(bed);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(.065, 12, 10), new THREE.MeshStandardMaterial({ color: '#c8d040', roughness: .7 })); ball.castShadow = true; scene.add(ball);
  // the dog at every age
  const DOG = []; for (const [age, pose, sleep] of [[0, 'sit', 0], [0, 'sit', 0], [.2, 'sit', 0], [.6, 'lie', 0], [1, 'lie', 1]]) DOG.push([dogTex(age, pose, 0, sleep), dogTex(age, pose, 1, sleep)]);
  const dog = billboard(DOG[0][0], 34 / 30 * .85, 26 / 30 * .85); scene.add(dog);
  const dogL = new THREE.PointLight('#fff0dc', 1.6, 2.5, 1.6); dogL.position.set(.5, .9, .6); scene.add(dogL);
  // him
  const H = { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, look: { pose: 'look' } };
  const hero = makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark' }, H), heroB = makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark', beard: 1 }, H);
  for (const h of [hero, heroB]) { h.root.position.set(-.45, .02, -1.05); h.shadow.visible = false; scene.add(h.root); }
  const phoneL = new THREE.PointLight('#8fc0ff', .9, 1.4, 2); scene.add(phoneL);
  const _v = new THREE.Vector3(), cA = new THREE.Color();

  function update(t, shot, cam, post, renderer) {
    const st = stageAt(t);
    // camera: the sofa, the dog and the ball; at the end, close on him and the empty bed
    if (t < T.up) { const u = eio(seg(t, 0, T.up)); cam.position.set(lerp(.7, .55, u), lerp(1.3, 1.2, u), lerp(3.0, 2.5, u)); cam.lookAt(lerp(.05, .1, u), lerp(.62, .58, u), -.8); cam.fov = 50; }
    else { const u = eo(seg(t, T.up, T.up + 1.2)); cam.position.set(lerp(.55, .45, u), lerp(1.2, 1.1, u), lerp(2.5, 2.0, u)); cam.lookAt(lerp(.1, .1, u), lerp(.58, .55, u), -.8); cam.fov = 50; }
    cam.updateProjectionMatrix();
    // seasons in the window: one per tick
    skyM.color.set(['#8ab0d8', '#9ac0e8', '#c89a6a', '#a8b0c0', '#8ab0d8', '#c8a07a'][st]); treeM.color.set(['#4a8a3e', '#3a6a34', '#c0702a', '#e0e4ea', '#5a9a46', '#b06a2a'][st]);
    // the dog: sits and wags, then lies by the ball, then sleeps in the bed, then is gone
    const wagRate = [9, 6, 3.5, 1.6, .6][Math.min(st, 4)], wag = Math.floor(t * wagRate) % 2;
    dog.visible = st < 5;
    if (dog.visible) {
      dog.material.map = DOG[st][wag];
      const sc = st === 0 ? .7 : 1; dog.scale.set(-sc, sc, 1);
      const pos = [[.35, -.35], [.45, -.35], [.45, -.35], [.3, -.45], [.75, -.35]][st]; dog.position.set(pos[0], st === 4 ? .12 : 0, pos[1]);
      dog.lookAt(cam.position.x, dog.position.y, cam.position.z);
    }
    ball.position.set(st >= 3 ? .05 : -.02, .065 + (st === 0 && wag ? .015 : 0), st >= 3 ? -.4 : -.5);
    // him
    const Hh = st >= 3 ? heroB : hero; hero.root.visible = Hh === hero; heroB.root.visible = Hh === heroB;
    Hh.frame(t >= T.up ? 'look' : (t % 2.9 < .1 ? 'blink' : 'phone')); Hh.face(cam); phoneL.position.copy(Hh.local(25, 18)).add(_v.set(.2, .05, .2)); phoneL.intensity = t < T.up ? .9 : .2;
    post.dof.focus = cam.position.distanceTo(_v.set(0, .5, -.7)); post.dof.aper = 40; post.dof.maxCoc = 12;
    renderer.toneMappingExposure = 1.2; post.bloom.strength = .35; post.bloom.threshold = .88;
  }
  return { scene, update };
}
