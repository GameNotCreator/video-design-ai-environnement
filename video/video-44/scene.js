// "Mamie": the cut-away house, two identical floors. Sunday, 1 p.m., he promised to visit his grandmother. Upstairs he
// keeps scrolling: at her place she lays two plates, waits at the window, calls him ("Tu viens toujours ?" / "J'arrive
// dans 5 min !") and ends up alone at the table. Downstairs he locks his phone and goes: they bake a cake and eat it,
// laughing. "Reviens dimanche !"
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, glow, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson, walkFrame, WALK } from './people.js';
import { T, phaseAt } from './story.js';
import { seg, eio, lerp } from '/core/lib.js';

const FY = [2.25, 0];   // floor heights: [upstairs, downstairs]
function wallTex(cols, s) { const P = new PX(64, 64), R = ramp(cols, .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, s) - .5) * .25 + (h2(x, y, s) - .5) * .1, x, y)); return P.done(); }
function blanketTex() { const P = new PX(48, 30), R = ramp(['#1c2236', '#2a3350', '#3c4870', '#56658e'], .45); P.fill((x, y) => R(.5 + .2 * Math.sin(x * .5 + Math.sin(y * .3) * 2) + (h2(x, y, 4) - .5) * .2 + ((x + y) % 8 === 0 ? -.15 : 0), x, y)); return P.done(); }
function stoneTex() { const P = new PX(64, 32), R = ramp(['#1a1816', '#2a2622', '#3a342e', '#4a433a'], .45); P.fill((x, y) => { const row = y >> 3, off = (row % 2) * 6, edge = (y % 8 === 0) || ((x + off) % 12 === 0); return R(edge ? .15 : .5 + (h2(x >> 2, y >> 2, 3) - .5) * .4, x, y); }); return P.done(); }
function clothTex() { const P = new PX(32, 32); P.fill((x, y) => ((x >> 2) + (y >> 2)) % 2 ? [226, 218, 196] : [176, 196, 214]); return P.done(); }
function wallpaperTex() { const P = new PX(64, 64), R = ramp(['#6a5a48', '#7e6c56', '#927e66', '#a69076'], .45); P.fill((x, y) => { const f = ((x + 8) % 16 < 3 && (y + (x >> 4) * 8) % 16 < 3); return f ? [150, 120, 96] : R(.55 + (h2(x, y, 4) - .5) * .12, x, y); }); return P.done(); }

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#070912');
  for (let i = 0; i < 40; i++) { const s = glow('#dfe8ff', .05 + h2(i, 3, 1) * .05, 1.2); s.position.set(-6 + h2(i, 1, 1) * 12, -1 + h2(i, 2, 1) * 8, -6); scene.add(s); }
  const stone = mat(stoneTex()); const found = box(3.6, 1.8, 2.6, stone); found.position.set(0, -2.05, -1.1); scene.add(found);
  const slabM = new THREE.MeshStandardMaterial({ color: '#241c18', roughness: .9 }), trimM = new THREE.MeshBasicMaterial({ color: '#d8c28e' });
  for (const y of [-.25, 2.0, 4.25]) { const s = box(3.5, .25, 2.5, slabM); s.position.set(0, y, -1.1); scene.add(s); const tr = box(3.5, .025, .02, trimM); tr.position.set(0, y + .11, .16); scene.add(tr); }
  const cloth = texOf(clothTex()), paper = texOf(wallpaperTex());
  const floors = FY.map((y0, f) => {
    const g = new THREE.Group(); g.position.y = y0; scene.add(g);
    const wood = mesh(new THREE.BoxGeometry(3.2, .02, 2.25).translate(0, .01, -1.1), mat(woodPlanks(96, 64, { pw: 6, len: 48, seed: 3 + f, cols: ['#1a120e', '#2c1e16', '#43301f', '#5a4128', '#6e5032'] }))); g.add(wood);
    // —— his room (Sunday, 1 p.m.) ——
    const bed = new THREE.Group(); g.add(bed);
    const wM = mat(wallTex(['#1c2030', '#262c40', '#323a52', '#3e4862'], 2 + f));
    const back = box(3.2, 2.0, .1, wM); back.position.set(0, 0, -2.25); bed.add(back);
    for (const x of [-1.65, 1.65]) { const sw = box(.1, 2.0, 2.4, wM); sw.position.set(x, 0, -1.1); bed.add(sw); }
    const woodM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 6 + f, nails: false, cols: ['#1e140e', '#33231a', '#4a3424', '#5e4430'] }));
    const bf = box(.95, .3, 1.9, woodM); bf.position.set(-1.05, 0, -1.2); bed.add(bf);
    const mt = box(.92, .14, 1.86, mat(blanketTex())); mt.position.set(-1.05, .3, -1.2); bed.add(mt);
    const pil = box(.7, .1, .35, new THREE.MeshStandardMaterial({ color: '#b8b4c4', roughness: 1 })); pil.position.set(-1.05, .44, -1.95); bed.add(pil);
    const lump = new THREE.Group(); lump.add(new THREE.Mesh(new THREE.CapsuleGeometry(.2, 1.0, 4, 8).rotateX(Math.PI / 2), mat(blanketTex()))); lump.children[0].position.set(0, .56, -1.0);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), new THREE.MeshStandardMaterial({ color: '#1f1619', roughness: .9 })); hair.position.set(0, .58, -1.85); lump.add(hair); lump.position.x = -1.05; bed.add(lump);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(.8, .6), new THREE.MeshBasicMaterial({ color: '#8cc4f0' })); win.position.set(-.1, 1.32, -2.19); bed.add(win);
    const frM = new THREE.MeshStandardMaterial({ color: '#2a2018', roughness: .9 });
    for (const [w, h, x, y] of [[.88, .05, -.1, 1.63], [.88, .05, -.1, 1.02], [.05, .66, -.52, 1.32], [.05, .66, .32, 1.32], [.03, .6, -.1, 1.32]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .05), frM); b.position.set(x, y, -2.18); bed.add(b); }
    const moon = glow('#fff0c0', .3, 1.0); moon.position.set(.1, 1.5, -2.18); bed.add(moon);
    const desk = box(1.05, .05, .62, woodM); desk.position.set(1.05, .72, -1.05); bed.add(desk);
    for (const [x, z] of [[.6, -1.3], [1.5, -1.3], [.6, -.8], [1.5, -.8]]) { const l = box(.05, .72, .05, woodM); l.position.set(x, 0, z); bed.add(l); }
    const chair = box(.4, .05, .4, woodM); chair.position.set(.22, .42, -1.02); bed.add(chair);
    for (const [x, z] of [[.05, -1.19], [.39, -1.19], [.05, -.85], [.39, -.85]]) { const l = box(.04, .42, .04, woodM); l.position.set(x, 0, z); bed.add(l); }
    const lampB = box(.06, .32, .06, new THREE.MeshStandardMaterial({ color: '#202028' })); lampB.position.set(1.42, .745, -1.25); bed.add(lampB);
    const lampG = glow('#ffc070', .3, 1.0); lampG.position.set(1.36, 1.1, -1.2); bed.add(lampG);
    const facedown = box(.08, .015, .15, new THREE.MeshStandardMaterial({ color: '#16161c', roughness: .4 })); facedown.position.set(.68, .745, -.85); facedown.visible = false; bed.add(facedown);
    const lampL = new THREE.PointLight('#fff0dc', 2.6, 3.4, 1.3); lampL.position.set(.2, 1.5, -.4); g.add(lampL);
    const moonL = new THREE.PointLight('#8aa0e0', .8, 3, 1.5); moonL.position.set(-.1, 1.3, -1.6); g.add(moonL);
    // —— Mamie's kitchen: flowered wallpaper, a round table with a checked cloth, the counter and the oven, a clock ——
    const home = new THREE.Group(); home.visible = false; g.add(home);
    const pM = new THREE.MeshStandardMaterial({ map: paper, roughness: .95 });
    const hb = box(3.2, 2.0, .1, pM); hb.position.set(0, 0, -2.25); home.add(hb);
    for (const x of [-1.65, 1.65]) { const sw = box(.1, 2.0, 2.4, pM); sw.position.set(x, 0, -1.1); home.add(sw); }
    const kwin = new THREE.Mesh(new THREE.PlaneGeometry(.66, .56), new THREE.MeshBasicMaterial({ color: '#8cc4f0' })); kwin.position.set(-1.0, 1.35, -2.19); home.add(kwin);
    for (const x of [-1.38, -.62]) { const cu = new THREE.Mesh(new THREE.PlaneGeometry(.16, .7), new THREE.MeshStandardMaterial({ color: '#c8b8a0', roughness: 1 })); cu.position.set(x, 1.32, -2.17); home.add(cu); }
    const clockF = new THREE.Mesh(new THREE.CircleGeometry(.12, 20), new THREE.MeshStandardMaterial({ color: '#f0ece2', roughness: .8 })); clockF.position.set(.05, 1.55, -2.18); home.add(clockF);
    const hand = box(.012, .09, .01, new THREE.MeshBasicMaterial({ color: '#222' })); hand.position.set(.05, 1.55, -2.17); home.add(hand);
    const tM = new THREE.MeshStandardMaterial({ map: cloth, roughness: .9 });
    const ttop = new THREE.Mesh(new THREE.CylinderGeometry(.46, .46, .05, 24), tM); ttop.position.set(-.3, .72, -1.3); home.add(ttop);
    const tleg = box(.08, .7, .08, new THREE.MeshStandardMaterial({ color: '#4a3424' })); tleg.position.set(-.3, 0, -1.3); home.add(tleg);
    const cM = new THREE.MeshStandardMaterial({ color: '#5a4030', roughness: .8 });
    for (const x of [-.95, .35]) { const ch = box(.34, .05, .34, cM); ch.position.set(x, .42, -1.3); home.add(ch); const cl = box(.04, .42, .04, cM); cl.position.set(x, 0, -1.3); home.add(cl); }
    const plateM = new THREE.MeshStandardMaterial({ color: '#f2efe8', roughness: .4 });
    const plates = [-.55, -.05].map(x => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.1, .09, .015, 16), plateM); p.position.set(x, .755, -1.25); p.visible = false; home.add(p); return p; });
    const cake = new THREE.Group(); const cb = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, .12, 20), new THREE.MeshStandardMaterial({ color: '#8a5a34', roughness: .8 })); cb.position.y = .06; cake.add(cb);
    const ct = new THREE.Mesh(new THREE.CylinderGeometry(.145, .145, .025, 20), new THREE.MeshStandardMaterial({ color: '#f4ecdc', roughness: .6 })); ct.position.y = .125; cake.add(ct);
    cake.position.set(-.3, .745, -1.4); cake.visible = false; home.add(cake);
    const slice = new THREE.Mesh(new THREE.BoxGeometry(.06, .1, .08), new THREE.MeshStandardMaterial({ color: '#8a5a34' })); slice.visible = false; home.add(slice);
    const counter = box(1.0, .82, .5, new THREE.MeshStandardMaterial({ color: '#c8c0b0', roughness: .7 })); counter.position.set(1.05, 0, -1.95); home.add(counter);
    const ctop = box(1.04, .04, .54, new THREE.MeshStandardMaterial({ color: '#6a5a4a', roughness: .6 })); ctop.position.set(1.05, .82, -1.95); home.add(ctop);
    const oven = new THREE.Mesh(new THREE.PlaneGeometry(.34, .26), new THREE.MeshBasicMaterial({ color: '#1a1414' })); oven.position.set(1.3, .42, -1.695); home.add(oven);
    const ovenG = glow('#ffa050', .2, 1.0); ovenG.position.set(1.3, .42, -1.68); ovenG.visible = false; home.add(ovenG);
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(.11, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#d8d0c0', side: THREE.DoubleSide })); bowl.rotation.x = Math.PI; bowl.position.set(.8, .95, -1.9); bowl.visible = false; home.add(bowl);
    const homeL = new THREE.PointLight('#ffe8c8', 0, 4.0, 1.2); homeL.position.set(-.2, 1.7, -.3); g.add(homeL);
    const phone = box(.035, .07, .015, new THREE.MeshStandardMaterial({ color: '#2a2a30' })); phone.visible = false; g.add(phone);
    // —— him and Mamie ——
    const hero = makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark', shoe: 'sneaker' }, {
      phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, sit: { pose: 'sit', smile: 1 }, talk: { pose: 'sittalk', mouth: 1, smile: 1 },
      p0: { pose: 'push', smile: 1 }, p1: { pose: 'push', bob: 1, smile: 1 }, stand: { pose: 'stand', smile: 1 }, ...WALK,
    });
    const mamie = makePerson({ skin: 'skinOld', top: 'green', bottom: 'beige', dress: 1, hair: 'hairWhite', hairStyle: 'bun', glasses: 1, hunch: 1, shoe: 'shoe' }, {
      stand: { pose: 'stand' }, smile: { pose: 'stand', smile: 1 }, look: { pose: 'look', nophone: 1 }, wait: { pose: 'stand', blink: 1 },
      p0: { pose: 'push', smile: 1 }, p1: { pose: 'push', bob: 1, smile: 1 }, sit: { pose: 'sit' }, sitsad: { pose: 'sit', blink: 1, bob: 1 },
      call: { pose: 'talk', mouth: 1 }, call2: { pose: 'talk' }, sitsmile: { pose: 'sit', smile: 1 }, sittalk: { pose: 'sittalk', mouth: 1, smile: 1 },
    });
    for (const P of [hero, mamie]) { P.shadow.visible = false; g.add(P.root); }
    const phoneL = new THREE.PointLight('#8fc0ff', 1.0, 1.4, 2); g.add(phoneL);
    return { g, bed, home, facedown, lampL, lampG, moonL, homeL, plates, cake, slice, ovenG, bowl, hand, phone, hero, mamie, phoneL };
  });
  scene.add(new THREE.HemisphereLight('#7080b0', '#1c1418', 1.3));
  const fill = new THREE.PointLight('#c0c8e8', 3.0, 20, 1.2); fill.position.set(0, 2.3, 5); scene.add(fill);
  const _v = new THREE.Vector3(), alt = (t, r, k = 0) => Math.floor(t * r + k) % 2;

  function update(t, shot, cam, post, renderer) {
    const u = eio(seg(t, 0, T.end)); cam.position.set(0, 2.17, lerp(13.2, 12.9, u)); cam.lookAt(0, 2.17, -1); cam.fov = 24.0; cam.updateProjectionMatrix();
    const ph = phaseAt(t), atHers = ph >= 1, verdict = ph >= 5;
    floors.forEach((F, f) => {
      const up = f === 0, H = F.hero, M = F.mamie;
      F.bed.visible = !atHers; F.home.visible = atHers; F.homeL.intensity = atHers ? 3.0 : 0; F.lampL.intensity = atHers ? 0 : 2.6; F.lampG.visible = false; F.moonL.intensity = 0;
      F.phone.visible = false; F.slice.visible = false; F.ovenG.visible = false; F.bowl.visible = false; F.cake.visible = false;
      F.hand.rotation.z = -[0, 0, 1.6, 3.2, 4.2, 4.6][ph];
      let hp = [.22, .02, -1.0], hf = 'phone', hv = true, hflip = false, mv = atHers, mp = [-.95, .02, -1.25], mf = 'sit', mflip = false;
      if (!atHers) {
        F.facedown.visible = !up && t >= T.down;
        if (!up && t >= T.down) { const k = seg(t, T.leave, 2.9); hp = [lerp(.22, 1.5, k), 0, lerp(-1.0, -.9, k)]; hf = k > 0 ? walkFrame(t) : 'stand'; hv = k < 1; }
        else hf = t % 2.9 < .1 ? 'blink' : 'phone';
      } else if (up) {   // he never comes: she lays two plates, waits at the window, calls
        hv = false; F.plates.forEach(p => { p.visible = true; });
        F.cake.visible = ph >= 2;
        if (ph === 1) { mp = [-.55, 0, -.95]; mf = 'smile'; }
        else if (ph === 2) { mp = [-1.0, 0, -1.75]; mf = 'look'; mflip = true; }
        else if (ph === 3) { mp = [-.95, .02, -1.25]; mf = 'sit'; }
        else if (!verdict) { mp = [-.75, 0, -.9]; mf = t >= 8.2 && t < 11.0 ? (alt(t, 3) ? 'call' : 'call2') : 'call2'; F.phone.visible = true; F.phone.position.copy(M.local(22, 13)).add(_v.set(0, 0, .04)); }
        else { mp = [-.95, .02, -1.25]; mf = 'sitsad'; }
      } else {           // downstairs: he came; they bake, then eat it together
        mflip = false;
        if (ph === 1) { mp = [.62, 0, -1.6]; mf = alt(t, 3) ? 'p0' : 'p1'; hp = [1.15, 0, -1.55]; hf = alt(t, 3, 1) ? 'p0' : 'p1'; F.bowl.visible = true; }
        else if (ph === 2) { mp = [.62, 0, -1.5]; mf = 'smile'; hp = [1.05, 0, -1.3]; hf = 'stand'; F.ovenG.visible = true; F.plates.forEach(p => { p.visible = true; }); }
        else { F.cake.visible = true; F.plates.forEach(p => { p.visible = true; }); mp = [-.95, .02, -1.25]; mf = alt(t, 2.4) ? 'sittalk' : 'sitsmile'; hp = [.35, .02, -1.25]; hf = alt(t, 2.4, 1) ? 'talk' : 'sit'; hflip = true; F.slice.visible = ph >= 4; F.slice.position.set(-.05, .79, -1.25); }
      }
      M.root.visible = mv; if (mv) { M.root.position.set(...mp); M.frame(mf); M.face(cam, mflip); }
      H.root.visible = hv; H.root.position.set(...hp); H.frame(hf); H.face(cam, hflip);
      const lit = hv && ['phone', 'blink'].includes(hf);
      F.phoneL.intensity = lit ? 1.0 : 0; if (lit) F.phoneL.position.copy(H.local(25, 18)).add(_v.set(.2, .05, .2));
    });
    post.dof.focus = cam.position.distanceTo(_v.set(0, 2.1, -1.0)); post.dof.aper = 2; post.dof.maxCoc = 3;
    renderer.toneMappingExposure = 1.25; post.bloom.strength = .3; post.bloom.threshold = .88;
  }
  return { scene, update };
}
