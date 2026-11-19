// The sitter: a procedural pixel sprite sitting on his bed (side view, facing right), legs stretched, phone up,
// drawn at 6 ages (19 → 79) + nodding + dead. Billboard lit by the scene (px.js).
import * as THREE from 'three';
import { PX, ramp, hex, texOf, billboard } from './px.js';

export const SPX = 1 / 30;
const FW = 40, FH = 40;
const INK = hex('#1a1016');
const R = (cols) => ramp(cols, .22);
const C = {
  hood: R(['#3a0708', '#6e0d0e', '#a01414', '#c41919', '#e0473a']),
  hoodOld: R(['#360a0b', '#621214', '#8c1a1b', '#ab2422', '#c44a40']),
  jean: R(['#141927', '#222b40', '#33405c', '#485a7c']),
  sock: R(['#5a5a62', '#9a9aa4', '#d6d6dc']),
  phone: R(['#0d0e14', '#1d1f2a', '#30333f']),
  glow: R(['#3d7fe0', '#7fb8ff', '#cfe6ff', '#ffffff']),
};
const SKIN = [R(['#9a6650', '#c98c6e', '#e8b493', '#f6d2b4']), R(['#94664f', '#c08a70', '#ddb096', '#efcdb6']), R(['#8a6656', '#b48a78', '#d0ae9c', '#e6cbbd'])];
const COLD = R(['#3e4a6e', '#6a80b0', '#9db8e6', '#d2e4ff']);
const HAIR = {
  dark: R(['#100b0d', '#1f1619', '#33262a', '#4a3a3a']), brown: R(['#1e130e', '#3a271c', '#5a3e2c', '#76563e']),
  pepper: R(['#2a282c', '#4a474e', '#77737c', '#a29ea6']), grey: R(['#58565c', '#86838a', '#b2afb6', '#d6d4da']),
  white: R(['#8e8c92', '#bab8be', '#dedce2', '#f6f5f8']),
};
// age stages: hair colour, beard (0 none, 1 stubble, 2 beard), bald (0..1), glasses, hunch (px), skin index, wrinkles
export const AGES = [
  { hair: 'dark', beard: 0, bald: 0, glasses: 0, hunch: 0, skin: 0, wr: 0 },
  { hair: 'dark', beard: 1, bald: 0, glasses: 0, hunch: 0, skin: 0, wr: 0 },
  { hair: 'brown', beard: 2, beardC: 'brown', bald: .15, glasses: 0, hunch: 1, skin: 0, wr: 0 },
  { hair: 'pepper', beard: 2, beardC: 'pepper', bald: .35, glasses: 1, hunch: 1, skin: 1, wr: 1 },
  { hair: 'grey', beard: 2, beardC: 'grey', bald: .65, glasses: 1, hunch: 2, skin: 1, wr: 1 },
  { hair: 'white', beard: 2, beardC: 'white', bald: .9, glasses: 1, hunch: 3, skin: 2, wr: 2 },
];

// p: { age (AGES entry), tap 0|1, pose: 'phone'|'nod'|'dead' }
function drawSitter(P, E, p) {
  const a = p.age, pose = p.pose || 'phone', H = HAIR[a.hair], S = SKIN[a.skin], hood = a.skin > 0 ? C.hoodOld : C.hood;
  const hu = a.hunch + (pose === 'nod' ? 2 : 0);
  // —— legs stretched to the right, socks ——
  for (let y = 31; y < 37; y++) for (let x = 15; x < 33; x++) P.set(x, y, C.jean((y === 31 ? .85 : .55) - (x > 30 ? .1 : 0) - (y > 34 ? .2 : 0), x, y));
  for (let y = 28; y < 37; y++) for (let x = 33; x < 36; x++) P.set(x, y, C.sock(y < 30 ? .9 : .55, x, y));
  // —— torso (leaning back against the headboard) ——
  const top = 14 + hu, bot = 37;
  const slump = pose === 'dead' ? 2 : 0;
  P.poly([[6, top + 1 + slump], [16, top + slump], [18, bot], [5, bot]], (x, y) => {
    const u = (y - top) / (bot - top), s = (x - 5) / 13;
    let v = .68 - s * .3 + (1 - u) * .1; if (y > bot - 3) v = .38; return hood(v, x, y);
  });
  P.ellipse(7, top + 1, 3.5, 2.4, (x, y, dx, dy) => hood(.5 - dy * .2, x, y));   // hood bunched behind the neck
  // —— head ——
  const hx = 11 + hu + (pose === 'dead' ? -1 : 0), hy = 8 + hu + (pose === 'nod' ? 2 : 0) + (pose === 'dead' ? 4 : 0);
  // hair mass (receding with bald)
  P.ellipse(hx, hy, 5.2, 5.6, (x, y, dx, dy) => (dy < -.2 && a.bald > 0 && Math.abs(dx) < a.bald * 1.1 && dx > -.4) ? S(.7 - dy * .2, x, y) : H(.55 - dy * .3 - dx * .1, x, y));
  // face (turned down-right to the phone; lower half lit cold by the screen)
  const lit = pose !== 'dead';
  P.ellipse(hx + 2.2, hy + 1.4, 3.6, 4.2, (x, y, dx, dy) => {
    const cold = lit && dy > -.2 && dx > -.3; const c = cold ? COLD(.6 + dx * .2 - dy * .1 - a.skin * .05, x, y) : S(.42 + dx * .1, x, y);
    if (cold) E.set(x, y, [22, 34, 64]); return c;
  });
  if (a.bald < .5) for (let x = hx - 2; x <= hx + 4; x++) P.set(x, hy - 2.6 + (x > hx + 2 ? 1 : 0), H(.6, x, 0));   // fringe
  // beard
  const BC = HAIR[a.beardC || a.hair];
  if (a.beard === 1) for (let x = hx; x <= hx + 4; x++) { if ((x + hy) % 2 === 0) P.set(x, hy + 4, BC(.45, x, 0)); P.set(x + 1, hy + 5, BC(.3, x, 0)); }
  if (a.beard === 2) P.poly([[hx - 1, hy + 2], [hx + 5, hy + 3], [hx + 5, hy + 5], [hx + 2, hy + 7], [hx - 1, hy + 5]], (x, y) => BC(.6 - (y - hy) * .05 + ((x + y) % 3 === 0 ? -.12 : 0), x, y));
  // eyes, glasses, wrinkles
  const ey = Math.round(hy + 1);
  if (pose === 'phone') { P.set(hx + 3, ey, INK); P.set(hx + 1, ey, INK); }
  else { P.set(hx + 3, ey, S(.15, 0, 0)); P.set(hx + 1, ey, S(.15, 0, 0)); P.set(hx + 2, ey, S(.2, 0, 0)); }   // closed
  if (a.glasses) { P.set(hx + 4, ey - 1, hex('#c8c8d0')); P.set(hx + 2, ey - 1, hex('#c8c8d0')); P.set(hx + 3, ey - 1, hex('#8c8c96')); P.set(hx, ey - 1, hex('#8c8c96')); }
  if (a.wr) { P.set(hx + 3, ey + 1, S(.2, 0, 0)); if (a.wr > 1) { P.set(hx + 1, ey + 1, S(.2, 0, 0)); P.set(hx + 4, hy - 1, S(.25, 0, 0)); } }
  P.set(hx + 5, hy + 2, lit ? COLD(.75, 0, 0) : S(.6, 0, 0));   // nose
  // —— arms + phone ——
  const sl = (pts) => pts.forEach(([x, y]) => { P.set(x, y, hood(.6, x, y)); P.set(x, y + 1, hood(.35, x, y)); });
  if (pose === 'dead') {
    sl([[14, top + 3 + slump], [15, top + 6 + slump], [16, top + 9 + slump], [17, top + 12 + slump], [18, top + 15]]);
    P.rect(19, top + 16, 2, 2, S(.45, 0, 0));
    return;
  }
  const py = top - 1 + (pose === 'nod' ? 4 : 0), px = 19 + hu;
  sl([[14, top + 3], [15, top + 5], [16, top + 6], [17, top + 6], [18, top + 5]]);
  P.rect(px - 1, py + 4, 2, 2, S(.6, 0, 0));
  for (let j = 0; j < 6; j++) for (let i = 0; i < 3; i++) P.set(px + 1 + i, py + j, C.phone(.5 - j * .07, i, j));
  for (let j = 0; j < 6; j++) { const c = C.glow(.75 - j * .08, 0, j); P.set(px, py + j, c); E.set(px, py + j, c); }
  P.set(px + 1 + (p.tap ? 1 : 0), py + 3 + (p.tap ? -1 : 1), S(.75, 0, 0));        // the scrolling thumb
}

export const TABLE = {};
AGES.forEach((a, i) => { TABLE[`a${i}t0`] = { age: a, tap: 0 }; TABLE[`a${i}t1`] = { age: a, tap: 1 }; });
TABLE.nod = { age: AGES[5], pose: 'nod' };
TABLE.dead = { age: AGES[5], pose: 'dead' };

function atlas() {
  const names = Object.keys(TABLE), n = names.length, P = new PX(FW * n, FH), E = new PX(FW * n, FH);
  names.forEach((k, i) => {
    const p1 = new PX(FW, FH), e1 = new PX(FW, FH); drawSitter(p1, e1, TABLE[k]); p1.outline(.3);
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { const c = p1.get(x, y); if (c) P.set(i * FW + x, y, c); const e = e1.get(x, y); if (e) E.set(i * FW + x, y, e); }
  });
  const tex = texOf(P.done()), em = texOf(E.done()); for (const t of [tex, em]) t.repeat.set(1 / n, 1);
  return { tex, em, names, n, canvas: P.c };
}

export function makeSitter() {
  const A = atlas();
  const mesh = billboard(A.tex, FW * SPX, FH * SPX, { em: A.em, emCol: '#ffffff', emI: 2.0 });
  const root = new THREE.Group(); root.add(mesh); root.userData.char = 'hero';
  return {
    root, mesh, atlas: A,
    frame(name) { const i = A.names.indexOf(name); if (i < 0) throw new Error('frame ' + name); A.tex.offset.x = A.em.offset.x = i / A.n; },
    face(cam) { root.rotation.y = Math.atan2(cam.position.x - root.position.x, cam.position.z - root.position.z); },
    local(px, py) { const v = new THREE.Vector3((px - FW / 2) * SPX, (FH - py) * SPX, .05); v.applyAxisAngle(new THREE.Vector3(0, 1, 0), root.rotation.y); return v.add(root.position); },
  };
}
