// the enclosure's sign (drawn over the scene in the safe zone)
import { T, PLAQUE } from './story.js';
import { seg, eo } from '/core/lib.js';
const Y = 1130, PW = 760, PH = 230;
export function extra(g, t, H, layer) {
  if (layer !== 'over' || t < T.plaque || t >= T.plaqueOut) return;
  const a = Math.min(seg(t, T.plaque, T.plaque + .4), 1 - seg(t, T.plaqueOut - .3, T.plaqueOut)), dy = (1 - eo(seg(t, T.plaque, T.plaque + .5))) * 16;
  const x = H.W / 2 - PW / 2, y = Y + dy;
  g.save(); g.globalAlpha = a;
  const gr = g.createLinearGradient(0, y, 0, y + PH); gr.addColorStop(0, '#3a6a44'); gr.addColorStop(.5, '#2e5a3a'); gr.addColorStop(1, '#1e4028');
  g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 24; g.fillStyle = gr; g.fillRect(x, y, PW, PH); g.shadowBlur = 0;
  g.strokeStyle = '#e8dcb0'; g.lineWidth = 6; g.strokeRect(x + 10, y + 10, PW - 20, PH - 20);
  for (const [cx, cy] of [[x + 30, y + 30], [x + PW - 30, y + 30], [x + 30, y + PH - 30], [x + PW - 30, y + PH - 30]]) { g.fillStyle = '#e8dcb0'; g.beginPath(); g.arc(cx, cy, 7, 0, Math.PI * 2); g.fill(); }
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#f4ecd0'; g.shadowColor = 'rgba(30,18,4,.9)'; g.shadowBlur = 4;
  g.font = '700 60px Cinzel'; H.spaced(g, PLAQUE[0], H.W / 2, y + 82, 4);
  g.font = 'italic 500 44px "EB Garamond"'; g.fillText(PLAQUE[1], H.W / 2, y + 160);
  g.restore();
}
export const extraTexts = t => t >= T.plaque && t < T.plaqueOut ? [{ id: 'plaque', text: PLAQUE.join(' '), x0: 160, y0: Y, x1: 920, y1: Y + PH }] : [];
