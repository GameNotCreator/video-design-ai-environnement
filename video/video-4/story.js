// video-4 "Next Christmas": timeline, single source of truth
export const DUR = 29.6;
export const YEARS = [
  { y: 2026, a: 0, b: 6.0 }, { y: 2027, a: 6.0, b: 11.6 }, { y: 2028, a: 11.6, b: 17.2 }, { y: 2029, a: 17.2, b: 24.6 },
];
export const yearAt = t => YEARS.findIndex(Y => t >= Y.a && t < Y.b);
export const T = { lookUp: 18.8, txt: 20.4, txt2: 21.6, txtOut: 24.6, card: 24.6, logo: 24.7, line: 25.1, plat: 25.7, silence: 17.2 };
export const SHOTS = [{ id: 'dinner', a: 0, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const LINES = [
  { id: 'g1', who: 'GRANDMA', text: "How's school, sweetheart?", a: .3, b: 3.75 },
  { id: 'y1', who: 'YOU', text: 'Mmh.', a: 3.85, b: 5.75 },
  { id: 'g2', who: 'GRANDMA', text: 'Will you show me your photos?', a: 6.45, b: 9.95 },
  { id: 'y2', who: 'YOU', text: 'Later.', a: 10.05, b: 11.6 },
  { id: 'g3', who: 'GRANDMA', text: 'I made your favourite pie.', a: 12.05, b: 15.4 },
  { id: 'y3', who: 'YOU', text: 'Mmh.', a: 15.5, b: 17.2 },
];
export const TXT1 = "Some people won't be there next year.", TXT2 = 'Put it down.';
export const LINE = 'WeLockIn helps you focus on what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: 'A9hzqHsocEA' };
