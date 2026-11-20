// video-6 "Watch again?": timeline, single source of truth
export const DUR = 28.2;
export const T = { impact: 13.3, meadow: 14.0, txt: 18.0, txtOut: 22.6, card: 22.6, logo: 22.7, line: 23.0, plat: 23.6 };
export const SHOTS = [{ id: 'sky', a: 0, b: T.impact }, { id: 'black', a: T.impact, b: T.meadow }, { id: 'meadow', a: T.meadow, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const LINES = [
  { id: 'i1', who: 'INSTRUCTOR', text: 'Look at that view!', a: .3, b: 3.05 },
  { id: 'y1', who: 'YOU', text: 'One sec, this video…', a: 3.15, b: 6.1 },
  { id: 'i2', who: 'INSTRUCTOR', text: 'PULL! PULL NOW!', a: 6.5, b: 9.1 },
  { id: 'y2', who: 'YOU', text: "lmao this guy didn't pull", a: 9.2, b: 12.5 },
];
// altitude shown on screen (m): 4000 → 0 at the impact, faster and faster
export const altAt = t => Math.max(0, Math.round(4000 * (1 - Math.pow(Math.min(1, t / T.impact), 1.7))));
export const TXT1 = "Some things can't wait\nfor the next video.", TXT2 = '';
export const LINE = 'WeLockIn locks your apps until the timer hits zero.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: 'Q_rAdk72b-k', offset: .5 };
