// World record: his living room, fourteen years in. Officials burst in with confetti, a photographer and a trophy:
// longest time without looking up. He doesn't look up for that either.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { particles } from './fx.js';
import { makePerson, WALK, walkFrame } from './people.js';
import { T } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

function wallTex() { const P = new PX(64, 64), R = ramp(['#3a3a2e', '#4a4a3a', '#5a5a46', '#6a6a54'], .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, 5) - .5) * .25 + (h2(x, y, 5) - .5) * .1, x, y)); return P.done(); }
function sofaTex() { const P = new PX(32, 16), R = ramp(['#3a2418', '#4e3222', '#64422e', '#7a543a'], .45); P.fill((x, y) => R(.5 + (h2(x, y, 8) - .5) * .3 + ((x % 8) === 0 ? -.2 : 0), x, y)); return P.done(); }

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#06060a');
  scene.add(mesh(new THREE.BoxGeometry(7, .2, 6).translate(0, -.1, 0), mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 7, cols: ['#2a1c14', '#40291c', '#583a26', '#704c32', '#8a603e'] }))));
  const wM = mat(wallTex()); const back = box(7, 3, .2, wM); back.position.set(0, 0, -2.2); scene.add(back);
  const left = box(.2, 3, 6, wM); left.position.set(-2.4, 0, 0); scene.add(left);
  // the door (opens at T.door), sofa, clutter of fourteen years
  const doorM = new THREE.MeshStandardMaterial({ color: '#6a4a30', roughness: .8 }), door = new THREE.Group(); const dp = box(.9, 2.0, .06, doorM); dp.position.x = .45; door.add(dp); door.position.set(1.0, 0, -2.08); scene.add(door);
  const doorLight = new THREE.PointLight('#fff0d8', 0, 4, 1.4); doorLight.position.set(1.45, 1.2, -1.8); scene.add(doorLight);
  const sofaM = mat(sofaTex());
  const seat = box(1.9, .42, .85, sofaM); seat.position.set(-.8, 0, -1.2); scene.add(seat);
  const backr = box(1.9, .45, .22, sofaM); backr.position.set(-.8, .42, -1.55); scene.add(backr);
  for (const x of [-1.8, .2]) { const a = box(.18, .6, .85, sofaM); a.position.set(x, 0, -1.2); scene.add(a); }
  const junkM = ['#c8c0b0', '#a86a3a', '#6a6a70', '#8a5a3a', '#d8d0c0'].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 1 }));
  for (let i = 0; i < 12; i++) { const b = box(.25 + h2(i, 1, 3) * .3, .04 + h2(i, 2, 3) * .25, .25 + h2(i, 3, 3) * .3, junkM[i % 5]); b.position.set(-2.1 + h2(i, 4, 3) * 1.6, 0, -.7 + h2(i, 5, 3) * .5); b.rotation.y = i; scene.add(b); }
  // trophy (appears next to him)
  const goldM = new THREE.MeshStandardMaterial({ color: '#d8b04a', roughness: .3, metalness: .9, emissive: '#3a2a08' }), trophy = new THREE.Group();
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(.13, .06, .22, 14), goldM); cup.position.y = .42; trophy.add(cup);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .14, 8), goldM); stem.position.y = .25; trophy.add(stem);
  const base = box(.2, .14, .14, new THREE.MeshStandardMaterial({ color: '#2a1a10' })); trophy.add(base);
  for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.TorusGeometry(.06, .015, 6, 12, Math.PI), goldM); h.position.set(s * .14, .44, 0); h.rotation.z = s * Math.PI / 2; trophy.add(h); }
  trophy.position.set(.05, .42, -1.15); scene.add(trophy);
  const tG = glow('#ffd880', .5, .8); scene.add(tG);
  // lights
  scene.add(new THREE.HemisphereLight('#c0b8d0', '#2a1c14', 1.5));
  const lamp = new THREE.PointLight('#ffcf90', 3.5, 6, 1.5); lamp.position.set(-1.8, 2.0, -.8); scene.add(lamp);
  const fill = new THREE.PointLight('#e8e0f0', 2.2, 7, 1.5); fill.position.set(.5, 1.8, 2.4); scene.add(fill);
  const flashL = new THREE.PointLight('#ffffff', 0, 6, 1.2); flashL.position.set(1.2, 1.6, .4); scene.add(flashL);
  const phoneL = new THREE.PointLight('#8fc0ff', .8, 1.3, 2); scene.add(phoneL);
  // him, fourteen years of beard
  const hero = makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark', beard: 6, shoe: 'sneaker' }, { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 } });
  hero.root.position.set(-.65, .02, -1.05); hero.shadow.visible = false; scene.add(hero.root);
  // the officials: the adjudicator (talks), the photographer, the confetti
  const OF = { stand: { pose: 'stand', smile: 1 }, talk: { pose: 'talk', mouth: 1, smile: 1 }, wave: { pose: 'wave', smile: 1, mouth: 1 }, film: { pose: 'film' }, ...WALK };
  const off = makePerson({ top: 'black', bottom: 'black', suit: 1, hair: 'hairGrey', glasses: 1, shoe: 'shoe' }, OF);
  const pho = makePerson({ top: 'navy', bottom: 'jean', hair: 'hairBlond', shoe: 'sneaker' }, OF);
  const con = makePerson({ top: 'mustard', bottom: 'jean', hair: 'hairBrown', hairStyle: 'long', hairUp: 1, shoe: 'sneaker' }, OF);
  const crew = [[off, .55, -.7], [pho, 1.35, -.2], [con, 1.0, -1.35]]; crew.forEach(([p]) => scene.add(p.root));
  const confetti = particles(240, (i, t, o) => { const r = h2(i, 1, 9), q = h2(i, 2, 9), life = clamp((t - T.confetti) / 3.5); o.x = .9 + (r - .5) * 3 * Math.min(1, life * 3) + Math.sin(t * 3 + i) * .1; o.y = Math.max(.02, 2.4 - life * (1.5 + q * 2) + Math.max(0, .6 - life) * 1.2 * q); o.z = -1.0 + (h2(i, 3, 9) - .5) * 2.4 * Math.min(1, life * 3); o.a = t >= T.confetti ? 1 : 0; o.s = .03; const c = [[1, .3, .3], [1, .8, .2], [.3, .7, 1], [.4, 1, .5], [1, .5, .9]][i % 5]; o.r = c[0]; o.g = c[1]; o.b = c[2]; }, { blend: THREE.NormalBlending });
  scene.add(confetti);
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    const u = eio(seg(t, 0, T.txt)); cam.position.set(lerp(.55, .4, u), lerp(1.6, 1.5, u), lerp(3.0, 2.5, u)); cam.lookAt(lerp(-.05, -.1, u), lerp(.95, .92, u), -1.1); cam.fov = 54; cam.updateProjectionMatrix();
    door.rotation.y = -1.4 * ss(seg(t, T.door, T.door + .4)) * (1 - ss(seg(t, 13.2, 13.6))); doorLight.intensity = 3 * ss(seg(t, T.door, T.door + .4)) * (1 - ss(seg(t, 13.2, 13.6)));
    hero.frame(t % 2.9 < .1 ? 'blink' : 'phone'); hero.face(cam);
    phoneL.position.copy(hero.local(25, 18)).add(_v.set(.2, .05, .2));
    crew.forEach(([p, x, z], i) => {
      const inA = T.door + .2 + i * .25, outA = T.leave + i * .2;
      p.root.visible = t >= inA && t < outA + 1.0;
      if (!p.root.visible) return;
      let px = x, f = 'stand', flip = true;
      if (t < inA + .7) { const k = seg(t, inA, inA + .7); px = lerp(1.45, x, k); f = walkFrame(t + i); }
      else if (t >= outA) { const k = seg(t, outA, outA + 1.0); px = lerp(x, 1.5, k); f = walkFrame(t + i); flip = false; }
      else if (p === off) f = ((t >= 3.2 && t < 12.0) && Math.floor(t * 3) % 2) ? 'talk' : 'stand';
      else if (p === pho) f = t >= T.flash - .3 && t < T.flash + 1.6 ? 'film' : 'stand';
      else f = t >= T.confetti && t < T.confetti + 1.2 ? 'wave' : (Math.floor(t * 2) % 2 ? 'wave' : 'stand');
      p.root.position.set(px, 0, t < inA + .7 || t >= outA ? -1.8 + (z + 1.8) * (t >= outA ? 1 - seg(t, outA, outA + 1) : seg(t, inA, inA + .7)) : z); p.frame(f); p.face(cam, flip);
    });
    confetti.visible = t >= T.confetti; confetti.userData.update(t);
    trophy.visible = t >= T.trophy; tG.visible = trophy.visible; tG.position.set(.05, .9, -1.1); trophy.rotation.y = t * .5;
    let fl = 0; for (const k of [0, .6, 1.2]) if (t >= T.flash + k && t < T.flash + k + .15) fl = 12; flashL.intensity = fl;
    post.dof.focus = cam.position.distanceTo(_v.set(-.2, 1.0, -1.0)); post.dof.aper = 20; post.dof.maxCoc = 10;
    renderer.toneMappingExposure = 1.2; post.bloom.strength = .4; post.bloom.threshold = .85;
  }
  return { scene, update };
}
