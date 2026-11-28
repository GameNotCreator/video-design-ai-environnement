// "Le chien": the cut-away house, two identical floors, the same flat. 7 p.m.: his dog sits in front of the sofa with
// the leash in its mouth. Upstairs he scrolls; the dog lies down, then gives up by the door. Downstairs he locks his
// phone: they go out, come back happy, play ball, fall asleep together on the sofa. Six months later his sister comes
// in: upstairs the dog is chubby and sad on the rug, the leash on its hook; downstairs it bounces, and the three go out.
import * as THREE from 'three';
import { PX, ramp, h2, fbm, texOf, glow, woodPlanks } from './px.js';
import { mat, mesh, box } from './kit.js';
import { makePerson, makeDog, WALK, walkFrame } from './people.js';
import { T, JUMPS as JUMPS_, phaseAt } from './story.js';
import { seg, eio, lerp } from '/core/lib.js';

const FY = [2.25, 0];   // floor heights: [upstairs, downstairs]
function wallTex(cols, s) { const P = new PX(64, 64), R = ramp(cols, .45); P.fill((x, y) => R(.5 + (fbm(x * .2, y * .2, s) - .5) * .25 + (h2(x, y, s) - .5) * .1, x, y)); return P.done(); }
function stoneTex() { const P = new PX(64, 32), R = ramp(['#1a1816', '#2a2622', '#3a342e', '#4a433a'], .45); P.fill((x, y) => { const row = y >> 3, off = (row % 2) * 6, edge = (y % 8 === 0) || ((x + off) % 12 === 0); return R(edge ? .15 : .5 + (h2(x >> 2, y >> 2, 3) - .5) * .4, x, y); }); return P.done(); }
function sofaTex() { const P = new PX(48, 16), R = ramp(['#26303a', '#34404c', '#46525e', '#5a6672'], .45); P.fill((x, y) => R(.5 + (h2(x >> 1, y >> 1, 5) - .5) * .25 - (x % 16 === 0 ? .2 : 0), x, y)); return P.done(); }
function tileTex() { const P = new PX(48, 16), R = ramp(['#8a8a84', '#a4a49c', '#bcbcb2', '#d0d0c6'], .45); P.fill((x, y) => (x % 6 === 0 || y % 6 === 0) ? [110, 108, 100] : R(.55 + (h2(x, y, 3) - .5) * .2, x, y)); return P.done(); }
function _unused_plateTex(dirty) { const P = new PX(12, 12); P.fill((x, y) => { const d = Math.hypot(x - 5.5, y - 5.5); if (d > 5.8) return [0, 0, 0, 0]; let c = d > 4.5 ? [214, 210, 200] : [236, 232, 222]; if (dirty && h2(x, y, 7) > .72) c = [150, 110, 70]; return c; }); return P.done(); }

export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#070912');
  for (let i = 0; i < 40; i++) { const s = glow('#dfe8ff', .05 + h2(i, 3, 1) * .05, 1.2); s.position.set(-6 + h2(i, 1, 1) * 12, -1 + h2(i, 2, 1) * 8, -6); scene.add(s); }
  const stone = mat(stoneTex()); const found = box(3.6, 1.8, 2.6, stone); found.position.set(0, -2.05, -1.1); scene.add(found);
  const slabM = new THREE.MeshStandardMaterial({ color: '#241c18', roughness: .9 }), trimM = new THREE.MeshBasicMaterial({ color: '#d8c28e' });
  for (const y of [-.25, 2.0, 4.25]) { const s = box(3.5, .25, 2.5, slabM); s.position.set(0, y, -1.1); scene.add(s); const tr = box(3.5, .025, .02, trimM); tr.position.set(0, y + .11, .16); scene.add(tr); }
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

    // the leash: in the dog's mouth, or on its hook by the door (six months later)
    const hookLeash = new THREE.Mesh(new THREE.PlaneGeometry(.05, .4), new THREE.MeshStandardMaterial({ color: '#283c6e', roughness: .8 })); hookLeash.position.set(.4, .95, -2.18); hookLeash.visible = false; g.add(hookLeash);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(.045, 10, 8), new THREE.MeshStandardMaterial({ color: '#c8c060', roughness: .7 })); ball.visible = false; g.add(ball);
    const lampG = glow('#ffc070', .3, 1.0); lampG.position.set(-1.45, 1.05, -1.95); g.add(lampG);
    const lampL = new THREE.PointLight('#ffcf90', 2.4, 3.0, 1.4); lampL.position.set(-1.0, 1.3, -.45); g.add(lampL);
    const kitL = new THREE.PointLight('#fff0dc', 2.0, 2.8, 1.4); kitL.position.set(.7, 1.6, -.35); g.add(kitL);
    // —— him, his dog, his sister ——
    const hero = makePerson({ top: 'red', bottom: 'grey', hair: 'hairDark', shoe: 'sneaker' }, {
      phone: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 }, tired: { pose: 'phone', bob: 1, blink: 1 }, laugh: { pose: 'sitlaugh' },
      sit: { pose: 'sit' }, smile: { pose: 'sit', smile: 1 }, doze: { pose: 'sit', doze: 1, blink: 1 }, um: { pose: 'sittalk', mouth: 1 },
      stand: { pose: 'stand', smile: 1 }, kneel: { pose: 'kneel', open: 1 }, ...WALK,
    });
    const dog = makeDog({
      sitL0: { pose: 'sit', leash: 1, wag: 1 }, sitL1: { pose: 'sit', leash: 1 }, lieL: { pose: 'lie', leash: 1 }, lieSad: { pose: 'lie', sad: 1 }, lie: { pose: 'lie' },
      st0: { pose: 'stand', tongue: 1, wag: 1 }, st1: { pose: 'stand', tongue: 1 }, lieFat: { pose: 'lie', fat: 1, sad: 1 },
      d0: { pose: 'walk', step: 0, tongue: 1, wag: 1 }, d1: { pose: 'walk', step: 1, tongue: 1 }, d2: { pose: 'walk', step: 2, tongue: 1, wag: 1 }, d3: { pose: 'walk', step: 3, tongue: 1 },
    });
    const sis = makePerson({ top: 'purple', bottom: 'jean', hair: 'hairBrown', hairStyle: 'long', shoe: 'shoe' }, {
      stand: { pose: 'stand' }, talk: { pose: 'talk', mouth: 1 }, smile: { pose: 'stand', smile: 1 }, look: { pose: 'stand', blink: 1 }, ...WALK,
    });
    for (const P of [hero, dog, sis]) { P.shadow.visible = false; g.add(P.root); }
    const phoneL = new THREE.PointLight('#8fc0ff', 1.0, 1.4, 2); g.add(phoneL);
    return { g, facedown, hookLeash, ball, lampG, lampL, kitL, hero, dog, sis, phoneL };
  });
  scene.add(new THREE.HemisphereLight('#7080b0', '#1c1418', 1.3));
  const fill = new THREE.PointLight('#c0c8e8', 3.0, 20, 1.2); fill.position.set(0, 2.3, 5); scene.add(fill);
  const _v = new THREE.Vector3(), alt = (t, r, k = 0) => Math.floor(t * r + k) % 2, dwalk = t => ['d0', 'd1', 'd2', 'd3'][Math.floor(t * 8) % 4];
  const DOOR = [.05, 0, -1.95], SOFA = [-1.0, .02, -1.42];

  function update(t, shot, cam, post, renderer) {
    const u = eio(seg(t, 0, T.end)); cam.position.set(0, 2.17, lerp(13.2, 12.9, u)); cam.lookAt(0, 2.17, -1); cam.fov = 24.0; cam.updateProjectionMatrix();
    const ph = phaseAt(t), later = ph >= 4, verdict = ph >= 5;
    floors.forEach((F, f) => {
      const up = f === 0, H = F.hero, Dg = F.dog, S = F.sis;
      let hp = SOFA, hf = 'phone', hv = true, hflip = false, dp = [-.38, 0, -.85], df = alt(t, 3) ? 'sitL0' : 'sitL1', dv = true, dflip = true;   // sits facing him, leash in mouth
      F.ball.visible = false; F.hookLeash.visible = later && up; F.facedown.visible = !up && t >= T.down && !later;
      const night = ph === 3; F.lampL.intensity = night && !up ? 1.2 : 2.4; F.kitL.intensity = night && !up ? 0 : 2.0;
      S.root.visible = later;
      if (!later) {
        if (up) {
          hf = ph === 2 ? 'laugh' : ph === 3 ? 'tired' : (t % 2.9 < .1 ? 'blink' : 'phone');
          if (ph === 1) { dp = [-.5, 0, -.95]; df = 'lieL'; dflip = false; }
          else if (ph >= 2) { dp = [.12, 0, -1.6]; df = 'lieSad'; dflip = false; }                       // he gave up, by the door
        } else if (ph === 0) {
          if (t >= T.down) {                                                              // out for the walk
            const k = seg(t, T.down, 2.6); hp = [lerp(-1.0, DOOR[0], k), 0, lerp(-1.42, DOOR[2], k)]; hf = walkFrame(t); hv = k < 1;
            dp = [lerp(-.38, DOOR[0] + .2, seg(t, T.down, 2.4)), 0, lerp(-.85, DOOR[2], seg(t, T.down, 2.4))]; df = dwalk(t); dflip = false; dv = seg(t, T.down, 2.4) < 1;
          }
        } else if (ph === 1) {                                                            // back, happy
          const k = seg(t, JUMPS_[0], JUMPS_[0] + .6);
          hp = k < 1 ? [lerp(DOOR[0], -1.0, k), 0, lerp(DOOR[2], -1.42, k)] : SOFA; hf = k < 1 ? walkFrame(t) : 'smile'; hflip = k < 1;
          dp = k < 1 ? [lerp(DOOR[0] + .2, -.45, k), 0, lerp(DOOR[2], -.95, k)] : [-.45, 0, -.95]; df = k < 1 ? dwalk(t) : (alt(t, 3) ? 'st0' : 'st1'); dflip = k < 1;
        } else if (ph === 2) {                                                            // playing ball
          hp = [-1.3, 0, -.82]; hf = 'kneel';
          const c = (t - JUMPS_[1]) * .9 % 2, k = c < 1 ? c : 2 - c; dp = [lerp(-.75, .55, eio(k)), 0, -.9]; df = dwalk(t); dflip = c >= 1;
          F.ball.visible = true; F.ball.position.set(dp[0] + (dflip ? -.32 : .32), .27, -.86);
        } else {                                                                          // 11 p.m.: asleep together on the sofa
          hf = 'doze'; dp = [-.5, .38, -1.55]; df = 'lie'; dflip = false;
        }
      } else {
        const inK = seg(t, T.later, T.later + .7);
        if (!verdict || up) {
          S.root.position.set(lerp(DOOR[0], .4, inK), 0, lerp(DOOR[2], -1.15, inK)); S.frame(inK < 1 ? walkFrame(t) : (up && ((t >= 8.2 && t < 11.0)) ? (alt(t, 3) ? 'talk' : 'look') : up ? 'look' : 'smile')); S.face(cam, true);
        }
        if (up) {
          hf = t >= 11.1 && t < 13.9 ? (alt(t, 3) ? 'um' : 'sit') : (t % 2.9 < .1 ? 'blink' : 'phone');
          dp = [-.45, 0, -.95]; df = 'lieFat'; dflip = false;
        } else if (!verdict) {
          hf = 'smile'; dp = [-.4, 0, -.95]; df = alt(t, 3) ? 'st0' : 'st1'; dflip = false;
        } else {                                                                          // the three of them go out
          const k = seg(t, T.verdict + .4, T.verdict + 2.0);
          S.root.position.set(lerp(.4, DOOR[0], k), 0, lerp(-1.15, DOOR[2], k)); S.frame(k > 0 && k < 1 ? walkFrame(t) : 'smile'); S.face(cam, true); S.root.visible = k < 1;
          const kh = seg(t, T.verdict + .2, T.verdict + 2.2); hp = [lerp(-1.0, DOOR[0], kh), 0, lerp(-1.42, DOOR[2], kh)]; hf = kh > 0 && kh < 1 ? walkFrame(t) : 'stand'; hv = kh < 1;
          const kd = seg(t, T.verdict, T.verdict + 1.8); dp = [lerp(-.4, DOOR[0] + .2, kd), 0, lerp(-.95, DOOR[2], kd)]; df = dwalk(t); dflip = false; dv = kd < 1;
        }
      }
      H.root.visible = hv; H.root.position.set(...hp); H.frame(hf); H.face(cam, hflip);
      Dg.root.visible = dv; Dg.root.position.set(...dp); Dg.frame(df); Dg.face(cam, dflip);
      const lit = hv && ['phone', 'blink', 'tired', 'laugh'].includes(hf);
      F.phoneL.intensity = lit ? 1.0 : 0; if (lit) F.phoneL.position.copy(H.local(25, 18)).add(_v.set(.2, .05, .2));
    });
    post.dof.focus = cam.position.distanceTo(_v.set(0, 2.1, -1.0)); post.dof.aper = 2; post.dof.maxCoc = 3;
    renderer.toneMappingExposure = 1.25; post.bloom.strength = .3; post.bloom.threshold = .88;
  }
  return { scene, update };
}
