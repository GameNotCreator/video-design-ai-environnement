// video-45 overlay extras: the WeLockIn lock card on the lower floor (padlock, "Verrouillé", the timer counting down),
// and the group photo over each floor at the end (three friends upstairs, four with him downstairs).
import { T, EN } from './story.js';
import { seg, ss, eo } from '/core/lib.js';

export const LOCK = { x: 70, y: 1060, w: 400, h: 160 };
export const GRADES = [];   // no marked papers in this episode
const OUT = '', LOCKED = EN ? 'Locked' : 'Verrouillé';
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
  // the group photo, over each floor: three friends upstairs, four with him (red) downstairs
  if (t >= T.verdict + .1 && t < T.end) {
    const a = Math.min(ss(seg(t, T.verdict + .1, T.verdict + .4)), 1 - ss(seg(t, T.end - .3, T.end))), k = eo(seg(t, T.verdict + .1, T.verdict + .5));
    for (const [y0, people, rot] of [[540, ['mustard', null, 'teal', 'green'], -.05], [1130, ['mustard', 'red', 'teal', 'green'], .04]]) {
      g.save(); g.globalAlpha = a; g.translate(600, y0 + (1 - k) * 24); g.rotate(rot); g.scale(1.3, 1.3);
      g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 20; g.fillStyle = '#f2ecdc'; g.fillRect(-160, -120, 320, 250); g.shadowBlur = 0;
      g.fillStyle = '#2a2034'; g.fillRect(-140, -100, 280, 180);
      for (let i = 0; i < 9; i++) { g.fillStyle = ['#ffd890', '#ffb870', '#fff0c0'][i % 3]; g.fillRect(-128 + i * 32, -90 + (i % 2) * 6, 6, 6); }
      const C = { mustard: '#b89030', teal: '#2e7a86', green: '#3e6e4e', red: '#c41919' }, H = { mustard: '#5a3e2c', teal: '#c2a058', green: '#1f1619', red: '#1f1619' };
      people.forEach((c, i) => { if (!c) return; const x = -96 + i * 64; g.fillStyle = C[c]; g.fillRect(x - 20, 0, 40, 80); g.fillStyle = '#e8b493'; g.fillRect(x - 14, -36, 28, 30); g.fillStyle = H[c]; g.fillRect(x - 16, -42, 32, 12); g.fillStyle = '#1a1016'; g.fillRect(x - 7, -24, 4, 4); g.fillRect(x + 4, -24, 4, 4); g.fillRect(x - 5, -14, 10, 3); });
      g.restore();
    }
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
