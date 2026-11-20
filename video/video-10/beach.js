// Ep. 3 — the lifeguard. A beach, a high chair, the lifeguard on his phone; far out, a swimmer in trouble… filming a live.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard } from './px.js';
import { mat, mesh, box } from './kit.js';
import { woodPlanks as wp } from './px.js';
import { sky, particles } from './fx.js';
import { makePerson, PAL } from './people.js';
import { T } from './story.js';
import { seg, ss, clamp, lerp, eio } from '/core/lib.js';


function sandTex() { const P = new PX(96, 96), R = ramp(['#a88a5a', '#c4a670', '#dcc08a', '#ecd6a4'], .45); P.fill((x, y) => R(.55 + (fbm(x * .1, y * .1, 3) - .5) * .4 + (h2(x, y, 4) - .5) * .25, x, y)); return P.done(); }
function waterTex() { const P = new PX(64, 64), R = ramp(['#0e3a5a', '#1a5a80', '#2a7aa0', '#4a9ec0', '#a8dcec'], .45); P.fill((x, y) => { const w = Math.sin((x * .35) + Math.sin(y * .25) * 2) * .5 + .5; return R(.35 + w * .25 + (fbm(x * .15, y * .15, 5) - .5) * .3 + (h2(x, y, 6) > .97 ? .4 : 0), x, y); }); const t = texOf(P.done(), { repeat: [24, 24] }); return t; }
// the swimmer: head, shoulders and arms above the water (34 x 30 px). f: 'w0'|'w1' waving, 'live' phone up + selfie, 'sink' only the arm + phone
function swimmer(f) {
  const P = new PX(34, 30), E = new PX(34, 30), S = PAL.skin, Hr = PAL.hairDark;
  const arm = (x0, y0, x1, y1) => { P.line(x0, y0, x1, y1, S(.55, 0, 0)); P.line(x0 + 1, y0, x1 + 1, y1, S(.4, 0, 0)); };
  if (f !== 'sink') {
    P.ellipse(16, 22, 6, 5, (x, y, dx, dy) => PAL.green(.55 - dy * .2, x, y));               // shoulders (swim top)
    P.ellipse(16, 14, 4.6, 4.8, (x, y, dx, dy) => Hr(.45 - dy * .3, x, y)); P.ellipse(17.5, 15, 3.4, 3.6, (x, y) => S(.6, x, y));
    P.set(18, 14, hex('#1a1016')); P.set(16, 14, hex('#1a1016'));
    if (f === 'live') { P.rect(17, 17, 2, 2, hex('#6a2a2a')); for (let y = 12; y < 18; y++) E.set(17, y, [22, 34, 64]); }
    else P.rect(16, 17, 3, 2, hex('#6a2a2a'));
  }
  if (f === 'w0') { arm(11, 20, 6, 6); arm(21, 20, 27, 5); P.rect(5, 4, 3, 3, S(.6, 0, 0)); P.rect(26, 3, 3, 3, S(.6, 0, 0)); }
  if (f === 'w1') { arm(11, 20, 4, 10); arm(21, 20, 29, 9); P.rect(3, 8, 3, 3, S(.6, 0, 0)); P.rect(28, 7, 3, 3, S(.6, 0, 0)); }
  if (f === 'live' || f === 'sink') {
    const bx = f === 'sink' ? 0 : 0;
    if (f === 'live') arm(11, 20, 5, 8);
    arm(21, f === 'sink' ? 28 : 20, 25, 6); P.rect(24, 4, 3, 3, S(.6, 0, 0));
    for (let y = 0; y < 6; y++) { P.set(27, y, PAL.phone(.4, 0, y)); P.set(28, y, PAL.phone(.6, 0, y)); const c = PAL.glow(.7, 0, y); P.set(26, y, c); E.set(26, y, c); }
    P.set(29, 1, [255, 60, 50]); E.set(29, 1, [255, 60, 50]);   // the red LIVE dot
  }
  P.outline(.3); return { map: texOf(P.done()), em: texOf(E.done()) };
}

export function buildBeach() {
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog('#bcdcec', 25, 140);
  const SK = sky({ top: '#2a6ab8', mid: '#6aaee0', hor: '#d8eef6', moonI: 0 }); scene.add(SK.mesh);
  const sand = mesh(new THREE.BoxGeometry(60, .2, 14).translate(0, -.1, 4), mat(sandTex())); scene.add(sand);
  const wt = waterTex(); const sea = new THREE.Mesh(new THREE.PlaneGeometry(300, 200), new THREE.MeshStandardMaterial({ map: wt, roughness: .4, metalness: .1 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, -.05, -103); scene.add(sea);
  const foam = new THREE.Mesh(new THREE.PlaneGeometry(60, .5), new THREE.MeshBasicMaterial({ color: '#f2fafc', transparent: true, opacity: .8 })); foam.rotation.x = -Math.PI / 2; foam.position.set(0, .01, -2.9); scene.add(foam);
  // lifeguard tower
  const woodM = mat(wp(48, 48, { pw: 6, len: 48, seed: 4, cols: ['#4a3420', '#6a4a2c', '#8a6438', '#a88048'] }));
  const tw = new THREE.Group();
  for (const [x, z] of [[-.45, -.4], [.45, -.4], [-.45, .4], [.45, .4]]) { const l = box(.08, 1.6, .08, woodM); l.position.set(x, 0, z); tw.add(l); }
  const plat = box(1.1, .08, 1.0, woodM); plat.position.y = 1.6; tw.add(plat);
  const back = box(1.1, .7, .06, woodM); back.position.set(0, 1.68, -.48); tw.add(back);
  for (let i = 0; i < 4; i++) { const r = box(.9, .05, .08, woodM); r.position.set(0, .3 + i * .35, .45); tw.add(r); }
  const umb = new THREE.Mesh(new THREE.ConeGeometry(.9, .4, 12, 1, true), new THREE.MeshStandardMaterial({ color: '#e8b830', side: THREE.DoubleSide })); umb.position.y = 3.75; tw.add(umb);
  const up = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, 2.1, 6), woodM); up.position.y = 2.7; tw.add(up);
  tw.position.set(-1.5, 0, 1.2); scene.add(tw);
  // beach life: towels, umbrellas
  for (let i = 0; i < 6; i++) { const u = new THREE.Mesh(new THREE.ConeGeometry(.8, .35, 10, 1, true), new THREE.MeshStandardMaterial({ color: ['#3a7ac8', '#e8e0d0', '#4ab08a', '#e8b830'][i % 4], side: THREE.DoubleSide })); u.position.set(2 + i * 2.4, 1.9, 3 + h2(i, 1, 3) * 3); scene.add(u); const p = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, 1.9, 6), new THREE.MeshStandardMaterial({ color: '#ddd' })); p.position.set(2 + i * 2.4, .95, 3 + h2(i, 1, 3) * 3); scene.add(p); }
  const guard = makePerson({ top: 'red', bottom: 'red', hair: 'hairBlond', shades: 1, skin: 'skin', shoe: 'sneaker' }, { a: { pose: 'phone' }, b: { pose: 'phone', blink: 1 }, talk: { pose: 'phone', mouth: 1 } });
  guard.root.position.set(-1.5, 1.6 + .02, 1.25); scene.add(guard.root); guard.shadow.visible = false;
  const gL = new THREE.PointLight('#8fc0ff', .6, 1.2, 2); scene.add(gL);
  // swimmer far out
  const SW = { w0: swimmer('w0'), w1: swimmer('w1'), live: swimmer('live'), sink: swimmer('sink') };
  const swM = new THREE.MeshLambertMaterial({ map: SW.w0.map, emissiveMap: SW.w0.em, emissive: '#ffffff', emissiveIntensity: 1.8, alphaTest: .5, side: THREE.DoubleSide });
  const sw = new THREE.Mesh(new THREE.PlaneGeometry(34 / 30, 1), swM); sw.position.set(3, .3, -18); scene.add(sw);
  const splash = particles(40, (i, t, o) => { const r = h2(i, 1, 4), q = h2(i, 2, 4), life = (t * 2 + q) % 1; o.x = 3 + (r - .5) * 1.2; o.y = life * .6 * Math.sin(life * Math.PI) + .05; o.z = -18 + (h2(i, 3, 4) - .5) * .8; o.a = .9 * (1 - life); o.s = .05; o.r = o.g = o.b = 1; }, { soft: 1, blend: THREE.NormalBlending });
  scene.add(splash);
  const bubbles = particles(30, (i, t, o) => { const r = h2(i, 1, 5), q = h2(i, 2, 5), life = (t * 1.5 + q) % 1; o.x = 3 + (r - .5) * .5; o.y = .02 + life * .1; o.z = -18 + (h2(i, 3, 5) - .5) * .5; o.a = .9 * (1 - life); o.s = .04; o.r = o.g = o.b = 1; }, { soft: 1, blend: THREE.NormalBlending });
  bubbles.visible = false; scene.add(bubbles);
  const sun = new THREE.DirectionalLight('#fff4e0', 2.8); sun.position.set(-10, 20, 12); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, far: 60 }); scene.add(sun);
  scene.add(new THREE.HemisphereLight('#d8eefa', '#a89068', 1.2));
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    // cameras: wide beach → from behind the tower out to sea → the lifeguard → the swimmer, close
    if (t < T.sea) { const u = seg(t, 0, T.sea); cam.position.set(lerp(1.6, 1.2, u), lerp(3.6, 3.3, u), lerp(7.8, 7.0, u)); cam.lookAt(-1.1, 1.9, -1.5); cam.fov = 48; }
    else if (t < T.guard) { const u = seg(t, T.sea, T.guard); cam.position.set(.6, 2.4, 3.6); cam.lookAt(lerp(2.0, 2.9, u), .3, -15); cam.fov = lerp(40, 26, u); }
    else if (t < T.live) { const u = seg(t, T.guard, T.live); cam.position.set(lerp(.3, .15, u), 2.4, lerp(3.6, 3.4, u)); cam.lookAt(-1.4, 2.45, 1.2); cam.fov = 46; }
    else { const u = eio(seg(t, T.live, T.impact)); cam.position.set(3.4, lerp(1.2, .9, u), lerp(-14.6, -15.2, u)); cam.lookAt(3, lerp(.5, .2, u), -18); cam.fov = 42; }
    cam.updateProjectionMatrix();
    wt.offset.set(t * .01, t * .02);
    guard.frame(t >= 7.0 && t < 9.2 && Math.floor(t * 3) % 2 ? 'talk' : (t % 3.3 < .12 ? 'b' : 'a')); guard.face(cam);
    gL.position.copy(guard.local(25, 18)).add(_v.set(.2, .05, .2));
    // swimmer: waving, then the live, then down
    let f = Math.floor(t * 4) % 2 ? 'w0' : 'w1', y = .3 + Math.sin(t * 3) * .06;
    if (t >= T.live) f = 'live';
    if (t >= T.sink) { f = 'sink'; y = lerp(.3, -.9, seg(t, T.sink, T.impact - .1)); }
    const F = SW[f]; if (swM.map !== F.map) { swM.map = F.map; swM.emissiveMap = F.em; swM.needsUpdate = true; }
    sw.position.y = y; sw.lookAt(cam.position.x, sw.position.y, cam.position.z);
    splash.visible = t < T.sink; splash.userData.update(t); bubbles.visible = t >= T.sink; bubbles.userData.update(t);
    const target = t < T.sea ? guard.root.position : t < T.guard ? sw.position : t < T.live ? guard.root.position : sw.position;
    post.dof.focus = cam.position.distanceTo(target); post.dof.aper = t >= T.live ? 80 : 160; post.dof.maxCoc = 16;
    renderer.toneMappingExposure = 1.08; post.bloom.strength = .4; post.bloom.threshold = .9;
  }
  return { scene, update, hero: { root: guard.root } };
}
