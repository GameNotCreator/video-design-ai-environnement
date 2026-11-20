// video-7 "Devolution": timeline, single source of truth
export const DUR = 24.8;
// the forms, in order, with their start time (seconds). From 'phone' on, evolution runs backwards.
export const FORMS = [
  { id: 'ape', a: 0 }, { id: 'hominid', a: 1.5 }, { id: 'caveman', a: 3.0 }, { id: 'man', a: 4.5 }, { id: 'student', a: 6.0 },
  { id: 'phone', a: 7.0 }, { id: 'cavephone', a: 8.3 }, { id: 'apephone', a: 9.6 }, { id: 'fish', a: 10.9 }, { id: 'blob', a: 12.4 },
];
export const formAt = t => { let f = FORMS[0]; for (const F of FORMS) if (t >= F.a) f = F; return f; };
export const T = { ping: 7.0, flip: 8.3, water: 10.9, blobPing: 14.0, stop: 15.2, txt: 15.4, txt2: 16.4, txtOut: 19.8, card: 19.8, logo: 19.9, line: 20.3, plat: 20.9 };
export const SHOTS = [{ id: 'march', a: 0, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const LINES = [];
export const TXT1 = '4 billion years of evolution.', TXT2 = 'Undone by\none more video.';
export const LINE = 'WeLockIn helps you focus on what matters.', PLAT = 'Available on iOS · Windows · macOS';
// walking position (m): forward, slowing down, then dragging to a stop in the puddle
export const XAt = t => 1.25 * Math.min(t, 8.3) + .8 * Math.max(0, Math.min(t, 12.4) - 8.3) + .25 * Math.max(0, Math.min(t, 14) - 12.4);
export const MUSIC = { file: 'aQkfOkFvx2U' };
