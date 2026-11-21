// the screen-time reminder, drawn as a phone notification card in the safe zone; the tap on "Remind me later"
import { POPS } from './story.js';
import { seg, eo, ss } from '/core/lib.js';
const X = 150, Y = 270, W = 780, Hh = 430;
export function extra(g, t, H, layer) {
  if (layer !== 'over') return;
  const P = POPS.find(p => t >= p.a && t < p.b); if (!P) return;
  const a = Math.min(P.a === 0 ? 1 : seg(t, P.a, P.a + .25), 1 - seg(t, P.b - .25, P.b)), dy = P.a === 0 ? 0 : (1 - eo(seg(t, P.a, P.a + .35))) * -30;
  const y = Y + dy;
  g.save(); g.globalAlpha = a;
  g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 30; g.fillStyle = 'rgba(246,244,250,.97)'; g.beginPath(); g.roundRect(X, y, W, Hh, 40); g.fill(); g.shadowBlur = 0;
  g.fillStyle = '#4a6ea8'; g.beginPath(); g.roundRect(X + 40, y + 36, 64, 64, 16); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(X + 56, y + 50); g.lineTo(X + 88, y + 50); g.lineTo(X + 72, y + 68); g.closePath(); g.moveTo(X + 56, y + 86); g.lineTo(X + 88, y + 86); g.lineTo(X + 72, y + 68); g.closePath(); g.fill(); g.textBaseline = 'middle';
  g.textAlign = 'left'; g.fillStyle = '#6f6a78'; g.font = '700 30px Figtree'; g.fillText('SCREEN TIME', X + 126, y + 56); g.fillText('now', X + W - 100, y + 56);
  g.fillStyle = '#1a1714'; g.font = '600 40px Figtree'; g.fillText("You've been scrolling for", X + 40, y + 150);
  g.font = '800 76px Figtree'; g.fillText(P.what + '.', X + 40, y + 230);
  g.font = '600 40px Figtree'; g.fillText('Take a break?', X + 40, y + 300);
  // buttons
  const by = y + Hh - 86, pressed = t >= P.tap && t < P.tap + .35;
  g.fillStyle = '#e6e2ec'; g.beginPath(); g.roundRect(X + 30, by, W / 2 - 45, 62, 31); g.fill();
  g.fillStyle = pressed ? '#9a94a8' : '#e6e2ec'; g.beginPath(); g.roundRect(X + W / 2 + 15, by, W / 2 - 45, 62, 31); g.fill();
  g.font = '700 32px Figtree'; g.textAlign = 'center'; g.fillStyle = '#3a6ad0'; g.fillText('Take a break', X + W / 4 - 7, by + 32);
  g.fillStyle = pressed ? '#ffffff' : '#4a4652'; g.fillText('Remind me later', X + 3 * W / 4 - 15, by + 32);
  // the tap: a ring where the thumb lands
  if (t >= P.tap - .15 && t < P.tap + .5) { const u = seg(t, P.tap - .15, P.tap + .5); g.strokeStyle = `rgba(60,60,80,${.7 * (1 - u)})`; g.lineWidth = 6; g.beginPath(); g.arc(X + 3 * W / 4 - 15, by + 31, 20 + 50 * ss(u), 0, Math.PI * 2); g.stroke(); }
  g.restore();
}
// the card's wording is the same every time; only the duration changes (that is what has to be read)
export const extraTexts = t => { const P = POPS.find(p => t >= p.a && t < p.b); return P ? [{ id: 'pop' + P.what, text: P.what, x0: X, y0: Y, x1: X + W, y1: Y + Hh }] : []; };
