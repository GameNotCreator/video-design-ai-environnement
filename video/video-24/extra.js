// the dating app's match card, over the scene: IT'S A MATCH! with her pixel portrait and "0 km away"
import { MATCH } from './story.js';
import { seg, eo } from '/core/lib.js';
const X = 190, Y = 560, W = 700, Hh = 560;
const FACE = ['....hhhhhh....', '..hhhhhhhhhh..', '.hhhhhhhhhhhh.', '.hhhsssssshhh.', 'hhhssssssssshh', 'hhsseessesseh.', 'hhssssssssssh.', 'hhsssssnsssshh', 'hhhssrrrrssshh', 'hhhhssssssshhh', 'hhhh.ssss.hhhh', 'hhh.mmmmmm.hhh', 'hh.mmmmmmmm.hh', '..mmmmmmmmmm..'];
const COL = { h: '#5a3e2c', s: '#e8b493', e: '#1a1016', n: '#c98c6e', r: '#a04a48', m: '#9a7a28' };
export function extra(g, t, H, layer) {
  if (layer !== 'over' || t < MATCH.a || t >= MATCH.b) return;
  const a = Math.min(seg(t, MATCH.a, MATCH.a + .2), 1 - seg(t, MATCH.b - .3, MATCH.b)), s = .9 + .1 * eo(seg(t, MATCH.a, MATCH.a + .35));
  g.save(); g.globalAlpha = a; g.translate(H.W / 2, Y + Hh / 2); g.scale(s, s); g.translate(-H.W / 2, -(Y + Hh / 2));
  g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 30; const gr = g.createLinearGradient(0, Y, 0, Y + Hh); gr.addColorStop(0, '#e86a8a'); gr.addColorStop(1, '#b8466a');
  g.fillStyle = gr; g.beginPath(); g.roundRect(X, Y, W, Hh, 44); g.fill(); g.shadowBlur = 0;
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 76px Figtree'; g.fillText("IT'S A MATCH!", H.W / 2, Y + 90);
  const px = 14, fx = H.W / 2 - 7 * px, fy = Y + 150; g.fillStyle = '#f6d2c4'; g.beginPath(); g.arc(H.W / 2, fy + 7 * px, 8.6 * px, 0, Math.PI * 2); g.fill();
  FACE.forEach((row, j) => [...row].forEach((c, i) => { if (COL[c]) { g.fillStyle = COL[c]; g.fillRect(fx + i * px, fy + j * px, px, px); } }));
  g.fillStyle = '#fff'; g.font = '800 54px Figtree'; g.fillText(MATCH.name, H.W / 2, Y + Hh - 110);
  g.font = '700 44px Figtree'; g.fillStyle = '#ffe2ea'; g.fillText(MATCH.dist, H.W / 2, Y + Hh - 50);
  g.restore();
}
export const extraTexts = t => t >= MATCH.a && t < MATCH.b ? [{ id: 'match', text: `IT'S A MATCH! ${MATCH.name} · ${MATCH.dist}`, x0: X, y0: Y, x1: X + W, y1: Y + Hh }] : [];
