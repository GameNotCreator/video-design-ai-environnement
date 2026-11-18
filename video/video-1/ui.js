// Canvas2D overlay (1080x1920): inner-voice dialogue box, impact flash/black, text cards, WeLockIn end card.
import { T, DLG, TXT1, TXT2 } from './story.js';
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
function dialogue(g, t) {
  const a = Math.min(seg(t, T.dlgIn, T.dlgIn + .3), 1 - seg(t, T.dlgOut - .3, T.dlgOut)); if (a <= 0) return;
  const rise = (1 - eo(seg(t, T.dlgIn, T.dlgIn + .3))) * 14, { x, w, h } = BOX, y = BOX.y + rise;
  g.save(); g.globalAlpha = a;
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(14,18,34,.86)'); gr.addColorStop(1, 'rgba(6,8,18,.92)');
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.strokeStyle = 'rgba(214,190,130,.9)'; g.lineWidth = 3; g.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  g.strokeStyle = 'rgba(214,190,130,.35)'; g.lineWidth = 1; g.strokeRect(x + 9, y + 9, w - 18, h - 18);
  for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) diamond(g, cx, cy, 9, GOLD);
  // name plate
  g.font = '700 30px Cinzel'; const nw = g.measureText(DLG.who).width + 56;
  g.fillStyle = 'rgba(10,12,24,.96)'; g.fillRect(x + 36, y - 26, nw, 50); g.strokeStyle = 'rgba(214,190,130,.9)'; g.lineWidth = 2; g.strokeRect(x + 36, y - 26, nw, 50);
  g.fillStyle = GOLD; g.textAlign = 'center'; g.textBaseline = 'middle'; spaced(g, DLG.who, x + 36 + nw / 2, y, 6);
  // typed text
  const n = Math.round(DLG.text.length * clamp((t - T.typeA) / (T.typeB - T.typeA)));
  g.font = 'italic 500 60px "EB Garamond"'; g.fillStyle = PAPER; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 6; g.fillText(DLG.text.slice(0, n), x + 52, y + 118); g.shadowBlur = 0;
  if (t > T.typeB && Math.floor((t - T.typeB) * 2.2) % 2 === 0) diamond(g, x + w - 44, y + h - 36 + Math.sin(t * 6) * 3, 9, GOLD);
  g.restore();
}

// —— Impact: headlights white-out, then black ——
function impact(g, t) {
  const white = Math.pow(seg(t, 8.12, 8.3), 1.6);
  if (t < T.impact && white > 0) { g.fillStyle = `rgba(255,250,240,${white * .92})`; g.fillRect(0, 0, W, H); }
  if (t >= T.impact && t < 8.5) { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); }
  if (t >= 8.5 && t < 9.3) { g.fillStyle = `rgba(0,0,0,${1 - ss(seg(t, 8.5, 9.3))})`; g.fillRect(0, 0, W, H); }
}

// —— Text cards over the phone ——
function card(g, text, t0, y, size) {
  const a = Math.min(seg(t, t0, t0 + .35), 1 - seg(t, T.txtOut - .35, T.txtOut));
  return a;
}
function textCards(g, t) {
  if (t < T.txt1 - .5 || t > T.txtOut) return;
  const band = Math.min(seg(t, T.txt1 - .4, T.txt1 + .2), 1 - seg(t, T.txtOut - .4, T.txtOut));
  const gr = g.createLinearGradient(0, 380, 0, 1000); gr.addColorStop(0, 'rgba(4,6,12,0)'); gr.addColorStop(.35, `rgba(4,6,12,${.55 * band})`); gr.addColorStop(.65, `rgba(4,6,12,${.55 * band})`); gr.addColorStop(1, 'rgba(4,6,12,0)');
  g.fillStyle = gr; g.fillRect(0, 380, W, 620);
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const a1 = Math.min(seg(t, T.txt1, T.txt1 + .35), 1 - seg(t, T.txtOut - .35, T.txtOut));
  if (a1 > 0) {
    g.save(); g.globalAlpha = a1; g.font = '700 88px Cinzel'; g.fillStyle = CREAM; g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 18;
    spaced(g, TXT1.toUpperCase(), W / 2, 640 + (1 - eo(seg(t, T.txt1, T.txt1 + .45))) * 12, 7); g.restore();
  }
  const a2 = Math.min(seg(t, T.txt2, T.txt2 + .35), 1 - seg(t, T.txtOut - .35, T.txtOut));
  if (a2 > 0) {
    g.save(); g.globalAlpha = a2;
    g.strokeStyle = 'rgba(216,194,142,.85)'; g.lineWidth = 2; g.beginPath(); g.moveTo(W / 2 - 200, 712); g.lineTo(W / 2 - 18, 712); g.moveTo(W / 2 + 18, 712); g.lineTo(W / 2 + 200, 712); g.stroke(); diamond(g, W / 2, 712, 8, GOLD);
    g.font = 'italic 500 78px "EB Garamond"'; g.fillStyle = CREAM; g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 16;
    g.fillText(TXT2, W / 2, 820 + (1 - eo(seg(t, T.txt2, T.txt2 + .45))) * 12); g.restore();
  }
}

// —— End card: cream plate, real logo, Download now, platforms ——
function endCard(g, t) {
  if (t < T.card) return;
  g.fillStyle = LOGO_BG; g.fillRect(0, 0, W, H);
  const la = ss(seg(t, T.logo, T.logo + .45)), ls = lerp(.97, 1, eo(seg(t, T.logo, T.logo + .6))), S = 640 * ls;
  g.save(); g.globalAlpha = la; g.imageSmoothingQuality = 'high'; g.drawImage(logo, W / 2 - S / 2, 760 - S / 2, S, S); g.restore();
  const pa = ss(seg(t, T.pill, T.pill + .35)), py = 1170 + (1 - eo(seg(t, T.pill, T.pill + .45))) * 14;
  if (pa > 0) {
    g.save(); g.globalAlpha = pa; g.font = '800 58px Figtree'; const tw = g.measureText('Download now').width, pw = tw + 150, ph = 116;
    g.fillStyle = INK; g.beginPath(); g.roundRect(W / 2 - pw / 2, py - ph / 2, pw, ph, ph / 2); g.fill();
    g.fillStyle = RED; g.beginPath(); g.arc(W / 2 - pw / 2 + 58, py, 10, 0, Math.PI * 2); g.fill();
    g.fillStyle = CREAM; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('Download now', W / 2 - pw / 2 + 88, py + 2); g.restore();
  }
  const qa = ss(seg(t, T.plat, T.plat + .35));
  if (qa > 0) { g.save(); g.globalAlpha = qa; g.font = '600 46px Figtree'; g.fillStyle = GREY; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('App Store · macOS · Windows', W / 2, 1310); g.restore(); }
  const fin = seg(t, T.card, T.card + .3); if (fin < 1) { g.fillStyle = `rgba(0,0,0,${1 - ss(fin)})`; g.fillRect(0, 0, W, H); }
}

export function drawOverlay(g, t) {
  g.clearRect(0, 0, W, H);
  dialogue(g, t); impact(g, t); textCards(g, t); endCard(g, t);
}

// every text on screen at t (for readcheck): full strings from their first visible frame
export function texts(t) {
  const out = [];
  if (t >= T.dlgIn && t < T.dlgOut) out.push({ id: 'dlg', text: DLG.text, x0: BOX.x, y0: BOX.y, x1: BOX.x + BOX.w, y1: BOX.y + BOX.h });
  if (t >= T.txt1 && t < T.txtOut) out.push({ id: 't1', text: TXT1, x0: 120, y0: 560, x1: 960, y1: 670 });
  if (t >= T.txt2 && t < T.txtOut) out.push({ id: 't2', text: TXT2, x0: 140, y0: 740, x1: 940, y1: 840 });
  if (t >= T.pill) out.push({ id: 'dl', text: 'Download now', x0: 260, y0: 1110, x1: 820, y1: 1230 });
  if (t >= T.plat) out.push({ id: 'pl', text: 'App Store · macOS · Windows', x0: 200, y0: 1280, x1: 880, y1: 1340 });
  return out;
}
