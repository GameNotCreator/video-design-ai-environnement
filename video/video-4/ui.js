// Canvas2D overlay (1080x1920): year label, fades between Christmases, RPG dialogue boxes, text cards, end card.
import { T, LINES, TXT1, TXT2, LINE, PLAT, YEARS, yearAt } from './story.js';
import { seg, ss, eo, clamp, lerp } from '/core/lib.js';

const W = 1080, H = 1920;
const LOGO_BG = '#F9EBDE', GOLD = '#d8c28e', PAPER = '#f6f0e2', CREAM = '#F5F0E8', INK = '#1A1714', GREY = '#6F6759', RED = '#C8402F';
let logo = null;
export async function overlayReady() {
  await Promise.all([
    document.fonts.load('700 80px Cinzel'), document.fonts.load('500 30px Cinzel'),
    document.fonts.load('italic 500 56px "EB Garamond"'), document.fonts.load('800 56px Figtree'), document.fonts.load('600 44px Figtree'),
  ]);
  await document.fonts.ready;
  logo = new Image(); logo.src = 'assets/logo-mascot.png'; await logo.decode();
}

function spaced(g, text, x, y, track) {   // centred text with letter spacing
  const ws = [...text].map(ch => g.measureText(ch).width), tot = ws.reduce((a, b) => a + b, 0) + track * (ws.length - 1);
  let cx = x - tot / 2; [...text].forEach((ch, i) => { g.fillText(ch, cx + ws[i] / 2, y); cx += ws[i] + track; });
  return tot;
}
function diamond(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r, y); g.lineTo(x, y + r); g.lineTo(x - r, y); g.closePath(); g.fill(); }

// —— Dialogue box: the inner voice, typed ——
const BOX = { x: 80, y: 1236, w: 920, h: 196 };
function dialogue(g, t) { for (const L of LINES) box1(g, t, L); }
function box1(g, t, L) {
  const typeA = L.a + .18, typeB = typeA + Math.min(1.1, .05 * L.text.length + .2);
  const a = Math.min(seg(t, L.a, L.a + .25), 1 - seg(t, L.b - .25, L.b)); if (a <= 0) return;
  const rise = (1 - eo(seg(t, L.a, L.a + .3))) * 14, { x, w, h } = BOX, y = BOX.y + rise;
  g.save(); g.globalAlpha = a;
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(14,18,34,.86)'); gr.addColorStop(1, 'rgba(6,8,18,.92)');
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.strokeStyle = 'rgba(214,190,130,.9)'; g.lineWidth = 3; g.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  g.strokeStyle = 'rgba(214,190,130,.35)'; g.lineWidth = 1; g.strokeRect(x + 9, y + 9, w - 18, h - 18);
  for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) diamond(g, cx, cy, 9, GOLD);
  g.font = '700 30px Cinzel'; const nw = g.measureText(L.who).width + 56;
  g.fillStyle = 'rgba(10,12,24,.96)'; g.fillRect(x + 36, y - 26, nw, 50); g.strokeStyle = 'rgba(214,190,130,.9)'; g.lineWidth = 2; g.strokeRect(x + 36, y - 26, nw, 50);
  g.fillStyle = GOLD; g.textAlign = 'center'; g.textBaseline = 'middle'; spaced(g, L.who, x + 36 + nw / 2, y, 6);
  const n = Math.round(L.text.length * clamp((t - typeA) / (typeB - typeA)));
  g.font = 'italic 500 60px "EB Garamond"'; g.fillStyle = PAPER; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 6; g.fillText(L.text.slice(0, n), x + 52, y + 118); g.shadowBlur = 0;
  if (t > typeB && Math.floor((t - typeB) * 2.2) % 2 === 0) diamond(g, x + w - 44, y + h - 36 + Math.sin(t * 6) * 3, 9, GOLD);
  g.restore();
}

// —— Text cards over the dark room ——
function card(g, text, t0, y, size) {
  const a = Math.min(seg(t, t0, t0 + .35), 1 - seg(t, T.txtOut - .35, T.txtOut));
  return a;
}
// —— year label + fade to black between Christmases ——
function years(g, t) {
  const yi = yearAt(t); if (yi < 0) return;
  const Y = YEARS[yi], a = Math.min(seg(t, Y.a + .3, Y.a + .6), 1 - seg(t, Math.min(Y.b, T.txt) - .5, Math.min(Y.b, T.txt) - .2));
  if (a > 0) {
    g.save(); g.globalAlpha = a; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.fillStyle = 'rgba(8,10,20,.55)'; g.fillRect(70, 236, 420, 104); g.strokeStyle = 'rgba(214,190,130,.8)'; g.lineWidth = 2; g.strokeRect(71, 237, 418, 102);
    g.font = '500 28px Cinzel'; g.fillStyle = GOLD; let x = 96; for (const ch of 'CHRISTMAS') { g.fillText(ch, x, 280); x += g.measureText(ch).width + 6; }
    g.font = '700 64px Cinzel'; g.fillStyle = PAPER; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 10; g.fillText(String(Y.y), 96, 330); g.restore();
  }
  for (const b of [YEARS[0].b, YEARS[1].b, YEARS[2].b]) { const k = Math.max(0, 1 - Math.abs(t - b) / .35); if (k > 0) { g.fillStyle = `rgba(0,0,0,${Math.min(1, k * 1.4)})`; g.fillRect(0, 0, W, H); } }
}
function textCards(g, t) {
  if (t < T.txt - .5 || t > T.txtOut) return;
  const band = Math.min(seg(t, T.txt - .4, T.txt + .2), 1 - seg(t, T.txtOut - .4, T.txtOut));
  const gr = g.createLinearGradient(0, 420, 0, 1000); gr.addColorStop(0, 'rgba(4,6,12,0)'); gr.addColorStop(.35, `rgba(4,6,12,${.65 * band})`); gr.addColorStop(.65, `rgba(4,6,12,${.65 * band})`); gr.addColorStop(1, 'rgba(4,6,12,0)');
  g.fillStyle = gr; g.fillRect(0, 420, W, 580);
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const a1 = Math.min(seg(t, T.txt, T.txt + .4), 1 - seg(t, T.txtOut - .35, T.txtOut));
  if (a1 > 0) { g.save(); g.globalAlpha = a1; g.font = 'italic 500 66px "EB Garamond"'; g.fillStyle = CREAM; g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 16;
    const dy = (1 - eo(seg(t, T.txt, T.txt + .5))) * 12; g.fillText('Some people won\u2019t be there', W / 2, 600 + dy); g.fillText('next year.', W / 2, 676 + dy); g.restore(); }
  const a2 = Math.min(seg(t, T.txt2, T.txt2 + .4), 1 - seg(t, T.txtOut - .35, T.txtOut));
  if (a2 > 0) { g.save(); g.globalAlpha = a2;
    g.strokeStyle = 'rgba(216,194,142,.85)'; g.lineWidth = 2; g.beginPath(); g.moveTo(W / 2 - 200, 736); g.lineTo(W / 2 - 18, 736); g.moveTo(W / 2 + 18, 736); g.lineTo(W / 2 + 200, 736); g.stroke(); diamond(g, W / 2, 736, 8, GOLD);
    g.font = '700 78px Cinzel'; g.fillStyle = CREAM; g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 18; spaced(g, TXT2.toUpperCase(), W / 2, 840 + (1 - eo(seg(t, T.txt2, T.txt2 + .5))) * 12, 5); g.restore(); }
}

// —— End card: cream plate, real logo, Download now, platforms ——
function endCard(g, t) {
  if (t < T.card) return;
  g.fillStyle = LOGO_BG; g.fillRect(0, 0, W, H);
  const la = ss(seg(t, T.logo, T.logo + .45)), ls = lerp(.97, 1, eo(seg(t, T.logo, T.logo + .6))), S = 640 * ls;
  g.save(); g.globalAlpha = la; g.imageSmoothingQuality = 'high'; g.drawImage(logo, W / 2 - S / 2, 740 - S / 2, S, S); g.restore();
  const pa = ss(seg(t, T.line, T.line + .35)), py = 1170 + (1 - eo(seg(t, T.line, T.line + .45))) * 12;
  if (pa > 0) { g.save(); g.globalAlpha = pa; g.font = '800 52px Figtree'; g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('WeLockIn helps you focus', W / 2, py); g.fillText('on what matters.', W / 2, py + 66); g.restore(); }
  const qa = ss(seg(t, T.plat, T.plat + .35)), qy = 1360;
  if (qa > 0) { g.save(); g.globalAlpha = qa; g.font = '700 40px Figtree'; const tw = g.measureText(PLAT).width, pw = tw + 120, ph = 96;
    g.fillStyle = INK; g.beginPath(); g.roundRect(W / 2 - pw / 2, qy - ph / 2, pw, ph, ph / 2); g.fill();
    g.fillStyle = RED; g.beginPath(); g.arc(W / 2 - pw / 2 + 46, qy, 9, 0, Math.PI * 2); g.fill();
    g.fillStyle = CREAM; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(PLAT, W / 2 - pw / 2 + 74, qy + 2); g.restore(); }
  const fin = seg(t, T.card, T.card + .3); if (fin < 1) { g.fillStyle = `rgba(0,0,0,${1 - ss(fin)})`; g.fillRect(0, 0, W, H); }
}

export function drawOverlay(g, t) {
  g.clearRect(0, 0, W, H);
  dialogue(g, t); years(g, t); textCards(g, t); endCard(g, t);
}

// every text on screen at t (for readcheck): full strings from their first visible frame
export function texts(t) {
  const out = [];
  for (const L of LINES) if (t >= L.a && t < L.b) out.push({ id: L.id, text: L.text, x0: BOX.x, y0: BOX.y, x1: BOX.x + BOX.w, y1: BOX.y + BOX.h });
  const yi = yearAt(t); if (yi >= 0 && t < T.txt - .2) out.push({ id: 'y' + yi, text: 'CHRISTMAS ' + YEARS[yi].y, x0: 70, y0: 236, x1: 490, y1: 340 });
  if (t >= T.txt && t < T.txtOut) out.push({ id: 't1', text: TXT1, x0: 120, y0: 540, x1: 960, y1: 700 });
  if (t >= T.txt2 && t < T.txtOut) out.push({ id: 't2', text: TXT2, x0: 200, y0: 770, x1: 880, y1: 860 });
  if (t >= T.line) out.push({ id: 'line', text: LINE, x0: 160, y0: 1130, x1: 920, y1: 1270 });
  if (t >= T.plat) out.push({ id: 'pl', text: PLAT, x0: 150, y0: 1312, x1: 930, y1: 1408 });
  return out;
}
