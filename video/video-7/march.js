// The march: a ground strip the forms walk along, camera tracking beside them (high 3/4, leading slightly).
// The world follows the form: savanna for the climb up; once he takes his phone out, back down: jungle, shore, the primordial pool.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard, ground } from './px.js';
import { mat, mesh, box, ridge } from './kit.js';
import { sky, particles } from './fx.js';
import { makePerson, WALK } from './people.js';
import { makeEvo } from './evo.js';
import { T, formAt, XAt } from './story.js';
import { seg, ss, clamp, lerp, eio } from '/core/lib.js';

function acacia(seed) { const P = new PX(40, 40), B = ramp(['#2a1c12', '#4a321e'], .22), L = ramp(['#2a3a1a', '#3e5222', '#56702e'], .45);
  for (let y = 18; y < 40; y++) P.set(19 + (y < 26 ? (26 - y) >> 2 : 0), y, B(.5, 0, y)); P.line(19, 26, 10, 16, B(.4, 0, 0)); P.line(20, 24, 30, 15, B(.4, 0, 0));
  P.fill((x, y) => { const d = Math.abs(y - 13) / 4 + Math.abs(x - 20) / 19 * .6 + (h2(x, y, seed) - .5) * .4; return d < 1 && y > 8 && y < 18 ? L(.7 - d * .4, x, y) : null; }); P.outline(.25); return texOf(P.done()); }
function fern(seed) { const P = new PX(24, 24), G = ramp(['#0e2a12', '#1a4a1e', '#2a6a2a', '#44904a'], .45); for (let k = 0; k < 7; k++) { const a = -2.6 + k * .55; P.line(12, 23, 12 + Math.cos(a) * 11, 23 + Math.sin(a) * 18, G(.4 + k % 3 * .2, 0, 0)); } P.outline(.25); return texOf(P.done()); }

export function buildMarch() {
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2('#c8a878', .02);
  const SK = sky({ top: '#3a6ab0', mid: '#8ab0d8', hor: '#f0d0a0', moonI: 0 }); scene.add(SK.mesh);
  const groundM = { savanna: mat(ground(96, 96, { grass: ['#4a3a1c', '#6a5428', '#8a7036', '#a88c44', '#c4a858'], mask: () => 1, seed: 3 })), jungle: mat(ground(96, 96, { grass: ['#0e1a0e', '#162a14', '#20401c', '#2e5a26', '#3e7430'], mask: () => 1, seed: 5 })), ooze: mat(ground(96, 96, { grass: ['#1a1024', '#2a1a36', '#3e264a', '#54345e', '#6a4472'], mask: () => 1, seed: 7 })) };
  const strip = mesh(new THREE.BoxGeometry(80, .2, 8).translate(20, -.1, 0), groundM.savanna); scene.add(strip);
  // props along the way (both worlds, shown by phase)
  const sav = new THREE.Group(), jun = new THREE.Group();
  for (let i = 0; i < 12; i++) { const a = billboard(acacia(i), 3, 3); a.position.set(-4 + i * 4.2 + h2(i, 1, 2) * 2, 0, -2.5 - h2(i, 2, 2) * 2.5); sav.add(a); }
  for (let i = 0; i < 30; i++) { const f = billboard(fern(i), 1.0 + h2(i, 3, 2) * .8, 1.0 + h2(i, 3, 2) * .8); f.position.set(-2 + i * 1.4, 0, -1.2 - h2(i, 4, 2) * 3); jun.add(f); }
  scene.add(sav, jun);
  for (let i = 0; i < 4; i++) { const r = ridge(40, 6 + i * 2, ['#c49a6a', '#a8805a', '#8a6a4a', '#6a5440'][i], 20 + i); r.position.set(20, 0, -14 - i * 6); scene.add(r); }
  // water rising for the fish, then a shallow purple pool
  const water = new THREE.Mesh(new THREE.PlaneGeometry(80, 8), new THREE.MeshStandardMaterial({ color: '#1e4a6a', transparent: true, opacity: .8, roughness: .7, metalness: 0 })); water.rotation.x = -Math.PI / 2; water.position.set(20, -1, 0); scene.add(water);
  const bubbles = particles(60, (i, t, o) => { const r = h2(i, 1, 9), q = h2(i, 2, 9); o.x = XAt(t) + (r - .5) * 3; o.y = (q * 1.2 + t * .3) % 1.2 - .1; o.z = -.4 - h2(i, 3, 9) * 1.4; o.a = .5; o.s = .012; o.r = .8; o.g = .9; o.b = 1; }, { soft: 1 });
  bubbles.visible = false; scene.add(bubbles);
  // lights
  const sun = new THREE.DirectionalLight('#fff0d0', 2.6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, far: 60 }); sun.shadow.bias = -.0008; scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight('#d8e0f0', '#5a4a30', 1.1); scene.add(hemi);
  const fill = new THREE.PointLight('#fff4e0', 1.2, 6, 2); scene.add(fill);
  const phoneL = new THREE.PointLight('#8fc0ff', 0, 1.6, 2); scene.add(phoneL);
  const phoneG = glow('#9cc8ff', .25, .9); phoneG.visible = false; scene.add(phoneG);
  // the forms
  const evo = makeEvo(); scene.add(evo.root); evo.root.userData.char = 'hero';
  const student = makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark' }, { ...WALK, p0: { pose: 'walkphone', step: 0 }, p1: { pose: 'walkphone', step: 1, bob: 1 }, p2: { pose: 'walkphone', step: 2 }, p3: { pose: 'walkphone', step: 3, bob: 1 } });
  scene.add(student.root);
  const puff = particles(40, (i, t, o) => { const k = (t * 3) % 1; o.x = 0; o.y = 0; o.z = 0; o.a = 0; }, { soft: 1 });
  const _v = new THREE.Vector3(), cA = new THREE.Color();

  function update(t, shot, cam, post, renderer) {
    const F = formAt(t).id, x = XAt(t), back = t >= T.flip;
    // camera: high 3/4 tracking shot, leading slightly; closing in on the puddle at the end
    const close = seg(t, 12.0, 14.0);
    cam.position.set(x + lerp(1.0, .3, close), lerp(1.75, .75, close), lerp(3.7, 1.35, close)); cam.lookAt(x + lerp(.25, .08, close), lerp(.75, .05, close), 0);
    cam.fov = 42; cam.updateProjectionMatrix();
    // walking
    const step = Math.floor(t * (back ? 4 : 6)) % 2, step4 = Math.floor(t * 7) % 4;
    const isStudent = F === 'student' || F === 'phone';
    evo.root.visible = !isStudent; student.root.visible = isStudent;
    let y = 0;
    if (F === 'fish') y = -.12 + Math.sin(t * 6) * .03; if (F === 'blob') y = -.15;
    if (isStudent) { student.root.position.set(x, 0, 0); student.frame(F === 'student' ? ['w0', 'w1', 'w2', 'w3'][step4] : ['p0', 'p1', 'p2', 'p3'][Math.floor(t * 4) % 4]); student.face(cam); }
    else { evo.root.position.set(x, y, 0); evo.frame(F + (F === 'blob' ? Math.floor(t * 2) % 2 : step)); evo.face(cam); }
    const hero = isStudent ? student.root : evo.root;
    // world by phase: savanna (up), jungle, water, ooze (down)
    const W = !back ? 'savanna' : t < T.water ? 'jungle' : 'ooze';
    strip.material = groundM[W]; sav.visible = !back; jun.visible = back && t < 12.4;
    water.position.y = t < T.water ? -1 : lerp(-.4, .04, seg(t, T.water - .3, T.water + .3)); water.material.color.set(t < 12.4 ? '#1e4a6a' : '#4a2a5a');
    bubbles.visible = t > T.water; bubbles.userData.update(t);
    const dark = seg(t, 8.3, 12.4);
    scene.fog.color.set('#c8a878').lerp(cA.set('#2a1a34'), dark);
    SK.u.top.value.set('#3a6ab0').lerp(cA.set('#1a0e2a'), dark); SK.u.mid.value.set('#8ab0d8').lerp(cA.set('#3a1e4a'), dark); SK.u.hor.value.set('#f0d0a0').lerp(cA.set('#6a3a5a'), dark);
    sun.position.set(x - 6, 10, 6); sun.target.position.set(x, 0, 0); sun.intensity = 2.6 * (1 - .6 * dark); sun.color.set('#fff0d0').lerp(cA.set('#b090d0'), dark);
    hemi.intensity = 1.1 * (1 - .5 * dark);
    fill.position.set(x + 1, 1.6, 2.2);
    // the phone's cold light from the moment he takes it out
    const ph = t >= T.ping; phoneG.visible = ph; phoneL.intensity = ph ? 1.2 : 0;
    const ppos = _v.copy(hero.position).add(new THREE.Vector3(.3, F === 'blob' ? .22 : F === 'fish' ? .38 : F === 'apephone' ? .95 : 1.1, .1));
    phoneL.position.copy(ppos).add(new THREE.Vector3(.1, .1, .3)); phoneG.position.copy(ppos);
    const blink = t >= T.blobPing && t < T.blobPing + .6 ? 1.8 : 1; phoneG.scale.setScalar(.25 * blink);
    post.dof.focus = cam.position.distanceTo(_v.copy(hero.position).setY(hero.position.y + .7)); post.dof.aper = lerp(260, 60, close); post.dof.maxCoc = 18;
    renderer.toneMappingExposure = 1.12; post.bloom.strength = .5 + .2 * dark; post.bloom.threshold = .85;
  }
  return { scene, update, hero: { get root() { return student.root.visible ? student.root : evo.root; } } };
}
