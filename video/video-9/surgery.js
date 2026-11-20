// Ep. 2 — the surgeon. An operating room: the patient under the lamp, the monitor, the nurse, and the surgeon on his phone.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson, PAL } from './people.js';
import { T, hrAt } from './story.js';
import { seg, ss, clamp, lerp, eio } from '/core/lib.js';

function tiles(w, h) { const P = new PX(w, h), R = ramp(['#3a4a4c', '#4e6264', '#62787a', '#7a9294'], .45); P.fill((x, y) => (x % 8 === 0 || y % 8 === 0) ? [40, 52, 54] : R(.55 + (h2(x >> 3, y >> 3, 2) - .5) * .2 + (h2(x, y, 3) - .5) * .1, x, y)); return P.done(); }
function patientTex() {   // lying, seen from above: head at -x, green sheet (56 x 20 px)
  const P = new PX(56, 20), S = PAL.skin, G = ramp(['#1e4a3a', '#2e6a52', '#3e8a6a', '#5aa886'], .45);
  P.ellipse(7, 10, 4.6, 4.4, (x, y, dx, dy) => PAL.hairBrown(.5 - dx * .2, x, y)); P.ellipse(8.5, 10, 3.4, 3.6, (x, y) => S(.62, x, y));
  P.set(8, 8, [70, 50, 50]); P.set(8, 12, [70, 50, 50]); P.rect(10, 9, 2, 3, PAL.white(.8, 0, 0));      // eyes closed, oxygen mask
  P.poly([[13, 2], [54, 3], [55, 17], [13, 18]], (x, y) => G(.55 + ((x + y) % 7 === 0 ? -.12 : 0) - Math.abs(y - 10) * .02, x, y));
  P.rect(24, 7, 10, 6, PAL.white(.85, 0, 0));   // the open drape on the chest
  P.outline(.3); return texOf(P.done());
}

export function buildOR() {
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2('#0e1416', .05); scene.background = new THREE.Color('#06090a');
  const tileM = mat(tiles(96, 96));
  scene.add(mesh(new THREE.BoxGeometry(7, .2, 6).translate(0, -.1, -.5), mat(tiles(96, 96))));
  const bw = box(7, 3, .2, tileM); bw.position.set(0, 0, -2.6); scene.add(bw);
  const lw = box(.2, 3, 6, tileM); lw.position.set(-3.4, 0, -.5); scene.add(lw);
  // table + patient
  const steel = new THREE.MeshStandardMaterial({ color: '#8a9298', roughness: .35, metalness: .7 });
  const tb = box(2.0, .08, .7, steel); tb.position.set(0, .86, 0); scene.add(tb);
  const leg = box(.2, .86, .2, steel); leg.position.set(0, 0, 0); scene.add(leg);
  const pat = new THREE.Mesh(new THREE.PlaneGeometry(1.87, .67), new THREE.MeshStandardMaterial({ map: patientTex(), alphaTest: .5, transparent: true })); pat.rotation.x = -Math.PI / 2; pat.position.set(0, .95, 0); pat.receiveShadow = true; scene.add(pat);
  const body = box(1.4, .16, .55, new THREE.MeshStandardMaterial({ color: '#2e6a52', roughness: .9 })); body.position.set(.25, .88, 0); scene.add(body);
  pat.position.y = 1.045;
  // surgical lamp
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.0, 6), steel); arm.position.set(0, 2.55, -.2); scene.add(arm);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(.42, .34, .12, 20), new THREE.MeshStandardMaterial({ color: '#d8dcde', emissive: '#fff6e8', emissiveIntensity: 1.4 })); disc.position.set(0, 2.1, 0); scene.add(disc);
  const spot = new THREE.SpotLight('#fff6e8', 16, 6, .5, .5, 1.5); spot.position.set(0, 2.05, 0); spot.target.position.set(0, .9, 0); spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); scene.add(spot, spot.target);
  const halo = glow('#fff6e8', .8, .7); halo.position.set(0, 2.05, 0); scene.add(halo);
  // monitor with a live ECG
  const cv = document.createElement('canvas'); cv.width = 160; cv.height = 110; const g = cv.getContext('2d');
  const monT = new THREE.CanvasTexture(cv); monT.magFilter = THREE.NearestFilter; monT.colorSpace = THREE.SRGBColorSpace;
  const monM = new THREE.MeshStandardMaterial({ map: monT, emissiveMap: monT, emissive: '#ffffff', emissiveIntensity: 1.4 });
  const mon = new THREE.Mesh(new THREE.PlaneGeometry(.62, .42), monM); mon.position.set(.95, 1.55, -1.25); mon.rotation.y = -.25; scene.add(mon);
  const monBox = box(.7, .5, .12, new THREE.MeshStandardMaterial({ color: '#1a1e22' })); monBox.position.set(.97, 1.31, -1.32); monBox.rotation.y = -.25; scene.add(monBox);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, 1.3, 6), steel); pole.position.set(.97, .65, -1.32); scene.add(pole);
  const monL = new THREE.PointLight('#5af08a', .8, 2.5, 2); monL.position.set(.9, 1.55, -.95); scene.add(monL);
  function drawECG(t) {
    const hr = hrAt(t), flat = t >= T.flat, alarm = t >= T.alarm && !flat;
    g.fillStyle = '#04100a'; g.fillRect(0, 0, 160, 110);
    const col = flat ? '#ff4a3a' : alarm ? '#ffc23a' : '#5af08a';
    g.strokeStyle = col; g.lineWidth = 2; g.beginPath();
    for (let x = 0; x <= 120; x++) {
      const ts = t - (120 - x) * .022, beat = ts * Math.max(1, hrAt(ts)) / 60, ph = beat - Math.floor(beat);
      let y = 46; if (ts < T.flat) { if (ph > .1 && ph < .13) y = 50; else if (ph >= .13 && ph < .16) y = 18; else if (ph >= .16 && ph < .19) y = 60; else if (ph > .4 && ph < .5) y = 42; }
      x === 0 ? g.moveTo(x + 6, y) : g.lineTo(x + 6, y);
    }
    g.stroke();
    g.fillStyle = col; g.font = '700 26px monospace'; g.textAlign = 'left'; g.fillText('HR', 8, 98); g.font = '700 34px monospace'; g.fillText(flat ? '---' : String(hr), 52, 100);
    if ((alarm || flat) && Math.floor(t * 4) % 2) { g.fillStyle = col; g.fillRect(126, 8, 28, 28); }
    monT.needsUpdate = true;
  }
  // people
  const F = { ph: { pose: 'standphone' }, ph2: { pose: 'standphone', blink: 1 }, laugh: { pose: 'standphone', mouth: 1 }, stand: { pose: 'stand' }, talk: { pose: 'talk', mouth: 1 } };
  const surgeon = makePerson({ top: 'teal', bottom: 'teal', hair: 'hairDark', hat: 'surgeon', mask: 1, shoe: 'sneaker' }, F);
  const nurse = makePerson({ top: 'green', bottom: 'green', hair: 'hairBrown', hairStyle: 'bun', hat: 'surgeon', mask: 1, shoe: 'sneaker' }, F);
  surgeon.root.position.set(-1.35, 0, .05); nurse.root.position.set(1.3, 0, .35); scene.add(surgeon.root, nurse.root);
  const sL = new THREE.PointLight('#8fc0ff', .9, 1.3, 2); scene.add(sL);
  scene.add(new THREE.HemisphereLight('#9ab8b8', '#101616', .7));
  const fill = new THREE.PointLight('#c8e0e0', 1.0, 6, 2); fill.position.set(0, 1.9, 2.2); scene.add(fill);
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    if (t < T.capOut) { const u = seg(t, 0, T.capOut); cam.position.set(lerp(1.2, 1.0, u), lerp(3.6, 3.3, u), lerp(4.8, 4.4, u)); cam.lookAt(-.3, .9, -.2); cam.fov = 48; }
    else if (t < T.alarm) { const u = seg(t, T.capOut, T.alarm); cam.position.set(lerp(-.4, -.55, u), lerp(2.2, 2.05, u), lerp(2.9, 2.6, u)); cam.lookAt(-1.0, 1.1, 0); cam.fov = 46; }
    else if (t < T.flat) { const u = seg(t, T.alarm, T.flat); cam.position.set(lerp(1.9, 1.8, u), 1.95, lerp(1.9, 1.7, u)); cam.lookAt(.8, 1.35, -.9); cam.fov = 48; }
    else { const u = eio(seg(t, T.flat, T.impact)); cam.position.set(lerp(1.15, 1.05, u), 1.58, lerp(-.45, -.6, u)); cam.lookAt(.95, 1.55, -1.25); cam.fov = 44; }
    cam.updateProjectionMatrix();
    drawECG(t);
    const talkN = (t >= 3.6 && t < 5.6) || (t >= 8.9 && t < 11.6);
    nurse.frame(talkN && Math.floor(t * 4) % 2 ? 'talk' : 'stand'); nurse.face(cam, true);
    surgeon.frame(t >= 5.7 && t < 11.8 && Math.floor(t * 3) % 2 ? 'laugh' : (t % 3.1 < .12 ? 'ph2' : 'ph')); surgeon.face(cam, false);
    sL.position.copy(surgeon.local(25, 18)).add(_v.set(.2, .05, .2));
    const alarm = t >= T.alarm ? 1 : 0; monL.color.set(t >= T.flat ? '#ff4a3a' : alarm ? '#ffc23a' : '#5af08a'); monL.intensity = .8 + alarm * (Math.floor(t * 4) % 2 ? 1.2 : .2);
    post.dof.focus = t < T.alarm ? cam.position.distanceTo(surgeon.root.position.clone().setY(1.3)) : cam.position.distanceTo(mon.position); post.dof.aper = 120; post.dof.maxCoc = 16;
    renderer.toneMappingExposure = 1.1; post.bloom.strength = .5; post.bloom.threshold = .85;
  }
  return { scene, update, hero: { root: surgeon.root } };
}
