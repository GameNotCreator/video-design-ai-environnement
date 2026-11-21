// video-25 "The elevator": timeline, single source of truth
export const DUR = 25.0;
// each stop: the floor, when the doors open and close, what is waiting outside
export const STOPS = [
  { floor: 22, a: 3.4, b: 4.9, set: 'grad' },
  { floor: 25, a: 5.4, b: 7.7, set: 'girl' },
  { floor: 30, a: 8.0, b: 9.4, set: 'altar' },
  { floor: 40, a: 9.8, b: 11.0, set: 'kid' },
  { floor: 60, a: 11.3, b: 12.2, set: 'friends' },
  { floor: 99, a: 12.8, b: 99, set: 'sky' },
];
export const T = { capOut: 3.4, last: 12.8, up: 14.0, txt: 15.8, txt2: 16.8, txtOut: 20.6, card: 20.6, logo: 20.7, line: 20.8, plat: 21.1 };
export const SHOTS = [{ id: 'lift', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = 'Every floor is\na year of your life.';
export const COUNTER = [[0, 'FLOOR 18'], [3.2, 'FLOOR 22'], [5.2, 'FLOOR 25'], [7.8, 'FLOOR 30'], [9.6, 'FLOOR 40'], [11.1, 'FLOOR 60'], [12.3, 'FLOOR 80'], [12.7, 'LAST FLOOR']];
export const CNT = { end: T.txt - .2, size: 100, y0: 640 };
export const ageAt = t => [0, 0, 1, 2, 3, 4, 5, 5][COUNTER.filter(([a]) => t >= a).length - 1];
export const doorsAt = t => { for (const s of STOPS) { if (t >= s.a && t < s.b) return Math.min(1, (t - s.a) / .45, (s.b - t) / .45); } return 0; };
export const setAt = t => { for (const s of STOPS) if (t >= s.a - .1 && t < s.b + .1) return s.set; return null; };
export const LINES = [
  { id: 'h1', who: 'HER', text: 'Coming?', a: 5.5, b: 7.6 },
  { id: 'e1', who: 'ELEVATOR', text: 'Last stop.', a: 13.2, b: 15.6 },
];
export const EVENTS = STOPS.map(s => ({ t: s.a, type: 'ding' })).concat(STOPS.filter(s => s.b < 90).map(s => ({ t: s.b - .45, type: 'close' })));
export const TXT1 = 'Life only goes up.\nYou missed every floor.', TXT2 = 'Stop scrolling.';
export const LINE = 'WeLockIn helps you focus\non what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: 'aQkfOkFvx2U' };
