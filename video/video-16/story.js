// video-16 "10 minutes": timeline, single source of truth
export const DUR = 24.0;
export const T = { capOut: 3.2, run: 2.6, hug: 8.6, impact: 14.5, txt: 15.5, txt2: 16.7, txtOut: 19.9, card: 19.9, logo: 20.0, line: 20.1, plat: 20.4 };
export const SHOTS = [{ id: 'room', a: 0, b: T.impact + .6 }, { id: 'black', a: T.impact + .6, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = 'The world has 10 minutes left.';
export const COUNTER = [[0, 'IMPACT IN 10:00'], [3.2, 'IMPACT IN 07:41'], [5.4, 'IMPACT IN 05:03'], [8.6, 'IMPACT IN 02:30'], [11.2, 'IMPACT IN 00:45'], [13.4, 'IMPACT IN 00:05']];
export const CNT = { end: T.impact, size: 84, alert: [11.2, T.impact] };
export const LINES = [
  { id: 'r1', who: 'ROOMMATE', text: "It's real! Go!", a: 3.3, b: 5.8 },
  { id: 'y1', who: 'YOU', text: "There's a video about it.", a: 5.9, b: 9.1 },
  { id: 'r2', who: 'ROOMMATE', text: 'Mom? I love you.', a: 9.2, b: 11.6 },
  { id: 'y2', who: 'YOU', text: 'Ha. This edit is crazy.', a: 11.7, b: T.impact },
];
export const EVENTS = [{ t: T.run, type: 'run' }, { t: T.impact, type: 'impact' }];
export const TXT1 = 'If it ended today,\nwould you even look up?', TXT2 = 'Stop scrolling.';
export const LINE = 'WeLockIn helps you focus\non what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: 'Q_rAdk72b-k' };
