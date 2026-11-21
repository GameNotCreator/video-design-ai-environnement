// Class of…: a lecture hall. Every year a class sits down, studies, throws its caps and leaves; he stays in the same
// seat on his phone and grows a beard, then grey hair. Forty-one years later a freshman sits next to him.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson, WALK, walkFrame } from './people.js';
import { T, TICKS, ageAt } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

function wallTex(cols, s) { const P = new PX(64, 64), R = ramp(cols, .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, s) - .5) * .25 + (h2(x, y, s) - .5) * .1, x, y)); return P.done(); }
function boardTex() { const P = new PX(96, 40), R = ramp(['#141c18', '#1c2822', '#24342c', '#2e4036'], .45); P.fill((x, y) => R(.5 + (fbm(x * .1, y * .2, 4) - .5) * .4, x, y)); for (let y = 6; y < 34; y += 6) for (let x = 8; x < 88; x++) if (h2(x, y, 9) > .35 && (x % 23) < 18) P.set(x, y, [176, 184, 178]); for (let x = 0; x < 96; x++) { P.set(x, 0, [90, 64, 40]); P.set(x, 39, [90, 64, 40]); } return P.done(); }
function capTex() { const P = new PX(12, 7); for (let x = 0; x < 12; x++) for (let y = 0; y < 3; y++) if (Math.abs(x - 5.5) < 6 - y * 1.5 + 1.5) P.set(x, y + 1, y === 0 ? [60, 60, 70] : [24, 24, 30]); for (let x = 3; x < 9; x++) for (let y = 3; y < 6; y++) P.set(x, y, [20, 20, 26]); P.set(10, 2, [220, 180, 70]); P.set(10, 3, [220, 180, 70]); P.set(10, 4, [200, 160, 60]); P.outline(.3); return texOf(P.done()); }

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#202020');
  scene.add(mesh(new THREE.BoxGeometry(11, .2, 9).translate(0, -.1, -1), mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 12, cols: ['#2a1e16', '#40301f', '#58422c', '#6e5638', '#86704a'] }))));
  const hW = mat(wallTex(['#4a4840', '#5e5a50', '#726e62', '#888476'], 7));
  const hb = box(11, 3.8, .2, hW); hb.position.set(0, 0, -4.6); scene.add(hb);
  const hl = box(.2, 3.8, 9, hW); hl.position.set(-5.0, 0, -1); scene.add(hl);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.6), mat(boardTex())); board.position.set(.6, 2.0, -4.49); scene.add(board);
  for (let i = 0; i < 3; i++) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.6), new THREE.MeshBasicMaterial({ color: '#dfe8f0', fog: false })); w.position.set(-4.89, 2.0, -3.4 + i * 2); w.rotation.y = Math.PI / 2; scene.add(w); }
  const sun = new THREE.DirectionalLight('#fff0dc', 2.2); sun.position.set(-6, 5, 1); sun.target.position.set(0, 0, -1); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 }); sun.shadow.bias = -.002; scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight('#d8e0f0', '#6a5a4a', 2.0));
  const fill = new THREE.PointLight('#f0e8e0', 2.0, 8, 1.6); fill.position.set(1.5, 2.2, 2.0); scene.add(fill);
  const phoneL = new THREE.PointLight('#8fc0ff', .8, 1.3, 2); scene.add(phoneL);
  // desks: 3 rows x 4 columns
  const deskM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 8, nails: false, cols: ['#3a2a1c', '#56402a', '#705838', '#8a7048'] }));
  const seats = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const x = -3.4 + c * 1.75, z = -3.3 + r * 1.55;
    const d = box(.75, .05, .5, deskM); d.position.set(x + .55, .7, z); scene.add(d); const dl = box(.06, .7, .06, deskM); dl.position.set(x + .55, 0, z); scene.add(dl);
    const seat = box(.4, .05, .4, deskM); seat.position.set(x - .05, .42, z); scene.add(seat);
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(.2, .28), new THREE.MeshStandardMaterial({ color: '#ece8dc', roughness: .95 })); paper.rotation.set(-Math.PI / 2, 0, -.15); paper.position.set(x + .5, .73, z); scene.add(paper);
    seats.push({ x, z, r, c, hero: r === 2 && c === 1, newbie: false });
  }
  // four classes take turns in the same seats
  const TOPS = ['teal', 'mustard', 'navy', 'green', 'purple', 'grey', 'beige', 'black'], HAIRS = ['hairBlond', 'hairBrown', 'hairDark', 'hairBrown', 'hairBlond'];
  const SF = { w0: { pose: 'write', step: 0 }, w1: { pose: 'write', step: 1 }, cheer: { pose: 'wave', mouth: 1 }, ...WALK };
  const others = seats.filter(s => !s.hero);
  const classes = [0, 1, 2, 3].map(k => others.map((s, i) => { const p = makePerson({ top: TOPS[(i * 3 + k * 5) % TOPS.length], bottom: k % 2 ? 'jean' : 'navy', hair: HAIRS[(i + k * 2) % HAIRS.length], hairStyle: (i + k) % 3 === 0 ? 'long' : 'short', shoe: 'shoe' }, SF); p.root.position.set(s.x, 0, s.z - .02); p.shadow.visible = false; scene.add(p.root); return p; }));
  const capT = capTex(), caps = others.map(() => { const c = billboard(capT, .32, .19); scene.add(c); return c; });
  // him, at every age (same seat, same phone)
  const PH = { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, look: { pose: 'look' } };
  const ages = [
    makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark' }, PH),
    makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark', beard: 1 }, PH),
    makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark', beard: 3 }, PH),
    makePerson({ top: 'red', bottom: 'jean', hair: 'hairGrey', beard: 4 }, PH),
    makePerson({ top: 'red', bottom: 'grey', hair: 'hairGrey', beard: 5, hunch: 1, glasses: 1 }, PH),
    makePerson({ top: 'red', bottom: 'grey', hair: 'hairWhite', beard: 6, hunch: 1, glasses: 1, skin: 'skinOld' }, PH),
  ];
  const ageIdx = a => [0, 0, 0, 1, 2, 3, 4, 5][a];
  const hs = seats.find(s => s.hero);
  ages.forEach(h => { h.root.position.set(hs.x, 0, hs.z - .02); h.shadow.visible = false; scene.add(h.root); });
  const newbie = makePerson({ top: 'teal', bottom: 'jean', hair: 'hairBlond', shoe: 'sneaker' }, { stand: { pose: 'stand' }, talk: { pose: 'talk', mouth: 1 }, ...WALK });
  scene.add(newbie.root);
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    // camera: the hall from the front-right, then in on him and the freshman
    if (t < T.close) { const u = eio(seg(t, 0, T.close)); cam.position.set(hs.x + lerp(2.0, 1.7, u), lerp(2.3, 2.15, u), hs.z + lerp(3.0, 2.6, u)); cam.lookAt(hs.x + lerp(.1, .2, u), lerp(1.0, .95, u), hs.z - 1.4); cam.fov = 54; }
    else { const u = eo(seg(t, T.close, T.close + 1.2)); cam.position.set(hs.x + lerp(1.3, 1.05, u), lerp(1.6, 1.5, u), hs.z + lerp(2.7, 2.4, u)); cam.lookAt(hs.x + .5, lerp(1.0, .98, u), hs.z + .2); cam.fov = 52; }
    cam.updateProjectionMatrix();
    const age = ageAt(t), k = age % 4, last = age === 7;
    // the classes: write; caps fly before each tick; then the next class
    let tossA = null; for (const a of TICKS) if (t >= a - .45 && t < a) tossA = a;
    classes.forEach((cl, ci) => cl.forEach((p, i) => {
      p.root.visible = ci === k;
      if (!p.root.visible) return;
      p.frame(tossA ? 'cheer' : (Math.floor(t * 6 + i * 1.7) % 2 ? 'w1' : 'w0')); p.face(cam);
    }));
    caps.forEach((c, i) => { const s = others[i]; c.visible = !!tossA; if (!tossA) return; const u = seg(t, tossA - .45, tossA); c.position.set(s.x + .1 + Math.sin(i) * .2 * u, 1.55 + 1.6 * Math.sin(u * Math.PI * .9), s.z); c.material.rotation = u * 6 + i; c.lookAt(cam.position); });
    // him
    const ai = ageIdx(age); ages.forEach((h, i) => { h.root.visible = i === ai; });
    const H = ages[ai]; H.frame(t >= 12.9 ? 'look' : (t % 2.9 < .1 ? 'blink' : 'phone')); H.face(cam);
    phoneL.position.copy(H.local(25, 18)).add(_v.set(.2, .05, .2)); phoneL.intensity = t < 12.9 ? .8 : .2;
    // the freshman
    newbie.root.visible = last && t >= T.newbie;
    if (newbie.root.visible) {
      const u = seg(t, T.newbie, T.newbie + .9), here = u >= 1;
      newbie.root.position.set(lerp(hs.x + 2.6, hs.x + .95, u), 0, hs.z + .45);
      newbie.frame(here ? (t >= 10.0 && t < 12.85 && Math.floor(t * 3) % 2 ? 'talk' : 'stand') : walkFrame(t)); newbie.face(cam, here);
    }
    post.dof.focus = cam.position.distanceTo(_v.set(hs.x + (t < T.close ? 0 : .5), .9, hs.z + (t < T.close ? 0 : .25))); post.dof.aper = t < T.close ? 40 : 30; post.dof.maxCoc = 10;
    renderer.toneMappingExposure = 1.35; post.bloom.strength = .3; post.bloom.threshold = .9;
  }
  return { scene, update };
}
