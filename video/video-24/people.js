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
  stone: R(['#3a3a3e', '#5a5a5e', '#7e7c7a', '#a29e98']), moss: R(['#22301c', '#34462a', '#4e6236', '#6a7a46']), orange: R(['#5a2a08', '#9a4a10', '#d07020', '#f09a3a']),
  phone: R(['#0d0e14', '#1d1f2a', '#30333f']), glow: R(['#3d7fe0', '#7fb8ff', '#cfe6ff', '#ffffff']), gold: R(['#5a4210', '#9a7424', '#d8b04a', '#f4dc8a']),
};

// a readable portrait phone: dark bezel, lit screen with a status bar and a feed, a camera dot (5 x 8 px).
// sc = { c, s }: which feed video is on screen (0..3) and the swipe step (0 rest, 1 mid-swipe, 2 end of swipe):
// the feed slides up and the next video comes in from the bottom, so the thumb visibly scrolls.
const FEED = [
  [[[150, 200, 255], [150, 200, 255], [150, 200, 255]], [[120, 180, 250], [250, 222, 190], [120, 180, 250]], [[90, 150, 235], [60, 64, 90], [90, 150, 235]], [[40, 90, 180], [40, 90, 180], [40, 90, 180]], [[236, 236, 244], [236, 236, 244], [30, 50, 100]]],
  [[[255, 214, 150], [255, 200, 130], [255, 214, 150]], [[250, 180, 110], [70, 44, 60], [250, 180, 110]], [[200, 120, 100], [70, 44, 60], [200, 120, 100]], [[90, 52, 70], [90, 52, 70], [90, 52, 70]], [[236, 236, 244], [236, 236, 244], [60, 34, 50]]],
  [[[120, 230, 200], [120, 230, 200], [120, 230, 200]], [[80, 200, 170], [240, 240, 220], [80, 200, 170]], [[40, 150, 130], [240, 240, 220], [40, 150, 130]], [[20, 90, 80], [20, 90, 80], [20, 90, 80]], [[236, 236, 244], [236, 236, 244], [10, 60, 54]]],
  [[[200, 160, 255], [200, 160, 255], [200, 160, 255]], [[160, 120, 240], [255, 240, 200], [160, 120, 240]], [[120, 80, 210], [120, 80, 210], [250, 190, 230]], [[60, 40, 130], [60, 40, 130], [60, 40, 130]], [[236, 236, 244], [236, 236, 244], [40, 26, 90]]],
];
const TINT = FEED.map(F => [0, 1, 2].map(k => F.slice(0, 4).flat().reduce((a, c) => a + c[k], 0) / 12));
function drawPhone(P, E, x0, y0, dim = 1, sc = null) {
  const bez = [20, 22, 30], rows = [[232, 240, 255], [74, 122, 216], [122, 168, 240], [42, 74, 144], [122, 168, 240], [74, 122, 216]];
  const sh = sc ? [0, 2, 4][sc.s] : 0;
  for (let j = 0; j < 8; j++) for (let i = 0; i < 5; i++) {
    const edge = i === 0 || i === 4 || j === 0 || j === 7; let c = edge ? bez : rows[j - 1];
    if (!edge && sc && j > 1) { const r = j - 2 + sh; c = r < 5 ? FEED[sc.c][r][i - 1] : FEED[(sc.c + 1) % 4][r - 5][i - 1]; }
    else if (!edge && j > 1 && i === 2 && j % 2 === 0) c = rows[1];
    if (!edge) c = c.map(v => Math.round(v * (.55 + .45 * dim) * (sc && j > 1 ? .8 : 1)));
    P.set(x0 + i, y0 + j, c); if (!edge) E.set(x0 + i, y0 + j, c.map(v => Math.round(v * (sc ? .1 : .5) * dim)));
  }
  P.set(x0 + 2, y0, [60, 64, 76]);   // camera dot on the bezel
}
// scrolling clock: render(t) sets it once per frame (pure function of t); each phone user swipes on their own rhythm
const CLOCK = { t: 0 }; let NEXT_ID = 0;
export const setScrollTime = t => { CLOCK.t = t; };
const SWIPE = 1.0;   // seconds per video in the feed (hold, then a quick swipe up)
const PH_POSES = ['phone', 'standphone', 'walkphone', 'sitlaugh'];

// look: { skin, hair, hairStyle: 'short'|'long'|'bun'|'bald', top, bottom, dress, gown, gradCap, veil, beard, glasses, cane, hunch, shoe, small }
// pose: { pose: 'stand'|'walk'|'sit'|'phone'|'look'|'wave'|'push'|'kick'|'talk', step 0..3, bob, blink, mouth }
function draw(P, E, L, p) {
  const pose = p.pose || 'stand', sit = ['sit', 'phone', 'look', 'sittalk', 'sitlaugh', 'write'].includes(pose), ph = pose === 'phone' || pose === 'standphone' || pose === 'walkphone' || pose === 'sitlaugh', by = (p.bob || 0) + (L.hunch || 0) + (L.small || 0) + (pose === 'kneel' ? 7 : 0);
  const S = PAL[L.skin || 'skin'], Hr = PAL[L.hair || 'hairDark'], Top = PAL[L.top || 'teal'], Bot = PAL[L.bottom || 'jean'], Sh = PAL[L.shoe || 'sneaker'];
  const top = 17 + by, waist = 33;
  // —— legs ——
  if (pose === 'kneel') {
    for (let y = 37; y < 41; y++) for (let x = 14; x < 24; x++) P.set(x, y, Bot(y === 37 ? .85 : .55, x, y));      // front thigh
    for (let y = 41; y < 48; y++) for (let x = 20; x < 24; x++) P.set(x, y, Bot(x === 20 ? .3 : .6, x, y));      // front shin
    for (let x = 20; x < 26; x++) for (let y = 47; y < 50; y++) P.set(x, y, Sh(y === 47 ? .9 : .45, x, y));
    for (let y = 44; y < 48; y++) for (let x = 5; x < 16; x++) P.set(x, y, Bot(y === 44 ? .7 : .45, x, y));       // back shin on the floor
    for (let x = 3; x < 7; x++) for (let y = 45; y < 49; y++) P.set(x, y, Sh(.5, x, y));
  } else if (sit) {
    for (let y = 31; y < 35; y++) for (let x = 12; x < 25; x++) P.set(x, y, Bot(y === 31 ? .85 : .5, x, y));          // thighs
    for (let y = 35; y < 47; y++) for (let x = 21; x < 25; x++) P.set(x, y, Bot(x === 21 ? .3 : .6, x, y));           // shins
    for (let x = 21; x < 27; x++) for (let y = 47; y < 50; y++) P.set(x, y, Sh(y === 47 ? .9 : .45, x, y));
  } else if (!L.dress && !L.gown) {
    const st = pose === 'walk' || pose === 'push' || pose === 'walkphone' ? p.step ?? 0 : -1;
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
  const look = pose === 'look', down = ph || pose === 'write' || p.doze ? 1 : 0;
  const hx = 17 + down + (L.hunch ? 1 : 0), hy = 9 + by + down;
  if (L.hairStyle === 'long' || L.hairStyle === 'bun') P.ellipse(hx - 3, hy + (L.hairUp ? 1 : 3), 3.4, L.hairUp ? 5 : 6.5, (x, y, dx, dy) => Hr(.5 - dy * .2, x, y));
  P.ellipse(hx, hy, 5.4, 5.8, (x, y, dx, dy) => (L.hairStyle === 'bald' && dy < -.1 && dx > -.5) ? S(.7 - dy * .2, x, y) : Hr(.55 - dy * .3 - dx * .1, x, y));
  if (L.hairStyle === 'bun') P.ellipse(hx - 4, hy - 4, 2.4, 2.4, (x, y, dx, dy) => Hr(.6 - dy * .3, x, y));
  if (ph) {
    P.ellipse(hx + 2.2, hy + 1.6, 3.6, 4.2, (x, y, dx, dy) => { const lit = dy > -.2 && dx > -.3; let c = lit ? PAL.cold(.6 + dx * .2 - dy * .1, x, y) : S(.45 + dx * .1, x, y); const tn = p.scroll && TINT[p.scroll.c]; if (lit && tn) c = c.map((v, k) => Math.round(v * .6 + tn[k] * .4)); if (lit) E.set(x, y, tn ? tn.map(v => Math.round(v * .22)) : [22, 34, 64]); return c; });
    if (L.hairStyle !== 'bald') for (let x = hx - 2; x <= hx + 4; x++) P.set(x, hy - 2.6 + (x > hx + 2 ? 1 : 0), Hr(.6, x, 0));
    if (!p.blink) { P.set(hx + 3, hy + 1, INK); P.set(hx + 1, hy + 1, INK); }
    if (L.beard) { const bl = typeof L.beard === 'number' ? L.beard : 2; for (let y = hy + 4; y < hy + 5 + bl; y++) for (let x = hx - 1 + (y - hy - 4) * .5; x < hx + 5 - (y - hy - 4) * .3; x++) P.set(Math.round(x), y, Hr(.5, x, y)); }
    P.set(hx + 5, hy + 2, p.scroll ? TINT[p.scroll.c].map(v => Math.round(v * .9)) : PAL.cold(.75, 0, 0));
  } else {
    const fx = look ? hx + 1.2 : hx + 2.3;
    P.ellipse(fx, hy + 1, 3.7, 4.3, (x, y, dx, dy) => S(.62 - dy * .25 - Math.abs(dx) * .15, x, y));
    if (L.hairStyle !== 'bald') for (let x = Math.floor(fx - 3); x <= fx + 3; x++) P.set(x, hy - 3, Hr(.6, x, 0));
    const ex = Math.round(fx), ey = Math.round(hy);
    if (p.blink) { P.set(ex + 2, ey + 1, S(.2, 0, 0)); P.set(ex - 1, ey + 1, S(.2, 0, 0)); }
    else if (look) { P.rect(ex - 2, ey, 2, 2, hex('#e8e8ee')); P.rect(ex + 1, ey, 2, 2, hex('#e8e8ee')); P.set(ex - 1, ey + 1, INK); P.set(ex + 2, ey + 1, INK); }
    else { P.set(ex + 2, ey, INK); P.set(ex + 2, ey + 1, INK); P.set(ex - 1, ey, INK); P.set(ex - 1, ey + 1, INK); }
    if (p.mouth) P.rect(ex, ey + 3, 2, 1, hex('#6a2a2a'));
    if (p.smile) { P.set(ex - 1, ey + 3, hex('#6a2a2a')); P.rect(ex, ey + 4, 2, 1, hex('#6a2a2a')); P.set(ex + 2, ey + 3, hex('#6a2a2a')); }
    P.set(ex + 3, ey + 2, S(.4, 0, 0));
    if (L.glasses) { P.set(ex + 2, ey - 1, hex('#c8c8d0')); P.set(ex - 1, ey - 1, hex('#c8c8d0')); P.set(ex, ey - 1, hex('#8c8c96')); P.set(ex + 1, ey - 1, hex('#8c8c96')); }
    if (L.mask) P.rect(ex - 2, ey + 2, 7, 4, PAL.white(.7, 0, 0));
    if (L.shades) { P.rect(ex - 2, ey, 3, 2, INK); P.rect(ex + 1, ey, 3, 2, INK); }
    if (L.beard) { P.poly([[ex - 2, ey + 4], [ex + 3, ey + 4], [ex + 3, ey + 5], [ex + 1, ey + 7], [ex - 2, ey + 6]], (x, y) => Hr(.5, x, y)); P.rect(ex, ey + 3, 2, 1, hex('#6a3a30')); }
  }
  if (L.hat === 'pilot') { P.rect(hx - 5, hy - 6, 12, 3, PAL.navy(.55, 0, 0)); P.rect(hx - 5, hy - 4, 12, 1, PAL.gold(.8, 0, 0)); P.rect(hx + 3, hy - 3, 6, 1, PAL.black(.3, 0, 0)); P.set(hx + 1, hy - 5, PAL.gold(.95, 0, 0)); }
  if (L.hat === 'surgeon') P.ellipse(hx, hy - 3, 6, 3.6, (x, y, dx, dy) => PAL.teal(.75 - dy * .2, x, y));
  if (L.mask && ph) P.rect(hx + 1, hy + 3, 6, 3, PAL.white(.7, 0, 0));
  if (L.gradCap) { P.rect(hx - 6, hy - 6, 13, 2, PAL.black(.5, 0, 0)); P.rect(hx - 3, hy - 5, 7, 2, PAL.black(.3, 0, 0)); P.set(hx + 6, hy - 5, PAL.gold(.9, 0, 0)); P.set(hx + 6, hy - 4, PAL.gold(.7, 0, 0)); P.set(hx + 6, hy - 3, PAL.gold(.7, 0, 0)); }
  if (L.veil) for (let y = hy - 5; y < hy + 14; y++) for (let x = hx - 7; x < hx - 3 + (y - hy) * .15; x++) if ((x + y) % 3) P.set(x, y, PAL.white(.85, x, y));
  // —— arms ——
  const sl = pts => pts.forEach(([x, y]) => { P.set(x, y, Body(.62, x, y)); P.set(x, y + 1, Body(.38, x, y)); });
  const hand = (x, y) => P.rect(x, y, 2, 2, S(.6, 0, 0));
  if (ph) {
    sl([[21, top + 2], [22, top + 3], [22, top + 5], [23, top + 6], [24, top + 6]]);
    drawPhone(P, E, 24, top - 5, 1, p.scroll);
    if (p.off) for (let j = 1; j < 7; j++) for (let i = 1; i < 4; i++) { P.set(24 + i, top - 5 + j, [14, 14, 20]); E.set(24 + i, top - 5 + j, [0, 0, 0]); }
    hand(23, top + 1);   // fingers round the phone
    const ty = top - 5 + [5, 3, 1][p.scroll ? p.scroll.s : 0];   // thumb on the screen, sliding up as it swipes
    P.set(26, ty, S(.8, 0, 0)); P.set(26, ty + 1, S(.62, 0, 0)); if (!p.scroll || p.scroll.s === 0) P.set(25, ty + 2, S(.55, 0, 0));
  } else if (pose === 'look') {
    sl([[21, top + 2], [22, top + 4], [22, top + 6], [22, top + 8], [23, top + 10]]); hand(23, top + 12);
    if (!p.nophone) drawPhone(P, E, 24, top + 8, .35);
  } else if (pose === 'write') {   // forearm on the desk, pen moving
    const k = p.step ?? 0;
    sl([[21, top + 3], [23, top + 5], [25, top + 6], [27, top + 6]]); hand(28 + k, top + 5 + k);
    P.set(30 + k, top + 4 + k, hex('#2a2a34')); P.set(31 + k, top + 3 + k, hex('#2a2a34'));
  } else if (pose === 'kneel') {
    sl([[21, top + 2], [23, top + 2], [25, top + 1], [27, top]]); hand(28, top - 1);
    P.rect(30, top - 2, 3, 3, PAL.black(.4, 0, 0)); P.set(31, top - 3, PAL.gold(.95, 0, 0)); E.set(31, top - 3, PAL.gold(.95, 0, 0)); P.set(31, top - 4, [255, 255, 255]); E.set(31, top - 4, [255, 255, 255]);
  } else if (pose === 'film') {
    sl([[21, top + 1], [23, top], [25, top - 1], [26, top - 2]]); hand(27, top - 3);
    for (let j = 0; j < 6; j++) for (let i = 0; i < 2; i++) P.set(28 + i, top - 6 + j, PAL.phone(.45 + i * .2, i, j));
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
export function makePerson(look, frames0) {
  const id = NEXT_ID++, frames = {};
  for (const [k, p] of Object.entries(frames0)) {
    if (PH_POSES.includes(p.pose) && !p.still) for (let c = 0; c < 4; c++) for (let s = 0; s < 3; s++) frames[`${k}~${c}${s}`] = { ...p, scroll: { c, s } };
    else frames[k] = p;
  }
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
    frame(name) {
      if (!names.includes(name) && names.includes(name + '~00')) {
        const u = (CLOCK.t + id * .43) / SWIPE, k = Math.floor(u), f = (u - k) * SWIPE;
        name += `~${((k % 4) + 4) % 4}${f > SWIPE - .085 ? 2 : f > SWIPE - .17 ? 1 : 0}`;
      }
      const i = names.indexOf(name); if (i < 0) throw new Error('frame ' + name); tex.offset.x = em.offset.x = i / n; },
    face(cam, flip = false) { root.updateMatrixWorld(); const w = new THREE.Vector3().setFromMatrixPosition(root.matrixWorld); root.rotation.y = Math.atan2(cam.position.x - w.x, cam.position.z - w.z); mesh.scale.x = flip ? -1 : 1; },
    local(px, py) { const v = new THREE.Vector3((px - FW / 2) * SPX * mesh.scale.x, (FH - py) * SPX, .05); v.applyAxisAngle(new THREE.Vector3(0, 1, 0), root.rotation.y); return v.add(root.position); },
  };
}
export const WALK = { w0: { pose: 'walk', step: 0 }, w1: { pose: 'walk', step: 1, bob: -1 }, w2: { pose: 'walk', step: 2 }, w3: { pose: 'walk', step: 3, bob: -1 } };
export const walkFrame = t => ['w0', 'w1', 'w2', 'w3'][Math.floor(t * 7) % 4];
