// the departures board (top of the safe zone): amber on black, rows flip to DEPARTED one by one
import { T, FLIGHTS, statusAt } from './story.js';
import { seg, eo } from '/core/lib.js';
const X = 90, Y = 236, W = 900, RH = 74;
export function extra(g, t, H, layer) {
  if (layer !== 'over' || t >= T.txt - .2) return;
  const a = 1 - seg(t, T.txt - .6, T.txt - .2);
  g.save(); g.globalAlpha = a;
  g.fillStyle = 'rgba(8,8,12,.92)'; g.fillRect(X, Y, W, 92 + RH * FLIGHTS.length); g.strokeStyle = 'rgba(214,190,130,.8)'; g.lineWidth = 3; g.strokeRect(X + 1.5, Y + 1.5, W - 3, 92 + RH * FLIGHTS.length - 3);
  g.font = '700 40px Cinzel'; g.fillStyle = '#d8c28e'; g.textAlign = 'left'; g.textBaseline = 'middle'; H.spaced(g, 'DEPARTURES', H.W / 2, Y + 46, 8);
  FLIGHTS.forEach((f, i) => {
    const y = Y + 92 + i * RH + RH / 2, st = statusAt(f, t), flip = f.gone <= t ? 1 - eo(seg(t, f.gone, f.gone + .25)) : 0;
    g.fillStyle = i % 2 ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)'; g.fillRect(X + 8, y - RH / 2 + 3, W - 16, RH - 6);
    g.font = '700 42px Figtree'; g.textAlign = 'left'; g.fillStyle = st === 'DEPARTED' ? '#7a756a' : '#ffd27a';
    g.fillText(f.time, X + 30, y); g.fillText(f.dest, X + 190, y);
    g.textAlign = 'right'; g.font = '800 36px Figtree';
    g.fillStyle = st === 'FINAL CALL' ? (Math.floor(t * 4) % 2 ? '#ff9a3c' : '#ffd27a') : st === 'DEPARTED' ? '#9a958a' : st === 'BOARDING' ? '#9fe0a0' : '#c8c2b4';
    g.save(); g.translate(X + W - 30, y); g.scale(1, 1 - flip * .9); g.fillText(st, 0, 0); g.restore();
  });
  g.restore();
}
export const extraTexts = t => t < T.txt - .2 ? [{ id: 'board' + FLIGHTS.map(f => statusAt(f, t)[0]).join(''), text: 'DEPARTURES', x0: X, y0: Y, x1: X + W, y1: Y + 92 + RH * FLIGHTS.length, pass: true }] : [];
