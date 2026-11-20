// video-11 "She said yes": timeline, single source of truth
export const DUR = 24.2;
export const T = { capOut: 0, waiter: 5.6, stand: 6.4, leave: 12.8, bill: 14.6, lookUp: 15.0, txt: 15.4, txt2: 16.4, txtOut: 19.6, card: 19.6, logo: 19.7, line: 19.9, plat: 20.4 };
export const SHOTS = [{ id: 'dinner', a: 0, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = '';
export const LINES = [
  { id: 'h1', who: 'HER', text: 'Will you marry me?', a: 0, b: 2.9, instant: true },
  { id: 'y1', who: 'YOU', text: 'Hold on, one sec.', a: 3.0, b: 5.7 },
  { id: 'w1', who: 'WAITER', text: 'Are you okay?', a: 6.0, b: 8.5 },
  { id: 'h2', who: 'HER', text: '…Will you?', a: 8.7, b: 10.9 },
  { id: 'w2', who: 'WAITER', text: 'Yes.', a: 11.0, b: 12.8 },
];
export const TXT1 = 'Some moments\nonly ask once.', TXT2 = 'Look up.';
export const LINE = 'WeLockIn helps you focus\non what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: 'kn5HyDC8q7c' };
