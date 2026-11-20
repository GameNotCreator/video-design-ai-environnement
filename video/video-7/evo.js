// The forms of the march (side view, facing right), procedural pixel drawings, 2 walk frames each.
// One atlas, one billboard; frame names are `${form}${0|1}`. The student uses the shared people.js drawing.
import * as THREE from 'three';
import { PX, ramp, hex, texOf, billboard, blob } from './px.js';
import { PAL } from './people.js';

const FW = 40, FH = 50, INK = hex('#1a1016');
const FUR = ramp(['#1e120c', '#3a2416', '#5a3a22', '#7a5432'], .22), SKIN = PAL.skin, TAN = ramp(['#5a3a24', '#8a5a3a', '#b07a52', '#cc9a6c'], .22);
const PHONE = (P, E, x, y, h = 5) => { for (let j = 0; j < h; j++) { P.set(x + 1, y + j, PAL.phone(.4, 0, j)); const c = PAL.glow(.7, 0, j); P.set(x, y + j, c); E.set(x, y + j, c); } };

function ape(P, E, s, phone) {
  const b = s ? 1 : 0;
  P.ellipse(18, 30 + b, 11, 7, (x, y, dx, dy) => FUR(.55 - dy * .3, x, y));                       // hunched body
  for (const [x, fw] of [[9, s], [15, 1 - s], [24, s], [29, 1 - s]]) for (let y = 34; y < 49; y++) P.set(x + (y > 42 ? fw : 0), y, FUR(.35, 0, y)), P.set(x + 1 + (y > 42 ? fw : 0), y, FUR(.5, 0, y));
  P.ellipse(31, 24 + b, 5.5, 5, (x, y, dx, dy) => FUR(.6 - dy * .3, x, y));                       // head
  P.ellipse(33.5, 26 + b, 3, 2.6, (x, y, dx, dy) => TAN(.6 - dy * .2, x, y));                      // muzzle
  P.set(32, 23 + b, INK); P.rect(29, 21 + b, 5, 1, FUR(.2, 0, 0));
  if (phone) { P.set(32, 23 + b, PAL.cold(.9, 0, 0)); PHONE(P, E, 36, 23 + b); for (let y = 28; y < 32; y++) P.set(34, y + b, FUR(.5, 0, y)); }
}
function hominid(P, E, s) {
  const b = s ? 1 : 0;
  for (const [x, f] of [[14, s], [19, 1 - s]]) for (let y = 34; y < 49; y++) { P.set(x + (y > 41 ? f * 2 - 1 : 0), y, FUR(.4, 0, y)); P.set(x + 1 + (y > 41 ? f * 2 - 1 : 0), y, FUR(.55, 0, y)); P.set(x + 2 + (y > 41 ? f * 2 - 1 : 0), y, FUR(.45, 0, y)); }
  P.poly([[11, 20 + b], [24, 18 + b], [24, 36], [12, 36]], (x, y) => FUR(.55 - (x - 11) * .015, x, y));
  P.ellipse(26, 15 + b, 5, 5.2, (x, y, dx, dy) => FUR(.6 - dy * .3, x, y)); P.ellipse(28, 17 + b, 2.8, 2.6, (x, y) => TAN(.6, x, y)); P.set(27, 15 + b, INK);
  for (let y = 22; y < 40; y++) P.set(25 + (y > 32 ? 1 : 0), y + b, FUR(.4, 0, y));
}
function caveman(P, E, s, phone) {
  const b = s ? 1 : 0, hu = phone ? 3 : 0;
  for (const [x, f] of [[15, s], [20, 1 - s]]) for (let y = 34; y < 49; y++) for (let k = 0; k < 3; k++) P.set(x + k + (y > 42 ? f * 2 - 1 : 0), y, TAN(k === 0 ? .35 : .6, 0, y));
  P.poly([[12, 18 + hu], [25, 17 + hu], [26, 35], [12, 35]], (x, y) => TAN(.62 - (x - 12) * .012, x, y));
  P.poly([[12, 26 + hu], [26, 22 + hu], [27, 36], [12, 37]], (x, y) => FUR(.55 + ((x + y) % 4 === 0 ? -.15 : 0), x, y));   // fur loincloth
  P.ellipse(23 + hu, 12 + hu + b, 5.5, 5.5, (x, y, dx, dy) => FUR(.4 - dy * .2, x, y));            // wild hair
  P.ellipse(25 + hu, 13 + hu + b, 3.6, 4, (x, y, dx, dy) => TAN(.6 - dy * .2, x, y));
  P.poly([[22 + hu, 15 + hu + b], [29 + hu, 15 + hu + b], [28 + hu, 20 + hu + b], [23 + hu, 19 + hu + b]], (x, y) => FUR(.45, x, y));   // beard
  P.set(27 + hu, 12 + hu + b, phone ? PAL.cold(.9, 0, 0) : INK);
  if (phone) { for (let x = 24; x < 31; x++) P.set(x, 22 + hu, TAN(.55, 0, 0)); PHONE(P, E, 31, 15 + hu + b); }
  else { for (let y = 20; y < 30; y++) P.set(26, y, TAN(.5, 0, y)); P.line(27, 30, 33, 24, FUR(.3, 0, 0)); P.ellipse(33, 23, 2.2, 2.2, (x, y) => FUR(.35, x, y)); }   // club
}
function man(P, E, s) {
  const b = s ? 1 : 0, C = PAL.beige, J = PAL.jean;
  for (const [x, f] of [[15, s], [20, 1 - s]]) for (let y = 33; y < 49; y++) for (let k = 0; k < 3; k++) P.set(x + k + (y > 42 ? f * 2 - 1 : 0), y, J(k === 0 ? .35 : .65, 0, y));
  P.poly([[13, 15 + b], [24, 15 + b], [25, 34], [13, 34]], (x, y) => C(.65 - (x - 13) * .015, x, y));
  P.ellipse(19, 9 + b, 5, 5.5, (x, y, dx, dy) => PAL.hairBrown(.5 - dy * .3, x, y)); P.ellipse(21, 10 + b, 3.6, 4, (x, y, dx, dy) => SKIN(.6 - dy * .2, x, y)); P.set(23, 9 + b, INK);
  for (let y = 17; y < 30; y++) P.set(23 + (s && y > 24 ? 1 : 0), y + b, C(.4, 0, y));
}
function fish(P, E, s) {
  const F = PAL.teal, b = s ? 1 : 0;
  P.ellipse(20, 42 + b, 9, 4.5, (x, y, dx, dy) => F(.65 - dy * .3, x, y));
  P.poly([[11, 42 + b], [5, 37 + b - s], [5, 47 + b + s]], (x, y) => F(.45, x, y));
  P.set(26, 41 + b, [240, 240, 240]); P.set(27, 41 + b, PAL.cold(.9, 0, 0));
  P.line(20, 45 + b, 26, 44 + b, F(.3, 0, 0)); PHONE(P, E, 29, 38 + b, 4);
}
function cell(P, E, s) {
  const G = ramp(['#3a2a4a', '#6a4a7a', '#9a72a8', '#c8a0d0'], .22);
  P.ellipse(20, 44, 6 + s * .6, 4 - s * .4, (x, y, dx, dy) => G(.7 - Math.hypot(dx, dy) * .4, x, y));
  P.ellipse(19, 44, 1.6, 1.4, (x, y) => [70, 40, 80]);
  PHONE(P, E, 25, 41, 3);
}

const DRAW = { ape: (P, E, s) => ape(P, E, s, 0), apephone: (P, E, s) => ape(P, E, s, 1), hominid, caveman: (P, E, s) => caveman(P, E, s, 0), cavephone: (P, E, s) => caveman(P, E, s, 1), man, fish, blob: cell };

export function makeEvo() {
  const names = []; Object.keys(DRAW).forEach(k => names.push(k + '0', k + '1'));
  const n = names.length, P = new PX(FW * n, FH), E = new PX(FW * n, FH);
  names.forEach((nm, i) => {
    const p1 = new PX(FW, FH), e1 = new PX(FW, FH); DRAW[nm.slice(0, -1)](p1, e1, +nm.slice(-1)); p1.outline(.3);
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { const c = p1.get(x, y); if (c) P.set(i * FW + x, y, c); const e = e1.get(x, y); if (e) E.set(i * FW + x, y, e); }
  });
  const tex = texOf(P.done()), em = texOf(E.done()); for (const t of [tex, em]) t.repeat.set(1 / n, 1);
  const mesh = billboard(tex, FW / 30, FH / 30, { em, emCol: '#ffffff', emI: 2.0 });
  const root = new THREE.Group(); root.add(mesh); const sh = blob(.4, .5); sh.position.y = .015; root.add(sh);
  return { root, mesh, names, frame(nm) { const i = names.indexOf(nm); if (i < 0) throw new Error(nm); tex.offset.x = em.offset.x = i / n; }, face(cam) { root.rotation.y = Math.atan2(cam.position.x - root.position.x, cam.position.z - root.position.z); } };
}
