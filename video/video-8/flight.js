// Ep. 1 — the pilot. Exterior: an airliner cruising above the clouds. Interior: a cut-away cockpit, both pilots on their
// phones, the terrain alarm, a mountain growing in the windshield.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, billboard } from './px.js';
import { sky, particles } from './fx.js';
import { makePerson } from './people.js';
import { T } from './story.js';
import { track, seg, ss, clamp, lerp, eio } from '/core/lib.js';

function cloudTex(seed) { const P = new PX(40, 18), W = ramp(['#b8c4d4', '#d8e0ea', '#f2f6fa', '#ffffff'], .45); P.fill((x, y) => { const d = Math.hypot((x - 20) / 19, (y - 11) / 8) + (fbm(x * .2, y * .25, seed) - .5) * .6; return d < 1 ? W(.9 - d * .5, x, y) : null; }); return texOf(P.done()); }
function hullTex() { const P = new PX(96, 24), W = ramp(['#9aa2ae', '#c4cad2', '#e2e6ec', '#f6f8fa'], .45); P.fill((x, y) => { if (y === 9 && x % 4 < 2 && x > 18 && x < 88) return [40, 52, 70]; if (y > 15 && y < 18) return [44, 72, 128]; return W(.75 - Math.abs(y - 9) * .02 + (h2(x, y, 2) - .5) * .1, x, y); }); return texOf(P.done()); }
function mountainTex() { const P = new PX(80, 56), R = ramp(['#2a2e38', '#464a56', '#6a6e78', '#9a9ea6'], .45);
  P.fill((x, y) => { const top = 56 * (.08 + .7 * Math.abs((x - 40) / 40) ** 1.3 + (fbm(x * .1, 0, 3) - .5) * .25); if (y < top) return null; if (y < top + 6 && fbm(x * .3, y * .3, 4) > .4) return [236, 240, 246]; return R(.55 - (y - top) / 80 + (fbm(x * .2, y * .2, 5) - .5) * .4, x, y); }); return texOf(P.done()); }

export function buildFlight() {
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog('#bcd2ea', 30, 400);
  const SK = sky({ top: '#2e64b0', mid: '#6aa0dc', hor: '#dce8f4', moonI: 0 }); scene.add(SK.mesh);
  const sun = new THREE.DirectionalLight('#fff4e0', 2.6); sun.position.set(-20, 40, 30); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); scene.add(sun);
  scene.add(new THREE.HemisphereLight('#d0e0f4', '#8090a0', 1.2));
  // cloud sea + drifting clouds
  const ctex = [1, 2, 3, 4].map(cloudTex), clouds = [];
  for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(16, 7), new THREE.MeshBasicMaterial({ map: ctex[i % 4], transparent: true, alphaTest: .4, depthWrite: false })); scene.add(m); clouds.push({ m, x: (h2(i, 1, 6) - .5) * 160, y: -8 - h2(i, 2, 6) * 10, z: -10 - h2(i, 3, 6) * 60 }); }
  // the airliner (exterior)
  const plane = new THREE.Group(), hullM = new THREE.MeshStandardMaterial({ map: hullTex(), roughness: .5 }), white = new THREE.MeshStandardMaterial({ color: '#e8ecf0', roughness: .5 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, 10, 16).rotateZ(Math.PI / 2), hullM); plane.add(body);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(.9, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2).rotateZ(-Math.PI / 2).scale(1.4, 1, 1), white); nose.position.x = 5; plane.add(nose);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(.9, 2.4, 16).rotateZ(Math.PI / 2), white); tail.position.x = -6.2; plane.add(tail);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(2.2, .14, 11), white); wing.position.set(.2, -.4, 0); wing.rotation.y = -.35; plane.add(wing);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.4, .14), new THREE.MeshStandardMaterial({ color: '#2c4a80' })); fin.position.set(-6, 1.4, 0); fin.rotation.z = -.4; plane.add(fin);
  for (const z of [-2.6, 2.6]) { const eng = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, 1.6, 12).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#b0b6be' })); eng.position.set(.8, -.9, z); plane.add(eng); }
  plane.position.set(0, 0, -14); scene.add(plane);

  // the cockpit (interior, a separate small set far from the plane)
  const C = new THREE.Group(); C.position.set(0, 200, 0); scene.add(C);
  const darkM = new THREE.MeshStandardMaterial({ color: '#22262e', roughness: .7 }), seatM = new THREE.MeshStandardMaterial({ color: '#2a2e3a', roughness: .8 });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(4, .1, 3), darkM); floor.position.set(0, -.05, 0); C.add(floor);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(.6, .9, 2.6), darkM); panel.position.set(1.55, .45, 0); C.add(panel);
  const screens = []; for (let i = 0; i < 4; i++) { const m = new THREE.MeshStandardMaterial({ color: '#000', emissive: i % 2 ? '#3ac87a' : '#4a9ae8', emissiveIntensity: 1.6 }); const s = new THREE.Mesh(new THREE.PlaneGeometry(.42, .3), m); s.position.set(1.24, .78, -.95 + i * .63); s.rotation.y = -Math.PI / 2; C.add(s); screens.push(m); }
  const alarmM = new THREE.MeshStandardMaterial({ color: '#000', emissive: '#ffa020', emissiveIntensity: 0 }); const al = new THREE.Mesh(new THREE.PlaneGeometry(.5, .12), alarmM); al.position.set(1.24, 1.0, 0); al.rotation.y = -Math.PI / 2; C.add(al);
  const alL = new THREE.PointLight('#ffa020', 0, 3, 2); alL.position.set(1.0, 1.1, 0); C.add(alL);
  const frameM = new THREE.MeshStandardMaterial({ color: '#30343c', roughness: .6 });
  for (const z of [-1.3, 0, 1.3]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.08, 1.0, .08), frameM); p.position.set(1.85, 1.45, z); C.add(p); }
  const top = new THREE.Mesh(new THREE.BoxGeometry(.9, .1, 2.8), frameM); top.position.set(1.6, 2.0, 0); C.add(top);
  for (const z of [-.6, .6]) { const seat = new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .5), seatM); seat.position.set(0, .25, z); C.add(seat); const back = new THREE.Mesh(new THREE.BoxGeometry(.12, .9, .5), seatM); back.position.set(-.3, .75, z); C.add(back); }
  // outside the windshield: sky, clouds, the mountain coming
  const outSky = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshBasicMaterial({ color: '#8ab4e0', fog: false })); outSky.position.set(170, 0, 0); outSky.scale.set(6, 6, 1); outSky.rotation.y = -Math.PI / 2; C.add(outSky);
  const mountain = new THREE.Mesh(new THREE.PlaneGeometry(40, 28), new THREE.MeshStandardMaterial({ map: mountainTex(), transparent: true, alphaTest: .4, fog: false })); mountain.rotation.y = -Math.PI / 2; C.add(mountain);
  const outClouds = [0, 1, 2, 3, 4, 5].map(i => { const m = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.5), new THREE.MeshBasicMaterial({ map: ctex[i % 4], transparent: true, alphaTest: .4, fog: false })); m.rotation.y = -Math.PI / 2; C.add(m); return m; });
  const pil = { a: { pose: 'phone' }, b: { pose: 'phone', blink: 1 }, laugh: { pose: 'sitlaugh', mouth: 1 } };
  const captain = makePerson({ top: 'navy', bottom: 'navy', hair: 'hairGrey', beard: 1, hat: 'pilot', shoe: 'shoe' }, pil);
  const copilot = makePerson({ top: 'navy', bottom: 'navy', hair: 'hairDark', hat: 'pilot', shoe: 'shoe' }, pil);
  captain.root.position.set(.05, 0, -.6); copilot.root.position.set(.05, 0, .6); C.add(captain.root, copilot.root);
  const capL = new THREE.PointLight('#8fc0ff', .8, 1.3, 2), coL = new THREE.PointLight('#8fc0ff', .8, 1.3, 2); C.add(capL, coL);
  const cabin = new THREE.PointLight('#d8dcff', 1.2, 6, 2); cabin.position.set(-.8, 1.9, 0); C.add(cabin);
  const winL = new THREE.DirectionalLight('#fff4e0', 1.6); winL.position.set(5, 3, 1); winL.target = floor; C.add(winL);
  const _v = new THREE.Vector3(), cw = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    if (shot.id === 'sky') {
      const u = seg(t, 0, T.cockpit);
      cam.position.set(lerp(13, 10, u), lerp(4.5, 3.4, u), lerp(10, 7, u)); cam.lookAt(lerp(.5, 1.5, u), 0, -14); cam.fov = 44;
      plane.position.y = Math.sin(t * .8) * .15; plane.rotation.z = Math.sin(t * .5) * .02;
      clouds.forEach((c, i) => { c.m.position.set(((c.x - t * 22) % 160 + 240) % 160 - 80, c.y, c.z); c.m.lookAt(cam.position); });
      post.dof.focus = cam.position.distanceTo(plane.position); post.dof.aper = 30; post.dof.maxCoc = 10;
    } else {
      // cameras: behind-left on both pilots → closer on the co-pilot → between the seats, out of the windshield
      cw.set(0, 200, 0);
      if (t < 9.3) { const u = seg(t, T.cockpit, 9.3); cam.position.set(lerp(-2.5, -2.2, u), 200 + lerp(2.3, 2.15, u), lerp(2.7, 2.4, u)); cam.lookAt(lerp(1.5, 1.6, u), 201.15, 0); cam.fov = 50; }
      else if (t < T.front) { const u = seg(t, 9.3, T.front); cam.position.set(lerp(-1.3, -1.1, u), 201.75, lerp(2.3, 2.1, u)); cam.lookAt(1.2, 201.1, .4); cam.fov = 46; }
      else { const u = eio(seg(t, T.front, T.impact)); cam.position.set(-.55, 201.25, 0); cam.lookAt(5, 201.1, 0); cam.fov = lerp(50, 44, u); }
      const k = seg(t, T.cockpit, T.impact), d = lerp(150, 3, Math.pow(k, 2.0));
      mountain.position.set(d + 2, -4 + 4 * k, -1); const sc = 1; mountain.scale.setScalar(sc);
      outClouds.forEach((m, i) => { m.position.set(14 + i * 6, ((h2(i, 1, 3) - .5) * 10 + t * 4) % 10 - 5, ((h2(i, 2, 3) - .5) * 20 - t * 9) % 30 + 10); });
      const ala = t >= T.alarm ? (Math.floor(t * 4) % 2 ? 1 : .2) : 0; alarmM.emissiveIntensity = 3 * ala; alL.intensity = 2.2 * ala;
      screens.forEach((m, i) => { m.emissive.set(t >= T.alarm && i % 2 === 0 ? '#ffa020' : (i % 2 ? '#3ac87a' : '#4a9ae8')); });
      captain.frame(t < 6.5 && Math.floor(t * 3) % 2 ? 'laugh' : (t % 3.1 < .12 ? 'b' : 'a')); copilot.frame(t % 2.7 < .12 ? 'b' : 'a');
      captain.face(cam); copilot.face(cam);
      capL.position.copy(captain.local(25, 18)).add(_v.set(.25, .05, 0)); coL.position.copy(copilot.local(25, 18)).add(_v.set(.25, .05, 0));
      post.dof.focus = t < T.front ? cam.position.distanceTo(copilot.root.position.clone().setY(201)) : 6; post.dof.aper = 120; post.dof.maxCoc = 16;
    }
    cam.updateProjectionMatrix();
    const glare = Math.pow(seg(t, T.impact - .5, T.impact), 2);
    renderer.toneMappingExposure = 1.1 + 2 * glare; post.bloom.strength = .45 + glare; post.bloom.threshold = .9 - .4 * glare;
  }
  return { scene, update, hero: { root: copilot.root } };
}
