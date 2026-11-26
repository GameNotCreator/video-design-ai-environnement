// "Premier rendez-vous": the cut-away house again, two identical floors. First date at a café table by a night window:
// upstairs he scrolls and she gets up and leaves; downstairs he locks his phone, puts it face down, and they laugh.
// One year later both floors become a living room: upstairs he is alone on the sofa with his phone, downstairs the two
// of them, side by side, in the TV light.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson, WALK, walkFrame } from './people.js';
import { T, phaseAt } from './story.js';
import { seg, ss, eio, eo, clamp, lerp } from '/core/lib.js';

const FY = [2.25, 0];   // floor heights: [upstairs, downstairs]
function wallTex(cols, s) { const P = new PX(64, 64), R = ramp(cols, .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, s) - .5) * .25 + (h2(x, y, s) - .5) * .1, x, y)); return P.done(); }
function stoneTex() { const P = new PX(64, 32), R = ramp(['#1a1816', '#2a2622', '#3a342e', '#4a433a'], .45); P.fill((x, y) => { const row = y >> 3, off = (row % 2) * 6, edge = (y % 8 === 0) || ((x + off) % 12 === 0); return R(edge ? .15 : .5 + (h2(x >> 2, y >> 2, 3) - .5) * .4, x, y); }); return P.done(); }
function cityTex() { const P = new PX(48, 30); P.fill((x, y) => y < 12 ? [14, 18, 40] : [10, 12, 26]); for (let i = 0; i < 9; i++) { const x0 = Math.floor(h2(i, 1, 3) * 44), w = 3 + Math.floor(h2(i, 2, 3) * 5), top = 8 + Math.floor(h2(i, 3, 3) * 12); for (let x = x0; x < Math.min(48, x0 + w); x++) for (let y = top; y < 30; y++) P.set(x, y, ((x % 3 === 1) && (y % 3 === 1) && h2(x, y, 5) > .7) ? [150, 124, 80] : [18, 20, 36]); } return P.done(); }
function sofaTex() { const P = new PX(32, 16), R = ramp(['#3a2a22', '#4e382c', '#644838', '#7a5a46'], .45); P.fill((x, y) => R(.5 + (h2(x, y, 8) - .5) * .3 + ((x % 8) === 0 ? -.2 : 0), x, y)); return P.done(); }

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#070912');
  for (let i = 0; i < 40; i++) { const s = glow('#dfe8ff', .05 + h2(i, 3, 1) * .05, 1.2); s.position.set(-6 + h2(i, 1, 1) * 12, -1 + h2(i, 2, 1) * 8, -6); scene.add(s); }
  const stone = mat(stoneTex()); const found = box(3.6, 1.8, 2.6, stone); found.position.set(0, -2.05, -1.1); scene.add(found);
  const slabM = new THREE.MeshStandardMaterial({ color: '#241c18', roughness: .9 }), trimM = new THREE.MeshBasicMaterial({ color: '#d8c28e' });
  for (const y of [-.25, 2.0, 4.25]) { const s = box(3.5, .25, 2.5, slabM); s.position.set(0, y, -1.1); scene.add(s); const tr = box(3.5, .025, .02, trimM); tr.position.set(0, y + .11, .16); scene.add(tr); }
  const floors = FY.map((y0, f) => {
    const g = new THREE.Group(); g.position.y = y0; scene.add(g);
    g.add(mesh(new THREE.BoxGeometry(3.2, .02, 2.25).translate(0, .01, -1.1), mat(woodPlanks(96, 64, { pw: 6, len: 48, seed: 5 + f, cols: ['#2a1c14', '#40291c', '#583a26', '#704c32', '#8a603e'] }))));
    // —— the café (first date) ——
    const cafe = new THREE.Group(); g.add(cafe);
    const cW = mat(wallTex(['#3a2620', '#4a322a', '#5a3e34', '#6a4a3e'], 4 + f));
    const cb = box(3.2, 2.0, .1, cW); cb.position.set(0, 0, -2.25); cafe.add(cb); for (const x of [-1.65, 1.65]) { const sw = box(.1, 2.0, 2.4, cW); sw.position.set(x, 0, -1.1); cafe.add(sw); }
    const city = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.05), new THREE.MeshBasicMaterial({ map: texOf(cityTex()) })); city.position.set(0, 1.25, -2.19); cafe.add(city);
    const frM = new THREE.MeshStandardMaterial({ color: '#2a1a12', roughness: .9 });
    for (const [w, h, x, y] of [[1.9, .05, 0, 1.78], [1.9, .05, 0, .72], [.05, 1.1, -.92, 1.25], [.05, 1.1, .92, 1.25], [.04, 1.05, 0, 1.25]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .05), frM); b.position.set(x, y, -2.18); cafe.add(b); }
    const tM = new THREE.MeshStandardMaterial({ color: '#5a3c26', roughness: .6 });
    const tTop = new THREE.Mesh(new THREE.CylinderGeometry(.32, .32, .04, 20), tM); tTop.position.set(0, .74, -1.0); cafe.add(tTop);
    const tLeg = box(.06, .72, .06, tM); tLeg.position.set(0, 0, -1.0); cafe.add(tLeg);
    for (const x of [-.55, .55]) { const ch = box(.36, .05, .36, tM); ch.position.set(x, .42, -1.0); cafe.add(ch); const cl = box(.05, .42, .05, tM); cl.position.set(x, 0, -1.0); cafe.add(cl); }
    const cupM = new THREE.MeshStandardMaterial({ color: '#e8e4dc', roughness: .4 });
    for (const x of [-.14, .14]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.04, .035, .07, 12), cupM); c.position.set(x, .795, -.95); cafe.add(c); }
    const candle = glow('#ffc070', .16, 1.3); candle.position.set(0, .85, -1.05); cafe.add(candle);
    const facedown = box(.08, .015, .15, new THREE.MeshStandardMaterial({ color: '#16161c', roughness: .4 })); facedown.position.set(-.2, .768, -.85); facedown.visible = false; cafe.add(facedown);
    const pend = new THREE.PointLight('#ffcf90', 2.4, 2.8, 1.5); pend.position.set(0, 1.5, -.8); g.add(pend);
    const pendG = glow('#ffc070', .22, 1.0); pendG.position.set(0, 1.75, -1.0); cafe.add(pendG);
    // —— the living room, one year later ——
    const home = new THREE.Group(); home.visible = false; g.add(home);
    const hW = mat(wallTex(['#1c2030', '#262c40', '#323a52', '#3e4862'], 8 + f));
    const hb = box(3.2, 2.0, .1, hW); hb.position.set(0, 0, -2.25); home.add(hb); for (const x of [-1.65, 1.65]) { const sw = box(.1, 2.0, 2.4, hW); sw.position.set(x, 0, -1.1); home.add(sw); }
    const sM = mat(sofaTex());
    const seat = box(1.7, .42, .8, sM); seat.position.set(0, 0, -1.3); home.add(seat);
    const back = box(1.7, .45, .2, sM); back.position.set(0, .42, -1.65); home.add(back);
    for (const x of [-.95, .95]) { const a = box(.2, .58, .8, sM); a.position.set(x, 0, -1.3); home.add(a); }
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(.5, .38), new THREE.MeshStandardMaterial({ color: f ? '#c8b088' : '#3a3a44', roughness: .8 })); frame.position.set(.95, 1.45, -2.19); home.add(frame);
    const lampH = glow('#ffc070', .28, 1.0); lampH.position.set(-1.35, 1.3, -1.6); home.add(lampH);
    const homeL = new THREE.PointLight('#ffcf90', 0, 2.8, 1.5); homeL.position.set(-1.2, 1.3, -1.3); g.add(homeL);
    const tvL = new THREE.PointLight('#8fb0ff', 0, 3.0, 1.4); tvL.position.set(0, 1.0, .4); g.add(tvL);
    // —— him and her ——
    const hero = makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark', shoe: 'sneaker' }, {
      phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, talk: { pose: 'sittalk', mouth: 1, smile: 1 }, sit: { pose: 'sit', smile: 1 }, look: { pose: 'look' },
    });
    const her = makePerson({ dress: 1, top: 'purple', hair: 'hairBrown', hairStyle: 'long', shoe: 'shoe' }, {
      sit: { pose: 'sit' }, smile: { pose: 'sit', smile: 1 }, talk: { pose: 'sittalk', mouth: 1, smile: 1 }, ask: { pose: 'sittalk', mouth: 1 }, ...WALK,
    });
    hero.shadow.visible = false; her.shadow.visible = false; g.add(hero.root, her.root);
    const phoneL = new THREE.PointLight('#8fc0ff', 1.0, 1.4, 2); g.add(phoneL);
    return { g, cafe, home, facedown, pend, pendG, candle, homeL, tvL, lampH, hero, her, phoneL };
  });
  scene.add(new THREE.HemisphereLight('#8080a8', '#1c1418', 1.3));
  const fill = new THREE.PointLight('#c0c8e8', 3.0, 20, 1.2); fill.position.set(0, 2.3, 5); scene.add(fill);
  const _v = new THREE.Vector3();

  function update(t, shot, cam, post, renderer) {
    const u = eio(seg(t, 0, T.end)); cam.position.set(0, 2.17, lerp(13.2, 12.9, u)); cam.lookAt(0, 2.17, -1); cam.fov = 24.0; cam.updateProjectionMatrix();
    const later = phaseAt(t) === 1;
    floors.forEach((F, f) => {
      const up = f === 0, H = F.hero, S = F.her;
      F.cafe.visible = !later; F.home.visible = later;
      F.pend.intensity = later ? 0 : 2.4; F.homeL.intensity = later ? (up ? 0 : 2.2) : 0; F.lampH.visible = later && !up; F.tvL.intensity = later ? (up ? .5 : 1.4) * (.85 + .15 * Math.sin(t * 5.3)) : 0;
      let hp = [-.55, .02, -1.0], hf = 'phone', sp = [.55, .02, -1.0], sf = 'sit', sflip = true, svis = true;
      if (!later) {
        F.facedown.visible = !up && t >= T.down;
        if (up) {
          hf = t % 2.9 < .1 ? 'blink' : 'phone';
          if (t >= 4.0 && t < 6.9) sf = Math.floor(t * 3) % 2 ? 'ask' : 'sit';
          if (t >= T.leave) { const k = seg(t, T.leave, T.leave + 1.2); sp = [lerp(.55, 1.9, k), 0, lerp(-1.0, -.6, k)]; sf = walkFrame(t); sflip = false; svis = k < 1; }
        } else {
          hf = t < T.down ? 'phone' : (Math.floor(t * 2.6) % 2 ? 'talk' : 'sit');
          sf = t < T.laugh ? 'sit' : (Math.floor(t * 2.6 + 1) % 2 ? 'talk' : 'smile');
        }
      } else {
        // one year later: upstairs alone, downstairs together on the sofa
        if (up) { hp = [-.1, .02, -1.2]; hf = t >= 11.8 && t < 15.2 ? 'look' : (t % 2.9 < .1 ? 'blink' : 'phone'); svis = false; }
        else { hp = [-.3, .02, -1.2]; hf = Math.floor(t * 2 + 1) % 3 === 0 ? 'talk' : 'sit'; sp = [.3, .02, -1.22]; sf = Math.floor(t * 2) % 3 === 0 ? 'talk' : 'smile'; sflip = true; }
      }
      H.root.position.set(...hp); H.frame(hf); H.face(cam, false);
      S.root.visible = svis; if (svis) { S.root.position.set(...sp); S.frame(sf); S.face(cam, sflip); }
      const lit = ['phone', 'blink', 'look'].includes(hf);
      F.phoneL.intensity = lit ? (hf === 'look' ? .3 : 1.0) : 0; if (lit) F.phoneL.position.copy(H.local(25, 18)).add(_v.set(.2, .05, .2));
    });
    post.dof.focus = cam.position.distanceTo(_v.set(0, 2.1, -1.0)); post.dof.aper = 2; post.dof.maxCoc = 3;
    renderer.toneMappingExposure = 1.25; post.bloom.strength = .3; post.bloom.threshold = .88;
  }
  return { scene, update };
}
