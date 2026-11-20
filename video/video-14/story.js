// video-14 "You" (Imagine if… EP. 5): timeline, single source of truth
export const DUR = 23.7;
// night: 23:00 → 07:58 in the bedroom; alarm; the exam hall; the grade; the cards
export const T = { capOut: 3.6, lapse: 3.6, alarm: 8.0, look: 8.3, exam: 10.9, doze: 12.0, pens: 13.4, grade: 14.6, txt: 15.6, txt2: 16.6, txtOut: 19.6, card: 19.6, logo: 19.7, line: 19.8, plat: 20.1 };
export const SHOTS = [{ id: 'room', a: 0, b: T.exam }, { id: 'exam', a: T.exam, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = 'IMAGINE IF · EP. 5', CAPTION = 'Your future is in good hands.';
// the clock: [film time, shown time]; the night jumps forward, one tick per beat
export const CLOCK = [[0, '23:00'], [3.6, '23:58'], [4.3, '00:47'], [5.0, '01:36'], [5.6, '02:51'], [6.2, '04:12'], [6.8, '05:30'], [7.4, '06:44'], [8.0, '07:58'], [T.exam, '08:00'], [T.exam + 1.8, '09:30'], [T.pens, '10:00']];
export const clockAt = t => { let s = CLOCK[0][1]; for (const [a, v] of CLOCK) if (t >= a) s = v; return s; };
export const LINES = [
  { id: 'y1', who: 'YOU', text: 'Exam at 8. One more video.', a: 0, b: 3.5, instant: true },
  { id: 'y2', who: 'YOU', text: '…wait. I\'m late.', a: T.look, b: T.exam },
  { id: 'p1', who: 'PROCTOR', text: 'Pens down.', a: T.pens, b: T.pens + 2.2 },
];
export const TXT1 = 'This time, it\'s not a pilot.\nIt\'s you.', TXT2 = 'Imagine if you didn\'t.';
export const LINE = 'WeLockIn helps you focus\non what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: 'A9hzqHsocEA' };
