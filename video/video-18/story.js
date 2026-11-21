// video-18 "1%": timeline, single source of truth
export const DUR = 22.8;
export const T = { capOut: 3.2, low: 8.4, dead: 9.6, up: 10.2, wide: 10.2, deer: 11.0, txt: 14.2, txt2: 15.2, txtOut: 18.6, card: 18.6, logo: 18.7, line: 18.8, plat: 19.1 };
export const SHOTS = [{ id: 'street', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = 'Just checking one thing.';
export const COUNTER = [[0, 'BATTERY 9%'], [3.2, 'BATTERY 6%'], [5.0, 'BATTERY 3%'], [6.8, 'BATTERY 2%'], [T.low, 'BATTERY 1%']];
export const CNT = { end: T.dead, size: 96, alert: [T.low, T.dead], y0: 560 };
export const LINES = [
  { id: 'y1', who: 'YOU', text: 'How long was I…', a: 11.2, b: 14.0 },
];
export const EVENTS = [{ t: T.dead, type: 'dead' }, { t: T.up, type: 'up' }, { t: T.deer, type: 'deer' }];
export const TXT1 = 'What did you miss\nwhile you were scrolling?', TXT2 = 'Stop scrolling.';
export const LINE = 'WeLockIn helps you focus\non what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: 'BYGz4ttihm8' };
