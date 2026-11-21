// Canvas2D overlay (1080x1920), v2 (almost silent): frame-0 hook caption, three try pictograms (crossed out as each fails),
// one sentence at the end, the WeLockIn end card. No dialogue, no voice.
import { T, TRIES, TXT1, PLAT, CAPTION, SERIES } from './story.js';
import { seg, ss, eo, clamp, lerp } from '/core/lib.js';

const W = 1080, H = 1920;
const LOGO_BG = '#F9EBDE', GOLD = '#d8c28e', CREAM = '#F5F0E8', INK = '#1A1714', RED = '#C8402F';
let logo = null;
export async function overlayReady() {
  await Promise.all([document.fonts.load('700 80px Cinzel'), document.fonts.load('italic 600 80px "EB Garamond"'), document.fonts.load('700 44px Figtree')]);
  await document.fonts.ready;
  logo = new Image(); logo.src = 'assets/logo-mascot.png'; await logo.decode();
}
function spaced(g, text, x, y, track) {
  const ws = [...text].map(ch => g.measureText(ch).width), tot = ws.reduce((a, b) => a + b, 0) + track * (ws.length - 1);
  let cx = x - tot / 2; [...text].forEach((ch, i) => { g.fillText(ch, cx + ws[i] / 2, y); cx += ws[i] + track; });
}
function diamond(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r, y); g.lineTo(x, y + r); g.lineTo(x - r, y); g.closePath(); g.fill(); }
function plate(g, x, y, w, h) {
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(14,18,34,.84)'); gr.addColorStop(1, 'rgba(6,8,18,.9)');
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.strokeStyle = 'rgba(214,190,130,.9)'; g.lineWidth = 3; g.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  g.strokeStyle = 'rgba(214,190,130,.35)'; g.lineWidth = 1; g.strokeRect(x + 9, y + 9, w - 18, h - 18);
  for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) diamond(g, cx, cy, 9, GOLD);
}

// —— frame-0 caption: series tag + the hook, already written ——
function caption(g, t) {
  if (t > T.capOut) return;
  const a = 1 - seg(t, T.capOut - .3, T.capOut);
  g.save(); g.globalAlpha = a; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const gr = g.createLinearGradient(0, 220, 0, 600); gr.addColorStop(0, 'rgba(4,6,12,0)'); gr.addColorStop(.25, 'rgba(4,6,12,.62)'); gr.addColorStop(.8, 'rgba(4,6,12,.62)'); gr.addColorStop(1, 'rgba(4,6,12,0)');
  g.fillStyle = gr; g.fillRect(0, 220, W, 380);
  g.font = '700 34px Cinzel'; g.fillStyle = GOLD; spaced(g, SERIES, W / 2, 312, 6);
  g.strokeStyle = 'rgba(216,194,142,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(W / 2 - 170, 340); g.lineTo(W / 2 + 170, 340); g.stroke();
  g.font = 'italic 600 84px "EB Garamond"'; g.fillStyle = CREAM; g.shadowColor = 'rgba(0,0,0,.75)'; g.shadowBlur = 18;
  CAPTION.split('\n').forEach((l, i) => g.fillText(l, W / 2, 430 + i * 90)); g.restore();
}

// —— the three tries as pixel pictograms on one plate: the current one lit, a failed one crossed out in gold ——
function icon(g, kind, cx, cy, s, col) {
  g.save(); g.translate(cx, cy); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = s * .11; g.lineCap = 'square'; g.lineJoin = 'miter';
  if (kind === 'restart') { g.beginPath(); g.arc(0, 0, s * .32, -Math.PI * .35, Math.PI * 1.45); g.stroke(); g.beginPath(); g.moveTo(s * .14, -s * .42); g.lineTo(s * .34, -s * .26); g.lineTo(s * .1, -s * .14); g.closePath(); g.fill(); }
  if (kind === 'trash') { g.fillRect(-s * .32, -s * .3, s * .64, s * .08); g.fillRect(-s * .1, -s * .38, s * .2, s * .08); g.strokeRect(-s * .24, -s * .18, s * .48, s * .52); for (const x of [-.08, .08]) g.fillRect(s * x - s * .025, -s * .1, s * .05, s * .36); }
  if (kind === 'laptop') { g.strokeRect(-s * .3, -s * .3, s * .6, s * .4); g.fillRect(-s * .42, s * .16, s * .84, s * .09); }
  g.restore();
}
const HUD = { y: 236, h: 170, w: 600 };
function hud(g, t) {
  const a = Math.min(seg(t, T.try1, T.try1 + .3), 1 - seg(t, T.hudOut - .3, T.hudOut)); if (a <= 0) return;
  const x = (W - HUD.w) / 2, y = HUD.y + (1 - eo(seg(t, T.try1, T.try1 + .35))) * -12;
  g.save(); g.globalAlpha = a; plate(g, x, y, HUD.w, HUD.h);
  TRIES.forEach((R, i) => {
    const cx = x + HUD.w * (i + .5) / 3, cy = y + HUD.h / 2 - 6, on = t >= R.a, failed = seg(t, R.fail, R.fail + .25), cur = on && t < R.fail + .6;
    const s = 96 * (cur ? 1 + .08 * (1 - eo(seg(t, R.a, R.a + .3))) : 1);
    icon(g, R.icon, cx, cy, s, on ? (failed > 0 ? `rgba(245,240,232,${1 - .55 * failed})` : CREAM) : 'rgba(245,240,232,.28)');
    if (cur && failed === 0) { g.fillStyle = GOLD; g.fillRect(cx - 34, y + HUD.h - 30, 68, 5); }
    if (failed > 0) { const r = 44 * eo(failed); g.strokeStyle = GOLD; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - r, cy - r); g.lineTo(cx + r, cy + r); g.moveTo(cx + r, cy - r); g.lineTo(cx - r, cy + r); g.stroke(); }
  });
  g.restore();
}

// —— the one sentence ——
function textCard(g, t) {
  if (t < T.txt - .5 || t > T.txtOut) return;
  const band = Math.min(seg(t, T.txt - .4, T.txt + .2), 1 - seg(t, T.txtOut - .4, T.txtOut));
  const gr = g.createLinearGradient(0, 300, 0, 820); gr.addColorStop(0, 'rgba(4,6,12,0)'); gr.addColorStop(.3, `rgba(4,6,12,${.6 * band})`); gr.addColorStop(.7, `rgba(4,6,12,${.6 * band})`); gr.addColorStop(1, 'rgba(4,6,12,0)');
  g.fillStyle = gr; g.fillRect(0, 300, W, 520);
  const a1 = Math.min(seg(t, T.txt, T.txt + .4), 1 - seg(t, T.txtOut - .35, T.txtOut)); if (a1 <= 0) return;
  g.save(); g.globalAlpha = a1; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.font = 'italic 600 88px "EB Garamond"'; g.fillStyle = CREAM; g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 16;
  const dy = (1 - eo(seg(t, T.txt, T.txt + .5))) * 12; TXT1.split('\n').forEach((l, i) => g.fillText(l, W / 2, 540 + dy + i * 96)); g.restore();
}

// —— End card: cream plate, the real logo, the platforms ——
function endCard(g, t) {
  if (t < T.card) return;
  g.fillStyle = LOGO_BG; g.fillRect(0, 0, W, H);
  const la = ss(seg(t, T.logo, T.logo + .4)), ls = lerp(.97, 1, eo(seg(t, T.logo, T.logo + .6))), S = 680 * ls;
  g.save(); g.globalAlpha = la; g.imageSmoothingQuality = 'high'; g.drawImage(logo, W / 2 - S / 2, 800 - S / 2, S, S); g.restore();
  const qa = ss(seg(t, T.plat, T.plat + .35)), qy = 1250;
  if (qa > 0) { g.save(); g.globalAlpha = qa; g.font = '700 48px Figtree'; const tw = g.measureText(PLAT).width, pw = tw + 136, ph = 108;
    g.fillStyle = INK; g.beginPath(); g.roundRect(W / 2 - pw / 2, qy - ph / 2, pw, ph, ph / 2); g.fill();
    g.fillStyle = RED; g.beginPath(); g.arc(W / 2 - pw / 2 + 50, qy, 11, 0, Math.PI * 2); g.fill();
    g.fillStyle = CREAM; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(PLAT, W / 2 - pw / 2 + 84, qy + 2); g.restore(); }
  const fin = seg(t, T.card, T.card + .3); if (fin < 1) { g.fillStyle = `rgba(0,0,0,${1 - ss(fin)})`; g.fillRect(0, 0, W, H); }
}

export function drawOverlay(g, t) { g.clearRect(0, 0, W, H); caption(g, t); hud(g, t); textCard(g, t); endCard(g, t); }

// every text on screen at t (for readcheck)
export function texts(t) {
  const out = [];
  if (t < T.capOut) out.push({ id: 'series', text: SERIES, x0: 200, y0: 280, x1: 880, y1: 330 }, { id: 'cap', text: CAPTION, x0: 110, y0: 360, x1: 970, y1: 560 });
  if (t >= T.txt && t < T.txtOut) out.push({ id: 't1', text: TXT1, x0: 110, y0: 460, x1: 970, y1: 660 });
  if (t >= T.plat) out.push({ id: 'pl', text: PLAT, x0: 170, y0: 1196, x1: 910, y1: 1304 });
  return out;
}
