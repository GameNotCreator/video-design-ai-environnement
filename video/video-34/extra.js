// video-34 overlay extras: the WeLockIn lock card on the lower floor (padlock, "Verrouillé", the timer counting down),
// and the two marked papers on results day.
import { T, EN } from './story.js';
import { seg, ss, eo } from '/core/lib.js';

export const LOCK = { x: 70, y: 1060, w: 400, h: 160 };
export const GRADES = [{ t: T.grades, x: 290, y: 560, n: EN ? 'F' : '6', rot: -.06 }, { t: T.gradeB, x: 290, y: 1250, n: EN ? 'A' : '16', rot: .05 }]
const OUT = EN ? '' : '/20', LOCKED = EN ? 'Locked' : 'Verrouillé';;
const timer = t => { const s = Math.max(0, 7200 - Math.floor((t - T.lock) * 1)), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, c = s % 60; return `${h}:${String(m).padStart(2, '0')}:${String(c).padStart(2, '0')}`; };

function padlock(g, x, y, s, col) {
  g.strokeStyle = col; g.lineWidth = s * .16; g.beginPath(); g.arc(x, y - s * .2, s * .32, Math.PI, 0); g.stroke();
  g.fillStyle = col; g.beginPath(); g.roundRect(x - s * .5, y - s * .2, s, s * .78, s * .12); g.fill();
  g.fillStyle = 'rgba(16,18,28,1)'; g.beginPath(); g.arc(x, y + s * .14, s * .1, 0, Math.PI * 2); g.fill(); g.fillRect(x - s * .04, y + s * .14, s * .08, s * .22);
}
export function extra(g, t, H, layer) {
  if (layer !== 'over') return;
  // the lock card (lower floor)
  if (t >= T.lock && t < T.lockEnd) {
    const a = Math.min(ss(seg(t, T.lock, T.lock + .2)), 1 - ss(seg(t, T.lockEnd - .3, T.lockEnd))), dy = (1 - eo(seg(t, T.lock, T.lock + .3))) * 12, { x, y, w, h } = LOCK;
    g.save(); g.globalAlpha = a; g.translate(0, dy);
    g.fillStyle = 'rgba(16,18,28,.92)'; g.beginPath(); g.roundRect(x, y, w, h, 26); g.fill();
    g.strokeStyle = 'rgba(214,190,130,.75)'; g.lineWidth = 2; g.stroke();
    padlock(g, x + 78, y + h / 2, 70, H.CREAM);
    g.fillStyle = H.CREAM; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.font = '700 40px Figtree'; g.fillText(LOCKED, x + 145, y + 66);
    g.font = '800 56px Figtree'; g.fillText(timer(t), x + 145, y + 128);
    g.restore();
  }
  // the marked papers
  for (const G of GRADES) {
    if (t < G.t || t >= T.end) continue;
    const a = Math.min(ss(seg(t, G.t, G.t + .2)), 1 - ss(seg(t, T.end - .3, T.end))), k = eo(seg(t, G.t, G.t + .35));
    g.save(); g.globalAlpha = a; g.translate(G.x, G.y + (1 - k) * 30); g.rotate(G.rot);
    g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 18; g.fillStyle = '#f2ecdc'; g.fillRect(-140, -110, 280, 220); g.shadowBlur = 0;
    g.strokeStyle = 'rgba(80,90,120,.35)'; g.lineWidth = 2; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-110, -70 + i * 30); g.lineTo(110, -70 + i * 30); g.stroke(); }
    g.fillStyle = '#1e2a5a'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.font = 'italic 500 120px "EB Garamond"'; const nw = g.measureText(G.n).width; g.fillText(G.n, OUT ? -30 : 0, 40);
    if (OUT) { g.font = 'italic 500 60px "EB Garamond"'; g.fillText(OUT, -30 + nw / 2 + 50, 40); }
    g.strokeStyle = '#1e2a5a'; g.lineWidth = 5; g.beginPath(); g.moveTo(-110, 64); g.quadraticCurveTo(0, 80, 110, 58); g.stroke();
    g.restore();
  }
}
export const extraTexts = t => {
  const out = [];
  if (t >= T.lock && t < T.lockEnd) { out.push({ id: 'lock', text: LOCKED, x0: LOCK.x, y0: LOCK.y, x1: LOCK.x + LOCK.w, y1: LOCK.y + 80 }); out.push({ id: 'tm' + timer(t), text: timer(t), x0: LOCK.x, y0: LOCK.y + 80, x1: LOCK.x + LOCK.w, y1: LOCK.y + LOCK.h, pass: true }); }
  for (const G of GRADES) if (t >= G.t && t < T.end) out.push({ id: 'g' + G.n, text: G.n + OUT, x0: G.x - 140, y0: G.y - 110, x1: G.x + 140, y1: G.y + 110 });
  return out;
};
