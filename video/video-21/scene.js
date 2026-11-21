// Final call: an airport gate. Behind the glass, one plane after another boards and leaves; he stays in his seat,
// scrolling, until the last flight (YOUR 20s) is gone and the gate agent comes over.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson, WALK, walkFrame } from './people.js';
import { T, FLIGHTS } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

function tileTex() { const P = new PX(64, 64), R = ramp(['#8a8a86', '#a2a29c', '#b8b8b2', '#cacac4'], .45); P.fill((x, y) => R(.55 + (h2(x, y, 2) - .5) * .15 + ((x % 16) === 0 || (y % 16) === 0 ? -.3 : 0), x, y)); return P.done(); }
function tarmacTex() { const P = new PX(96, 96), R = ramp(['#3a3a3e', '#4a4a4e', '#5a5a5e'], .45); P.fill((x, y) => R(.5 + (h2(x, y, 4) - .5) * .4 + ((y % 48) === 20 && (x % 12) < 6 ? .9 : 0), x, y)); return P.done(); }
function plane() {
  const g = new THREE.Group(), white = new THREE.MeshStandardMaterial({ color: '#e8e8ec', roughness: .5 }), dark = new THREE.MeshStandardMaterial({ color: '#2a3444', roughness: .4 }), red = new THREE.MeshStandardMaterial({ color: '#3a5a8a', roughness: .5 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 14, 16).rotateZ(Math.PI / 2), white); body.position.y = 2.6; g.add(body);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 10, 0, Math.PI), white); nose.rotation.y = -Math.PI / 2; nose.position.set(7, 2.6, 0); g.add(nose);
  const win = new THREE.Mesh(new THREE.BoxGeometry(11, .22, .02), dark); win.position.set(0, 2.9, 1.0); g.add(win);
  const ck = new THREE.Mesh(new THREE.BoxGeometry(.8, .3, .02), dark); ck.position.set(7.2, 3.0, .7); ck.rotation.y = .5; g.add(ck);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(3.5, .18, 13), white); wing.position.set(-.5, 2.1, 0); g.add(wing);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.0, .2), red); fin.position.set(-6.3, 4.3, 0); fin.rotation.z = .35; g.add(fin);
  const eng = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, 1.6, 12).rotateZ(Math.PI / 2), white); eng.position.set(.2, 1.4, 3.5); g.add(eng);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g;
}

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#8ab0d8');
  // inside: tiled floor, window wall (glass and mullions), gate desk
  scene.add(mesh(new THREE.BoxGeometry(14, .2, 8).translate(0, -.1, 1), mat(tileTex())));
  const mullM = new THREE.MeshStandardMaterial({ color: '#2a2e36', roughness: .5, metalness: .5 });
  for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(.08, 3.4, .08), mullM); m.position.set(-5.25 + i * 1.5, 1.7, -2.5); scene.add(m); }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(12, .1, .1), mullM); rail.position.set(0, .35, -2.5); scene.add(rail);
  const top = new THREE.Mesh(new THREE.BoxGeometry(14, .6, .3), new THREE.MeshStandardMaterial({ color: '#d8d8d4' })); top.position.set(0, 3.6, -2.5); scene.add(top);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(12, 3.4), new THREE.MeshBasicMaterial({ color: '#a8c8e0', transparent: true, opacity: .08, depthWrite: false })); glass.position.set(0, 1.7, -2.45); scene.add(glass);
  // outside: tarmac, far terminal, the plane at the gate
  const tar = mesh(new THREE.BoxGeometry(80, .2, 60).translate(0, -.15, -32), mat(tarmacTex())); scene.add(tar);
  for (let i = 0; i < 6; i++) { const h = 3 + h2(i, 1, 5) * 4, b = new THREE.Mesh(new THREE.BoxGeometry(8, h, 4), new THREE.MeshBasicMaterial({ color: '#7a8aa0' })); b.position.set(-25 + i * 10, h / 2, -45); scene.add(b); }
  const planes = FLIGHTS.map(() => { const p = plane(); p.position.set(0, 0, -10); p.rotation.y = 0; scene.add(p); return p; });
  // seats
  const seatM = new THREE.MeshStandardMaterial({ color: '#22242c', roughness: .6 }), legM = new THREE.MeshStandardMaterial({ color: '#8a8c94', roughness: .4, metalness: .6 });
  for (let r = 0; r < 1; r++) { const bar = box(5.0, .05, .08, legM); bar.position.set(-.3, .2, -.2 + r * 1.6); scene.add(bar);
    for (let s = 0; s < 6; s++) { const x = -2.6 + s * .9, z = -.2 + r * 1.6; const st = box(.6, .08, .5, seatM); st.position.set(x, .42, z); scene.add(st); const bk = box(.6, .55, .08, seatM); bk.position.set(x, .5, z - .27); scene.add(bk); } }
  const desk = box(1.4, 1.05, .6, new THREE.MeshStandardMaterial({ color: '#c8c4bc', roughness: .6 })); desk.position.set(3.4, 0, -1.4); scene.add(desk);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(.9, .45, .06), new THREE.MeshStandardMaterial({ color: '#1a2a4a', emissive: '#203a6a', emissiveIntensity: .6 })); sign.position.set(3.4, 2.3, -1.6); scene.add(sign);
  const sun = new THREE.DirectionalLight('#fff0dc', 2.2); sun.position.set(-8, 10, -12); sun.target.position.set(0, 0, -2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, far: 60 }); scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight('#d0dcf0', '#4a4a44', 1.5); scene.add(hemi);
  const fill = new THREE.PointLight('#f0ecf0', 2.2, 8, 1.5); fill.position.set(.4, 2.2, 2.8); scene.add(fill);
  const phoneL = new THREE.PointLight('#8fc0ff', .8, 1.3, 2); scene.add(phoneL);
  // him; the agent; passengers who board
  const H = { phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, look: { pose: 'look' } };
  const hero = makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark', shoe: 'sneaker' }, H), heroB = makePerson({ top: 'red', bottom: 'jean', hair: 'hairDark', beard: 3, shoe: 'sneaker' }, H);
  for (const h of [hero, heroB]) { h.root.position.set(-.8, .05, -.22); h.shadow.visible = false; scene.add(h.root); }
  const agent = makePerson({ top: 'navy', bottom: 'navy', hair: 'hairBrown', hairStyle: 'bun', shoe: 'shoe' }, { stand: { pose: 'stand' }, talk: { pose: 'talk', mouth: 1 }, ...WALK }); scene.add(agent.root);
  const PL = [['teal', 'hairBlond'], ['mustard', 'hairDark'], ['purple', 'hairBrown'], ['green', 'hairBlond'], ['beige', 'hairDark'], ['grey', 'hairBrown']];
  const pax = PL.map(([top, hair], i) => { const p = makePerson({ top, bottom: 'jean', hair, hairStyle: i % 2 ? 'long' : 'short', shoe: 'shoe' }, { ...WALK }); scene.add(p.root); return p; });
  const SKY = ['#9ac0e8', '#8ab8e8', '#a8c0d8', '#e8a878', '#2a2a4a'], SUN = [[-8, 10, -12, 2.2], [0, 14, -12, 2.6], [8, 10, -12, 2.2], [12, 3, -12, 1.4], [12, 3, -12, .2]];
  const _v = new THREE.Vector3(), cA = new THREE.Color(), cB = new THREE.Color();

  function update(t, shot, cam, post, renderer) {
    // camera: medium shot on him with the glass behind; close on him and the agent at the end
    if (t < T.agent) { const u = eio(seg(t, 0, T.agent)); cam.position.set(lerp(-.1, -.25, u), lerp(1.45, 1.35, u), lerp(3.6, 3.0, u)); cam.lookAt(lerp(-.7, -.75, u), lerp(1.25, 1.2, u), -1.4); cam.fov = 54; }
    else { const u = eo(seg(t, T.agent, T.agent + 1.2)); cam.position.set(lerp(.2, -.05, u), lerp(1.4, 1.35, u), lerp(3.0, 2.3, u)); cam.lookAt(lerp(-.4, -.45, u), lerp(1.45, 1.3, u), -.8); cam.fov = 52; }
    cam.updateProjectionMatrix();
    // time of day: one step per departed flight
    const k = FLIGHTS.filter(f => t >= f.gone).length, f = Math.min(k, 4), fr = ss(seg(t, (FLIGHTS[Math.max(0, k - 1)] || {}).gone ?? 0, ((FLIGHTS[Math.max(0, k - 1)] || {}).gone ?? 0) + 1));
    const from = Math.max(0, f - 1);
    scene.background.copy(cA.set(SKY[from]).lerp(cB.set(SKY[f]), k ? fr : 1));
    const s0 = SUN[from], s1 = SUN[f], w = k ? fr : 1; sun.position.set(lerp(s0[0], s1[0], w), lerp(s0[1], s1[1], w), lerp(s0[2], s1[2], w)); sun.intensity = lerp(s0[3], s1[3], w);
    hemi.intensity = f >= 4 ? .7 : 1.5; fill.intensity = f >= 4 ? 1.2 : 2.2;
    // the planes: at the gate until it leaves (push back, taxi away to the right); the next one rolls in
    FLIGHTS.forEach((fl, i) => {
      const p = planes[i], inA = i === 0 ? -9 : FLIGHTS[i - 1].gone + .2, out = seg(t, fl.gone, fl.gone + 2.0), inn = eo(seg(t, inA, inA + 1.4));
      p.visible = t >= inA && out < 1;
      p.position.set(lerp(-26, 2, inn) + 30 * out * out, 0, -11 - 2 * out); p.rotation.y = 0;
    });
    // him
    const He = t >= 8.2 ? heroB : hero; hero.root.visible = He === hero; heroB.root.visible = He === heroB;
    He.frame(t >= T.agent + .6 ? 'look' : (t % 2.9 < .1 ? 'blink' : 'phone')); He.face(cam);
    phoneL.position.copy(He.local(25, 18)).add(_v.set(.2, .05, .2)); phoneL.intensity = t < T.agent + .6 ? .8 : .2;
    // passengers walk past to the gate at each final call (two per flight)
    pax.forEach((p, i) => { const fl = FLIGHTS[1 + Math.floor(i / 2)] || FLIGHTS[3], a = fl.board + .3 + (i % 2) * .5, u = seg(t, a, a + 2.2); p.root.visible = u > 0 && u < 1; p.root.position.set(lerp(-4.2, 4.4, u), 0, -1.0 + (i % 2) * .3); p.frame(walkFrame(t + i * .2)); p.face(cam); });
    // the agent: behind the desk, then walks over to him
    const au = seg(t, T.agent - 1.0, T.agent); agent.root.position.set(lerp(3.4, .1, au), 0, lerp(-1.95, -.1, au)); agent.frame(au > 0 && au < 1 ? walkFrame(t) : (t >= T.agent && t < 14.8 && Math.floor(t * 3) % 2 ? 'talk' : 'stand')); agent.face(cam, au > 0);
    post.dof.focus = cam.position.distanceTo(_v.set(-.5, 1.0, -.2)); post.dof.aper = 40; post.dof.maxCoc = 12;
    renderer.toneMappingExposure = f >= 4 ? 1.35 : 1.1; post.bloom.strength = .35; post.bloom.threshold = .88;
  }
  return { scene, update };
}
