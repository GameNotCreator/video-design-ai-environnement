// video-31 overlay extras: a short dark blink on each jump in time (the cut is the passage of years).
import { JUMPS } from './story.js';
import { seg, ss } from '/core/lib.js';

export function extra(g, t, H, layer) {
  if (layer !== 'under') return;
  let a = 0;
  for (const j of JUMPS) a = Math.max(a, ss(seg(t, j - .12, j)) * (1 - ss(seg(t, j, j + .3))));
  if (a > 0) { g.fillStyle = `rgba(4,4,8,${a})`; g.fillRect(0, 0, H.W, H.H); }
}
export const extraTexts = () => [];
