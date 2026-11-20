// video-8 "Imagine if… #1: the pilot": timeline, single source of truth
export const DUR = 21.8;
export const T = { capOut: 3.5, cockpit: 2.4, alarm: 6.6, front: 11.4, impact: 12.6, txt: 13.0, txtOut: 17.2, card: 17.2, logo: 17.3, line: 17.5, plat: 18.0 };
export const SHOTS = [{ id: 'sky', a: 0, b: T.cockpit }, { id: 'cockpit', a: T.cockpit, b: T.impact }, { id: 'black', a: T.impact, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = 'IMAGINE IF · EP. 1', CAPTION = 'Your flight is in good hands.';
export const LINES = [
  { id: 'c1', who: 'CAPTAIN', text: 'Ha, look at this one.', a: 3.6, b: 6.5 },
  { id: 's1', who: 'SYSTEM', text: 'TERRAIN! PULL UP!', a: 6.6, b: 9.3 },
  { id: 'f1', who: 'CO-PILOT', text: 'One sec.', a: 9.4, b: 11.5 },
];
export const TXT1 = 'Imagine if they\nscrolled like you do.', TXT2 = '';
export const LINE = 'WeLockIn helps you focus\non what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: '01qStKYB7ts' };
