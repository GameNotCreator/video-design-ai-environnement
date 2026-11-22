// video-28 "Desert island": timeline, single source of truth
export const DUR = 24.4;
export const T = { capOut: 3.2, shipIn: 1.2, horn: 5.6, leave: 10.0, up: 13.0, txt: 16.0, txt2: 17.0, txtOut: 20.2, card: 20.2, logo: 20.3, line: 20.4, plat: 20.7 };
export const SHOTS = [{ id: 'island', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = 'Stranded. One bar of signal.';
export const COUNTER = [[0, 'DAY 47']];
export const CNT = { end: T.leave, size: 110 };
export const LINES = [
  { id: 'c1', who: 'CAPTAIN', text: 'Anyone on that island?', a: 7.0, b: 10.0 },
  { id: 'y1', who: 'YOU', text: '…was that a boat?', a: 13.2, b: 15.8 },
];
export const EVENTS = [{ t: T.horn, type: 'horn' }, { t: T.horn + .6, type: 'horn' }, { t: T.horn + 1.2, type: 'horn' }, { t: T.leave, type: 'leave' }, { t: T.up, type: 'up' }];
export const TXT1 = "Rescue doesn't\ncome twice.", TXT2 = 'Stop scrolling.';
export const LINE = 'WeLockIn helps you focus\non what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: 'A9hzqHsocEA' };
