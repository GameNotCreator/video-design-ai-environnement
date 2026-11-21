// video-20 "Fetch": timeline, single source of truth
export const DUR = 23.6;
export const TICKS = [3.4, 6.0, 8.4, 10.6, 12.6];
export const T = { capOut: 3.4, gone: 12.6, up: 13.2, txt: 14.6, txt2: 15.8, txtOut: 19.4, card: 19.4, logo: 19.5, line: 19.6, plat: 19.9 };
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = 'He just wants you to throw it.';
export const COUNTER = [[0, '2026'], [3.4, '2028'], [6.0, '2031'], [8.4, '2035'], [10.6, '2039'], [12.6, '2040']];
export const CNT = { end: T.txt - .2, size: 110 };
export const stageAt = t => TICKS.filter(a => t >= a).length;   // 0 puppy … 4 very old, 5 gone
export const LINES = [];
// barks (sound only): young and loud, then old and quiet
export const EVENTS = [{ t: 1.0, type: 'bark', v: 1 }, { t: 1.35, type: 'bark', v: 1 }, { t: 4.6, type: 'bark', v: .8 }, { t: 7.2, type: 'bark', v: .6 }, { t: 9.2, type: 'bark', v: .3 }, { t: T.gone, type: 'gone' }, { t: T.up, type: 'up' }];
export const TXT1 = 'He waited his whole life\nfor you to throw it.', TXT2 = 'Stop scrolling.';
export const LINE = 'WeLockIn helps you focus\non what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: '4JZ-o3iAJv4' };
