// video-29 "Overdue": timeline, single source of truth
export const DUR = 24.2;
export const TICKS = [3.4, 4.6, 5.8, 7.0];
export const T = { capOut: 3.0, pull: 2.4, knock: 8.0, enter: 8.2, txt: 15.8, txt2: 16.8, txtOut: 20.0, card: 20.0, logo: 20.1, line: 20.2, plat: 20.5 };
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = 'Due back in 2 weeks.';
export const COUNTER = [[0, 'MARCH 2026'], [3.4, '2031'], [4.6, '2040'], [5.8, '2053'], [7.0, '2066']];
export const CNT = { end: T.knock + .6, size: 104 };
export const stageAt = t => TICKS.filter(a => t >= a).length;   // 0..4
export const LINES = [
  { id: 'l1', who: 'LIBRARIAN', text: 'This book is 40 years overdue.', a: 9.2, b: 12.6 },
  { id: 'y1', who: 'YOU', text: '…I was gonna read it.', a: 12.7, b: 15.6 },
];
export const EVENTS = [{ t: T.knock, type: 'knock' }, { t: T.enter, type: 'door' }];
export const TXT1 = 'You never even\nopened it.', TXT2 = 'Stop scrolling.';
export const LINE = 'WeLockIn helps you focus\non what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: 'BYGz4ttihm8' };
