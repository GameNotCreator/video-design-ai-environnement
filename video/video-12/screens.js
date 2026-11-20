// The devices' pixel screens (phone, laptop), redrawn every frame from t (pure function of t).
// Only what facts.md allows on an app screen: a padlock, the countdown of the session, a progress bar. No invented UI words.
import * as THREE from 'three';
import { PX, texOf, h2 } from './px.js';

const DIG = {
  0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'], 2: ['111', '001', '111', '100', '111'], 3: ['111', '001', '111', '001', '111'],
  4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '111', '001', '111'], 6: ['111', '100', '111', '101', '111'], 7: ['111', '001', '010', '010', '010'],
  8: ['111', '101', '111', '101', '111'], 9: ['111', '101', '111', '001', '111'], ':': ['0', '1', '0', '1', '0'],
};
export const textW = s => [...s].reduce((a, ch) => a + DIG[ch][0].length + 1, -1);
export function digits(P, s, x, y, col) { let cx = x; for (const ch of s) { const g = DIG[ch]; g.forEach((row, j) => [...row].forEach((b, i) => { if (b === '1') P.set(cx + i, y + j, col); })); cx += g[0].length + 1; } }
export const hms = sec => { sec = Math.max(0, Math.floor(sec)); const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = sec % 60; return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; };

export const COL = { bg: [30, 25, 23], red: [200, 64, 47], redHi: [236, 112, 88], redLo: [140, 36, 26], cream: [245, 240, 232], dim: [74, 62, 58], black: [6, 6, 8] };
const LOCK_C = ['..XXXXX..', '.XX...XX.', '.X.....X.', '.X.....X.'], LOCK_O = ['......XXXXX', '.....XX...XX', '.....X.....X', '...........X'];
const BODY = ['BBBBBBBBB', 'BBBBBBBBB', 'BBBB.BBBB', 'BBBB.BBBB', 'BBBBBBBBB', 'bbbbbbbbb'];
// padlock 9 x 10 px (closed) at (x, y); open: the shackle lifted to the right
export function padlock(P, x, y, open = false, col = COL.red) {
  const hi = col.map(v => Math.min(255, v + 40)), lo = col.map(v => Math.round(v * .7));
  (open ? LOCK_O : LOCK_C).forEach((row, j) => [...row].forEach((c, i) => { if (c === 'X') P.set(x + i, y + j - (open ? 1 : 0), j === 0 ? hi : col); }));
  BODY.forEach((row, j) => [...row].forEach((c, i) => { if (c === 'B') P.set(x + i, y + 4 + j, j === 0 ? hi : col); else if (c === 'b') P.set(x + i, y + 4 + j, lo); }));
}

// the lock screen: padlock, the countdown, a progress bar. a = seconds since this screen appeared (a short flash as it slams in)
export function lockScreen(P, remain, total, a = 9) {
  const W = P.w, H = P.h;
  P.rect(0, 0, W, H, COL.bg);
  const ly = Math.round(H * .2), px = Math.floor((W - 9) / 2);
  padlock(P, px, ly);
  const s = hms(remain), tw = textW(s), ty = ly + 14 + (H > 30 ? 4 : 0);
  digits(P, s, Math.floor((W - tw) / 2), ty, COL.cream);
  const bw = Math.min(W - 6, tw + 2), bx = Math.floor((W - bw) / 2), by = ty + 8, f = Math.max(0, Math.min(1, remain / total));
  if (by < H - 2) { P.rect(bx, by, bw, 1, COL.dim); P.rect(bx, by, Math.max(1, Math.round(bw * f)), 1, COL.red); }
  if (a < .22) { const k = 1 - a / .22; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = P.get(x, y); P.set(x, y, c.slice(0, 3).map(v => Math.round(v + (255 - v) * k * .8))); } }
}
export function offScreen(P) { P.rect(0, 0, P.w, P.h, COL.black); }
// boot: black, a small ring of dots turning
export function bootScreen(P, a) {
  offScreen(P); const cx = P.w / 2 - .5, cy = P.h / 2 - .5, k = Math.floor(a * 12) % 8;
  for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2, v = ((i - k + 8) % 8) / 8; const c = Math.round(60 + 190 * (1 - v)); P.set(Math.round(cx + Math.cos(an) * 3), Math.round(cy + Math.sin(an) * 3), [c, c, c + 4]); }
}
// home screen: 4 x 5 icons (4 x 4 px), muted colours; one cream tile (the blocker app, not its logo).
// o: { jiggle: 0/1, gone: 0..1 (the cream tile poofs away), tap: index of the icon being tapped or -1 }
const ICON = [[96, 140, 220], [150, 110, 220], [80, 180, 160], [220, 180, 90], [110, 170, 230], [170, 120, 190], [90, 150, 110], [200, 150, 120],
  [120, 120, 210], [80, 160, 200], [190, 170, 110], [140, 190, 130], [100, 110, 150], [180, 130, 160], [110, 190, 200], [150, 150, 170], [130, 100, 180], [90, 130, 90], [200, 200, 210], [160, 120, 100]];
export const APP = 5;   // the cream tile's slot
export function homeScreen(P, t, o = {}) {
  const W = P.w, H = P.h; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) P.set(x, y, [28 + y * .9, 40 + y * 1.2, 92 + y * 1.6].map(Math.round));
  P.rect(1, 1, 3, 1, [210, 220, 240]); P.rect(W - 5, 1, 4, 1, [210, 220, 240]);
  const ox = Math.floor((W - 19) / 2);
  for (let i = 0; i < 20; i++) {
    const cx = i % 4, cy = Math.floor(i / 4); let x = ox + cx * 5, y = 4 + cy * 6;
    if (o.jiggle) { const ph = Math.floor(t * 9 + i) % 2; x += ph ? 0 : (i % 2 ? 1 : 0); y += ph ? (i % 3 === 0 ? 1 : 0) : 0; }
    if (i === APP) {
      const g = o.gone || 0; if (g >= 1) continue;
      if (g > 0) { const n = 10; for (let k = 0; k < n; k++) { const an = k / n * 6.28 + .4, r = 1.5 + g * 9; P.set(Math.round(x + 1.5 + Math.cos(an) * r), Math.round(y + 1.5 + Math.sin(an) * r), [245, 240, 232]); } if (g > .35) continue; }
      P.rect(x, y, 4, 4, COL.cream); P.rect(x + 1, y + 1, 2, 2, COL.red); continue;
    }
    const c = ICON[i]; P.rect(x, y, 4, 4, c); P.rect(x, y, 4, 1, c.map(v => Math.min(255, v + 40))); P.set(x + 1, y + 2, c.map(v => Math.min(255, v + 70)));
    if (o.tap === i) P.rect(x - 1, y - 1, 6, 6, [255, 255, 255], 255), P.rect(x, y, 4, 4, c);
  }
  P.rect(ox, H - 6, 19, 5, [70, 90, 140]);
  for (let k = 0; k < 4; k++) P.rect(ox + 1 + k * 5, H - 5, 3, 3, ICON[12 + k]);
}
// laptop desktop: cold blue, an open window, notifications popping in at the top right
export function deskScreen(P, t) {
  const W = P.w, H = P.h; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) P.set(x, y, [40 + y * 2, 64 + y * 2.4, 140 + y * 2.4].map(Math.round));
  P.rect(3, 3, W - 12, H - 7, [222, 230, 244]); P.rect(3, 3, W - 12, 2, [150, 170, 210]);
  for (let j = 0; j < 4; j++) P.rect(5, 7 + j * 3, 6 + ((j * 7) % 9), 1, [120, 130, 160]);
  const k = Math.floor(t / .7) % 3; for (let n = 0; n <= k; n++) { P.rect(W - 9, 2 + n * 4, 8, 3, [250, 250, 255]); P.rect(W - 8, 3 + n * 4, 2, 1, [100, 150, 240]); }
  P.rect(0, H - 2, W, 2, [30, 40, 70]);
}

// A screen = a small canvas texture redrawn by draw(P) each frame
export function makeScreen(w, h) {
  const P = new PX(w, h), tex = texOf(P.c);
  return { P, tex, paint(fn) { fn(P); P.done(); tex.needsUpdate = true; } };
}

// The phone prop: dark body + lit screen, a glow and the light it throws. Faces the camera (held up to be read).
export function makePhone(o = {}) {
  const g = new THREE.Group(), W = o.w ?? .2, Hh = o.h ?? .36;
  const body = new THREE.Mesh(new THREE.BoxGeometry(W + .016, Hh + .02, .012), new THREE.MeshStandardMaterial({ color: '#16161c', roughness: .5 }));
  body.castShadow = true; g.add(body);
  const scr = makeScreen(o.px ?? 24, o.py ?? 44), mat = new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: true });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(W, Hh), mat); plane.position.z = .007; g.add(plane);
  const light = new THREE.PointLight('#ff7a5a', 0, 1.6, 1.8); light.position.set(0, 0, .25); g.add(light);
  return { group: g, scr, mat, light };
}
// The laptop prop: base + a lid that opens around its back edge; the screen on the lid
export function makeLaptop(o = {}) {
  const g = new THREE.Group(), W = o.w ?? .44, D = o.d ?? .3, LH = o.lh ?? .29;
  const metal = new THREE.MeshStandardMaterial({ color: '#8a8c96', roughness: .45, metalness: .2 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(W, .022, D), metal); base.position.y = .011; base.castShadow = base.receiveShadow = true; g.add(base);
  const keys = new THREE.Mesh(new THREE.PlaneGeometry(W * .86, D * .5), new THREE.MeshStandardMaterial({ color: '#2a2a32', roughness: .8 })); keys.rotation.x = -Math.PI / 2; keys.position.set(0, .0225, -.03); g.add(keys);
  const pivot = new THREE.Group(); pivot.position.set(0, .022, -D / 2); g.add(pivot);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(W, LH, .014), metal); lid.position.set(0, LH / 2, -.007); lid.castShadow = true; pivot.add(lid);
  const scr = makeScreen(o.px ?? 34, o.py ?? 22), mat = new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: true });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(W * .9, LH * .86), mat); plane.position.set(0, LH / 2 + .004, .0005); pivot.add(plane);
  const light = new THREE.PointLight('#ff7a5a', 0, 2.2, 1.8); light.position.set(0, LH * 1.4, .6); pivot.add(light);
  // open: 0 closed .. 1 open (lid at ~105 degrees)
  return { group: g, scr, mat, light, pivot, setOpen(u) { pivot.rotation.x = Math.PI / 2 - u * (Math.PI / 2 + .3); } };
}
export const _noise = h2;
