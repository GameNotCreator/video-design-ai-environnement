// Freefall: the tandem pair (one pixel sprite, full billboard), clouds rushing up, farmland far below coming closer.
// Then the meadow insert: his phone face-up in the grass, "Video ended. Watch again?", one sneaker.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, blob } from './px.js';
import { sky, particles } from './fx.js';
import { PAL } from './people.js';
import { T, LINES, altAt } from './story.js';
import { track, seg, ss, clamp, lerp, eio, eo } from '/core/lib.js';

const INK = hex('#1a1016');
// tandem, side view, belly to earth, heads to the right (64 x 40 px). f: 'a'|'b' flutter, 'shout', 'laugh', 'brace'
function tandem(f) {
  const P = new PX(64, 40), E = new PX(64, 40), RJ = PAL.red, BJ = PAL.black, S = PAL.skin, Hr = PAL.hairDark, G = PAL.grey;
  const fl = f === 'b' ? 1 : 0;
  // instructor (on top / behind): black suit, grey helmet, blue goggles, arms out
  P.poly([[8, 9], [44, 7], [46, 15], [8, 17]], (x, y) => BJ(.6 - (y - 7) * .03 + ((x + y) % 7 === 0 ? -.1 : 0), x, y));
  for (const [x0, y0] of [[2, 6 + fl], [3, 13 - fl]]) for (let x = x0; x < x0 + 8; x++) for (let y = y0; y < y0 + 3; y++) P.set(x, y, BJ(.45, x, y));   // legs
  P.ellipse(50, 9, 5.5, 5, (x, y, dx, dy) => G(.65 - dy * .3, x, y));                 // helmet
  P.rect(52, 9, 4, 2, PAL.teal(.8, 0, 0));                                             // goggles
  P.rect(52, 11, 4, 3, S(.6, 0, 0));
  if (f === 'shout') { P.rect(54, 13, 2, 2, hex('#4a1a1a')); for (let x = 44; x < 60; x++) P.set(x, 4 - Math.floor((x - 44) / 5), BJ(.6, x, 0)); P.rect(59, 1, 2, 2, S(.6, 0, 0)); }   // arm pointing, mouth open
  else if (f === 'brace') { for (let y = 2; y < 9; y++) P.set(47, y, BJ(.6, 0, y)); P.rect(46, 1, 3, 2, S(.6, 0, 0)); }
  else { for (let x = 26; x < 40; x++) P.set(x, 4 - fl, BJ(.6, x, 0)); P.rect(40, 3 - fl, 2, 2, S(.6, 0, 0)); }
  // harness straps
  for (let x = 20; x < 44; x += 6) P.set(x, 17, hex('#c8a040'));
  // student (in front / below): red suit, head right, phone in front of the face
  P.poly([[10, 18], [44, 17], [45, 27], [10, 28]], (x, y) => RJ(.62 - (y - 17) * .03 + ((x + y) % 6 === 0 ? -.1 : 0), x, y));
  for (const [x0, y0] of [[1, 18 - fl], [2, 25 + fl]]) for (let x = x0; x < x0 + 10; x++) for (let y = y0; y < y0 + 3; y++) P.set(x, y, PAL.jean(.5, x, y));
  for (const [x0, y0] of [[0, 18 - fl], [1, 25 + fl]]) P.rect(x0, y0, 2, 3, PAL.sneaker(.8, 0, 0));
  const laugh = f === 'laugh';
  P.ellipse(50, laugh ? 21 : 22, 5, 5, (x, y, dx, dy) => Hr(.5 - dy * .3, x, y));        // hair
  P.ellipse(52, laugh ? 22 : 24, 3.6, 3.4, (x, y, dx, dy) => { const c = dy > -.3 ? PAL.cold(.6 + dx * .2, x, y) : S(.5, x, y); if (dy > -.3) E.set(x, y, [22, 34, 64]); return c; });
  if (laugh) { P.rect(53, 24, 3, 2, hex('#4a1a1a')); P.set(52, 21, INK); P.set(54, 21, INK); } else { P.set(53, 23, INK); P.set(55, 23, INK); }
  // arms forward, phone glowing toward his face
  for (let x = 42; x < 56; x++) P.set(x, 28 + (x > 50 ? 1 : 0), RJ(.5, x, 0));
  P.rect(56, 28, 2, 2, S(.6, 0, 0));
  for (let y = 26; y < 32; y++) for (let x = 58; x < 60; x++) P.set(x, y, PAL.phone(.4, x, y));
  for (let y = 26; y < 32; y++) { const c = PAL.glow(.7, 0, y); P.set(57, y, c); E.set(57, y, c); }
  P.outline(.3);
  return { map: texOf(P.done()), em: texOf(E.done()) };
}
function farmland() {   // one tile: fields, hedges, a road
  const P = new PX(64, 64), F = [ramp(['#3a5a24', '#4e7430', '#628a3a'], .45), ramp(['#6a6a2a', '#8a8634', '#a8a040'], .45), ramp(['#4a3a24', '#62502e', '#7a6638'], .45), ramp(['#2e4a22', '#3c5e2a', '#4a7232'], .45)];
  P.fill((x, y) => { const cx = Math.floor((x + (y > 30 ? 8 : 0)) / 20), cy = Math.floor(y / 22), k = Math.floor(h2(cx, cy, 3) * 4); if (x % 20 === 0 || y % 22 === 0) return [34, 46, 26]; if (Math.abs(x - y * .6 - 10) < 1.2) return [120, 116, 104]; return F[k](.5 + ((k === 1 ? y : x) % 3 === 0 ? .2 : 0) + (h2(x, y, 5) - .5) * .2, x, y); });
  return P.done();
}
function cloudTex(seed) { const P = new PX(40, 18), W = ramp(['#b8c4d4', '#d8e0ea', '#f2f6fa', '#ffffff'], .45); P.fill((x, y) => { const d = Math.hypot((x - 20) / 19, (y - 11) / 8) + (fbm(x * .2, y * .25, seed) - .5) * .6; return d < 1 ? W(.9 - d * .5, x, y) : null; }); return texOf(P.done()); }

export function buildSky() {
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog('#a8c4e0', 60, 900);
  const SK = sky({ top: '#2e64b0', mid: '#6aa0dc', hor: '#cfe0f0', moonI: 0 }); scene.add(SK.mesh);
  const tile = texOf(farmland(), { repeat: [60, 60] });
  const groundM = new THREE.MeshStandardMaterial({ map: tile, roughness: 1 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), groundM); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const sun = new THREE.DirectionalLight('#fff4e0', 2.6); sun.position.set(30, 80, 40); scene.add(sun);
  scene.add(new THREE.HemisphereLight('#c8dcf4', '#5a6a4a', 1.2));
  const frames = { a: tandem('a'), b: tandem('b'), shout: tandem('shout'), laugh: tandem('laugh'), brace: tandem('brace') };
  const tm = new THREE.MeshLambertMaterial({ map: frames.a.map, emissiveMap: frames.a.em, emissive: '#ffffff', emissiveIntensity: 1.6, alphaTest: .5, side: THREE.DoubleSide });
  const pair = new THREE.Mesh(new THREE.PlaneGeometry(64 / 30, 40 / 30), tm); pair.userData.char = 'hero'; scene.add(pair);
  const fill = new THREE.PointLight('#ffffff', 2, 8, 2); scene.add(fill);
  // clouds rushing up past them
  const ctex = [1, 2, 3].map(cloudTex), clouds = [];
  for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(14, 6.3), new THREE.MeshBasicMaterial({ map: ctex[i % 3], transparent: true, alphaTest: .4, fog: true, depthWrite: false })); scene.add(m); clouds.push({ m, x: (h2(i, 1, 6) - .5) * 40, z: -6 - h2(i, 2, 6) * 30, ph: h2(i, 3, 6) }); }
  const streaks = particles(140, (i, t, o) => { const r = h2(i, 1, 8), q = h2(i, 2, 8); o.x = (r - .5) * 8; o.y = ((q * 30 + t * 38) % 30) - 15; o.z = (h2(i, 3, 8) - .5) * 6; o.a = .5; o.s = .03; o.r = o.g = o.b = 1; }, { soft: 1 });
  scene.add(streaks);
  const _c = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    // the ground: from far below to the impact (visual scale, not real metres)
    const k = Math.min(1, t / T.impact), H = 3 + 700 * Math.pow(1 - k, 2.4);
    ground.position.y = -H;
    // shots: side close / above looking down past them / his face / straight down at the ground
    let fr = Math.floor(t * 8) % 2 ? 'b' : 'a';
    if (t < 6.4) { const u = seg(t, 0, 6.4); cam.position.set(lerp(-.2, .3, u), lerp(.7, .9, u), lerp(5.6, 5.0, u)); cam.lookAt(0, 0, 0); cam.fov = 42; }
    else if (t < 9.15) { cam.position.set(.4, 4.6, 3.0); cam.lookAt(0, -6, -1.5); cam.fov = 50; fr = 'shout'; }
    else if (t < 12.0) { const u = seg(t, 9.15, 12); cam.position.set(lerp(1.5, 1.35, u), .3, lerp(2.4, 2.2, u)); cam.lookAt(.6, .05, 0); cam.fov = 40; fr = 'laugh'; }
    else { const u = eio(seg(t, 12.0, T.impact)); cam.position.set(0, 2.8, .02); cam.lookAt(0, -40, 0); cam.fov = 60; fr = t > 12.9 ? 'brace' : 'laugh'; }
    cam.updateProjectionMatrix();
    const F = frames[fr]; if (tm.map !== F.map) { tm.map = F.map; tm.emissiveMap = F.em; tm.needsUpdate = true; }
    pair.lookAt(cam.position); pair.rotation.z += Math.sin(t * 1.3) * .03;
    fill.position.copy(cam.position).lerp(pair.position, .5);
    clouds.forEach(c => { const y = ((c.ph * 120 + t * (14 + 30 * k)) % 120) - 70; c.m.position.set(c.x, y, c.z); c.m.lookAt(cam.position); });
    streaks.userData.update(t);
    post.dof.focus = cam.position.distanceTo(pair.position); post.dof.aper = 60; post.dof.maxCoc = 14;
    renderer.toneMappingExposure = 1.1; post.bloom.strength = .45; post.bloom.threshold = .9;
  }
  return { scene, update, hero: { root: pair } };
}

// —— the meadow insert ——
function grassTex() { const P = new PX(160, 160), G = ramp(['#1e3a14', '#2e5a1e', '#467a2a', '#62983a', '#86b44e'], .45); P.fill((x, y) => G(.45 + (fbm(x * .25, y * .5, 7) - .5) * .7 + (h2(x, y, 3) - .5) * .4 + ((x + Math.floor(y / 3)) % 5 === 0 ? .15 : 0), x, y)); return texOf(P.done()); }
function sneakerTex() { const P = new PX(30, 14), W = PAL.sneaker; P.poly([[1, 6], [18, 3], [28, 7], [29, 12], [1, 12]], (x, y) => W(y > 10 ? .3 : .75 - (x % 7 === 0 ? .15 : 0), x, y)); for (let x = 8; x < 18; x += 2) P.set(x, 6, [40, 40, 48]); P.outline(.3); return texOf(P.done()); }
export function buildMeadow() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#2a3a1e'); scene.fog = new THREE.FogExp2('#3a4a2a', .2);
  const g = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshStandardMaterial({ map: grassTex(), roughness: 1 })); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; scene.add(g);
  const sun = new THREE.DirectionalLight('#fff4dc', 2.4); sun.position.set(-1, 3, 1.4); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -.001; scene.add(sun);
  scene.add(new THREE.HemisphereLight('#c8dcf4', '#3a4a2a', 1.0));
  // the phone, face up, video ended
  const cv = document.createElement('canvas'); cv.width = 300; cv.height = 620; const x = cv.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 0, 620); gr.addColorStop(0, '#1a2a44'); gr.addColorStop(1, '#0a0e18'); x.fillStyle = gr; x.fillRect(0, 0, 300, 620);
  x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(20, 60, 260, 150);   // the ended video's last frame, dimmed
  x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.font = '800 52px Figtree'; x.fillText('Video', 150, 300); x.fillText('ended.', 150, 356);
  x.fillStyle = '#ffffff'; x.beginPath(); x.roundRect(14, 410, 272, 120, 60); x.fill(); x.fillStyle = '#0a0e18'; x.font = '800 44px Figtree'; x.fillText('Watch', 150, 462); x.fillText('again?', 150, 508);
  const sT = new THREE.CanvasTexture(cv); sT.colorSpace = THREE.SRGBColorSpace;
  const phone = new THREE.Group();
  phone.add(new THREE.Mesh(new THREE.BoxGeometry(.075, .009, .155).translate(0, .0045, 0), new THREE.MeshStandardMaterial({ color: '#0c0d12', roughness: .35 })));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(.07, .147), new THREE.MeshStandardMaterial({ map: sT, emissiveMap: sT, emissive: '#ffffff', emissiveIntensity: .5, roughness: .2 })); scr.rotation.x = -Math.PI / 2; scr.position.y = .0093; phone.add(scr);
  phone.rotation.y = .18; phone.position.set(0, .002, .02); phone.children[0].castShadow = true; scene.add(phone);
  const shoe = new THREE.Mesh(new THREE.PlaneGeometry(.3, .14), new THREE.MeshStandardMaterial({ map: sneakerTex(), alphaTest: .5, transparent: true })); shoe.rotation.x = -Math.PI / 2; shoe.rotation.z = .5; shoe.position.set(.07, .003, -.17); scene.add(shoe);
  const sh = blob(.05, .45); sh.scale.set(1, 1.8, 1); sh.position.set(.004, .001, .024); scene.add(sh);
  function update(t, shot, cam, post, renderer) {
    const u = eo(seg(t, T.meadow, T.card));
    cam.position.set(.0, lerp(.36, .3, u), lerp(.09, .07, u)); cam.lookAt(0, 0, .0); cam.fov = 40; cam.updateProjectionMatrix();
    post.dof.focus = cam.position.distanceTo(phone.position); post.dof.aper = 8; post.dof.maxCoc = 10;
    renderer.toneMappingExposure = 1.05; post.bloom.strength = .3; post.bloom.threshold = .95;
  }
  return { scene, update, hero: { root: phone } };
}
