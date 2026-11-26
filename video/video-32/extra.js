// video-32 overlay extras: the phone's volume pop-up when he turns the sound up (he hears nothing of his future self).
import { T } from './story.js';
import { seg, ss, eio } from '/core/lib.js';

export function extra(g, t, H, layer) {
  if (layer !== 'over' || t < T.vol || t > T.volEnd) return;
  const a = Math.min(ss(seg(t, T.vol, T.vol + .15)), 1 - ss(seg(t, T.volEnd - .3, T.volEnd)));
  const lvl = .35 + .65 * eio(seg(t, T.vol + .15, T.vol + .8));
  const w = 470, h = 96, x = H.W / 2 - w / 2, y = 800;
  g.save(); g.globalAlpha = a;
  g.fillStyle = 'rgba(16,18,28,.86)'; g.beginPath(); g.roundRect(x, y, w, h, h / 2); g.fill();
  g.strokeStyle = 'rgba(214,190,130,.7)'; g.lineWidth = 2; g.stroke();
  // speaker with three waves (the last ones light up as the level rises)
  const sx = x + 52, sy = y + h / 2;
  g.fillStyle = H.CREAM; g.fillRect(sx - 14, sy - 10, 12, 20);
  g.beginPath(); g.moveTo(sx - 4, sy - 10); g.lineTo(sx + 12, sy - 24); g.lineTo(sx + 12, sy + 24); g.lineTo(sx - 4, sy + 10); g.closePath(); g.fill();
  g.strokeStyle = H.CREAM; g.lineWidth = 5; g.lineCap = 'round';
  [12, 22, 32].forEach((r, i) => { g.globalAlpha = a * (lvl > .4 + i * .25 ? 1 : .25); g.beginPath(); g.arc(sx + 16, sy, r, -.8, .8); g.stroke(); });
  g.globalAlpha = a;
  // the level bar
  const bx = x + 130, bw = w - 170, by = sy - 9;
  g.fillStyle = 'rgba(246,240,226,.22)'; g.beginPath(); g.roundRect(bx, by, bw, 18, 9); g.fill();
  g.fillStyle = H.CREAM; g.beginPath(); g.roundRect(bx, by, bw * lvl, 18, 9); g.fill();
  g.restore();
}
export const extraTexts = () => [];
