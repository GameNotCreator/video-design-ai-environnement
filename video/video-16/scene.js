// 10 minutes: a student flat at dusk. The TV says an asteroid hits in ten minutes; the roommates panic, run, call
// their mothers. He stays on the sofa, watching videos about the asteroid. The window turns white.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson, WALK, walkFrame } from './people.js';
import { T } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

function wallTex() { const P = new PX(64, 64), R = ramp(['#3a2e2a', '#4e3e38', '#625048', '#76625a'], .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, 5) - .5) * .25 + (h2(x, y, 5) - .5) * .1, x, y)); return P.done(); }
function sofaTex() { const P = new PX(32, 16), R = ramp(['#1a2430', '#243444', '#304a5e', '#3e5e74'], .45); P.fill((x, y) => R(.5 + (h2(x, y, 8) - .5) * .3 + ((x % 8) === 0 ? -.2 : 0), x, y)); return P.done(); }
function tvTex(k) {   // the alert: red bands, a white rock, a countdown bar
  const P = new PX(48, 28); P.fill((x, y) => { const band = y < 5 || y > 22; return band ? (((x + k) >> 2) % 2 ? [200, 30, 30] : [240, 200, 40]) : [24, 10, 12]; });
  for (let i = 0; i < 40; i++) P.set(4 + i, 24 + (i % 2), [250, 250, 250]);
  const cx = 24, cy = 13; P.fill((x, y) => { const d = Math.hypot(x - cx, y - cy); return d < 6 ? (d < 4 ? [230, 200, 170] : [255, 120, 40]) : null; });
  for (let i = 0; i < 9; i++) P.set(cx - 7 - i, cy - 4 + (i >> 1), [255, 150, 60]);
  return texOf(P.done());
}
function rugTex() { const P = new PX(48, 36), R = ramp(['#3a2420', '#5a3428', '#7a4a34', '#9a6448'], .45); P.fill((x, y) => { const b = x < 3 || y < 3 || x > 44 || y > 32; return R(b ? .8 : .45 + ((x >> 2) + (y >> 2)) % 2 * .1 + (h2(x, y, 7) - .5) * .2, x, y); }); return P.done(); }

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#06060a');
  scene.add(mesh(new THREE.BoxGeometry(7, .2, 6).translate(0, -.1, 0), mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 4, cols: ['#2a1c14', '#40291c', '#583a26', '#704c32', '#8a603e'] }))));
  const wM = mat(wallTex());
  const back = box(7, 3, .2, wM); back.position.set(0, 0, -2.2); scene.add(back);
  const left = box(.2, 3, 6, wM); left.position.set(-2.4, 0, 0); scene.add(left);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), mat(rugTex())); rug.rotation.x = -Math.PI / 2; rug.position.set(0, .005, -.2); rug.receiveShadow = true; scene.add(rug);
  // big window in the back wall: the sky, the asteroid growing
  const skyM = new THREE.MeshBasicMaterial({ color: '#3a2a4a', fog: false }), sky = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.3), skyM); sky.position.set(-.1, 1.75, -2.09); scene.add(sky);
  const fM = new THREE.MeshStandardMaterial({ color: '#d8d0c4', roughness: .8 });
  for (const [w, h, x, y] of [[2.3, .06, -.1, 2.42], [2.3, .06, -.1, 1.08], [.06, 1.4, -1.22, 1.75], [.06, 1.4, 1.02, 1.75], [.04, 1.3, -.1, 1.75]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .06), fM); b.position.set(x, y, -2.06); scene.add(b); }
  for (let i = 0; i < 6; i++) { const hgt = .3 + h2(i, 1, 3) * .5, b = new THREE.Mesh(new THREE.PlaneGeometry(.35, hgt), new THREE.MeshBasicMaterial({ color: '#141018' })); b.position.set(-1.1 + i * .4, 1.1 + hgt / 2, -2.085); scene.add(b); }
  const rock = glow('#ffb060', .4, 2.0); rock.position.set(1.45, 2.05, -2.08); scene.add(rock);
  const trail = glow('#ff7a30', .3, 1.0); scene.add(trail);
  // the TV on the left wall
  const tvF = box(.08, .72, 1.2, new THREE.MeshStandardMaterial({ color: '#101014', roughness: .5 })); tvF.position.set(-2.26, 1.05, -.6); scene.add(tvF);
  const tvTexs = [0, 1, 2, 3].map(tvTex), tvM = new THREE.MeshBasicMaterial({ map: tvTexs[0] }), tv = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .64), tvM); tv.rotation.y = Math.PI / 2; tv.position.set(-2.21, 1.41, -.6); scene.add(tv);
  const tvL = new THREE.PointLight('#ff4a2a', 2.5, 4, 1.6); tvL.position.set(-1.8, 1.4, -.6); scene.add(tvL);
  // sofa, low table, lamp, shelf
  const sofaM = mat(sofaTex());
  const seat = box(2.0, .42, .85, sofaM); seat.position.set(-.1, 0, -1.2); scene.add(seat);
  const backr = box(2.0, .45, .22, sofaM); backr.position.set(-.1, .42, -1.55); scene.add(backr);
  for (const x of [-1.15, .95]) { const a = box(.2, .6, .85, sofaM); a.position.set(x, 0, -1.2); scene.add(a); }
  const woodM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 6, nails: false, cols: ['#2e1e14', '#4a3222', '#644630', '#7e5a3c'] }));
  const table = box(1.0, .05, .5, woodM); table.position.set(-.1, .36, -.25); scene.add(table);
  for (const [x, z] of [[-.55, -.45], [.35, -.45], [-.55, -.05], [.35, -.05]]) { const l = box(.04, .36, .04, woodM); l.position.set(x, 0, z); scene.add(l); }
  const cups = [[-.3, -.25], [.15, -.3]].map(([x, z]) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(.04, .035, .1, 8), new THREE.MeshStandardMaterial({ color: '#c8c0b0' })); c.position.set(x, .46, z); scene.add(c); return c; });
  const shelf = box(.8, 1.6, .3, woodM); shelf.position.set(2.6, 0, -2.0); scene.add(shelf);
  const lampP = box(.05, 1.4, .05, new THREE.MeshStandardMaterial({ color: '#202024' })); lampP.position.set(1.35, 0, -1.6); scene.add(lampP);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(.14, .22, .25, 10), new THREE.MeshStandardMaterial({ color: '#e8d0a0', emissive: '#ffb860', emissiveIntensity: .6 })); shade.position.set(1.35, 1.5, -1.6); scene.add(shade);
  const lamp = new THREE.PointLight('#ffb870', 4, 6, 1.5); lamp.position.set(1.35, 1.45, -1.4); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -.003; scene.add(lamp);
  const hemi = new THREE.HemisphereLight('#7a6a8a', '#2a1a14', 1.2); scene.add(hemi);
  const fill = new THREE.PointLight('#c0b8e0', 2.0, 7, 1.6); fill.position.set(.6, 1.8, 2.2); scene.add(fill);
  const sunset = new THREE.PointLight('#ff9a50', 0, 7, 1.3); sunset.position.set(-.1, 1.8, -1.6); scene.add(sunset);
  // him on the sofa; the roommates
  const hero = makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark' }, { phone: { pose: 'sitlaugh' }, calm: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 } });
  hero.root.position.set(-.25, .02, -1.05); hero.shadow.visible = false; scene.add(hero.root);
  const heroL = new THREE.PointLight('#8fc0ff', 1.0, 1.4, 2); scene.add(heroL);
  const RF = { stand: { pose: 'stand' }, talk: { pose: 'talk', mouth: 1 }, wave: { pose: 'wave', mouth: 1 }, push: { pose: 'push' }, ...WALK };
  const r1 = makePerson({ top: 'mustard', bottom: 'jean', hair: 'hairBlond', shoe: 'sneaker' }, RF);
  const r2 = makePerson({ top: 'teal', bottom: 'navy', hair: 'hairBrown', hairStyle: 'long', shoe: 'sneaker' }, RF);
  const r3 = makePerson({ top: 'purple', bottom: 'jean', hair: 'hairDark', shoe: 'sneaker' }, RF);
  [r1, r2, r3].forEach(r => scene.add(r.root));
  const _v = new THREE.Vector3(), cA = new THREE.Color();

  function update(t, shot, cam, post, renderer) {
    const doom = clamp(t / T.impact), end = ss(seg(t, 11.2, T.impact));
    // camera: a wide of the room (TV, window, sofa), slowly in on him
    const u = eio(seg(t, 0, T.impact));
    cam.position.set(lerp(.35, .2, u), lerp(1.55, 1.45, u), lerp(3.4, 2.4, u)); cam.lookAt(lerp(-.15, -.2, u), lerp(1.25, 1.1, u), -1.2); cam.fov = 56; cam.updateProjectionMatrix();
    // sky: dusk → orange → white; the rock grows and drops
    skyM.color.set('#3a2a4a').lerp(cA.set('#ff8a40'), ss(doom)).lerp(cA.set('#fff4e0'), end);
    const rs = lerp(.5, 1.7, doom * doom) + 3 * end; rock.scale.setScalar(rs); rock.position.set(lerp(.6, -.05, doom), lerp(1.9, 1.7, doom), -2.08);
    trail.position.copy(rock.position).add(_v.set(.18 * rs * .5, .12 * rs * .5, 0)); trail.scale.setScalar(rs * .8);
    sunset.intensity = 6 * ss(doom) + 20 * end; hemi.intensity = 1.2 + 2 * end;
    tvM.map = tvTexs[Math.floor(t * 4) % 4]; tvL.intensity = 2.5 * (Math.floor(t * 4) % 2 ? 1 : .6);
    // him: laughing at the screen, the phone glowing
    hero.frame(Math.floor(t * 1.5) % 3 === 0 ? 'phone' : (t % 2.7 < .1 ? 'blink' : 'calm')); hero.face(cam);
    heroL.position.copy(hero.local(25, 18)).add(_v.set(.2, .05, .2));
    // roommate 1 bursts in, shouts at him, runs out
    { let x, f = 'stand', flip = true, vis = t >= T.run && t < 9.0;
      if (t < 3.3) { x = lerp(2.4, .75, seg(t, T.run, 3.3)); f = walkFrame(t * 1.6); }
      else if (t < 6.4) { x = .75; f = Math.floor(t * 4) % 2 ? 'wave' : 'talk'; }
      else { x = lerp(.75, 2.6, seg(t, 6.4, 7.6)); f = walkFrame(t * 1.6); flip = false; }
      r1.root.visible = vis; r1.root.position.set(x ?? 1, 0, -.6); r1.frame(f); r1.face(cam, flip); }
    // roommates 2 and 3 by the window: one calls her mother, the other holds on to her
    { const vis = true; r2.root.visible = r3.root.visible = vis;
      r2.root.position.set(-1.0, 0, -1.85); r2.frame(t >= 9.2 && t < 11.6 && Math.floor(t * 3) % 2 ? 'talk' : 'stand'); r2.face(cam, true);
      r3.root.position.set(t < T.hug ? -2.0 : lerp(-2.0, -1.45, seg(t, T.hug, T.hug + .6)), 0, -1.75); r3.frame(t >= T.hug && t < T.hug + .6 ? walkFrame(t) : (t >= T.hug + .6 ? 'push' : 'stand')); r3.face(cam, false); }
    post.dof.focus = cam.position.distanceTo(_v.copy(hero.root.position).setY(.9)); post.dof.aper = 60; post.dof.maxCoc = 10;
    renderer.toneMappingExposure = 1.2 + .8 * end; post.bloom.strength = .45 + 1.2 * end; post.bloom.threshold = .8 - .3 * end;
  }
  return { scene, update };
}
