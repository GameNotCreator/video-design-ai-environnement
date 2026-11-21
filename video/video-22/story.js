// video-22 "Take a break?": timeline, single source of truth
export const DUR = 24.6;
// the reminder pops up four times; he taps "Remind me later" every time
export const POPS = [{ a: 0, b: 3.6, tap: 2.7, what: '3 HOURS' }, { a: 4.2, b: 7.4, tap: 6.6, what: '3 DAYS' }, { a: 8.2, b: 11.4, tap: 10.6, what: '3 YEARS' }, { a: 12.6, b: 15.8, tap: 15.0, what: '63 YEARS' }];
export const T = { capOut: 0, age: 11.4, bones: 12.4, txt: 16.2, txt2: 17.2, txtOut: 20.4, card: 20.4, logo: 20.5, line: 20.6, plat: 20.9 };
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = '';
export const stageAt = t => t >= T.bones ? 4 : POPS.filter(p => t >= p.a).length - 1;   // 0 young, 1 stubble, 2 beard, 3 (montage), 4 skeleton
export const LINES = [];
export const EVENTS = POPS.flatMap(p => [{ t: p.a, type: 'pop' }, { t: p.tap, type: 'tap' }]).concat([{ t: T.age, type: 'age' }, { t: T.bones, type: 'bones' }]);
export const TXT1 = 'The reminder\noutlived you.', TXT2 = 'Stop scrolling.';
export const LINE = 'WeLockIn helps you focus\non what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: 'BYGz4ttihm8' };
