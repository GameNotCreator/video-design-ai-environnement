// the impact: everything goes white, then black
import { T } from './story.js';
import { seg } from '/core/lib.js';
export function extra(g, t, H, layer) {
  if (layer !== 'under' || t < T.impact - .15 || t >= T.impact + .6) return;
  const w = seg(t, T.impact - .15, T.impact + .05), b = seg(t, T.impact + .35, T.impact + .6);
  g.fillStyle = `rgba(255,250,240,${w})`; g.fillRect(0, 0, H.W, H.H);
  if (b > 0) { g.fillStyle = `rgba(0,0,0,${b})`; g.fillRect(0, 0, H.W, H.H); }
}
export const extraTexts = () => [];
