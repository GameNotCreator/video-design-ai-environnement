// video-19 "Group project": timeline, single source of truth
export const DUR = 24.3;
export const TICKS = [3.2, 5.0, 6.8, 8.6];
export const T = { capOut: 3.4, pres: 10.4, prof: 12.0, turn: 14.9, txt: 16.2, txt2: 17.2, txtOut: 20.2, card: 20.2, logo: 20.3, line: 20.4, plat: 20.7 };
export const SHOTS = [{ id: 'library', a: 0, b: T.pres }, { id: 'class', a: T.pres, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = 'Group project.\nFour names on it.';
export const COUNTER = [[0, 'DEADLINE IN 14 DAYS'], [3.2, 'DEADLINE IN 10 DAYS'], [5.0, 'DEADLINE IN 6 DAYS'], [6.8, 'DEADLINE IN 2 DAYS'], [8.6, 'DEADLINE TOMORROW'], [T.pres, 'PRESENTATION DAY']];
export const CNT = { end: T.prof, size: 70, y0: 640 };
export const dayAt = t => TICKS.filter(a => t >= a).length;   // 0..4
export const LINES = [
  { id: 'm1', who: 'MIA', text: 'Can you do the intro slide?', a: 3.2, b: 6.5 },
  { id: 'y1', who: 'YOU', text: 'Yeah. Tonight.', a: 6.6, b: 9.0 },
  { id: 'p1', who: 'PROFESSOR', text: 'And what did you do?', a: T.prof, b: T.turn },
];
export const EVENTS = [{ t: T.pres, type: 'pres' }, { t: T.turn, type: 'turn' }];
export const TXT1 = 'Your team noticed.', TXT2 = 'Stop scrolling.';
export const LINE = 'WeLockIn helps you focus\non what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: 'kn5HyDC8q7c' };
