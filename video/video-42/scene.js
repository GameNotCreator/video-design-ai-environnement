// "La coloc": the cut-away house, two identical floors, the same shared flat (sofa and coffee table on the left, the
// kitchen counter on the right, the front door between them). Sunday night: upstairs he scrolls on the sofa while the
// dishes pile up by the sink; downstairs he locks his phone, washes up, wipes the table, goes to bed. Monday night his
// flatmate comes home: upstairs she sees the pile and walks out again; downstairs she sees the clean kitchen and cooks.
import * as THREE from 'three';
import { PX, ramp, h2, fbm, texOf, glow, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson, WALK, walkFrame } from './people.js';
import { T, phaseAt } from './story.js';
import { seg, eio, lerp } from '/core/lib.js';

const FY = [2.25, 0];   // floor heights: [upstairs, downstairs]
function wallTex(cols, s) { const P = new PX(64, 64), R = ramp(cols, .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, s) - .5) * .25 + (h2(x, y, s) - .5) * .1, x, y)); return P.done(); }
function stoneTex() { const P = new PX(64, 32), R = ramp(['#1a1816', '#2a2622', '#3a342e', '#4a433a'], .45); P.fill((x, y) => { const row = y >> 3, off = (row % 2) * 6, edge = (y % 8 === 0) || ((x + off) % 12 === 0); return R(edge ? .15 : .5 + (h2(x >> 2, y >> 2, 3) - .5) * .4, x, y); }); return P.done(); }
function sofaTex() { const P = new PX(48, 16), R = ramp(['#26303a', '#34404c', '#46525e', '#5a6672'], .45); P.fill((x, y) => R(.5 + (h2(x >> 1, y >> 1, 5) - .5) * .25 - (x % 16 === 0 ? .2 : 0), x, y)); return P.done(); }
function tileTex() { const P = new PX(48, 16), R = ramp(['#8a8a84', '#a4a49c', '#bcbcb2', '#d0d0c6'], .45); P.fill((x, y) => (x % 6 === 0 || y % 6 === 0) ? [110, 108, 100] : R(.55 + (h2(x, y, 3) - .5) * .2, x, y)); return P.done(); }
function plateTex(dirty) { const P = new PX(12, 12); P.fill((x, y) => { const d = Math.hypot(x - 5.5, y - 5.5); if (d > 5.8) return [0, 0, 0, 0]; let c = d > 4.5 ? [214, 210, 200] : [236, 232, 222]; if (dirty && h2(x, y, 7) > .72) c = [150, 110, 70]; return c; }); return P.done(); }

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#070912');
  for (let i = 0; i < 40; i++) { const s = glow('#dfe8ff', .05 + h2(i, 3, 1) * .05, 1.2); s.position.set(-6 + h2(i, 1, 1) * 12, -1 + h2(i, 2, 1) * 8, -6); scene.add(s); }
  const stone = mat(stoneTex()); const found = box(3.6, 1.8, 2.6, stone); found.position.set(0, -2.05, -1.1); scene.add(found);
  const slabM = new THREE.MeshStandardMaterial({ color: '#241c18', roughness: .9 }), trimM = new THREE.MeshBasicMaterial({ color: '#d8c28e' });
  for (const y of [-.25, 2.0, 4.25]) { const s = box(3.5, .25, 2.5, slabM); s.position.set(0, y, -1.1); scene.add(s); const tr = box(3.5, .025, .02, trimM); tr.position.set(0, y + .11, .16); scene.add(tr); }
  const dirtyM = new THREE.MeshStandardMaterial({ color: '#e0d8c8', roughness: .6 }), stainM = new THREE.MeshStandardMaterial({ color: '#8a6a48', roughness: .9 }), cleanM = new THREE.MeshStandardMaterial({ color: '#f2f0ea', roughness: .3 });
  const floors = FY.map((y0, f) => {
    const g = new THREE.Group(); g.position.y = y0; scene.add(g);
    g.add(mesh(new THREE.BoxGeometry(3.2, .02, 2.25).translate(0, .01, -1.1), mat(woodPlanks(96, 64, { pw: 6, len: 48, seed: 13 + f, cols: ['#2a1c14', '#3c2a1e', '#523a28', '#684c34', '#7c5c3e'] }))));
    const wM = mat(wallTex(['#3e3630', '#4e443c', '#5e5248', '#6e6054'], 2 + f));
    const back = box(3.2, 2.0, .1, wM); back.position.set(0, 0, -2.25); g.add(back);
    for (const x of [-1.65, 1.65]) { const sw = box(.1, 2.0, 2.4, wM); sw.position.set(x, 0, -1.1); g.add(sw); }
    // the window above the sofa, the front door between the sofa and the kitchen
    const win = new THREE.Mesh(new THREE.PlaneGeometry(.7, .5), new THREE.MeshBasicMaterial({ color: '#0c1430' })); win.position.set(-.9, 1.42, -2.19); g.add(win);
    const frM = new THREE.MeshStandardMaterial({ color: '#2a2018', roughness: .9 });
    for (const [w, h, x, y] of [[.78, .05, -.9, 1.69], [.78, .05, -.9, 1.15], [.05, .58, -1.27, 1.42], [.05, .58, -.53, 1.42], [.03, .5, -.9, 1.42]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .05), frM); b.position.set(x, y, -2.18); g.add(b); }
    const door = box(.5, 1.35, .04, new THREE.MeshStandardMaterial({ color: '#4a3424', roughness: .8 })); door.position.set(.05, 0, -2.19); g.add(door);
    const knob = glow('#d8c28e', .04, 1.2); knob.position.set(.24, .68, -2.16); g.add(knob);
    // sofa + coffee table (left)
    const sM = mat(sofaTex());
    const seat = box(1.2, .38, .55, sM); seat.position.set(-.95, 0, -1.65); g.add(seat);
    const backr = box(1.2, .42, .14, sM); backr.position.set(-.95, .38, -1.9); g.add(backr);
    for (const x of [-1.6, -.3]) { const a = box(.12, .55, .55, sM); a.position.set(x + (x < 0 ? .05 : -.05), 0, -1.65); g.add(a); }
    const woodM = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 6 + f, nails: false, cols: ['#2a1c14', '#3e2a1c', '#563c28', '#6e4e34'] }));
    const ctab = box(.7, .05, .36, woodM); ctab.position.set(-.85, .34, -.95); g.add(ctab);
    for (const [x, z] of [[-1.15, -1.08], [-.55, -1.08], [-1.15, -.82], [-.55, -.82]]) { const l = box(.04, .34, .04, woodM); l.position.set(x, 0, z); g.add(l); }
    const pizza = box(.34, .04, .34, new THREE.MeshStandardMaterial({ color: '#b89a6a', roughness: .9 })); pizza.position.set(-.95, .39, -.95); pizza.rotation.y = .3; g.add(pizza);
    const cans = [0, 1, 2].map(i => { const c = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .09, 10), new THREE.MeshStandardMaterial({ color: ['#4a6a8a', '#8a8a92', '#4a7a5a'][i], metalness: .5, roughness: .4 })); c.position.set(-.62 - i * .09, .435, -.9 + (i % 2) * .06); g.add(c); return c; });
    const facedown = box(.08, .015, .15, new THREE.MeshStandardMaterial({ color: '#16161c', roughness: .4 })); facedown.position.set(-.6, .395, -1.05); facedown.visible = false; g.add(facedown);
    // the kitchen (right): counter, tiles, sink, stove, cupboards
    const cM = new THREE.MeshStandardMaterial({ color: '#3a3a40', roughness: .6 }), topM = new THREE.MeshStandardMaterial({ color: '#8a8478', roughness: .5 });
    const counter = box(1.2, .82, .5, cM); counter.position.set(1.0, 0, -1.95); g.add(counter);
    const top = box(1.24, .04, .54, topM); top.position.set(1.0, .82, -1.95); g.add(top);
    const tiles = new THREE.Mesh(new THREE.PlaneGeometry(1.2, .55), new THREE.MeshStandardMaterial({ map: texOf(tileTex()), roughness: .4 })); tiles.position.set(1.0, 1.14, -2.19); g.add(tiles);
    const cup = box(1.2, .38, .3, new THREE.MeshStandardMaterial({ color: '#4a4440', roughness: .7 })); cup.position.set(1.0, 1.48, -2.05); g.add(cup);
    const sink = box(.38, .02, .3, new THREE.MeshStandardMaterial({ color: '#1e2024', roughness: .3, metalness: .4 })); sink.position.set(.72, .845, -1.93); g.add(sink);
    const tap = box(.03, .2, .03, new THREE.MeshStandardMaterial({ color: '#a0a4ac', metalness: .7, roughness: .3 })); tap.position.set(.72, .86, -2.12); g.add(tap);
    const hob = box(.4, .02, .34, new THREE.MeshStandardMaterial({ color: '#141418', roughness: .4 })); hob.position.set(1.32, .845, -1.95); g.add(hob);
    const burner = glow('#ff9a50', .14, 1.0); burner.position.set(1.32, .9, -1.9); burner.visible = false; g.add(burner);
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(.13, .11, .06, 16), new THREE.MeshStandardMaterial({ color: '#2a2a2e', metalness: .5, roughness: .4 })); pan.position.set(1.32, .89, -1.92); pan.visible = false; g.add(pan);
    const steam = [0, 1, 2].map(i => { const s = glow('#e8e8f0', .07, 1.0); s.visible = false; g.add(s); return s; });
    // the dishes: a dirty pile by the sink (grows upstairs, goes downstairs); a clean rack once washed
    const pile = Array.from({ length: 14 }, (_, i) => { const p = new THREE.Group(); const d = new THREE.Mesh(new THREE.CylinderGeometry(.11, .1, .018, 14), dirtyM); p.add(d); const st = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .004, 8), stainM); st.position.set((h2(i, 1, 2) - .5) * .08, .011, (h2(i, 2, 2) - .5) * .06); p.add(st); const col = i < 9 ? 0 : 1, k = i < 9 ? i : i - 9; p.position.set(.44 + col * .02 + (h2(i, 3, 3) - .5) * .03, .85 + k * .021, -1.86 + col * -.1); p.rotation.set((h2(i, 4, 4) - .5) * .2, 0, (h2(i, 5, 4) - .5) * .2); p.visible = false; g.add(p); return p; });
    const mugs = [0, 1, 2].map(i => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.035, .03, .08, 10), new THREE.MeshStandardMaterial({ color: ['#6a7a8a', '#8a7a5a', '#5a6a5a'][i], roughness: .6 })); m.position.set(.58 + i * .08, .88, -1.78); m.visible = false; g.add(m); return m; });
    const rack = Array.from({ length: 6 }, (_, i) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, .015, 14), cleanM); p.rotation.x = Math.PI / 2 - .15; p.position.set(.98 + i * .035, .93, -2.0); p.visible = false; g.add(p); return p; });
    const lampG = glow('#ffc070', .3, 1.0); lampG.position.set(-1.45, 1.05, -1.95); g.add(lampG);
    const lampL = new THREE.PointLight('#ffcf90', 2.4, 3.0, 1.4); lampL.position.set(-1.0, 1.3, -.45); g.add(lampL);
    const kitL = new THREE.PointLight('#fff0dc', 2.0, 2.8, 1.4); kitL.position.set(.7, 1.6, -.35); g.add(kitL);
    const moonL = new THREE.PointLight('#8aa0e0', 0, 3, 1.5); moonL.position.set(-.9, 1.3, -1.6); g.add(moonL);
    // —— him and his flatmate ——
    const hero = makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark', shoe: 'sneaker' }, {
      phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, tired: { pose: 'phone', bob: 1, blink: 1 }, laugh: { pose: 'sitlaugh' },
      sit: { pose: 'sit' }, smile: { pose: 'sit', smile: 1 }, talk: { pose: 'sittalk', mouth: 1, smile: 1 }, um: { pose: 'sittalk', mouth: 1 },
      s0: { pose: 'push' }, s1: { pose: 'push', bob: 1 }, ...WALK,
    });
    const mate = makePerson({ top: 'teal', bottom: 'jean', hair: 'hairBlond', hairStyle: 'long', shoe: 'shoe' }, {
      stand: { pose: 'stand' }, cross: { pose: 'talk', mouth: 1 }, look: { pose: 'stand', blink: 1 }, smile: { pose: 'stand', smile: 1 },
      c0: { pose: 'push', smile: 1 }, c1: { pose: 'push', bob: 1, smile: 1, mouth: 1 }, ...WALK,
    });
    for (const P of [hero, mate]) { P.shadow.visible = false; g.add(P.root); }
    const phoneL = new THREE.PointLight('#8fc0ff', 1.0, 1.4, 2); g.add(phoneL);
    return { g, pizza, cans, facedown, pile, mugs, rack, burner, pan, steam, lampG, lampL, kitL, moonL, hero, mate, phoneL };
  });
  scene.add(new THREE.HemisphereLight('#7080b0', '#1c1418', 1.3));
  const fill = new THREE.PointLight('#c0c8e8', 3.0, 20, 1.2); fill.position.set(0, 2.3, 5); scene.add(fill);
  const _v = new THREE.Vector3(), alt = (t, r, k = 0) => Math.floor(t * r + k) % 2;

  function update(t, shot, cam, post, renderer) {
    const u = eio(seg(t, 0, T.end)); cam.position.set(0, 2.17, lerp(13.2, 12.9, u)); cam.lookAt(0, 2.17, -1); cam.fov = 24.0; cam.updateProjectionMatrix();
    const ph = phaseAt(t), monday = ph >= 4, verdict = ph >= 5;
    floors.forEach((F, f) => {
      const up = f === 0, H = F.hero, M = F.mate;
      // the dishes: upstairs 5 → 8 → 11 → 14 (+ mugs, pizza, cans); downstairs 5 at first, washed away by 4.6, a clean rack
      const nUp = [5, 8, 11, 14, 14, 14][ph], washed = up ? 0 : Math.round(5 * seg(t, T.down + .3, 4.4));
      F.pile.forEach((p, i) => { p.visible = up ? i < nUp : i < 5 - washed; });
      F.mugs.forEach((m, i) => { m.visible = up ? ph >= 1 + i : t < T.down; });
      F.rack.forEach((r, i) => { r.visible = !up && i < washed + (washed >= 5 ? 1 : 0); });
      F.pizza.visible = up ? ph >= 2 : t < 4.6; F.cans.forEach((c, i) => { c.visible = up ? ph >= 1 + (i > 0 ? i : 0) : t < 4.6 && i === 0; });
      F.facedown.visible = !up && t >= T.down && !monday;
      // light: the lamp stays on upstairs all night; downstairs the flat goes dark at 11 (he is in bed); Monday all lit
      const dark = !up && ph === 3; F.lampL.intensity = dark ? 0 : 2.4; F.lampG.visible = !dark; F.kitL.intensity = dark ? 0 : 2.0; F.moonL.intensity = dark ? 1.2 : 0;
      const cooking = !up && verdict; F.burner.visible = F.pan.visible = cooking;
      F.steam.forEach((s, i) => { const k = ((t * .6 + i / 3) % 1); s.visible = cooking; s.position.set(1.32 + Math.sin(k * 6 + i) * .03, .98 + k * .35, -1.92); s.material.opacity = cooking ? (1 - k) * .5 : 0; });
      let pos = [-1.0, .02, -1.42], fr = 'phone', vis = true, flip = false;
      if (!monday) {
        M.root.visible = false;
        if (up) fr = ph === 2 ? 'laugh' : ph === 3 ? 'tired' : (t % 2.9 < .1 ? 'blink' : 'phone');
        else if (t >= T.down && t < 4.6) { pos = [.66, 0, -1.48]; fr = alt(t, 3) ? 's0' : 's1'; }                  // washing up at the sink
        else if (t >= 4.6 && ph < 3) { pos = [-1.32, 0, -.72]; fr = alt(t, 3) ? 's0' : 's1'; }           // wiping the coffee table
        else if (ph === 3) vis = false;                                                                              // in bed
      } else {
        M.root.visible = true;
        const inK = seg(t, T.home, T.home + .7);
        if (!verdict) {
          M.root.position.set(lerp(.05, .2, inK), 0, lerp(-1.95, -1.15, inK)); M.frame(inK < 1 ? walkFrame(t) : (up ? (t >= 8.2 && t < 11.0 ? (alt(t, 3) ? 'cross' : 'look') : 'look') : 'smile')); M.face(cam, false);
          fr = up ? (t >= 11.1 && t < 13.9 ? (alt(t, 3) ? 'um' : 'sit') : (t % 2.9 < .1 ? 'blink' : 'phone')) : 'smile';
        } else if (up) {   // she walks out again; he stays with the pile and the phone
          const k = seg(t, T.verdict, T.verdict + 1.0); M.root.visible = k < 1; M.root.position.set(lerp(.2, .05, k), 0, lerp(-1.15, -2.0, k)); M.frame(walkFrame(t)); M.face(cam, false);
          fr = t % 2.9 < .1 ? 'blink' : 'phone';
        } else {           // she cooks; he is at the table, smiling
          const k = seg(t, T.verdict, T.verdict + .6); M.root.position.set(lerp(.2, 1.08, k), 0, lerp(-1.15, -1.5, k)); M.frame(k < 1 ? walkFrame(t) : (alt(t, 2.5) ? 'c0' : 'c1')); M.face(cam, false);
          fr = alt(t, 2.5, 1) ? 'talk' : 'smile';
        }
      }
      H.root.visible = vis; H.root.position.set(...pos); H.frame(fr); H.face(cam, flip);
      const lit = vis && ['phone', 'blink', 'tired', 'laugh'].includes(fr);
      F.phoneL.intensity = lit ? 1.0 : 0; if (lit) F.phoneL.position.copy(H.local(25, 18)).add(_v.set(.2, .05, .2));
    });
    post.dof.focus = cam.position.distanceTo(_v.set(0, 2.1, -1.0)); post.dof.aper = 2; post.dof.maxCoc = 3;
    renderer.toneMappingExposure = 1.25; post.bloom.strength = .3; post.bloom.threshold = .88;
  }
  return { scene, update };
}
