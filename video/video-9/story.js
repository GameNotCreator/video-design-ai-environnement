// video-9 "Imagine if… #2: the surgeon": timeline, single source of truth
export const DUR = 21.8;
export const T = { capOut: 3.5, alarm: 8.9, flat: 11.6, impact: 12.6, txt: 13.0, txtOut: 17.2, card: 17.2, logo: 17.3, line: 17.5, plat: 18.0 };
export const SHOTS = [{ id: 'or', a: 0, b: T.impact }, { id: 'black', a: T.impact, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = 'IMAGINE IF · EP. 2', CAPTION = "You're in good hands.";
export const LINES = [
  { id: 'n1', who: 'NURSE', text: 'Doctor?', a: 3.6, b: 5.6 },
  { id: 'd1', who: 'SURGEON', text: "Wait, this one's funny.", a: 5.7, b: 8.8 },
  { id: 'n2', who: 'NURSE', text: 'DOCTOR! His heart!', a: 8.9, b: 11.6 },
];
// heart rate shown on the monitor
export const hrAt = t => t < T.alarm ? 72 : t < T.flat ? Math.round(72 + 96 * Math.pow((t - T.alarm) / (T.flat - T.alarm), 1.4)) : 0;
export const TXT1 = 'Imagine if they\nscrolled like you do.', TXT2 = '';
export const LINE = 'WeLockIn helps you focus\non what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: '01qStKYB7ts' };
