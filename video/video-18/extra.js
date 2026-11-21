// the phone dies: a short dark beat before he looks up
import { T } from './story.js';
import { seg } from '/core/lib.js';
export function extra(g, t, H, layer) {
  if (layer !== 'under' || t < T.dead || t >= T.up + .5) return;
  const a = Math.min(seg(t, T.dead, T.dead + .12), 1 - seg(t, T.up, T.up + .5));
  g.fillStyle = `rgba(0,0,0,${.92 * a})`; g.fillRect(0, 0, H.W, H.H);
}
export const extraTexts = () => [];
