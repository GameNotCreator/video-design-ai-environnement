// video-15 "The statue": timeline, single source of truth
export const DUR = 23.1;
export const T = { capOut: 3.2, kids: 5.9, carrot: 6.8, melt: 8.0, moss: 9.6, nest: 10.2, stone: 10.8, pigeons: 11.4, plaque: 12.2, plaqueOut: 15.2, txt: 15.2, txt2: 16.2, txtOut: 19.0, card: 19.0, logo: 19.1, line: 19.2, plat: 19.5 };
export const SHOTS = [{ id: 'park', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = 'He sat down for five minutes.';
export const COUNTER = [[0, 'SPRING 2026'], [3.2, 'SUMMER 2026'], [4.2, 'AUTUMN 2026'], [5.2, 'WINTER 2026'], [T.melt, 'SPRING 2027'], [T.moss, '2031'], [T.nest, '2038'], [T.stone, '2046'], [T.pigeons, '2059']];
export const CNT = { end: T.plaque, size: 92 };
// the park's season at t (the years jump through seasons too)
const SEAS = [[0, 'spring'], [3.2, 'summer'], [4.2, 'autumn'], [5.2, 'winter'], [T.melt, 'spring'], [T.moss, 'summer'], [T.nest, 'autumn'], [T.stone, 'spring'], [T.pigeons, 'summer']];
export const seasonAt = t => { let s = 'spring'; for (const [a, v] of SEAS) if (t >= a) s = v; return s; };
export const LINES = [
  { id: 'k1', who: 'KID', text: 'Is he… real?', a: 6.2, b: 8.6 },
];
export const PLAQUE = ['THE STUDENT', 'STILL SCROLLING'];
export const EVENTS = [{ t: T.carrot, type: 'pop' }, { t: T.melt, type: 'melt' }, { t: T.stone, type: 'stone' }, { t: T.plaque, type: 'plaque' }];
export const TXT1 = "Don't become part\nof the scenery.", TXT2 = 'Stop scrolling.';
export const LINE = 'WeLockIn helps you focus\non what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: '01qStKYB7ts' };
