// Overdue: a library book on his desk, "How to Stop Procrastinating", due in two weeks. He scrolls on his bed while the
// years pass and the book gathers dust. Forty years later, the librarian, now old, knocks on his door.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson, WALK, walkFrame } from './people.js';
import { T, stageAt } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

function wallTex() { const P = new PX(64, 64), R = ramp(['#2a3038', '#343c46', '#404a56', '#4c5866'], .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, 2) - .5) * .25 + (h2(x, y, 2) - .5) * .1, x, y)); return P.done(); }
function blanketTex() { const P = new PX(48, 30), R = ramp(['#1c2236', '#2a3350', '#3c4870', '#56658e'], .45); P.fill((x, y) => R(.5 + .2 * Math.sin(x * .5 + Math.sin(y * .3) * 2) + (h2(x, y, 4) - .5) * .2, x, y)); return P.done(); }
function coverTex(dust) {   // the book's cover with its library sticker (real text so it reads)
  const c = document.createElement('canvas'); c.width = 360; c.height = 480; const g = c.getContext('2d');
  g.fillStyle = '#2a4a6a'; g.fillRect(0, 0, 360, 480); g.fillStyle = '#e8c860'; g.fillRect(0, 0, 360, 16); g.fillRect(0, 464, 360, 16);
  g.fillStyle = '#f4f0e6'; g.font = '800 46px Figtree'; g.textAlign = 'center'; ['HOW TO', 'STOP', 'PROCRASTI-', 'NATING'].forEach((l, i) => g.fillText(l, 180, 110 + i * 54));
  g.fillStyle = '#f4f0e6'; g.fillRect(70, 340, 220, 92); g.strokeStyle = '#c84030'; g.lineWidth = 4; g.strokeRect(74, 344, 212, 84);
  g.fillStyle = '#1a1714'; g.font = '700 28px Figtree'; g.fillText('LIBRARY · DUE', 180, 378); g.font = '800 30px Figtree'; g.fillText('12 MAR 2026', 180, 414);
  if (dust) { g.fillStyle = `rgba(180,170,150,${.35 * dust})`; g.fillRect(0, 0, 360, 480); for (let i = 0; i < 300 * dust; i++) { g.fillStyle = 'rgba(200,190,170,.5)'; g.fillRect(h2(i, 1, 3) * 360, h2(i, 2, 3) * 480, 3, 3); } }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function webTex() { const P = new PX(24, 24), c = [210, 212, 220]; for (let i = 0; i < 24; i++) { P.set(i, 0, c); P.set(0, i, c); P.set(i, i, c); if (i < 18) { P.set(i, Math.floor(i / 2), c); P.set(Math.floor(i / 2), i, c); } } for (let r = 5; r < 24; r += 6) for (let a = 0; a <= r; a++) P.set(a, r - a, c); return texOf(P.done()); }

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#05060c');
  scene.add(mesh(new THREE.BoxGeometry(6, .2, 5).translate(0, -.1, 0), mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 3, cols: ['#1a120e', '#2c1e16', '#43301f', '#5a4128', '#6e5032'] }))));
  const wM = mat(wallTex()); const back = box(6, 3, .2, wM); back.position.set(0, 0, -2.1); scene.add(back);
  const right = box(.2, 3, 5, wM); right.position.set(2.4, 0, 0); scene.add(right);
  const skyM = new THREE.MeshBasicMaterial({ color: '#8ab0d8' }), sky = new THREE.Mesh(new THREE.PlaneGeometry(1.0, .9), skyM); sky.position.set(-.9, 1.8, -1.99); scene.add(sky);
  const woodM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 6, nails: false, cols: ['#1e140e', '#33231a', '#4a3424', '#5e4430'] }));
  const bedF = box(2.0, .3, 1.1, woodM); bedF.position.set(-1.4, 0, -1.4); scene.add(bedF);
  const matr = box(1.95, .16, 1.05, mat(blanketTex())); matr.position.set(-1.4, .3, -1.4); scene.add(matr);
  // the desk with the book, front-right
  const desk = box(1.2, .05, .7, woodM); desk.position.set(.2, .72, -.6); scene.add(desk);
  for (const [x, z] of [[-.3, -.9], [.7, -.9], [-.3, -.3], [.7, -.3]]) { const l = box(.05, .72, .05, woodM); l.position.set(x, 0, z); scene.add(l); }
  const covers = [0, .35, .7, 1].map(coverTex), bookM = new THREE.MeshStandardMaterial({ map: covers[0], roughness: .8 });
  const book = new THREE.Mesh(new THREE.BoxGeometry(.3, .04, .4), [new THREE.MeshStandardMaterial({ color: '#ece4d0' }), new THREE.MeshStandardMaterial({ color: '#ece4d0' }), bookM, new THREE.MeshStandardMaterial({ color: '#2a4a6a' }), new THREE.MeshStandardMaterial({ color: '#ece4d0' }), new THREE.MeshStandardMaterial({ color: '#ece4d0' })]);
  book.position.set(.2, .765, -.5); book.rotation.y = .15; scene.add(book);
  const web = new THREE.Mesh(new THREE.PlaneGeometry(.26, .26), new THREE.MeshBasicMaterial({ map: webTex(), transparent: true, alphaTest: .5 })); web.position.set(.33, .9, -.62); web.rotation.y = -.4; scene.add(web);
  // the door (right wall) for the librarian
  const door = new THREE.Group(); const dp = box(.06, 2.0, .9, new THREE.MeshStandardMaterial({ color: '#5a3a24', roughness: .8 })); dp.position.z = -.45; door.add(dp); door.position.set(2.27, 0, .9); scene.add(door);
  const hall = new THREE.PointLight('#fff0d8', 0, 4, 1.4); hall.position.set(2.0, 1.4, .5); scene.add(hall);
  scene.add(new THREE.HemisphereLight('#7a88aa', '#1c1418', 1.5));
  const lamp = new THREE.PointLight('#ffcf90', 3.0, 4, 1.5); lamp.position.set(.1, 1.6, -.7); scene.add(lamp);
  const fill = new THREE.PointLight('#c8d0f0', 2.0, 7, 1.5); fill.position.set(.4, 1.8, 2.4); scene.add(fill);
  const phoneL = new THREE.PointLight('#8fc0ff', 1.0, 1.4, 2); scene.add(phoneL);
  const A = (o) => makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark', ...o }, { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, look: { pose: 'look' } });
  const ages = [A({}), A({ beard: 2 }), A({ beard: 4, hair: 'hairGrey' }), A({ beard: 5, hair: 'hairGrey', glasses: 1 }), A({ beard: 6, hair: 'hairWhite', hunch: 1, glasses: 1, skin: 'skinOld' })];
  ages.forEach(h => { h.root.position.set(-1.0, .02, -.95); h.shadow.visible = false; scene.add(h.root); });
  const lib = makePerson({ top: 'purple', bottom: 'grey', hair: 'hairWhite', hairStyle: 'bun', glasses: 1, cane: 1, hunch: 1, skin: 'skinOld', shoe: 'shoe' }, { stand: { pose: 'stand' }, talk: { pose: 'talk', mouth: 1 }, ...WALK });
  scene.add(lib.root);
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    // camera: close on the book (frame 0), pull back to the room, then a two-shot for the librarian
    if (t < T.pull) { const u = eio(seg(t, 0, T.pull)); cam.position.set(lerp(.3, .25, u), lerp(1.2, 1.25, u), lerp(.3, .35, u)); cam.lookAt(.2, .77, -.5); cam.fov = 46; }
    else if (t < T.enter) { const u = eio(seg(t, T.pull, T.pull + 1.4)); cam.position.set(lerp(.25, .45, u), lerp(1.25, 1.6, u), lerp(.35, 2.9, u)); cam.lookAt(lerp(.2, -.35, u), lerp(.77, .95, u), lerp(-.5, -.8, u)); cam.fov = lerp(46, 54, u); }
    else { const u = eo(seg(t, T.enter, T.enter + 1.2)); cam.position.set(lerp(.45, .3, u), lerp(1.6, 1.5, u), lerp(2.9, 2.7, u)); cam.lookAt(lerp(-.35, -.2, u), 1.0, -.7); cam.fov = 54; }
    cam.updateProjectionMatrix();
    const st = stageAt(t);
    bookM.map = covers[Math.min(3, st === 0 ? 0 : st - 1 + (st >= 3 ? 1 : 0))]; web.visible = st >= 2;
    skyM.color.set(['#8ab0d8', '#c89a6a', '#a8b0c0', '#8ab0d8', '#c8a07a'][st]);
    ages.forEach((h, i) => { h.root.visible = i === st; }); const H = ages[st];
    H.frame(t >= 12.7 ? 'look' : (t % 2.9 < .1 ? 'blink' : 'phone')); H.face(cam);
    phoneL.position.copy(H.local(25, 18)).add(_v.set(.2, .05, .2)); phoneL.intensity = t < 12.7 ? 1.0 : .2;
    // the knock, the door, the old librarian with her cane
    const op = ss(seg(t, T.enter, T.enter + .5)); door.rotation.y = 1.2 * op; hall.intensity = 3 * op;
    lib.root.visible = t >= T.enter;
    if (lib.root.visible) { const k = seg(t, T.enter + .2, T.enter + 1.2); lib.root.position.set(lerp(2.0, .55, k), 0, lerp(.6, -.2, k)); lib.frame(k < 1 ? walkFrame(t * .7) : (t >= 9.2 && t < 12.6 && Math.floor(t * 3) % 2 ? 'talk' : 'stand')); lib.face(cam, true); }
    post.dof.focus = cam.position.distanceTo(t < T.pull ? _v.set(.2, .77, -.5) : _v.set(-.3, 1.0, -.7)); post.dof.aper = t < T.pull ? 40 : 18; post.dof.maxCoc = 10;
    renderer.toneMappingExposure = 1.25; post.bloom.strength = .35; post.bloom.threshold = .85;
  }
  return { scene, update };
}
