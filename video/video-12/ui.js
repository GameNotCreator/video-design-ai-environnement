// Canvas2D overlay (1080x1920): frame-0 hook caption, "TRY n OF 3" plates, RPG dialogue boxes, text cards, WeLockIn end card.
import { T, LINES, TRIES, TXT1, TXT2, LINE, PLAT, CAPTION, SERIES } from './story.js';
import { seg, ss, eo, clamp, lerp } from '/core/lib.js';

const W = 1080, H = 1920;
const LOGO_BG = '#F9EBDE', GOLD = '#d8c28e', PAPER = '#f6f0e2', CREAM = '#F5F0E8', INK = '#1A1714', RED = '#C8402F';
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
function wrap(g, text, maxW) { if (text.includes('\n')) return text.split('\n'); const out = []; let line = ''; for (const w of text.split(' ')) { const tr = line ? line + ' ' + w : w; if (g.measureText(tr).width > maxW && line) { out.push(line); line = w; } else line = tr; } if (line) out.push(line); return out; }
function plate(g, x, y, w, h) {   // dark translucent plate, thin gold border, corner diamonds
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(14,18,34,.86)'); gr.addColorStop(1, 'rgba(6,8,18,.92)');
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.strokeStyle = 'rgba(214,190,130,.9)'; g.lineWidth = 3; g.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  g.strokeStyle = 'rgba(214,190,130,.35)'; g.lineWidth = 1; g.strokeRect(x + 9, y + 9, w - 18, h - 18);
  for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) diamond(g, cx, cy, 9, GOLD);
}

// —— Dialogue box: the hero's lines, typed ——
const BOX = { x: 80, y: 1236, w: 920, h: 196 };
function box1(g, t, L) {
  const typeA = L.instant ? -1 : L.a + .12, typeB = L.instant ? -.5 : typeA + Math.min(1.2, .045 * L.text.length + .2);
  const a = L.instant && t < L.a + .3 ? (t >= L.a ? 1 - seg(t, L.b - .25, L.b) : 0) : Math.min(seg(t, L.a, L.a + .2), 1 - seg(t, L.b - .25, L.b)); if (a <= 0) return;
  const rise = L.instant ? 0 : (1 - eo(seg(t, L.a, L.a + .3))) * 14, { x, w, h } = BOX, y = BOX.y + rise;
  g.save(); g.globalAlpha = a; plate(g, x, y, w, h);
  g.font = '700 38px Cinzel'; const nw = g.measureText(L.who).width + 70;
  g.fillStyle = 'rgba(10,12,24,.96)'; g.fillRect(x + 36, y - 32, nw, 62); g.strokeStyle = 'rgba(214,190,130,.9)'; g.lineWidth = 2; g.strokeRect(x + 36, y - 32, nw, 62);
  g.fillStyle = GOLD; g.textAlign = 'center'; g.textBaseline = 'middle'; spaced(g, L.who, x + 36 + nw / 2, y, 6);
  const n = Math.round(L.text.length * clamp((t - typeA) / (typeB - typeA)));
  g.font = 'italic 500 62px "EB Garamond"'; g.fillStyle = PAPER; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 6; g.fillText(L.text.slice(0, n), x + 52, y + 120); g.shadowBlur = 0;
  if (t > typeB && Math.floor((t - typeB) * 2.2) % 2 === 0) diamond(g, x + w - 44, y + h - 36 + Math.sin(t * 6) * 3, 9, GOLD);
  g.restore();
}

// —— frame-0 caption: series tag + the hook, already written ——
function caption(g, t) {
  if (t > T.capOut) return;
  const a = 1 - seg(t, T.capOut - .3, T.capOut);
  g.save(); g.globalAlpha = a; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const gr = g.createLinearGradient(0, 220, 0, 600); gr.addColorStop(0, 'rgba(4,6,12,0)'); gr.addColorStop(.25, 'rgba(4,6,12,.6)'); gr.addColorStop(.8, 'rgba(4,6,12,.6)'); gr.addColorStop(1, 'rgba(4,6,12,0)');
  g.fillStyle = gr; g.fillRect(0, 220, W, 380);
  g.font = '700 34px Cinzel'; g.fillStyle = GOLD; spaced(g, SERIES, W / 2, 312, 6);
  g.strokeStyle = 'rgba(216,194,142,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(W / 2 - 170, 340); g.lineTo(W / 2 + 170, 340); g.stroke();
  g.font = 'italic 600 84px "EB Garamond"'; g.fillStyle = CREAM; g.shadowColor = 'rgba(0,0,0,.75)'; g.shadowBlur = 18;
  wrap(g, CAPTION, 860).forEach((l, i) => g.fillText(l, W / 2, 430 + i * 90)); g.restore();
}

// —— "TRY n OF 3" plate at the top; a gold strike-through the moment it fails ——
const TP = { x: 130, y: 236, w: 820, h: 176 };
function tryPlate(g, t) {
  for (const R of TRIES) {
    const a = Math.min(seg(t, R.a, R.a + .25), 1 - seg(t, R.b - .25, R.b)); if (a <= 0) continue;
    const dy = (1 - eo(seg(t, R.a, R.a + .3))) * -12;
    g.save(); g.globalAlpha = a; plate(g, TP.x, TP.y + dy, TP.w, TP.h);
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.font = '700 34px Cinzel'; g.fillStyle = GOLD; spaced(g, `TRY ${R.n} OF 3`, W / 2, TP.y + dy + 62, 7);
    const failed = seg(t, R.fail, R.fail + .3);
    g.font = 'italic 600 70px "EB Garamond"'; g.fillStyle = failed > 0 ? `rgba(245,240,232,${1 - .45 * failed})` : CREAM;
    g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 8; g.fillText(R.text, W / 2, TP.y + dy + 142); g.shadowBlur = 0;
    if (failed > 0) { const tw = g.measureText(R.text).width + 30, x0 = W / 2 - tw / 2; g.strokeStyle = GOLD; g.lineWidth = 5; g.beginPath(); g.moveTo(x0, TP.y + dy + 120); g.lineTo(x0 + tw * eo(failed), TP.y + dy + 120); g.stroke(); }
    g.restore();
  }
}

// —— text cards (after the last try): TXT1 in the italic serif, TXT2 in capitals ——
function textCards(g, t) {
  if (t < T.txt - .5 || t > T.txtOut) return;
  const band = Math.min(seg(t, T.txt - .4, T.txt + .2), 1 - seg(t, T.txtOut - .4, T.txtOut));
  const gr = g.createLinearGradient(0, 300, 0, 980); gr.addColorStop(0, 'rgba(4,6,12,0)'); gr.addColorStop(.3, `rgba(4,6,12,${.66 * band})`); gr.addColorStop(.7, `rgba(4,6,12,${.66 * band})`); gr.addColorStop(1, 'rgba(4,6,12,0)');
  g.fillStyle = gr; g.fillRect(0, 300, W, 680);
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const a1 = Math.min(seg(t, T.txt, T.txt + .4), 1 - seg(t, T.txtOut - .35, T.txtOut));
  let y = 500;
  g.font = 'italic 600 74px "EB Garamond"'; const L1 = wrap(g, TXT1, 860);
  if (a1 > 0) { g.save(); g.globalAlpha = a1; g.fillStyle = CREAM; g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 16; const dy = (1 - eo(seg(t, T.txt, T.txt + .5))) * 12; L1.forEach((l, i) => g.fillText(l, W / 2, y + dy + i * 84)); g.restore(); }
  y += L1.length * 84 - 14;
  const a2 = Math.min(seg(t, T.txt2, T.txt2 + .4), 1 - seg(t, T.txtOut - .35, T.txtOut));
  if (a2 > 0) { g.save(); g.globalAlpha = a2;
    g.strokeStyle = 'rgba(216,194,142,.85)'; g.lineWidth = 2; g.beginPath(); g.moveTo(W / 2 - 220, y); g.lineTo(W / 2 - 18, y); g.moveTo(W / 2 + 18, y); g.lineTo(W / 2 + 220, y); g.stroke(); diamond(g, W / 2, y, 8, GOLD);
    g.font = '700 76px Cinzel'; g.fillStyle = GOLD; g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 18;
    spaced(g, TXT2.toUpperCase(), W / 2, y + 104 + (1 - eo(seg(t, T.txt2, T.txt2 + .5))) * 12, 6); g.restore(); }
}

// —— End card: cream plate, the real logo, one line, the platforms ——
function endCard(g, t) {
  if (t < T.card) return;
  g.fillStyle = LOGO_BG; g.fillRect(0, 0, W, H);
  const la = ss(seg(t, T.logo, T.logo + .4)), ls = lerp(.97, 1, eo(seg(t, T.logo, T.logo + .6))), S = 640 * ls;
  g.save(); g.globalAlpha = la; g.imageSmoothingQuality = 'high'; g.drawImage(logo, W / 2 - S / 2, 720 - S / 2, S, S); g.restore();
  const pa = ss(seg(t, T.line, T.line + .35)), py = 1150 + (1 - eo(seg(t, T.line, T.line + .45))) * 12;
  if (pa > 0) { g.save(); g.globalAlpha = pa; g.font = '800 56px Figtree'; g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle';
    wrap(g, LINE, 880).forEach((l, i) => g.fillText(l, W / 2, py + i * 70)); g.restore(); }
  const qa = ss(seg(t, T.plat, T.plat + .35)), qy = 1370;
  if (qa > 0) { g.save(); g.globalAlpha = qa; g.font = '700 44px Figtree'; const tw = g.measureText(PLAT).width, pw = tw + 130, ph = 100;
    g.fillStyle = INK; g.beginPath(); g.roundRect(W / 2 - pw / 2, qy - ph / 2, pw, ph, ph / 2); g.fill();
    g.fillStyle = RED; g.beginPath(); g.arc(W / 2 - pw / 2 + 48, qy, 10, 0, Math.PI * 2); g.fill();
    g.fillStyle = CREAM; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(PLAT, W / 2 - pw / 2 + 80, qy + 2); g.restore(); }
  const fin = seg(t, T.card, T.card + .3); if (fin < 1) { g.fillStyle = `rgba(0,0,0,${1 - ss(fin)})`; g.fillRect(0, 0, W, H); }
}

export function drawOverlay(g, t) {
  g.clearRect(0, 0, W, H);
  for (const L of LINES) box1(g, t, L);
  caption(g, t); tryPlate(g, t); textCards(g, t); endCard(g, t);
}

// every text on screen at t (for readcheck): full strings from their first visible frame
export function texts(t) {
  const out = [];
  if (t < T.capOut) out.push({ id: 'series', text: SERIES, x0: 200, y0: 280, x1: 880, y1: 330 }, { id: 'cap', text: CAPTION, x0: 110, y0: 360, x1: 970, y1: 560 });
  for (const R of TRIES) if (t >= R.a && t < R.b) out.push({ id: 'try' + R.n, text: `TRY ${R.n} OF 3 ${R.text}`, x0: TP.x, y0: TP.y, x1: TP.x + TP.w, y1: TP.y + TP.h });
  for (const L of LINES) if (t >= L.a && t < L.b) out.push({ id: L.id, text: L.text, x0: BOX.x, y0: BOX.y, x1: BOX.x + BOX.w, y1: BOX.y + BOX.h });
  if (t >= T.txt && t < T.txtOut) out.push({ id: 't1', text: TXT1, x0: 110, y0: 420, x1: 970, y1: 620 });
  if (t >= T.txt2 && t < T.txtOut) out.push({ id: 't2', text: TXT2, x0: 140, y0: 660, x1: 940, y1: 760 });
  if (t >= T.line) out.push({ id: 'line', text: LINE, x0: 140, y0: 1110, x1: 940, y1: 1260 });
  if (t >= T.plat) out.push({ id: 'pl', text: PLAT, x0: 180, y0: 1320, x1: 900, y1: 1420 });
  return out;
}
