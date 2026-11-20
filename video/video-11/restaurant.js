// She said yes: a restaurant at night. She's on one knee with a ring; he's on his phone. The waiter is not.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard, woodPlanks, plaster } from './px.js';
import { mat, mesh, box } from './kit.js';
import { flick } from './fx.js';
import { makePerson, WALK, walkFrame } from './people.js';
import { T } from './story.js';
import { seg, ss, clamp, lerp, eio, eo } from '/core/lib.js';

function cloth() { const P = new PX(48, 24), R = ramp(['#5a5448', '#7a7262', '#9a927e', '#b4ac96'], .45); P.fill((x, y) => R(.6 + ((x + y) % 6 === 0 ? -.12 : 0) + (h2(x, y, 5) - .5) * .12, x, y)); return P.done(); }
function wallp() { const P = new PX(96, 96), R = ramp(['#2a1418', '#3e1e22', '#52282c', '#663438'], .45); P.fill((x, y) => R(.45 + ((y % 16) < 1 ? .3 : 0) + (x % 24 < 1 ? .2 : 0) + (h2(x, y, 3) - .5) * .12, x, y)); return P.done(); }
function billTex() { const P = new PX(10, 16); P.fill((x, y) => (x === 0 || x === 9 || y === 0 || y === 15) ? [150, 146, 138] : [236, 232, 222]); for (let y = 3; y < 13; y += 2) for (let x = 2; x < 8; x++) if (h2(x, y, 2) > .3) P.set(x, y, [90, 86, 80]); return texOf(P.done()); }

export function buildRestaurant() {
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2('#1a1012', .02); scene.background = new THREE.Color('#06040a');
  scene.add(mesh(new THREE.BoxGeometry(9, .2, 7).translate(0, -.1, -.8), mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 9, cols: ['#1a100c', '#2e1d14', '#452a1b', '#5c3a24', '#74492b'] }))));
  const wm = mat(wallp()); const bw = box(9, 3.2, .2, wm); bw.position.set(0, 0, -3.4); scene.add(bw);
  // window with the night city
  const win = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.4), new THREE.MeshBasicMaterial({ color: '#0e1630', fog: false })); win.position.set(1.4, 1.7, -3.28); scene.add(win);
  for (let i = 0; i < 14; i++) { const g = glow(i % 3 ? '#ffc070' : '#c8d8ff', .08, 1.4); g.position.set(.3 + h2(i, 1, 3) * 2.2, 1.1 + h2(i, 2, 3) * 1.2, -3.27); scene.add(g); }
  const woodM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 6, nails: false, cols: ['#1e140e', '#33231a', '#4a3424', '#5e4430'] }));
  const table = (x, z) => { const g = new THREE.Group(); const t = box(1.0, .05, .8, mat(cloth())); t.position.y = .74; g.add(t); const l = box(.08, .74, .08, woodM); g.add(l); g.position.set(x, 0, z); scene.add(g); return g; };
  table(0, 0); table(-2.6, -2.0); table(2.6, -2.0);
  const chair = (x, z) => { const g = new THREE.Group(); const s = box(.42, .05, .42, woodM); s.position.y = .45; g.add(s); const b = box(.05, .5, .42, woodM); b.position.set(-.2, .48, 0); g.add(b); g.position.set(x, 0, z); scene.add(g); };
  chair(-.75, 0);
  // candles
  const cands = [[0, .78, 0], [-2.6, .78, -2.0], [2.6, .78, -2.0]].map(([x, y, z]) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .14, 8), new THREE.MeshStandardMaterial({ color: '#f0e8d0' })); c.position.set(x, y + .07, z); scene.add(c); const L = new THREE.PointLight('#ffb050', .9, 2.6, 1.8); L.position.set(x, y + .25, z + .1); scene.add(L); const g = glow('#ffc070', .2, 1.2); g.position.set(x, y + .18, z); scene.add(g); return { L, g }; });
  const hemi = new THREE.HemisphereLight('#a07a6a', '#2a1610', 1.2); scene.add(hemi);
  const pend = new THREE.PointLight('#ffc888', 7, 7, 1.4); pend.position.set(0, 2.4, .1); pend.castShadow = true; pend.shadow.mapSize.set(1024, 1024); pend.shadow.bias = -.003; scene.add(pend);
  const fill = new THREE.PointLight('#f0d8d0', 2.4, 7, 1.6); fill.position.set(.7, 1.5, 2.2); scene.add(fill);
  // people
  const hero = makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark' }, { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, look: { pose: 'look' } });
  hero.root.position.set(-.7, 0, .05); hero.root.userData.char = 'hero'; hero.shadow.visible = false; scene.add(hero.root);
  const heroL = new THREE.PointLight('#8fc0ff', .8, 1.3, 2); scene.add(heroL);
  const her = makePerson({ dress: 1, top: 'mustard', hair: 'hairBrown', hairStyle: 'long', shoe: 'shoe' }, { kneel: { pose: 'kneel' }, kneel2: { pose: 'kneel', blink: 1 }, stand: { pose: 'stand' }, talk: { pose: 'talk', mouth: 1 }, ...WALK });
  her.root.position.set(.25, 0, .55); scene.add(her.root);
  const ringG = glow('#fff2c8', .2, 3); scene.add(ringG);
  const waiter = makePerson({ top: 'black', bottom: 'black', suit: 1, hair: 'hairDark', shoe: 'shoe' }, { stand: { pose: 'stand' }, talk: { pose: 'talk', mouth: 1 }, ...WALK });
  scene.add(waiter.root);
  // diners in the back
  const dinerF = { sit: { pose: 'sit' }, talk: { pose: 'sittalk', mouth: 1 }, clap: { pose: 'wave', mouth: 1 } };
  const diners = [[-3.1, -2.0, false, 'teal', 'hairBlond'], [-2.1, -2.0, true, 'mustard', 'hairDark'], [2.1, -2.0, false, 'purple', 'hairGrey'], [3.1, -2.0, true, 'green', 'hairBrown']].map(([x, z, flip, top, hair]) => { const d = makePerson({ top, bottom: 'navy', hair, shoe: 'shoe' }, dinerF); d.root.position.set(x, 0, z); d.shadow.visible = false; scene.add(d.root); return { d, flip }; });
  const bill = new THREE.Mesh(new THREE.PlaneGeometry(.16, .25), new THREE.MeshStandardMaterial({ map: billTex(), roughness: .9 })); bill.visible = false; scene.add(bill);
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    // cameras
    if (t < T.waiter) { const u = seg(t, 0, T.waiter); cam.position.set(lerp(1.5, 1.3, u), lerp(1.75, 1.7, u), lerp(3.6, 3.3, u)); cam.lookAt(-.2, .72, .25); cam.fov = 44; }
    else if (t < T.leave) { const u = seg(t, T.waiter, T.leave); cam.position.set(lerp(1.6, 1.3, u), lerp(2.2, 2.1, u), lerp(3.4, 3.1, u)); cam.lookAt(.2, .95, .2); cam.fov = 48; }
    else if (t < T.bill) { const u = seg(t, T.leave, T.bill); cam.position.set(lerp(1.4, 2.0, u), lerp(2.6, 3.0, u), lerp(4.4, 4.9, u)); cam.lookAt(1.0, .8, -.6); cam.fov = 50; }
    else { const u = eio(seg(t, T.bill, T.bill + 1.2)); cam.position.set(lerp(.6, .3, u), lerp(1.7, 1.55, u), lerp(1.9, 1.6, u)); cam.lookAt(-.55, .95, .0); cam.fov = 44; }
    cam.updateProjectionMatrix();
    // him
    hero.frame(t >= T.lookUp ? 'look' : (t % 2.9 < .1 ? 'blink' : 'phone')); hero.face(cam);
    heroL.position.copy(hero.local(25, 18)).add(_v.set(.2, .05, .2)); heroL.intensity = t < T.lookUp ? .8 : .2;
    // her: kneeling → standing (waiter's hand) → asks HIM → they leave together
    let hx = .25, hframe = t % 3.3 < .1 ? 'kneel2' : 'kneel', hflip = true;
    if (t >= T.stand) { hframe = (t >= 8.7 && t < 10.9 && Math.floor(t * 3) % 2) ? 'talk' : 'stand'; hflip = false; }
    if (t >= T.leave) { const u = seg(t, T.leave, 14.6); hx = lerp(.25, 4.2, u); hframe = walkFrame(t); hflip = false; }
    her.root.position.set(hx, 0, .55); her.frame(hframe); her.face(cam, hflip);
    ringG.visible = t < T.leave; if (t < T.stand) ringG.position.copy(her.local(31, 14)); else ringG.position.copy(her.local(24, 30));
    ringG.scale.setScalar(.2 * (1 + .3 * Math.sin(t * 7)));
    // waiter: walks in, helps her up, says yes, leaves with her
    let wx = 3.4, wframe = 'stand', wflip = true; waiter.root.visible = t >= T.waiter - .6;
    if (t < T.stand) { wx = lerp(3.4, 1.05, seg(t, T.waiter - .6, T.stand)); wframe = walkFrame(t); }
    else if (t < T.leave) { wx = 1.05; wframe = ((t >= 6.0 && t < 8.5) || (t >= 11.0 && t < 12.8)) && Math.floor(t * 3) % 2 ? 'talk' : 'stand'; }
    else { wx = lerp(1.05, 4.6, seg(t, T.leave, 14.6)); wframe = walkFrame(t + .2); wflip = false; }
    waiter.root.position.set(wx, 0, .7); waiter.frame(wframe); waiter.face(cam, wflip);
    // the room: talking, then clapping when she says yes
    diners.forEach(({ d, flip }, i) => { const clap = t >= 11.2 && t < 14.6; d.frame(clap ? (Math.floor(t * 5 + i) % 2 ? 'clap' : 'sit') : (Math.floor(t * 1.3 + i) % 3 === 0 ? 'talk' : 'sit')); d.face(cam, flip); });
    // the bill
    bill.visible = t >= T.bill; const bu = eo(seg(t, T.bill, T.bill + .35)); bill.position.set(-.25, lerp(1.4, .775, bu), .1); bill.rotation.set(-Math.PI / 2, 0, .3);
    cands.forEach((c, i) => { const k = flick(t, i * 2.1); c.L.intensity = .9 * k; c.g.scale.setScalar(.2 * k); });
    post.dof.focus = cam.position.distanceTo(t < T.leave ? her.root.position.clone().setY(.9) : t < T.bill ? her.root.position.clone().setY(1.2) : hero.root.position.clone().setY(1)); post.dof.aper = 90; post.dof.maxCoc = 14;
    renderer.toneMappingExposure = 1.35; post.bloom.strength = .5; post.bloom.threshold = .85;
  }
  return { scene, update, hero };
}
