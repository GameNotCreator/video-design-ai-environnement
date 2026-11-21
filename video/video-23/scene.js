// Transformation: a gym. Day 1 to day 365: the people around him lift and grow; he sits on the bench watching
// "30 day transformation" videos and never changes. At the end, the biggest one asks for the bench.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson, WALK, walkFrame } from './people.js';
import { T, levelAt } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

function rubberTex() { const P = new PX(64, 64), R = ramp(['#16161a', '#1e1e24', '#28282e', '#323238'], .45); P.fill((x, y) => R(.5 + (h2(x, y, 3) - .5) * .5 + ((x % 32) === 0 || (y % 32) === 0 ? -.4 : 0), x, y)); return P.done(); }
function wallTex() { const P = new PX(64, 64), R = ramp(['#3a3e48', '#464a56', '#525866', '#5e6676'], .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, 9) - .5) * .2 + (h2(x, y, 9) - .5) * .1 + ((y % 16) === 0 ? -.2 : 0), x, y)); return P.done(); }

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0a0a0e');
  scene.add(mesh(new THREE.BoxGeometry(10, .2, 8).translate(0, -.1, 0), mat(rubberTex())));
  const wM = mat(wallTex()); const back = box(10, 3.4, .2, wM); back.position.set(0, 0, -2.6); scene.add(back);
  const mirror = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.8), new THREE.MeshStandardMaterial({ color: '#8aa0b8', roughness: .15, metalness: .8 })); mirror.position.set(0, 1.4, -2.49); scene.add(mirror);
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(10, .12), new THREE.MeshBasicMaterial({ color: '#c8a040' })); stripe.position.set(0, 2.55, -2.48); scene.add(stripe);
  // racks and dumbbells
  const ironM = new THREE.MeshStandardMaterial({ color: '#2a2a30', roughness: .4, metalness: .7 }), plateM = new THREE.MeshStandardMaterial({ color: '#141418', roughness: .5 });
  for (const x of [-3.2, 3.2]) { const r = box(.9, 1.4, .5, ironM); r.position.set(x, 0, -2.2); scene.add(r); for (let i = 0; i < 5; i++) { const d = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .3, 10).rotateZ(Math.PI / 2), plateM); d.position.set(x - .3 + i * .15, .45 + (i % 2) * .5, -2.0); scene.add(d); } }
  // his bench
  const benchM = new THREE.MeshStandardMaterial({ color: '#7a1a1a', roughness: .6 });
  const pad = box(1.3, .12, .35, new THREE.MeshStandardMaterial({ color: '#202026', roughness: .6 })); pad.position.set(0, .42, -.6); scene.add(pad);
  for (const x of [-.5, .5]) { const l = box(.08, .42, .3, ironM); l.position.set(x, 0, -.6); scene.add(l); }
  const lights = [-2.5, 0, 2.5].map(x => { const L = new THREE.PointLight('#f0f4ff', 6, 6, 1.4); L.position.set(x, 3.0, -.5); scene.add(L); const g = glow('#e8f0ff', .5, 1.2); g.position.set(x, 3.2, -.5); scene.add(g); return L; });
  scene.add(new THREE.HemisphereLight('#c8d0e0', '#2a2a30', 1.2));
  const fill = new THREE.PointLight('#e8e8f0', 2.0, 7, 1.5); fill.position.set(.4, 1.8, 2.4); scene.add(fill);
  const phoneL = new THREE.PointLight('#8fc0ff', .8, 1.3, 2); scene.add(phoneL);
  // him (never changes)
  const hero = makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark', shoe: 'sneaker' }, { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, look: { pose: 'look' } });
  hero.root.position.set(-.15, 0, -.55); hero.shadow.visible = false; scene.add(hero.root);
  // the regulars, at three sizes (day 1 / day 90 / day 365)
  const LIFT = { l0: { pose: 'lift', step: 0 }, l1: { pose: 'lift', step: 1, bob: -1 }, stand: { pose: 'stand' }, talk: { pose: 'talk', mouth: 1 }, ...WALK };
  const REG = [{ top: 'teal', bottom: 'navy', hair: 'hairBlond', shoe: 'sneaker' }, { top: 'mustard', bottom: 'black', hair: 'hairBrown', hairStyle: 'bun', shoe: 'sneaker' }, { top: 'green', bottom: 'grey', hair: 'hairDark', shoe: 'sneaker' }];
  const POS = [[-1.05, -1.5], [1.05, -1.55], [.45, -2.15]];
  const regs = REG.map((L, i) => [0, 1, 2].map(b => { const p = makePerson({ ...L, buff: [0, 2, 4][b] }, LIFT); p.root.position.set(POS[i][0], 0, POS[i][1]); p.shadow.visible = false; scene.add(p.root); return p; }));
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    const lv = levelAt(t), size = lv < 2 ? 0 : lv < 4 ? 1 : 2;
    if (t < T.ask) { const u = eio(seg(t, 0, T.ask)); cam.position.set(lerp(.3, .25, u), lerp(1.7, 1.6, u), lerp(3.6, 3.0, u)); cam.lookAt(lerp(0, 0, u), lerp(1.05, 1.0, u), -1.2); cam.fov = 56; }
    else { const u = eo(seg(t, T.ask, T.ask + 1.0)); cam.position.set(lerp(.25, .35, u), lerp(1.6, 1.45, u), lerp(3.0, 2.2, u)); cam.lookAt(lerp(0, .25, u), lerp(1.0, 1.05, u), -.6); cam.fov = 52; }
    cam.updateProjectionMatrix();
    hero.frame(t >= 13.1 ? 'look' : (t % 2.9 < .1 ? 'blink' : 'phone')); hero.face(cam);
    phoneL.position.copy(hero.local(25, 18)).add(_v.set(.2, .05, .2)); phoneL.intensity = t < 13.1 ? .8 : .2;
    regs.forEach((set, i) => set.forEach((p, b) => {
      p.root.visible = b === size;
      if (!p.root.visible) return;
      if (i === 2 && t >= T.walk) {   // the biggest one comes to the bench
        const u = seg(t, T.walk, T.ask); p.root.position.set(lerp(POS[2][0], .75, u), 0, lerp(POS[2][1], -.35, u)); p.frame(u < 1 ? walkFrame(t) : (t < 13.0 && Math.floor(t * 3) % 2 ? 'talk' : 'stand')); p.face(cam, u >= 1);
      } else { p.root.position.set(POS[i][0], 0, POS[i][1]); p.frame(Math.floor(t * 2.2 + i * .7) % 2 ? 'l1' : 'l0'); p.face(cam, i === 1); }
    }));
    post.dof.focus = cam.position.distanceTo(_v.set(0, 1.0, -.6)); post.dof.aper = 40; post.dof.maxCoc = 10;
    renderer.toneMappingExposure = 1.15; post.bloom.strength = .35; post.bloom.threshold = .85;
  }
  return { scene, update };
}
