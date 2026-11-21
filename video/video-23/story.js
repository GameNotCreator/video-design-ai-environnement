// video-23 "Transformation": timeline, single source of truth
export const DUR = 24.4;
export const TICKS = [3.0, 5.0, 7.0, 9.0];
export const T = { capOut: 3.0, walk: 9.4, ask: 10.0, txt: 15.6, txt2: 16.8, txtOut: 20.2, card: 20.2, logo: 20.3, line: 20.4, plat: 20.7 };
export const SHOTS = [{ id: 'gym', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = 'New year. New me.';
export const COUNTER = [[0, 'DAY 1'], [3.0, 'DAY 30'], [5.0, 'DAY 90'], [7.0, 'DAY 180'], [9.0, 'DAY 365']];
export const CNT = { end: T.ask, size: 120 };
export const levelAt = t => TICKS.filter(a => t >= a).length;   // 0..4
export const LINES = [
  { id: 'b1', who: 'GYM GUY', text: 'You using this bench?', a: T.ask, b: 13.0 },
  { id: 'y1', who: 'YOU', text: 'Almost done.', a: 13.1, b: 15.4 },
];
export const EVENTS = [{ t: T.walk, type: 'walk' }];
export const TXT1 = 'You watched 1,000\ntransformations.', TXT2 = 'Start yours.';
export const LINE = 'WeLockIn helps you focus\non what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: 'Q_rAdk72b-k' };
