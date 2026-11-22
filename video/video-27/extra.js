// camera flashes: a white pop over the scene
import { EVENTS } from './story.js';
import { seg } from '/core/lib.js';
export function extra(g, t, H, layer) {
  if (layer !== 'under') return;
  for (const e of EVENTS) if (e.type === 'flash' && t >= e.t && t < e.t + .2) { g.fillStyle = `rgba(255,255,255,${.55 * (1 - seg(t, e.t, e.t + .2))})`; g.fillRect(0, 0, H.W, H.H); }
}
export const extraTexts = () => [];
