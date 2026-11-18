// The student: a procedural pixel sprite (3/4 view facing right), red hoodie, head down over a glowing phone.
// One frame per pose, packed into an atlas; the billboard takes the scene lighting (px.js billboard).
import * as THREE from 'three';
import { PX, ramp, hex, texOf, billboard, blob } from './px.js';

export const SPX = 1 / 30;           // sprite pixel → metres (50 px ≈ 1.67 m)
const FW = 34, FH = 50;
const C = {
  hood: ramp(['#3a0708', '#6e0d0e', '#a01314', '#c41919', '#e0473a'], .22),     // brand red: the one saturated colour
  skin: ramp(['#9a6650', '#c98c6e', '#e8b493', '#f6d2b4'], .22),
  cold: ramp(['#3e4a6e', '#6a80b0', '#9db8e6', '#d2e4ff'], .22),                // skin lit by the screen
  hair: ramp(['#100b0d', '#1f1619', '#33262a', '#4a3a3a'], .22),
  jean: ramp(['#141927', '#222b40', '#33405c', '#485a7c'], .22),
  shoe: ramp(['#4c4c54', '#9a9aa4', '#dcdce2'], .22),
  phone: ramp(['#0d0e14', '#1d1f2a', '#30333f'], .22),
  glow: ramp(['#3d7fe0', '#7fb8ff', '#cfe6ff', '#ffffff'], .22),
};
const INK = hex('#1a1016');

// p: { step 0..3 | null, bob, pose: 'phone'|'look'|'flinch', blink }
function drawStudent(P, E, p) {
  const by = p.bob || 0, pose = p.pose || 'phone';
  // —— Legs + sneakers ——
  const st = p.step ?? -1;
  const legs = st < 0 ? [[13, 0], [18, 0]] : [[[11, 0], [20, -1]], [[14, -1], [17, 0]], [[20, -1], [11, 0]], [[17, 0], [14, -1]]][st];
  legs.forEach(([lx, ly], i) => {
    for (let y = 33 + by; y < 46 + ly; y++) for (let x = lx; x < lx + 4; x++) P.set(x, y, C.jean((i ? .55 : .8) - (x === lx ? .25 : 0) + (y > 42 ? -.1 : 0), x, y));
    for (let y = 46 + ly; y < 49 + ly; y++) for (let x = lx - 1; x < lx + 5; x++) P.set(x, y, C.shoe(y === 46 + ly ? .9 : (x === lx + 4 ? .7 : .45), x, y));
    P.rect(lx - 1, 49 + ly, 6, 1, C.shoe(.05, 0, 0));
  });
  // —— Hoodie body ——
  const top = 17 + by, bot = 34 + by;
  P.poly([[10, top], [23, top], [24, bot], [9, bot]], (x, y) => {
    const u = (y - top) / (bot - top), s = (x - 9) / 15;
    let v = .7 - s * .35 + (1 - u) * .12;
    if (y >= bot - 2) v = .35;                         // ribbed hem
    if (y > top + 9 && y < top + 13 && x > 13 && x < 22) v -= .2;   // front pocket
    return C.hood(v, x, y);
  });
  P.set(20, top + 1, C.shoe(.9, 0, 0)); P.set(20, top + 2, C.shoe(.7, 0, 0)); P.set(18, top + 1, C.shoe(.8, 0, 0)); P.set(18, top + 3, C.shoe(.6, 0, 0));   // drawstrings
  // Hood bunched behind the neck
  P.ellipse(12.5, top - .5, 4.5, 2.6, (x, y, dx, dy) => C.hood(.55 - dy * .2 - dx * .1, x, y));
  // —— Head ——
  const down = pose === 'phone' ? 1 : 0, hx = 17 + (pose === 'phone' ? 1 : 0), hy = 9 + by + down;
  P.ellipse(hx, hy, 5.5, 6, (x, y, dx, dy) => C.hair(.55 - dy * .3 - dx * .1, x, y));          // hair mass
  if (pose === 'phone') {
    // face turned down-right toward the phone, lower half lit cold by the screen
    P.ellipse(hx + 2.2, hy + 1.6, 3.6, 4.2, (x, y, dx, dy) => { const lit = dy > -.2 && dx > -.3; const c = lit ? C.cold(.6 + dx * .2 - dy * .1, x, y) : C.skin(.45 + dx * .1, x, y); if (lit) E.set(x, y, [22, 34, 64]); return c; });
    for (let x = hx - 2; x <= hx + 4; x++) P.set(x, hy - 2.6 + (x > hx + 2 ? 1 : 0), C.hair(.6, x, 0));   // fringe
    if (!p.blink) { P.set(hx + 3, hy + 1, INK); P.set(hx + 1, hy + 1, INK); } else { P.set(hx + 3, hy + 1, C.cold(.2, 0, 0)); }
    P.set(hx + 5, hy + 2, C.cold(.75, 0, 0));          // nose tip
  } else {
    // head up, face toward the light up the street (frontal), eyes wide
    P.ellipse(hx + 1.2, hy + 1, 3.8, 4.4, (x, y, dx, dy) => C.skin(.62 - dy * .25 - Math.abs(dx) * .15, x, y));
    for (let x = hx - 3; x <= hx + 4; x++) P.set(x, hy - 3, C.hair(.6, x, 0));
    P.rect(hx - 1, hy, 2, 2, hex('#e8e8ee')); P.rect(hx + 2, hy, 2, 2, hex('#e8e8ee'));
    P.set(hx, hy + 1, INK); P.set(hx + 3, hy + 1, INK);
    P.rect(hx + 1, hy + 3, 2, 2, hex('#5a2a2a'));      // open mouth
  }
  // —— Arms + phone ——
  const sleeve = (pts) => pts.forEach(([x, y]) => { P.set(x, y, C.hood(.6, x, y)); P.set(x, y + 1, C.hood(.35, x, y)); });
  if (pose === 'phone') {
    sleeve([[21, top + 2], [22, top + 3], [22, top + 4], [22, top + 5], [22, top + 6], [23, top + 6], [24, top + 5]]);
    P.rect(24, top + 3, 2, 2, C.skin(.6, 0, 0)); P.rect(23, top + 5, 2, 1, C.skin(.45, 0, 0));
    // phone held up, screen toward the face: we see its back and its glowing edge
    for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) P.set(25 + i - (j > 2 ? 1 : 0), top - 1 + j, C.phone(.5 - j * .08, i, j));
    for (let j = 0; j < 5; j++) { const c = C.glow(.75 - j * .1, 0, j); P.set(24 - (j > 2 ? 1 : 0), top - 1 + j, c); E.set(24 - (j > 2 ? 1 : 0), top - 1 + j, c); }
    P.set(9, top + 8, C.hood(.3, 0, 0)); P.set(9, top + 9, C.skin(.35, 0, 0));   // far hand
  } else if (pose === 'look') {
    sleeve([[21, top + 2], [22, top + 4], [22, top + 6], [22, top + 8], [22, top + 10]]);
    P.rect(22, top + 12, 2, 2, C.skin(.55, 0, 0));
    for (let j = 0; j < 5; j++) for (let i = 0; i < 2; i++) P.set(24 + i, top + 11 + j, C.phone(.45, i, j));
    for (let j = 0; j < 5; j++) { const c = C.glow(.6, 0, j); P.set(26, top + 11 + j, c); E.set(26, top + 11 + j, c); }
  } else {   // flinch: both forearms raised in front of the face
    sleeve([[21, top + 1], [23, top - 1], [24, top - 3], [24, top - 5]]); P.rect(24, top - 8, 3, 3, C.skin(.6, 0, 0));
    sleeve([[11, top + 1], [12, top - 1], [14, top - 3], [16, top - 5]]); P.rect(17, top - 8, 3, 3, C.skin(.45, 0, 0));
  }
}

const TABLE = {
  idle: { pose: 'phone' }, blink: { pose: 'phone', blink: 1 },
  w0: { step: 0, pose: 'phone' }, w1: { step: 1, pose: 'phone', bob: -1 }, w2: { step: 2, pose: 'phone' }, w3: { step: 3, pose: 'phone', bob: -1 },
  look: { pose: 'look' }, flinch: { pose: 'flinch', bob: 1 },
};

function atlas() {
  const names = Object.keys(TABLE), n = names.length, P = new PX(FW * n, FH), E = new PX(FW * n, FH);
  names.forEach((k, i) => {
    const p1 = new PX(FW, FH), e1 = new PX(FW, FH);
    drawStudent(p1, e1, TABLE[k]); p1.outline(.3);
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { const c = p1.get(x, y); if (c) P.set(i * FW + x, y, c); const e = e1.get(x, y); if (e) E.set(i * FW + x, y, e); }
  });
  const tex = texOf(P.done()), em = texOf(E.done());
  for (const t of [tex, em]) t.repeat.set(1 / n, 1);
  return { tex, em, names, n, canvas: P.c };
}

export function makeStudent() {
  const A = atlas();
  const mesh = billboard(A.tex, FW * SPX, FH * SPX, { em: A.em, emCol: '#ffffff', emI: 2.0 });
  const root = new THREE.Group(); root.add(mesh); root.userData.char = 'hero';
  const sh = blob(.42, .55); sh.position.y = .015; root.add(sh);
  return {
    root, mesh, atlas: A,
    frame(name) { const i = A.names.indexOf(name); if (i < 0) throw new Error('frame ' + name); A.tex.offset.x = A.em.offset.x = i / A.n; },
    face(cam) { root.rotation.y = Math.atan2(cam.position.x - root.position.x, cam.position.z - root.position.z); },
    phonePos() { const v = new THREE.Vector3((25.5 - FW / 2) * SPX, (FH - 17) * SPX, .06); v.applyAxisAngle(new THREE.Vector3(0, 1, 0), root.rotation.y); return v.add(root.position); },
  };
}
export { atlas as studentAtlas };
