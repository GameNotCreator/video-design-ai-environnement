// The zoo: he scrolls on a bench while families stop, point and take photos. The camera pulls back: he is inside
// an enclosure, behind bars, with a sign: HOMO SCROLLUS.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard, ground } from './px.js';
import { mat, mesh, box } from './kit.js';
import { sky } from './fx.js';
import { makePerson, WALK, walkFrame } from './people.js';
import { T } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

function rockTex() { const P = new PX(48, 32), R = ramp(['#4a4640', '#625e56', '#7a766c', '#948e82'], .45); P.fill((x, y) => { const d = Math.hypot((x - 24) / 24, (y - 32) / 30) + (fbm(x * .2, y * .2, 4) - .5) * .3; return d < 1 ? R(.7 - d * .4 + (h2(x, y, 2) - .5) * .2, x, y) : null; }); P.outline(.25); return texOf(P.done()); }
function bushTex(seed) { const P = new PX(30, 16), G = ramp(['#12301a', '#1e5028', '#2e7a36', '#4a8a3a'], .45); P.fill((x, y) => { const d = Math.hypot((x - 15) / 15, (y - 16) / 15) + (fbm(x * .3, y * .3, seed) - .5) * .4; return d < 1 ? G(.75 - d * .5 + (h2(x, y, seed) - .5) * .3, x, y) : null; }); P.outline(.25); return texOf(P.done()); }
function signTex() { const c = document.createElement('canvas'); c.width = 320; c.height = 160; const g = c.getContext('2d'); g.fillStyle = '#2e5a3a'; g.fillRect(0, 0, 320, 160); g.strokeStyle = '#e8dcb0'; g.lineWidth = 8; g.strokeRect(8, 8, 304, 144); g.fillStyle = '#f4ecd0'; g.font = '800 40px Figtree'; g.textAlign = 'center'; g.fillText('HOMO', 160, 66); g.fillText('SCROLLUS', 160, 112); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

export function build() {
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2('#b8cce0', .03);
  const SK = sky({ top: '#3a6aa8', mid: '#7aa4d0', hor: '#d0e0ec', moonI: 0 }); scene.add(SK.mesh);
  scene.add(mesh(new THREE.BoxGeometry(40, .2, 40).translate(0, -.1, 0), mat(ground(96, 96, { grass: ['#1a2a12', '#2a4018', '#3e5a22', '#56742e', '#6e8a3a'], mask: () => 1, seed: 21 }))));
  const pathM = new THREE.MeshStandardMaterial({ color: '#b8a888', roughness: 1 }); const path = new THREE.Mesh(new THREE.BoxGeometry(40, .04, 2.2), pathM); path.position.set(0, .0, 1.9); path.receiveShadow = true; scene.add(path);
  // the enclosure: bars across the front, a rock, straw, his bench
  const barM = new THREE.MeshStandardMaterial({ color: '#2a2a30', roughness: .4, metalness: .7 });
  for (let i = 0; i < 26; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, 2.6, 6).translate(0, 1.3, 0), barM); b.position.set(-3.25 + i * .26, 0, .55); b.castShadow = true; scene.add(b); }
  for (const y of [.08, 2.55]) { const r = new THREE.Mesh(new THREE.BoxGeometry(6.8, .06, .06), barM); r.position.set(0, y, .55); scene.add(r); }
  const bars = scene.children.slice(-28);
  const rock = billboard(rockTex(), 2.2, 1.4); rock.position.set(-1.6, 0, -1.6); scene.add(rock);
  [[1.8, -1.4, 1], [-2.6, -.6, 2], [2.8, -2.2, 3]].forEach(([x, z, s]) => { const b = billboard(bushTex(s), 1.5, .8); b.position.set(x, 0, z); scene.add(b); });
  const straw = new THREE.Mesh(new THREE.CircleGeometry(1.2, 20), new THREE.MeshStandardMaterial({ color: '#c8a85a', roughness: 1 })); straw.rotation.x = -Math.PI / 2; straw.position.set(.3, .006, -.6); straw.scale.y = .6; scene.add(straw);
  const wood = new THREE.MeshStandardMaterial({ color: '#6a4a2c', roughness: .8 });
  const bench = box(1.4, .08, .4, wood); bench.position.set(0, .42, -.6); scene.add(bench); for (const x of [-.6, .6]) { const l = box(.08, .42, .35, wood); l.position.set(x, 0, -.6); scene.add(l); }
  const post = box(.08, 1.2, .08, wood); post.position.set(1.6, 0, 1.0); scene.add(post);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(.8, .4), new THREE.MeshStandardMaterial({ map: signTex(), roughness: .8 })); sign.position.set(1.6, 1.25, 1.05); scene.add(sign);
  const peanut = new THREE.Mesh(new THREE.SphereGeometry(.03, 6, 5), new THREE.MeshStandardMaterial({ color: '#c8a060' })); scene.add(peanut);
  const sun = new THREE.DirectionalLight('#fff0d8', 2.6); sun.position.set(6, 12, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 }); scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight('#c8d8f0', '#3a4a2a', 1.3));
  const fill = new THREE.PointLight('#fff0e0', 1.6, 7, 1.5); fill.position.set(.4, 1.8, 3.6); scene.add(fill);
  const flashL = new THREE.PointLight('#ffffff', 0, 6, 1.2); flashL.position.set(-.6, 1.4, 2.0); scene.add(flashL);
  const phoneL = new THREE.PointLight('#8fc0ff', .7, 1.3, 2); scene.add(phoneL);
  // him; the visitors (a kid, the mom, a dad filming)
  const hero = makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark', shoe: 'sneaker' }, { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 } });
  hero.root.position.set(-.15, 0, -.5); hero.shadow.visible = false; scene.add(hero.root);
  const VF = { stand: { pose: 'stand', smile: 1 }, talk: { pose: 'talk', mouth: 1 }, point: { pose: 'push', smile: 1 }, wave: { pose: 'wave', smile: 1, mouth: 1 }, film: { pose: 'film' }, ...WALK };
  const kid = makePerson({ top: 'teal', bottom: 'navy', hair: 'hairBlond', shoe: 'sneaker' }, VF); kid.root.scale.setScalar(.66);
  const mom = makePerson({ top: 'mustard', bottom: 'jean', hair: 'hairBrown', hairStyle: 'long', hairUp: 1, shoe: 'shoe' }, VF);
  const dad = makePerson({ top: 'green', bottom: 'jean', hair: 'hairDark', beard: 1, shoe: 'shoe' }, VF);
  const vis = [[kid, -.85, 1.25], [mom, .95, 1.5], [dad, -1.6, 1.75]]; vis.forEach(([p]) => scene.add(p.root));
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    // camera: inside the enclosure first (no bars in view, the visitors' faces looking in); then it pulls back through the bars
    // camera: the whole picture first (visitors, bars, sign, him); in through the bars on him; back out for the sign
    if (t < T.pull) { const u = eio(seg(t, 0, T.pull)); cam.position.set(lerp(.45, .4, u), lerp(1.5, 1.45, u), lerp(4.6, 4.3, u)); cam.lookAt(lerp(.05, 0, u), lerp(1.05, 1.0, u), -.4); cam.fov = 54; }
    else if (t < T.plaque) { const u = eio(seg(t, T.pull, T.pull + 1.6)); cam.position.set(lerp(.4, .05, u), lerp(1.45, 1.3, u), lerp(4.3, 1.9, u)); cam.lookAt(lerp(0, -.1, u), lerp(1.0, 1.0, u), -.45); cam.fov = 54; }
    else { const u = eio(seg(t, T.plaque, T.plaque + 1.4)); cam.position.set(lerp(.05, .45, u), lerp(1.3, 1.55, u), lerp(1.9, 4.6, u)); cam.lookAt(lerp(-.1, .05, u), lerp(1.0, 1.15, u), -.4); cam.fov = 54; }
    cam.updateProjectionMatrix();
    hero.frame(t % 2.9 < .1 ? 'blink' : 'phone'); hero.face(cam); phoneL.position.copy(hero.local(25, 18)).add(_v.set(.2, .05, .2));
    vis.forEach(([p, x, z], i) => {
      p.root.position.set(x, 0, z);
      let f = 'stand';
      if (p === kid) f = t >= 5.0 && t < 7.6 ? (Math.floor(t * 3) % 2 ? 'point' : 'talk') : (t >= 8.8 && t < 9.4 ? 'wave' : (Math.floor(t * 1.5) % 2 ? 'point' : 'stand'));
      if (p === mom) f = t >= 7.7 && t < 11.2 && Math.floor(t * 3) % 2 ? 'talk' : 'stand';
      if (p === dad) f = t >= 5.6 && t < 7.0 ? 'film' : 'stand';
      p.frame(f); p.face(cam, true);
    });
    flashL.intensity = t >= 6.2 && t < 6.35 ? 10 : 0;
    const pk = seg(t, 9.0, 9.6); peanut.visible = pk > 0 && t < 13; peanut.position.set(lerp(-.8, -.1, pk), .9 + Math.sin(pk * Math.PI) * .6 - (pk >= 1 ? .87 : 0) * 1, lerp(1.3, -.2, pk));
    post.dof.focus = cam.position.distanceTo(_v.set(-.15, 1.0, -.5)); post.dof.aper = 12; post.dof.maxCoc = 10;
    renderer.toneMappingExposure = 1.05; post.bloom.strength = .3; post.bloom.threshold = .9;
  }
  return { scene, update };
}
