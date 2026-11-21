// Canvas2D overlay (1080x1920): RPG dialogue boxes, wrapped text cards, WeLockIn end card.
import * as ST from './story.js';
import { extra, extraTexts } from './extra.js';
const { T, LINES, TXT1, TXT2, LINE, PLAT, CAPTION, SERIES } = ST;
// optional big counter (clock, year, battery, countdown): COUNTER = [[t, text], ...]; CNT = { end, y0, y1, size, alert: [a, b] }
const COUNTER = ST.COUNTER || [], CNT = ST.CNT || {};
const clockAt = t => { let s = COUNTER.length ? COUNTER[0][1] : ''; for (const [a, v] of COUNTER) if (t >= a) s = v; return typeof s === 'function' ? s(t) : s; };
import { seg, ss, eo, eio, clamp, lerp } from '/core/lib.js';

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
  const typeA = L.instant ? -1 : L.a + .18, typeB = L.instant ? -.5 : typeA + Math.min(1.1, .05 * L.text.length + .2);
  const a = L.instant && t < L.a + .3 ? (t >= L.a ? 1 : 0) : Math.min(seg(t, L.a, L.a + .25), 1 - seg(t, L.b - .25, L.b)); if (a <= 0) return;
  const rise = L.instant ? 0 : (1 - eo(seg(t, L.a, L.a + .3))) * 14, { x, w, h } = BOX, y = BOX.y + rise;
  g.save(); g.globalAlpha = a;
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(14,18,34,.86)'); gr.addColorStop(1, 'rgba(6,8,18,.92)');
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.strokeStyle = 'rgba(214,190,130,.9)'; g.lineWidth = 3; g.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  g.strokeStyle = 'rgba(214,190,130,.35)'; g.lineWidth = 1; g.strokeRect(x + 9, y + 9, w - 18, h - 18);
  for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) diamond(g, cx, cy, 9, GOLD);
  g.font = '700 38px Cinzel'; const nw = g.measureText(L.who).width + 70;
  g.fillStyle = 'rgba(10,12,24,.96)'; g.fillRect(x + 36, y - 32, nw, 62); g.strokeStyle = 'rgba(214,190,130,.9)'; g.lineWidth = 2; g.strokeRect(x + 36, y - 32, nw, 62);
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
// —— frame-0 caption (the hook, already written) + series tag ——
function caption(g, t) {
  if (!CAPTION || t > T.capOut) return;
  const a = 1 - seg(t, T.capOut - .3, T.capOut);
  g.save(); g.globalAlpha = a; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const gr = g.createLinearGradient(0, 230, 0, 560); gr.addColorStop(0, 'rgba(4,6,12,0)'); gr.addColorStop(.3, 'rgba(4,6,12,.55)'); gr.addColorStop(.75, 'rgba(4,6,12,.55)'); gr.addColorStop(1, 'rgba(4,6,12,0)');
  g.fillStyle = gr; g.fillRect(0, 230, W, 330);
  if (SERIES) { g.font = '700 30px Cinzel'; g.fillStyle = GOLD; spaced(g, SERIES, W / 2, 330, 6); }
  g.font = 'italic 500 70px "EB Garamond"'; g.fillStyle = CREAM; g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 16;
  wrap(g, CAPTION, 860).forEach((l, i) => g.fillText(l, W / 2, 420 + i * 78)); g.restore();
}
// —— text cards: TXT1 in the italic serif, TXT2 in capitals, both wrapped inside the safe zone ——
function wrap(g, text, maxW) { if (text.includes('\n')) return text.split('\n'); const out = []; let line = ''; for (const w of text.split(' ')) { const tr = line ? line + ' ' + w : w; if (g.measureText(tr).width > maxW && line) { out.push(line); line = w; } else line = tr; } if (line) out.push(line); return out; }
function textCards(g, t) {
  if (t < T.txt - .5 || t > T.txtOut) return;
  const band = Math.min(seg(t, T.txt - .4, T.txt + .2), 1 - seg(t, T.txtOut - .4, T.txtOut));
  const gr = g.createLinearGradient(0, 400, 0, 1080); gr.addColorStop(0, 'rgba(4,6,12,0)'); gr.addColorStop(.3, `rgba(4,6,12,${.7 * band})`); gr.addColorStop(.7, `rgba(4,6,12,${.7 * band})`); gr.addColorStop(1, 'rgba(4,6,12,0)');
  g.fillStyle = gr; g.fillRect(0, 400, W, 680);
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const a1 = Math.min(seg(t, T.txt, T.txt + .4), 1 - seg(t, T.txtOut - .35, T.txtOut));
  let y = 580;
  g.font = 'italic 500 68px "EB Garamond"'; const L1 = wrap(g, TXT1, 860);
  if (a1 > 0) { g.save(); g.globalAlpha = a1; g.fillStyle = CREAM; g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 16; const dy = (1 - eo(seg(t, T.txt, T.txt + .5))) * 12; L1.forEach((l, i) => g.fillText(l, W / 2, y + dy + i * 78)); g.restore(); }
  y += L1.length * 78 - 20;
  const a2 = TXT2 ? Math.min(seg(t, T.txt2, T.txt2 + .4), 1 - seg(t, T.txtOut - .35, T.txtOut)) : 0;
  if (a2 > 0) { g.save(); g.globalAlpha = a2;
    g.strokeStyle = 'rgba(216,194,142,.85)'; g.lineWidth = 2; g.beginPath(); g.moveTo(W / 2 - 200, y); g.lineTo(W / 2 - 18, y); g.moveTo(W / 2 + 18, y); g.lineTo(W / 2 + 200, y); g.stroke(); diamond(g, W / 2, y, 8, GOLD);
    g.font = '700 58px Cinzel'; g.fillStyle = CREAM; g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 18; const L2 = wrap(g, TXT2.toUpperCase(), 800);
    L2.forEach((l, i) => spaced(g, l, W / 2, y + 92 + i * 72 + (1 - eo(seg(t, T.txt2, T.txt2 + .5))) * 12, 4)); g.restore(); }
}

// —— End card: cream plate, real logo, Download now, platforms ——
function endCard(g, t) {
  if (t < T.card) return;
  g.fillStyle = LOGO_BG; g.fillRect(0, 0, W, H);
  const la = ss(seg(t, T.logo, T.logo + .45)), ls = lerp(.97, 1, eo(seg(t, T.logo, T.logo + .6))), S = 640 * ls;
  g.save(); g.globalAlpha = la; g.imageSmoothingQuality = 'high'; g.drawImage(logo, W / 2 - S / 2, 740 - S / 2, S, S); g.restore();
  const pa = ss(seg(t, T.line, T.line + .35)), py = 1170 + (1 - eo(seg(t, T.line, T.line + .45))) * 12;
  if (pa > 0) { g.save(); g.globalAlpha = pa; g.font = '800 52px Figtree'; g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle';
    wrap(g, LINE, 860).forEach((l, i) => g.fillText(l, W / 2, py + i * 66)); g.restore(); }
  const qa = ss(seg(t, T.plat, T.plat + .35)), qy = 1360;
  if (qa > 0) { g.save(); g.globalAlpha = qa; g.font = '700 40px Figtree'; const tw = g.measureText(PLAT).width, pw = tw + 120, ph = 96;
    g.fillStyle = INK; g.beginPath(); g.roundRect(W / 2 - pw / 2, qy - ph / 2, pw, ph, ph / 2); g.fill();
    g.fillStyle = RED; g.beginPath(); g.arc(W / 2 - pw / 2 + 46, qy, 9, 0, Math.PI * 2); g.fill();
    g.fillStyle = CREAM; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(PLAT, W / 2 - pw / 2 + 74, qy + 2); g.restore(); }
  const fin = seg(t, T.card, T.card + .3); if (fin < 1) { g.fillStyle = `rgba(0,0,0,${1 - ss(fin)})`; g.fillRect(0, 0, W, H); }
}

// —— the clock: the night jumps forward (diegetic time, readable without sound) ——
const CLK_Y = CNT.y0 ?? 620, CLK_Y1 = CNT.y1 ?? 380, clockOn = t => COUNTER.length > 0 && t >= COUNTER[0][0] && t < (CNT.end ?? T.txt - .2);
const cntY = t => CAPTION ? lerp(CLK_Y, CLK_Y1, eio(seg(t, T.capOut - .3, T.capOut + .3))) : CLK_Y1;
function clock(g, t) {
  if (!clockOn(t)) return;
  let last = 0; for (const [a] of COUNTER) if (t >= a) last = a;
  const pop = last > COUNTER[0][0] ? 1 - eo(seg(t, last, last + .25)) : 0, ring = CNT.alert && t >= CNT.alert[0] && t < CNT.alert[1];
  const end = CNT.end ?? T.txt - .2, c0 = COUNTER[0][0], fade = Math.min(1 - seg(t, end - .4, end), c0 > 0 ? seg(t, c0, c0 + .3) : 1);
  const CY = cntY(t), size = CNT.size ?? 132;
  g.save(); g.globalAlpha = fade; g.textAlign = 'center'; g.textBaseline = 'middle';
  const gr = g.createRadialGradient(W / 2, CY, 20, W / 2, CY, 360); gr.addColorStop(0, 'rgba(4,6,12,.5)'); gr.addColorStop(1, 'rgba(4,6,12,0)'); g.fillStyle = gr; g.fillRect(W / 2 - 380, CY - 140, 760, 280);
  g.font = `700 ${Math.round(size * (1 + .06 * pop))}px Cinzel`;
  g.fillStyle = ring ? (Math.floor((t - CNT.alert[0]) * 4) % 2 ? '#ffd27a' : '#ff9a3c') : CREAM;
  g.shadowColor = ring ? 'rgba(255,140,40,.8)' : 'rgba(0,0,0,.7)'; g.shadowBlur = ring ? 30 : 16;
  spaced(g, clockAt(t), W / 2, CY, size > 100 ? 10 : 6); g.restore();
}

const HELP = { W, H, spaced, wrap, diamond, CREAM, GOLD, INK, PAPER, GREY, RED };
export function drawOverlay(g, t) {
  g.clearRect(0, 0, W, H);
  extra(g, t, HELP, 'under'); clock(g, t); dialogue(g, t); caption(g, t); extra(g, t, HELP, 'over'); textCards(g, t); endCard(g, t);
}

// every text on screen at t (for readcheck): full strings from their first visible frame
export function texts(t) {
  const out = [...extraTexts(t)];
  if (clockOn(t)) out.push({ id: 'clk' + clockAt(t), text: clockAt(t), x0: 140, y0: cntY(t) - 80, x1: 940, y1: cntY(t) + 80, pass: true });
  if (CAPTION && t < T.capOut) out.push({ id: 'cap', text: CAPTION, x0: 110, y0: 360, x1: 970, y1: 540 });
  for (const L of LINES) if (t >= L.a && t < L.b) out.push({ id: L.id, text: L.text, x0: BOX.x, y0: BOX.y, x1: BOX.x + BOX.w, y1: BOX.y + BOX.h });
  if (t >= T.txt && t < T.txtOut) out.push({ id: 't1', text: TXT1, x0: 110, y0: 510, x1: 970, y1: 680 });
  if (TXT2 && t >= T.txt2 && t < T.txtOut) out.push({ id: 't2', text: TXT2, x0: 140, y0: 720, x1: 940, y1: 900 });
  if (t >= T.line) out.push({ id: 'line', text: LINE, x0: 160, y0: 1130, x1: 920, y1: 1270 });
  if (t >= T.plat) out.push({ id: 'pl', text: PLAT, x0: 150, y0: 1312, x1: 930, y1: 1408 });
  return out;
}
