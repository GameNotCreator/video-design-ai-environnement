// "Futur toi": his bedroom at night. He scrolls on the edge of the bed, earbuds in. The ghost of himself at 80 (same red
// jumper, white hair, translucent and cold) shakes him, shouts, reaches through the phone, sits next to him, kneels,
// and fades with every regret. He laughs at a video. The ghost is gone. He takes out an earbud.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson } from './people.js';
import { T, GHOST } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

function wallTex(cols, s) { const P = new PX(64, 64), R = ramp(cols, .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, s) - .5) * .25 + (h2(x, y, s) - .5) * .1, x, y)); return P.done(); }
function blanketTex() { const P = new PX(48, 30), R = ramp(['#3a1c1c', '#502828', '#6a3a36', '#844e48'], .45); P.fill((x, y) => R(.5 + .2 * Math.sin(x * .5 + Math.sin(y * .3) * 2) + (h2(x, y, 4) - .5) * .2 + ((x + y) % 8 === 0 ? -.15 : 0), x, y)); return P.done(); }
function rugTex() { const P = new PX(48, 36), R = ramp(['#2a2028', '#40303a', '#5a4450', '#76606a'], .45); P.fill((x, y) => { const b = x < 3 || y < 3 || x > 44 || y > 32; return R(b ? .8 : .45 + ((x >> 2) + (y >> 2)) % 2 * .1 + (h2(x, y, 7) - .5) * .2, x, y); }); return P.done(); }
// posters of what he'll never do: Tokyo at night (red sun, towers), a mountain
function posterTex(kind) {
  const P = new PX(18, 26);
  if (kind === 'tokyo') { P.fill((x, y) => y < 16 ? [30, 26, 60] : [20, 18, 30]); for (let x = 0; x < 18; x++) for (let y = 0; y < 26; y++) if (Math.hypot(x - 9, y - 9) < 4.5) P.set(x, y, [210, 60, 50]); [[1, 14], [4, 10], [7, 13], [11, 8], [14, 12], [16, 15]].forEach(([x, top]) => { for (let y = top; y < 22; y++) for (let k = 0; k < 2; k++) P.set(x + k, y, (y + x) % 3 ? [16, 14, 26] : [230, 200, 120]); }); }
  else { P.fill((x, y) => [40 + y * 3, 60 + y * 3, 90 + y * 2]); for (let x = 0; x < 18; x++) { const top = 8 + Math.abs(x - 9) * 1.3; for (let y = Math.floor(top); y < 26; y++) P.set(x, y, y < top + 2 ? [236, 236, 244] : [60, 70, 80]); } }
  return P.done();
}

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#05060c');
  scene.add(mesh(new THREE.BoxGeometry(6, .2, 5).translate(0, -.1, 0), mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 3, cols: ['#1a120e', '#2c1e16', '#43301f', '#5a4128', '#6e5032'] }))));
  const wM = mat(wallTex(['#1c2030', '#262c40', '#323a52', '#3e4862'], 2));
  const back = box(6, 3, .2, wM); back.position.set(0, 0, -2.1); scene.add(back);
  const left = box(.2, 3, 5, wM); left.position.set(-2.6, 0, 0); scene.add(left);
  // window (night, moon, stars)
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(1.0, .9), new THREE.MeshBasicMaterial({ color: '#0a1028' })); sky.position.set(.15, 1.75, -1.99); scene.add(sky);
  const frameM = new THREE.MeshStandardMaterial({ color: '#2a2018', roughness: .9 });
  for (const [w, h, x, y] of [[1.12, .06, .15, 2.2], [1.12, .06, .15, 1.3], [.06, .96, -.38, 1.75], [.06, .96, .68, 1.75], [.04, .9, .15, 1.75]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .06), frameM); b.position.set(x, y, -1.97); scene.add(b); }
  const moon = glow('#c8d8ff', .4, 1.2); moon.position.set(.45, 2.0, -1.98); scene.add(moon);
  for (let i = 0; i < 7; i++) { const s = glow('#dfe8ff', .05, 1.5); s.position.set(-.3 + h2(i, 1, 2) * .9, 1.4 + h2(i, 2, 2) * .7, -1.985); scene.add(s); }
  // bed against the back wall
  const woodM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 6, nails: false, cols: ['#1e140e', '#33231a', '#4a3424', '#5e4430'] }));
  const bedF = box(2.0, .3, 1.1, woodM); bedF.position.set(-1.45, 0, -1.4); scene.add(bedF);
  const matr = box(1.95, .16, 1.05, mat(blanketTex())); matr.position.set(-1.45, .3, -1.4); scene.add(matr);
  const pillow = box(.5, .12, .7, new THREE.MeshStandardMaterial({ color: '#b8b4c4', roughness: 1 })); pillow.position.set(-2.2, .46, -1.4); scene.add(pillow);
  const head = box(.08, .9, 1.1, woodM); head.position.set(-2.46, 0, -1.4); scene.add(head);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.3), mat(rugTex())); rug.rotation.x = -Math.PI / 2; rug.position.set(-.7, .005, -.2); scene.add(rug);
  [[-1.55, 1.75, 'tokyo'], [-.85, 1.7, 'mountain']].forEach(([x, y, k]) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(.42, .6), mat(posterTex(k))); p.position.set(x, y, -1.99); scene.add(p); });
  // nightstand with a dead lamp
  const ns = box(.4, .5, .4, woodM); ns.position.set(-2.25, 0, -.5); scene.add(ns);
  const lampB = box(.1, .3, .1, new THREE.MeshStandardMaterial({ color: '#202028' })); lampB.position.set(-2.25, .5, -.5); scene.add(lampB);
  // lights: cold night, the phone on his face, the ghost's own cold glow
  const hemi = new THREE.HemisphereLight('#5a6a9a', '#1c1418', 1.6); scene.add(hemi);
  const fill = new THREE.PointLight('#a0b0e0', 2.6, 7, 1.5); fill.position.set(.6, 1.8, 1.8); scene.add(fill);
  const moonL = new THREE.PointLight('#8aa0e0', 1.4, 5, 1.5); moonL.position.set(.15, 1.8, -1.6); scene.add(moonL);
  const phoneL = new THREE.PointLight('#8fc0ff', 1.0, 1.4, 2); scene.add(phoneL);
  const ghostL = new THREE.PointLight('#7fb0ff', 0, 2.2, 1.6); scene.add(ghostL);

  // him: earbuds in
  const hero = makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark', shoe: 'sneaker', buds: 1 }, { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, laugh: { pose: 'sitlaugh' }, look: { pose: 'look', nobuds: 1 } });
  hero.root.position.set(-1.0, .02, -.95); hero.shadow.visible = false; scene.add(hero.root);
  // the ghost: him at 80 (same red jumper), tinted cold and see-through, no shadow
  const GF = { stand: { pose: 'stand' }, wave: { pose: 'wave', mouth: 1 }, push: { pose: 'push', mouth: 1 }, talk: { pose: 'talk', mouth: 1 }, talk2: { pose: 'talk' }, sit: { pose: 'sit' }, sittalk: { pose: 'sittalk', mouth: 1 }, kneel: { pose: 'kneel', open: 1, mouth: 1 }, kneel2: { pose: 'kneel', open: 1 } };
  const ghost = makePerson({ top: 'red', bottom: 'black', hair: 'hairWhite', skin: 'skinOld', beard: 4, hunch: 1, shoe: 'shoe' }, GF);
  const gm = ghost.mesh.material; gm.transparent = true; gm.depthWrite = false; gm.alphaTest = .02; gm.color.set('#a8c4f0'); gm.emissiveMap = null; gm.emissive.set('#0a1630'); gm.emissiveIntensity = 1; gm.needsUpdate = true;   // alphaTest is compared with alpha × opacity: keep it low so he can fade
  ghost.mesh.castShadow = false; ghost.shadow.visible = false; ghost.mesh.renderOrder = 2; scene.add(ghost.root);
  const halo = glow('#6a9aff', .8, .12); scene.add(halo);
  // where he stands for each beat (x, z, sits on the bed?, faces left?)
  const SPOT = { shake: [-.36, -1.12, 0, true], shout: [-.36, -1.12, 0, true], reach: [-.4, -1.08, 0, true], talk: [-.36, -1.12, 0, true], sit: [-1.6, -1.0, .02, false], kneel: [-.5, -.5, 0, true] };
  const _v = new THREE.Vector3();
  // camera keys: [t, pos, look, fov]
  const CAM = [
    [0, [-.5, 1.15, 2.3], [-.8, .75, -1.0], 50], [5.4, [-.55, 1.12, 2.1], [-.8, .76, -1.0], 50], [8.3, [-.58, 1.1, 2.0], [-.82, .76, -1.0], 50],
    [8.5, [-1.0, 1.12, 2.2], [-1.3, .75, -1.0], 50], [11.1, [-1.0, 1.1, 2.05], [-1.28, .75, -1.0], 50],
    [11.3, [-.6, 1.0, 2.2], [-.8, .65, -.8], 50], [13.9, [-.62, 1.0, 2.0], [-.82, .66, -.8], 50],
    [14.5, [-.75, 1.1, 2.0], [-.95, .8, -.95], 50], [16.7, [-.8, 1.02, 1.0], [-1.0, .88, -.95], 48],
  ];
  function camAt(t) {
    let i = 0; while (i < CAM.length - 1 && t >= CAM[i + 1][0]) i++;
    const A = CAM[i], B = CAM[Math.min(i + 1, CAM.length - 1)], cut = B[0] - A[0] < .5;   // keys closer than 0.5 s are a cut
    const u = i === CAM.length - 1 || cut ? (cut && t >= B[0] ? 1 : 0) : eio(seg(t, A[0], B[0]));
    return [0, 1, 2].map(k => A[1][k] + (B[1][k] - A[1][k]) * u).concat([0, 1, 2].map(k => A[2][k] + (B[2][k] - A[2][k]) * u), A[3] + (B[3] - A[3]) * u);
  }

  function update(t, shot, cam, post, renderer) {
    const c = camAt(t); cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]); cam.fov = c[6]; cam.updateProjectionMatrix();
    // him
    hero.frame(t >= T.up ? 'look' : t >= T.laugh ? 'laugh' : (t % 2.9 < .1 ? 'blink' : 'phone')); hero.face(cam);
    phoneL.position.copy(hero.local(25, 18)).add(_v.set(.2, .05, .2)); phoneL.intensity = t >= T.up ? .3 : 1.0;
    // the ghost
    let gi = 0; for (let i = 0; i < GHOST.length; i++) if (t >= GHOST[i].a) gi = i;
    const G = GHOST[gi], prev = GHOST[Math.max(0, gi - 1)];
    let op = lerp(prev.op, G.op, ss(seg(t, G.a, G.a + .6)));
    const flick = gi >= 3 ? 1 - .8 * (1 - ss(seg(t, G.a - .05, G.a + .25))) : 1;     // a flicker as he jumps to a new spot
    op *= flick * (1 - ss(seg(t, T.fade, T.gone)));
    op *= .9 + .1 * Math.sin(t * 7.3) * Math.sin(t * 3.1);                            // a slow shimmer
    const [x, z, y, flip] = SPOT[G.pose];
    const fr = G.pose === 'shake' ? (Math.floor(t * 6) % 2 ? 'wave' : 'push') : G.pose === 'shout' ? 'wave' : G.pose === 'reach' ? 'push'
      : G.pose === 'talk' ? (Math.floor(t * 3) % 2 ? 'talk' : 'talk2') : G.pose === 'sit' ? (Math.floor(t * 3) % 2 ? 'sittalk' : 'sit') : (Math.floor(t * 3) % 2 ? 'kneel' : 'kneel2');
    const jit = G.pose === 'shake' || G.pose === 'shout' ? Math.sin(t * 40) * .008 : 0;
    ghost.root.visible = op > .01; ghost.root.position.set(x + jit, y, z); ghost.frame(fr); ghost.face(cam, flip); gm.opacity = op;
    halo.visible = ghost.root.visible; halo.position.set(x, y + (G.pose === 'kneel' ? .45 : G.pose === 'sit' ? .55 : .7), z - .1); halo.material.opacity = op * .8;
    ghostL.position.set(x + .15, .9, z + .3); ghostL.intensity = .8 * op;
    post.dof.focus = cam.position.distanceTo(_v.set(-.9, .85, -.95)); post.dof.aper = 10; post.dof.maxCoc = 8;
    renderer.toneMappingExposure = 1.2; post.bloom.strength = .35; post.bloom.threshold = .88;
  }
  return { scene, update };
}
