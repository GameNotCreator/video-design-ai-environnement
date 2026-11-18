// Insert: the phone on the asphalt, seen almost straight down. Its own set at a finer pixel scale (200 px/m),
// constant within the shot. Cold screen glow vs. the warm lamp pool and the stopped car's white headlight wash.
import * as THREE from 'three';
import { PX, ramp, h2, fbm, texOf, glow, blob } from './px.js';
import { T } from './story.js';
import { seg, ss, clamp, lerp, eo } from '/core/lib.js';

const PPM = 200;
function ground(wM, hM) {
  const w = Math.round(wM * PPM), h = Math.round(hM * PPM), P = new PX(w, h);
  const R = ramp(['#0a0b10', '#13151c', '#1c1f27', '#272a33', '#343743'], .45), W = ramp(['#76746c', '#a6a39a', '#cdc9bc', '#e3dfd2'], .45);
  P.fill((x, y) => {
    // a worn zebra stripe crosses the frame diagonally (painted edge)
    const d = (x - w * .78) * .94 + (y - h * .5) * .34, inStripe = d > -55 && d < 55;
    const g = fbm(x * .35, y * .35, 4), grit = h2(x, y, 9);
    if (inStripe && !(fbm(x * .08, y * .08, 12) < .32 && grit > .35)) return W(.62 + (grit - .5) * .5 - (g < .4 ? .2 : 0), x, y);
    let v = .38 + (g - .5) * .55 + (grit - .5) * .4; if (h2(x, y, 3) > .975) v += .4;
    return R(v, x, y);
  });
  return P.done();
}
// phone: 15 x 31 px screen side; feed tiles + a crack + a notification banner (frame b = banner shown)
function screen(banner) {
  const w = 15, h = 31, P = new PX(w, h), E = new PX(w, h);
  const Fr = ramp(['#07080c', '#121420', '#1e2130'], .22);
  const tiles = ['#3a5aa8', '#6e8fd8', '#2d6f8a', '#8a6fd0', '#4f8fc8', '#b0c8f0'];
  P.fill((x, y) => {
    if (x === 0 || x === w - 1 || y === 0 || y === h - 1) return Fr(.8, x, y);
    if (y === 1 || y === h - 2) return Fr(.3, x, y);
    // feed: two big video tiles + rows of thumbnails
    const ty = y - 2, row = ty < 12 ? 0 : ty < 22 ? 1 : 2;
    let c;
    if (row < 2) { const k = tiles[(row * 3 + (x > 7 ? 1 : 0)) % tiles.length]; const v = .7 + (h2(x, y, row + 2) - .5) * .5; c = k; if ((ty % 12) === 11 || x === 7) c = '#0d0f18'; if (v > 1) c = '#dfe9ff'; }
    else c = (x % 4 === 0 || ty % 3 === 0) ? '#0d0f18' : tiles[(x >> 2) % tiles.length];
    if (banner && y >= 2 && y <= 6) c = y === 6 ? '#1a2a50' : (x > 2 && x < 12 && y === 4 ? '#ffffff' : '#e8f0ff');
    if (banner && x === 2 && y === 4) c = '#ff4d3d';
    // the crack: a jagged line from the top-left corner + a starburst
    const cx = 4 + y * .32 + (h2(0, y, 7) > .6 ? 1 : 0); if (Math.abs(x - cx) < .6 && y < 24) c = '#f4f8ff';
    if (Math.hypot(x - 5, y - 8) < 2.2 && h2(x, y, 8) > .45) c = '#f4f8ff';
    P.set(x, y, c); E.set(x, y, c); return null;
  });
  // P.set already done inside fill (returns null)
  return { map: texOf(P.done()), em: texOf(E.done()) };
}

export function buildPhone() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#0b1220', .05);
  scene.background = new THREE.Color('#05070c');
  const G = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshStandardMaterial({ map: texOf(ground(1.6, 1.6)), roughness: .95 }));
  G.rotation.x = -Math.PI / 2; G.receiveShadow = true; scene.add(G);
  const hemi = new THREE.HemisphereLight('#33446e', '#05050a', .55); scene.add(hemi);
  const lamp = new THREE.PointLight('#ffae55', .9, 6, 1.4); lamp.position.set(-1.2, 1.4, .6); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -.002; scene.add(lamp);
  const head = new THREE.SpotLight('#fff2dc', 0, 6, .7, .8, 1.5); head.position.set(.1, .5, -1.9); head.target.position.set(0, 0, 0); scene.add(head, head.target);

  const S0 = screen(false), S1 = screen(true);
  const phone = new THREE.Group();
  const bodyM = new THREE.MeshStandardMaterial({ color: '#0c0d12', roughness: .35, metalness: .5 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(.075, .009, .155).translate(0, .0045, 0), bodyM); body.castShadow = true; phone.add(body);
  const scrM = new THREE.MeshStandardMaterial({ map: S0.map, emissiveMap: S0.em, emissive: '#ffffff', emissiveIntensity: 1.6, roughness: .2 });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(.07, .148), scrM); scr.rotation.x = -Math.PI / 2; scr.position.y = .0092; phone.add(scr);
  phone.rotation.y = .42; phone.position.set(.02, 0, .04); scene.add(phone);
  const sh = blob(.07, .5); sh.scale.set(1, 1.8, 1); sh.rotation.z = .42; sh.position.set(.02, .001, .04); scene.add(sh);
  const sL = new THREE.PointLight('#8fbfff', .3, .9, 1.6); sL.position.set(.02, .08, .04); scene.add(sL);
  const sG = glow('#9cc8ff', .16, .25); sG.position.set(.02, .02, .04); scene.add(sG);
  // a few glass crumbs
  const crumbs = new THREE.Group(); const cmM = new THREE.MeshStandardMaterial({ color: '#cfe0ff', emissive: '#24344f', emissiveIntensity: .4, roughness: .1 });
  for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(.004, .002, .004), cmM); const a = h2(i, 1, 3) * 6.28, r = .07 + h2(i, 2, 3) * .09; c.position.set(.02 + Math.cos(a) * r, .001, .04 + Math.sin(a) * r * .8); c.rotation.y = a; crumbs.add(c); }
  scene.add(crumbs);

  function update(t, shot, cam, post, renderer) {
    const lt = t - shot.a;
    const h = lerp(.6, .46, eo(seg(t, 8.5, 13.8)));
    cam.position.set(.03, h, .12 + .04 * (1 - seg(t, 8.5, 13.8))); cam.fov = 40; cam.updateProjectionMatrix(); cam.lookAt(.02, 0, .03);
    // buzz: the phone shivers, the banner drops in, the screen brightens
    const bz = Math.max(...[T.buzz1, T.buzz2].map(b => (t >= b && t < b + .42) ? 1 : 0));
    const banner = [T.buzz1, T.buzz2].some(b => t >= b && t < b + 1.6);
    const M = banner ? S1 : S0; if (scrM.map !== M.map) { scrM.map = M.map; scrM.emissiveMap = M.em; scrM.needsUpdate = true; }
    const jx = bz ? (Math.sin(t * 190) * .0016) : 0, jr = bz ? Math.sin(t * 150) * .012 : 0;
    phone.position.set(.02 + jx, 0, .04); phone.rotation.y = .42 + jr;
    const flick = 1 + .05 * Math.sin(t * 7.3) * Math.sin(t * 2.1);
    scrM.emissiveIntensity = (banner ? 1.05 : .8) * flick; sL.intensity = (banner ? .45 : .3) * flick;
    head.intensity = .35 * (1 - .3 * seg(t, 8.5, 13.8));                 // the stopped car's light, cooling as the scene settles
    post.dof.focus = cam.position.distanceTo(new THREE.Vector3(.02, 0, .04)); post.dof.aper = 26; post.dof.maxCoc = 18;
    renderer.toneMappingExposure = .95;
    post.bloom.strength = .45; post.bloom.threshold = .92;
    post.vig.uniforms.amt.value = .75;
  }
  return { scene, update };
}
