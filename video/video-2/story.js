// video-2 timeline: single source of truth for picture, overlay, events and mix
import { clamp, ss, eio } from '/core/lib.js';

export const DUR = 28.4;
export const T = {
  dlgIn: .25, typeA: .45, typeB: 1.35, dlgOut: 3.3,
  years: 2.8, drop: 4.6, old: 15.0, nod: 15.25, die: 15.76, land: 16.2, ping: 16.9, dark: 17.6,
  txt1: 18.0, txt2: 19.1, txtOut: 23.0,
  card: 23.0, logo: 23.2, line: 23.6, plat: 24.2,
};
export const SHOTS = [
  { id: 'room', a: 0, b: T.card },
  { id: 'card', a: T.card, b: DUR },
];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];

// age 19 → 84 between T.years and T.old (eased), then stays
export const AGE0 = 19, AGE1 = 84;
export const ageAt = t => AGE0 + (AGE1 - AGE0) * eio(clamp((t - T.years) / (T.old - T.years)));
export const STAGES = [19, 27, 38, 52, 66, 79];
export const stageAt = t => { const a = ageAt(t); let s = 0; STAGES.forEach((v, i) => { if (a >= v) s = i; }); return s; };

// day cycles: rate (cycles/s) rises at the drop, falls back to zero at T.old, landing on midnight
function rate(t) {
  if (t < T.years) return .03;
  if (t < T.drop) return .03 + .35 * ss((t - T.years) / (T.drop - T.years));
  if (t < T.old - 1.4) return .38 + .82 * ss((t - T.drop) / 2.2);
  return 1.2 * (1 - ss((t - (T.old - 1.4)) / 1.4));
}
const STEP = .002, N = Math.ceil(DUR / STEP) + 2, CUM = new Float64Array(N);
for (let i = 1; i < N; i++) CUM[i] = CUM[i - 1] + rate((i - .5) * STEP) * STEP;
const cyc = t => { const f = clamp(t, 0, DUR) / STEP, i = Math.floor(f); return CUM[i] + (CUM[Math.min(N - 1, i + 1)] - CUM[i]) * (f - i); };
const P0 = .64, CE = cyc(T.old), SC = (Math.round(CE + P0) - P0) / CE;   // start late afternoon, land exactly on midnight at T.old
export const phaseAt = t => (P0 + SC * cyc(t)) % 1;      // 0 = midnight, .5 = noon
export const cyclesAt = t => SC * cyc(t);
export const sunElev = t => -Math.cos(2 * Math.PI * phaseAt(t));   // -1 midnight … 1 noon

export const DLG = { who: 'YOU', text: 'Just five more minutes.' };
export const TXT1 = 'Stop scrolling.', TXT2 = 'Do something with your life.';
export const LINE = 'WeLockIn helps you focus on what matters.', PLAT = 'Available on iOS · Windows · macOS';

// music edit (see TREATMENT.md cue map)
export const MUSIC = { file: 'BYGz4ttihm8', offset: 9.8, drop: 14.40, stopTrack: 25.56, outroAt: 18.0 };
