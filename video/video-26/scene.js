// The mirror: he scrolls in front of a full-length mirror. His reflection gives up, puts the phone down, walks out of
// the frame and comes back with a medal, a diploma, a girlfriend… then leaves for good. He has no reflection left.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson, WALK, walkFrame } from './people.js';
import { T, TRIPS } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

function wallTex() { const P = new PX(64, 64), R = ramp(['#4a3a3e', '#5a4850', '#6a5660', '#7a6670'], .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, 5) - .5) * .2 + (h2(x, y, 5) - .5) * .1 + ((x % 16) === 0 ? -.15 : 0), x, y)); return P.done(); }
function rugTex() { const P = new PX(48, 36), R = ramp(['#2a3a3a', '#3a5050', '#4a6a66', '#5a8078'], .45); P.fill((x, y) => { const b = x < 3 || y < 3 || x > 44 || y > 32; return R(b ? .8 : .45 + ((x >> 2) + (y >> 2)) % 2 * .1 + (h2(x, y, 7) - .5) * .2, x, y); }); return P.done(); }

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#06060a');
  const floorM = mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 3, cols: ['#2a1c14', '#40291c', '#583a26', '#704c32', '#8a603e'] })), wM = mat(wallTex());
  // the real room (z > -1.2) and the mirrored room behind the glass (z < -1.2)
  scene.add(mesh(new THREE.BoxGeometry(6, .2, 7).translate(0, -.1, -1.2), floorM));
  const wl = box(2.6, 3, .2, wM); wl.position.set(-1.75, 0, -1.2); scene.add(wl); const wr = box(2.6, 3, .2, wM); wr.position.set(1.75, 0, -1.2); scene.add(wr);
  const wt = box(.9, .95, .2, wM); wt.position.set(0, 2.05, -1.2); scene.add(wt); const wb = box(.9, .12, .2, wM); wb.position.set(0, 0, -1.2); scene.add(wb);
  const mback = box(4, 3, .2, wM); mback.position.set(0, 0, -4.6); scene.add(mback);
  for (const x of [-1.6, 1.6]) { const s = box(.2, 3, 3.4, wM); s.position.set(x, 0, -2.9); scene.add(s); }
  const frameM = new THREE.MeshStandardMaterial({ color: '#c8a050', roughness: .4, metalness: .6 });
  for (const [w, h, x, y] of [[1.02, .08, 0, 2.05], [1.02, .08, 0, .12], [.08, 2.0, -.47, 1.08], [.08, 2.0, .47, 1.08]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .1), frameM); b.position.set(x, y, -1.08); scene.add(b); }
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(.88, 1.9), new THREE.MeshBasicMaterial({ color: '#c8dcf0', transparent: true, opacity: .1, depthWrite: false })); glass.position.set(0, 1.08, -1.12); scene.add(glass);
  const shine = new THREE.Mesh(new THREE.PlaneGeometry(.06, 1.6), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .12, depthWrite: false })); shine.position.set(-.25, 1.15, -1.11); shine.rotation.z = -.25; scene.add(shine);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), mat(rugTex())); rug.rotation.x = -Math.PI / 2; rug.position.set(0, .005, .2); scene.add(rug);
  const rug2 = rug.clone(); rug2.position.set(0, .005, -2.6); scene.add(rug2);
  // a lamp on each side of the glass (real and reflected)
  for (const z of [-.4, -2.0]) { const L = new THREE.PointLight('#ffcf90', 3.2, 4.5, 1.5); L.position.set(1.0, 1.9, z); scene.add(L); const g = glow('#ffc070', .3, 1.0); g.position.set(1.0, 1.9, z); scene.add(g); }
  scene.add(new THREE.HemisphereLight('#a8a0c0', '#2a1c18', 1.4));
  const fill = new THREE.PointLight('#e0d8f0', 2.2, 7, 1.5); fill.position.set(.8, 1.8, 2.4); scene.add(fill);
  const phoneL = new THREE.PointLight('#8fc0ff', .8, 1.3, 2); scene.add(phoneL);
  // him and his reflection (same look; the reflection gets things)
  const LOOK = { top: 'red', bottom: 'jean', hair: 'hairDark', shoe: 'sneaker' };
  const RF = { phone: { pose: 'standphone' }, stand: { pose: 'stand' }, smile: { pose: 'stand', smile: 1 }, wave: { pose: 'wave', smile: 1, mouth: 1 }, ...WALK };
  const hero = makePerson(LOOK, { phone: { pose: 'standphone' }, blink: { pose: 'standphone', blink: 1 }, look: { pose: 'stand' } });
  hero.root.position.set(-.62, 0, .2); hero.shadow.visible = false; scene.add(hero.root);
  const refl = { base: makePerson(LOOK, RF), medal: makePerson({ ...LOOK, medal: 1 }, RF), grad: makePerson({ ...LOOK, gown: 1, gradCap: 1 }, RF), girl: makePerson({ ...LOOK, medal: 1 }, RF) };
  Object.values(refl).forEach(r => { r.shadow.visible = false; scene.add(r.root); });
  const her = makePerson({ dress: 1, top: 'mustard', hair: 'hairBrown', hairStyle: 'long', hairUp: 1, shoe: 'shoe' }, { smile: { pose: 'stand', smile: 1 }, wave: { pose: 'wave', smile: 1 }, ...WALK }); her.shadow.visible = false; scene.add(her.root);
  const RZ = -2.15, _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    const u = eio(seg(t, 0, T.txt)); cam.position.set(lerp(.55, .45, u), lerp(1.45, 1.4, u), lerp(2.9, 2.4, u)); cam.lookAt(lerp(-.38, -.36, u), lerp(1.05, 1.02, u), -1.0); cam.fov = 54; cam.updateProjectionMatrix();
    hero.frame(t >= T.up ? 'look' : (t % 2.9 < .1 ? 'blink' : 'phone')); hero.face(cam);
    phoneL.position.copy(hero.local(25, 18)).add(_v.set(.2, .05, .2)); phoneL.intensity = t < T.up ? .8 : .2;
    // which reflection, where, doing what
    let key = 'base', x = -.05, f = 'phone', flip = true, vis = true, girl = false;
    if (t >= T.drop) f = Math.floor(t * 2) % 5 === 0 ? 'stand' : 'stand';
    const leg = (a, b, x0, x1) => { const k = seg(t, a, b); return lerp(x0, x1, k); };
    for (let i = 0; i < TRIPS.length; i++) {
      const tr = TRIPS[i], prevWith = i ? TRIPS[i - 1].with : 'base';
      if (t >= tr.out && t < tr.out + .9) { key = prevWith; x = leg(tr.out, tr.out + .9, -.05, 1.0); f = walkFrame(t); flip = false; }
      else if (t >= tr.out + .9 && t < tr.back) { vis = false; }
      else if (t >= tr.back && t < tr.back + .7) { key = tr.with; x = leg(tr.back, tr.back + .7, 1.0, -.05); f = walkFrame(t); flip = true; }
      else if (t >= tr.back + .7 && (i === TRIPS.length - 1 || t < TRIPS[i + 1].out)) { key = tr.with; x = -.05; f = tr.with === 'girl' ? (t >= 10.2 && t < 12.6 && Math.floor(t * 3) % 2 ? 'wave' : 'smile') : 'smile'; flip = true; }
    }
    if (t >= T.gone) { key = 'girl'; x = leg(T.gone, T.gone + .9, -.05, 1.0); f = walkFrame(t); flip = false; if (t >= T.gone + .9) vis = false; }
    girl = key === 'girl' && vis;
    Object.entries(refl).forEach(([k, r]) => { r.root.visible = vis && k === key; });
    if (vis) { const r = refl[key]; r.root.position.set(x, 0, RZ); r.frame(f); r.face(cam, flip); }
    her.root.visible = girl; if (girl) { her.root.position.set(x + .45, 0, RZ - .15); her.frame(f.startsWith('w') && f !== 'wave' ? walkFrame(t + .2) : 'smile'); her.face(cam, flip); }
    post.dof.focus = cam.position.distanceTo(_v.set(-.3, 1.1, -.6)); post.dof.aper = 12; post.dof.maxCoc = 10;
    renderer.toneMappingExposure = 1.2; post.bloom.strength = .35; post.bloom.threshold = .85;
  }
  return { scene, update };
}
