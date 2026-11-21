// Right in front of you: a train carriage. A girl sits across from him and keeps smiling at him; he swipes on a
// dating app. She gets off at Central. His phone buzzes: it's a match, her, 0 km away. The seat is empty.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson, WALK, walkFrame } from './people.js';
import { T } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

function seatTex() { const P = new PX(32, 32), R = ramp(['#1a2a4a', '#24386a', '#30488a', '#4a62a4'], .45); P.fill((x, y) => R(.5 + (h2(x, y, 4) - .5) * .3 + (((x >> 2) + (y >> 2)) % 2) * .12, x, y)); return P.done(); }
function landTex() {   // fields, trees, poles: scrolls past the window
  const P = new PX(192, 48), sky = ramp(['#8ab0d8', '#a8c8e8', '#c8dcf0'], .45), G = ramp(['#2a4a24', '#3e6a2e', '#5a8a3a', '#7aa04a'], .45), Tr = ramp(['#12301a', '#1e5028', '#2e7a36'], .45);
  P.fill((x, y) => y < 26 ? sky(.3 + (26 - y) / 40, x, y) : G(.4 + (fbm(x * .1, y * .3, 3) - .5) * .5 + (y > 36 ? .15 : 0), x, y));
  for (let k = 0; k < 14; k++) { const cx = Math.floor(h2(k, 1, 5) * 192), r = 4 + Math.floor(h2(k, 2, 5) * 5); for (let y = 26 - r * 2; y < 27; y++) for (let x = cx - r; x <= cx + r; x++) if (Math.hypot((x - cx) / r, (y - (26 - r)) / r) < 1) P.set(((x % 192) + 192) % 192, y, Tr(.5 + (h2(x, y, k) - .5) * .5, x, y)); }
  for (let x = 0; x < 192; x += 48) for (let y = 6; y < 40; y++) P.set(x, y, [60, 56, 52]);
  for (let x = 0; x < 192; x++) P.set(x, 10 + Math.round(2 * Math.sin(x / 48 * Math.PI)), [40, 40, 44]);
  const t = texOf(P.done(), { repeat: [1, 1] }); t.wrapS = THREE.RepeatWrapping; return t;
}
function platTex() { const P = new PX(192, 48), W = ramp(['#6a6a70', '#86868c', '#a2a2a8'], .45); P.fill((x, y) => y < 30 ? W(.5 + (((x >> 4) % 2) ? .1 : 0), x, y) : [200, 180, 60]); for (let x = 20; x < 172; x += 50) for (let y = 6; y < 14; y++) for (let i = 0; i < 26; i++) P.set(x + i, y, [24, 40, 90]); const t = texOf(P.done(), { repeat: [1, 1] }); t.wrapS = THREE.RepeatWrapping; return t; }

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0a0a10');
  const floorM = new THREE.MeshStandardMaterial({ color: '#3a3a40', roughness: .9 });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(6, .2, 4).translate(0, -.1, 0), floorM); floor.receiveShadow = true; scene.add(floor);
  const wallM = new THREE.MeshStandardMaterial({ color: '#d8d4cc', roughness: .8 });
  const lower = box(6, .9, .15, wallM); lower.position.set(0, 0, -1.2); scene.add(lower);
  const upper = box(6, .5, .15, wallM); upper.position.set(0, 2.0, -1.2); scene.add(upper);
  const ceil = new THREE.Mesh(new THREE.BoxGeometry(6, .1, 4), wallM); ceil.position.set(0, 2.55, 0); scene.add(ceil);
  // the window strip: landscape (scrolling), then the platform at Central
  const landT = landTex(), platT = platTex(), winM = new THREE.MeshBasicMaterial({ map: landT });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.1), winM); win.position.set(0, 1.45, -1.25); scene.add(win);
  for (const x of [-1.4, 1.4]) { const p = box(.08, 1.1, .1, new THREE.MeshStandardMaterial({ color: '#8a8a90', metalness: .6, roughness: .4 })); p.position.set(x, .9, -1.18); scene.add(p); }
  const winL = new THREE.PointLight('#e8f0ff', 2.4, 5, 1.4); winL.position.set(0, 1.5, -.7); scene.add(winL);
  // facing seats
  const sM = mat(seatTex());
  for (const [x, flip] of [[-.75, -1], [.75, 1]]) { const s = box(.55, .45, .9, sM); s.position.set(x, 0, -.6); scene.add(s); const b = box(.15, .75, .9, sM); b.position.set(x + flip * .33, .45, -.6); scene.add(b); }
  const table = box(.4, .04, .45, new THREE.MeshStandardMaterial({ color: '#6a5040', roughness: .7 })); table.position.set(0, .7, -.85); scene.add(table);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 2.5, 8).translate(0, 1.25, 0), new THREE.MeshStandardMaterial({ color: '#c8c8d0', metalness: .8, roughness: .3 })); pole.position.set(1.7, 0, .3); scene.add(pole);
  scene.add(new THREE.HemisphereLight('#e0e4f0', '#3a3a40', 1.4));
  const top = new THREE.PointLight('#fff8f0', 3.0, 6, 1.5); top.position.set(0, 2.3, 0); scene.add(top);
  const fill = new THREE.PointLight('#f0e8f0', 1.8, 6, 1.6); fill.position.set(.3, 1.6, 2.4); scene.add(fill);
  const phoneL = new THREE.PointLight('#ff9ab8', .8, 1.3, 2); scene.add(phoneL);
  // him (left, facing right) and her (right, facing him)
  const hero = makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark', shoe: 'sneaker' }, { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, look: { pose: 'look' } });
  hero.root.position.set(-.62, .02, -.55); hero.shadow.visible = false; scene.add(hero.root);
  const her = makePerson({ top: 'mustard', bottom: 'jean', hair: 'hairBrown', hairStyle: 'long', hairUp: 1, shoe: 'shoe' }, { sit: { pose: 'look', nophone: 1 }, smile: { pose: 'look', smile: 1, nophone: 1 }, blink: { pose: 'look', smile: 1, blink: 1, nophone: 1 }, stand: { pose: 'stand', smile: 1 }, ...WALK });
  scene.add(her.root);
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    // camera: from the aisle, both of them in profile across the little table; at the end, on the empty seat
    if (t < T.up) { const u = eio(seg(t, 0, T.up)); cam.position.set(lerp(0, .05, u), lerp(1.55, 1.5, u), lerp(3.5, 3.0, u)); cam.lookAt(0, lerp(1.0, .95, u), -.7); cam.fov = 54; }
    else { const u = eo(seg(t, T.up, T.up + 1.0)); cam.position.set(lerp(.05, .1, u), lerp(1.5, 1.4, u), lerp(3.0, 2.6, u)); cam.lookAt(lerp(0, .1, u), lerp(.95, .9, u), -.7); cam.fov = 52; }
        cam.updateProjectionMatrix();
    // the train: rolling, braking into Central (platform), leaving again
    const stopA = T.stop + 1.6, stopB = T.gone + .2;
    const speed = t < stopA ? (t < T.stop ? 1 : 1 - seg(t, T.stop, stopA)) : t < stopB ? 0 : seg(t, stopB, stopB + 1.2);
    const off = (t < stopA ? t - .5 * Math.max(0, t - T.stop) ** 2 / 1.6 : stopA - .8) * .35;
    const atPlat = t >= stopA - .5 && t < stopB + .8; winM.map = atPlat ? platT : landT; (atPlat ? platT : landT).offset.x = atPlat ? 0 : off + (t > stopB ? (t - stopB) * .2 : 0);
    const shake = speed * .006 * Math.sin(t * 31);
    // him
    hero.root.position.y = .02 + shake; hero.frame(t >= T.up ? 'look' : (t % 2.9 < .1 ? 'blink' : 'phone')); hero.face(cam);
    phoneL.position.copy(hero.local(25, 18)).add(_v.set(.2, .05, .2)); phoneL.intensity = t < T.up ? .8 : .1;
    // her: smiles at him, looks down, smiles again; stands at Central, glances back, leaves
    her.root.visible = t < T.gone;
    if (t < T.rise) { her.root.position.set(.62, .02 + shake, -.55); her.frame((t + 1.5) % 3.0 < .1 ? 'blink' : (Math.floor(t / 1.6) % 3 === 1 ? 'sit' : 'smile')); her.face(cam, true); }
    else if (t < T.leave) { her.root.position.set(.95, 0, -.05); her.frame('stand'); her.face(cam, true); }
    else { const u = seg(t, T.leave, T.gone); her.root.position.set(lerp(.95, 2.6, u), 0, -.05); her.frame(walkFrame(t)); her.face(cam, false); }
    post.dof.focus = cam.position.distanceTo(_v.set(0, 1.0, -.55)); post.dof.aper = 14; post.dof.maxCoc = 8;
    renderer.toneMappingExposure = 1.15; post.bloom.strength = .3; post.bloom.threshold = .9;
  }
  return { scene, update };
}
