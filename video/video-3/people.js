// Procedural pixel people (3/4 side view facing right), one atlas per character, frames = poses.
// A character is a "look" (colours, hair, outfit, accessories); poses are data (stand, walk, sit, phone, look, wave…).
import * as THREE from 'three';
import { PX, ramp, hex, texOf, billboard, blob } from './px.js';

export const SPX = 1 / 30;
const FW = 34, FH = 50;
const INK = hex('#1a1016');
export const R = cols => ramp(cols, .22);
export const PAL = {
  skin: R(['#9a6650', '#c98c6e', '#e8b493', '#f6d2b4']), skinD: R(['#5a3424', '#7e4a32', '#a06644', '#bc845e']), skinOld: R(['#8a6656', '#b48a78', '#d0ae9c', '#e6cbbd']),
  cold: R(['#3e4a6e', '#6a80b0', '#9db8e6', '#d2e4ff']),
  hairDark: R(['#100b0d', '#1f1619', '#33262a', '#4a3a3a']), hairBrown: R(['#1e130e', '#3a271c', '#5a3e2c', '#76563e']), hairBlond: R(['#5a4420', '#8e7038', '#c2a058', '#e4c878']),
  hairWhite: R(['#8e8c92', '#bab8be', '#dedce2', '#f6f5f8']), hairGrey: R(['#58565c', '#86838a', '#b2afb6', '#d6d4da']),
  red: R(['#3a0708', '#6e0d0e', '#a01414', '#c41919', '#e0473a']),
  green: R(['#12261c', '#1e4030', '#2e5e44', '#4a8060']), teal: R(['#0e2a30', '#18424c', '#266270', '#3e8494']),
  mustard: R(['#3a2c0c', '#6a5016', '#9a7a28', '#c4a040']), purple: R(['#24142e', '#3e2450', '#5a3878', '#7c58a0']),
  navy: R(['#10131f', '#1d2438', '#2c3754', '#40507a']), black: R(['#0a0a0e', '#16161c', '#24242c', '#363642']),
  white: R(['#8c8a94', '#b8b6c0', '#dcdae2', '#f6f4fa']), beige: R(['#4a3e30', '#7a6a54', '#a8967a', '#cab89c']),
  jean: R(['#141927', '#222b40', '#33405c', '#485a7c']), grey: R(['#2a2a30', '#44444c', '#62626c', '#82828c']),
  shoe: R(['#1a1210', '#2e221c', '#4a382c']), sneaker: R(['#4c4c54', '#9a9aa4', '#dcdce2']),
  phone: R(['#0d0e14', '#1d1f2a', '#30333f']), glow: R(['#3d7fe0', '#7fb8ff', '#cfe6ff', '#ffffff']), gold: R(['#5a4210', '#9a7424', '#d8b04a', '#f4dc8a']),
};

// look: { skin, hair, hairStyle: 'short'|'long'|'bun'|'bald', top, bottom, dress, gown, gradCap, veil, beard, glasses, cane, hunch, shoe, small }
// pose: { pose: 'stand'|'walk'|'sit'|'phone'|'look'|'wave'|'push'|'kick'|'talk', step 0..3, bob, blink, mouth }
function draw(P, E, L, p) {
  const pose = p.pose || 'stand', sit = ['sit', 'phone', 'look', 'sittalk'].includes(pose), by = (p.bob || 0) + (L.hunch || 0) + (L.small || 0);
  const S = PAL[L.skin || 'skin'], Hr = PAL[L.hair || 'hairDark'], Top = PAL[L.top || 'teal'], Bot = PAL[L.bottom || 'jean'], Sh = PAL[L.shoe || 'sneaker'];
  const top = 17 + by, waist = 33;
  // —— legs ——
  if (sit) {
    for (let y = 31; y < 35; y++) for (let x = 12; x < 25; x++) P.set(x, y, Bot(y === 31 ? .85 : .5, x, y));          // thighs
    for (let y = 35; y < 47; y++) for (let x = 21; x < 25; x++) P.set(x, y, Bot(x === 21 ? .3 : .6, x, y));           // shins
    for (let x = 21; x < 27; x++) for (let y = 47; y < 50; y++) P.set(x, y, Sh(y === 47 ? .9 : .45, x, y));
  } else if (!L.dress && !L.gown) {
    const st = pose === 'walk' || pose === 'push' ? p.step ?? 0 : -1;
    let legs = st < 0 ? [[13, 0], [18, 0]] : [[[11, 0], [20, -1]], [[14, -1], [17, 0]], [[20, -1], [11, 0]], [[17, 0], [14, -1]]][st];
    if (pose === 'kick') legs = [[13, 0], [21, -3]];
    legs.forEach(([lx, ly], i) => {
      for (let y = waist + by; y < 46 + ly; y++) for (let x = lx; x < lx + 4; x++) P.set(x, y, Bot((i ? .5 : .78) - (x === lx ? .22 : 0), x, y));
      for (let y = 46 + ly; y < 49 + ly; y++) for (let x = lx - 1; x < lx + 5; x++) P.set(x, y, Sh(y === 46 + ly ? .85 : .45, x, y));
    });
  } else {
    const st = pose === 'walk' ? p.step ?? 0 : -1, sw = st < 0 ? 0 : [1, 0, -1, 0][st];
    for (let y = 44; y < 49; y++) for (const lx of [13 + sw, 18 - sw]) for (let x = lx; x < lx + 3; x++) P.set(x, y, Sh(y === 47 ? .8 : .4, x, y));
  }
  // —— body ——
  const Body = L.gown ? PAL.black : Top;
  const hemY = L.dress || L.gown ? 47 : (sit ? 34 : waist + by + 1);
  const hemL = L.dress ? 6 : L.gown ? 8 : 9, hemR = L.dress ? 27 : L.gown ? 25 : 24;
  P.poly([[10, top], [23, top], [hemR, hemY], [hemL, hemY]], (x, y) => {
    const u = (y - top) / Math.max(1, hemY - top), s = (x - hemL) / (hemR - hemL);
    let v = .7 - s * .35 + (1 - u) * .12; if (!L.dress && !L.gown && y >= hemY - 1) v = .35;
    if (L.dress && ((x + y) % 7 === 0)) v -= .12;
    return Body(v, x, y);
  });
  if (L.gown) for (let y = top + 1; y < 30; y++) P.set(19, y, PAL.gold(.8, 0, 0));
  if (L.suit) { for (let y = top + 1; y < top + 8; y++) P.set(19, y, PAL.white(.9, 0, 0)); P.set(19, top + 3, PAL.black(.2, 0, 0)); P.set(19, top + 5, PAL.black(.2, 0, 0)); }
  // —— head ——
  const look = pose === 'look', down = pose === 'phone' ? 1 : 0;
  const hx = 17 + down + (L.hunch ? 1 : 0), hy = 9 + by + down;
  if (L.hairStyle === 'long' || L.hairStyle === 'bun') P.ellipse(hx - 2.5, hy + 3, 3.4, 6.5, (x, y, dx, dy) => Hr(.5 - dy * .2, x, y));
  P.ellipse(hx, hy, 5.4, 5.8, (x, y, dx, dy) => (L.hairStyle === 'bald' && dy < -.1 && dx > -.5) ? S(.7 - dy * .2, x, y) : Hr(.55 - dy * .3 - dx * .1, x, y));
  if (L.hairStyle === 'bun') P.ellipse(hx - 4, hy - 4, 2.4, 2.4, (x, y, dx, dy) => Hr(.6 - dy * .3, x, y));
  if (pose === 'phone') {
    P.ellipse(hx + 2.2, hy + 1.6, 3.6, 4.2, (x, y, dx, dy) => { const lit = dy > -.2 && dx > -.3; const c = lit ? PAL.cold(.6 + dx * .2 - dy * .1, x, y) : S(.45 + dx * .1, x, y); if (lit) E.set(x, y, [22, 34, 64]); return c; });
    if (L.hairStyle !== 'bald') for (let x = hx - 2; x <= hx + 4; x++) P.set(x, hy - 2.6 + (x > hx + 2 ? 1 : 0), Hr(.6, x, 0));
    if (!p.blink) { P.set(hx + 3, hy + 1, INK); P.set(hx + 1, hy + 1, INK); }
    P.set(hx + 5, hy + 2, PAL.cold(.75, 0, 0));
  } else {
    const fx = look ? hx + 1.2 : hx + 2.3;
    P.ellipse(fx, hy + 1, 3.7, 4.3, (x, y, dx, dy) => S(.62 - dy * .25 - Math.abs(dx) * .15, x, y));
    if (L.hairStyle !== 'bald') for (let x = Math.floor(fx - 3); x <= fx + 3; x++) P.set(x, hy - 3, Hr(.6, x, 0));
    const ex = Math.round(fx), ey = Math.round(hy);
    if (p.blink) { P.set(ex + 2, ey + 1, S(.2, 0, 0)); P.set(ex - 1, ey + 1, S(.2, 0, 0)); }
    else if (look) { P.rect(ex - 2, ey, 2, 2, hex('#e8e8ee')); P.rect(ex + 1, ey, 2, 2, hex('#e8e8ee')); P.set(ex - 1, ey + 1, INK); P.set(ex + 2, ey + 1, INK); }
    else { P.set(ex + 2, ey, INK); P.set(ex + 2, ey + 1, INK); P.set(ex - 1, ey, INK); P.set(ex - 1, ey + 1, INK); }
    if (p.mouth) P.rect(ex, ey + 3, 2, 1, hex('#6a2a2a'));
    P.set(ex + 3, ey + 2, S(.4, 0, 0));
    if (L.glasses) { P.set(ex + 2, ey - 1, hex('#c8c8d0')); P.set(ex - 1, ey - 1, hex('#c8c8d0')); P.set(ex, ey - 1, hex('#8c8c96')); P.set(ex + 1, ey - 1, hex('#8c8c96')); }
    if (L.beard) { P.poly([[ex - 2, ey + 4], [ex + 3, ey + 4], [ex + 3, ey + 5], [ex + 1, ey + 7], [ex - 2, ey + 6]], (x, y) => Hr(.5, x, y)); P.rect(ex, ey + 3, 2, 1, hex('#6a3a30')); }
  }
  if (L.gradCap) { P.rect(hx - 6, hy - 6, 13, 2, PAL.black(.5, 0, 0)); P.rect(hx - 3, hy - 5, 7, 2, PAL.black(.3, 0, 0)); P.set(hx + 6, hy - 5, PAL.gold(.9, 0, 0)); P.set(hx + 6, hy - 4, PAL.gold(.7, 0, 0)); P.set(hx + 6, hy - 3, PAL.gold(.7, 0, 0)); }
  if (L.veil) for (let y = hy - 5; y < hy + 14; y++) for (let x = hx - 7; x < hx - 3 + (y - hy) * .15; x++) if ((x + y) % 3) P.set(x, y, PAL.white(.85, x, y));
  // —— arms ——
  const sl = pts => pts.forEach(([x, y]) => { P.set(x, y, Body(.62, x, y)); P.set(x, y + 1, Body(.38, x, y)); });
  const hand = (x, y) => P.rect(x, y, 2, 2, S(.6, 0, 0));
  if (pose === 'phone') {
    sl([[21, top + 2], [22, top + 3], [22, top + 5], [23, top + 6], [24, top + 5]]); hand(24, top + 3);
    for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) P.set(25 + i - (j > 2 ? 1 : 0), top - 1 + j, PAL.phone(.5 - j * .08, i, j));
    for (let j = 0; j < 5; j++) { const c = PAL.glow(.75 - j * .1, 0, j); P.set(24 - (j > 2 ? 1 : 0), top - 1 + j, c); E.set(24 - (j > 2 ? 1 : 0), top - 1 + j, c); }
  } else if (pose === 'look') {
    sl([[21, top + 2], [22, top + 4], [22, top + 6], [22, top + 8], [23, top + 10]]); hand(23, top + 12);
    for (let j = 0; j < 4; j++) P.set(25, top + 11 + j, PAL.phone(.4, 0, j));
  } else if (pose === 'wave') {
    sl([[21, top + 1], [22, top - 1], [23, top - 3], [23, top - 5]]); hand(23, top - 8);
  } else if (pose === 'push') {
    sl([[21, top + 3], [23, top + 4], [25, top + 5], [27, top + 5]]); hand(29, top + 5);
  } else if (pose === 'talk' || pose === 'sittalk') {
    sl([[21, top + 3], [22, top + 5], [24, top + 6], [26, top + 6]]); hand(27, top + 5);
  } else if (L.cane) {
    sl([[21, top + 2], [22, top + 5], [23, top + 8], [24, top + 10]]); hand(24, top + 12);
    P.line(26, top + 12, 27, 49, PAL.shoe(.7, 0, 0)); P.rect(24, top + 11, 3, 1, PAL.shoe(.8, 0, 0));
  } else {
    const sw = pose === 'walk' ? [1, 0, -1, 0][p.step ?? 0] : 0;
    sl([[21, top + 2], [22, top + 4], [22 + sw, top + 6], [22 + sw, top + 8], [22 + sw, top + 10]]); hand(22 + sw, top + 12);
  }
}

// Build a character: look + list of frame names → { root, frame(name), face(cam, flip) }
export function makePerson(look, frames) {
  const names = Object.keys(frames), n = names.length, P = new PX(FW * n, FH), E = new PX(FW * n, FH);
  names.forEach((k, i) => {
    const p1 = new PX(FW, FH), e1 = new PX(FW, FH); draw(p1, e1, look, frames[k]); p1.outline(.3);
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { const c = p1.get(x, y); if (c) P.set(i * FW + x, y, c); const e = e1.get(x, y); if (e) E.set(i * FW + x, y, e); }
  });
  const tex = texOf(P.done()), em = texOf(E.done()); for (const t of [tex, em]) t.repeat.set(1 / n, 1);
  const mesh = billboard(tex, FW * SPX, FH * SPX, { em, emCol: '#ffffff', emI: 2.0 });
  const root = new THREE.Group(); root.add(mesh);
  const sh = blob(.36, .5); sh.position.y = .015; root.add(sh);
  return {
    root, mesh, shadow: sh,
    frame(name) { const i = names.indexOf(name); if (i < 0) throw new Error('frame ' + name); tex.offset.x = em.offset.x = i / n; },
    face(cam, flip = false) { root.rotation.y = Math.atan2(cam.position.x - root.position.x, cam.position.z - root.position.z); mesh.scale.x = flip ? -1 : 1; },
    local(px, py) { const v = new THREE.Vector3((px - FW / 2) * SPX * mesh.scale.x, (FH - py) * SPX, .05); v.applyAxisAngle(new THREE.Vector3(0, 1, 0), root.rotation.y); return v.add(root.position); },
  };
}
export const WALK = { w0: { pose: 'walk', step: 0 }, w1: { pose: 'walk', step: 1, bob: -1 }, w2: { pose: 'walk', step: 2 }, w3: { pose: 'walk', step: 3, bob: -1 } };
export const walkFrame = t => ['w0', 'w1', 'w2', 'w3'][Math.floor(t * 7) % 4];
