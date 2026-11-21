// The elevator: he rides up, scrolling. At every floor the doors open on a moment of his life (graduation, a girl,
// an altar, a kid, old friends); he never looks up and the doors close. At the last floor: clouds.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson, WALK } from './people.js';
import { T, STOPS, ageAt, doorsAt, setAt } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

function steelTex() { const P = new PX(32, 64), R = ramp(['#6a6c74', '#82848c', '#9a9ca4', '#b2b4bc'], .45); P.fill((x, y) => R(.5 + (h2(x, Math.floor(y / 3), 2) - .5) * .25 + Math.sin(x * .8) * .05, x, y)); return P.done(); }
function bannerTex(text, bg, fg) { const c = document.createElement('canvas'); c.width = 512; c.height = 96; const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, 512, 96); g.fillStyle = fg; g.font = '800 52px Figtree'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 256, 50); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function cloudTex() { const P = new PX(64, 32), C = ramp(['#c8d0e0', '#e0e6f0', '#f4f6fa', '#ffffff'], .45); P.fill((x, y) => { const d = fbm(x * .08, y * .15, 7) + (1 - y / 32) * .3; return d > .55 ? C(d, x, y) : null; }); return texOf(P.done()); }

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#08080c');
  // the car: back and side walls, floor, ceiling light; the front wall with the door opening
  const steel = mat(steelTex()), floorM = new THREE.MeshStandardMaterial({ color: '#2a2622', roughness: .9 });
  const fl = new THREE.Mesh(new THREE.BoxGeometry(1.8, .1, 3.2).translate(0, -.05, -.5), floorM); fl.receiveShadow = true; scene.add(fl);
  for (const x of [-.9, .9]) { const w = box(.06, 2.4, 3.2, steel); w.position.set(x, 0, -.5); scene.add(w); }
  const back = box(1.8, 2.4, .06, steel); back.position.set(0, 0, -2.1); scene.add(back);
  const ceil = new THREE.Mesh(new THREE.BoxGeometry(1.8, .06, 3.2), steel); ceil.position.set(0, 2.43, -.5); scene.add(ceil);
  for (const x of [-.72, .72]) { const f = box(.36, 2.4, .08, steel); f.position.set(x, 0, 1.08); scene.add(f); }
  const lintel = box(1.08, .3, .08, steel); lintel.position.set(0, 2.1, 1.08); scene.add(lintel);
  const doorM = new THREE.MeshStandardMaterial({ color: '#a8aab2', roughness: .35, metalness: .7 });
  const doors = [-1, 1].map(s => { const d = box(.54, 2.1, .05, doorM); scene.add(d); return { d, s }; });
  const cl = new THREE.PointLight('#fff4e4', 3.0, 4, 1.5); cl.position.set(0, 2.3, 0); scene.add(cl);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(.18, .5), new THREE.MeshStandardMaterial({ color: '#202024', emissive: '#d8a040', emissiveIntensity: .3 })); panel.position.set(-.86, 1.2, .4); panel.rotation.y = Math.PI / 2; scene.add(panel);
  scene.add(new THREE.HemisphereLight('#d0d4e0', '#3a3430', 1.2));
  const outL = new THREE.PointLight('#fff0dc', 0, 6, 1.4); outL.position.set(0, 1.6, 2.2); scene.add(outL);
  const phoneL = new THREE.PointLight('#8fc0ff', .8, 1.3, 2); scene.add(phoneL);
  // the floors: one small set each, beyond the doors
  const SETS = {}; const mk = (name, bg) => { const g = new THREE.Group(); const w = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), new THREE.MeshStandardMaterial({ color: bg, roughness: .9 })); w.position.set(0, 1.5, 3.6); w.rotation.y = Math.PI; g.add(w); const f = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), new THREE.MeshStandardMaterial({ color: '#3a3430' })); f.rotation.x = -Math.PI / 2; f.position.set(0, 0, 2.6); g.add(f); g.visible = false; scene.add(g); SETS[name] = g; return g; };
  const people = [];
  const P = (g, look, frames, x, z, flip = false, sc = 1) => { const p = makePerson(look, frames); p.root.position.set(x, 0, z); p.root.scale.setScalar(sc); p.shadow.visible = false; g.add(p.root); people.push({ p, flip }); return p; };
  const CHEER = { a: { pose: 'wave', mouth: 1, smile: 1 }, b: { pose: 'stand', smile: 1 } };
  // 22: graduation party
  let g = mk('grad', '#4a2a6a'); const ban = new THREE.Mesh(new THREE.PlaneGeometry(1.6, .3), new THREE.MeshBasicMaterial({ map: bannerTex('CLASS OF 2026', '#e8c860', '#2a1a40') })); ban.position.set(0, 2.2, 3.5); ban.rotation.y = Math.PI; g.add(ban);
  P(g, { gown: 1, gradCap: 1, hair: 'hairBlond', shoe: 'shoe' }, CHEER, -.4, 2.6); P(g, { gown: 1, gradCap: 1, hair: 'hairDark', hairStyle: 'long', shoe: 'shoe' }, CHEER, .1, 2.8, true); P(g, { gown: 1, gradCap: 1, hair: 'hairBrown', shoe: 'shoe' }, CHEER, .5, 2.5);
  // 25: the girl, waving him out
  g = mk('girl', '#7a4a3a'); P(g, { top: 'mustard', bottom: 'jean', hair: 'hairBrown', hairStyle: 'long', hairUp: 1, shoe: 'shoe' }, { a: { pose: 'wave', smile: 1 }, b: { pose: 'talk', mouth: 1 } }, .05, 2.3, true);
  // 30: the altar, a bride waiting alone
  g = mk('altar', '#e8e4dc'); const arch = new THREE.Mesh(new THREE.TorusGeometry(.7, .06, 8, 24, Math.PI), new THREE.MeshStandardMaterial({ color: '#f4f0f6', emissive: '#d8c0d0', emissiveIntensity: .3 })); arch.position.set(0, 1.1, 3.2); g.add(arch);
  P(g, { dress: 1, top: 'white', hair: 'hairBlond', hairStyle: 'bun', veil: 1, shoe: 'shoe' }, { a: { pose: 'stand' }, b: { pose: 'stand', blink: 1 } }, 0, 3.0, true);
  // 40: a kid with a ball
  g = mk('kid', '#5a7a4a'); P(g, { top: 'teal', bottom: 'jean', hair: 'hairDark', shoe: 'sneaker' }, CHEER, .05, 2.4, true, .65);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8), new THREE.MeshStandardMaterial({ color: '#e8e8e8' })); ball.position.set(-.25, .09, 2.2); g.add(ball);
  // 60: old friends toasting
  g = mk('friends', '#6a4a2a'); P(g, { top: 'green', bottom: 'grey', hair: 'hairWhite', glasses: 1, shoe: 'shoe' }, CHEER, -.35, 2.7); P(g, { top: 'purple', bottom: 'grey', hair: 'hairGrey', beard: 2, shoe: 'shoe' }, CHEER, .35, 2.7, true);
  // last floor: sky and clouds
  g = mk('sky', '#f8f4ec'); const cT = cloudTex(); for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), new THREE.MeshBasicMaterial({ map: cT, transparent: true, alphaTest: .4 })); c.position.set(-1.2 + (i % 3) * 1.2, .3 + Math.floor(i / 3) * .9, 3.2 - i * .1); c.rotation.y = Math.PI; g.add(c); }
  const halo = glow('#fff6dc', 3.0, 1.6); halo.position.set(0, 1.4, 3.3); g.add(halo);
  // him, at every age
  const H = { phone: { pose: 'standphone' }, blink: { pose: 'standphone', blink: 1 }, look: { pose: 'stand' } };
  const A = (o) => makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark', shoe: 'sneaker', ...o }, H);
  const ages = [A({}), A({ beard: 2 }), A({ beard: 3 }), A({ beard: 4, hair: 'hairGrey' }), A({ beard: 5, hair: 'hairGrey', glasses: 1 }), A({ beard: 6, hair: 'hairWhite', hunch: 1, skin: 'skinOld', glasses: 1 })];
  ages.forEach(h => { h.root.position.set(.42, 0, .1); h.shadow.visible = false; scene.add(h.root); });
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    const u = eio(seg(t, 0, T.txt)); cam.position.set(lerp(-.15, -.12, u), lerp(1.45, 1.4, u), lerp(-1.95, -1.6, u)); cam.lookAt(lerp(.1, .08, u), lerp(1.1, 1.12, u), 1.2); cam.fov = 58; cam.updateProjectionMatrix();
    const open = ss(doorsAt(t)); doors.forEach(({ d, s }) => d.position.set(s * (.27 + .5 * open), 0, 1.02));
    const set = setAt(t); Object.entries(SETS).forEach(([k, g]) => { g.visible = k === set; });
    outL.intensity = open * (set === 'sky' ? 9 : 4); outL.color.set(set === 'sky' ? '#fff8e8' : '#ffe8cc');
    people.forEach(({ p, flip }, i) => { if (!p.root.parent.visible) return; p.frame(Math.floor(t * 3 + i) % 2 ? 'a' : 'b'); p.face(cam, flip); });
    const k = ageAt(t); ages.forEach((h, i) => { h.root.visible = i === k; });
    const He = ages[k]; He.frame(t >= T.up ? 'look' : (t % 2.9 < .1 ? 'blink' : 'phone')); He.face(cam);
    phoneL.position.copy(He.local(25, 18)).add(_v.set(.2, .05, -.2)); phoneL.intensity = t < T.up ? .8 : .1;
    post.dof.focus = cam.position.distanceTo(_v.set(.3, 1.2, .4)); post.dof.aper = 20; post.dof.maxCoc = 8;
    renderer.toneMappingExposure = set === 'sky' ? 1.0 + .5 * open : 1.2; post.bloom.strength = set === 'sky' ? .5 + .6 * open : .3; post.bloom.threshold = set === 'sky' ? .7 : .88;
  }
  return { scene, update };
}
