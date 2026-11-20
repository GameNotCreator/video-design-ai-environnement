// video-10 "Imagine if… #3: the lifeguard": timeline, single source of truth
export const DUR = 22.4;
export const T = { capOut: 3.7, sea: 3.8, guard: 7.0, live: 9.6, sink: 12.5, impact: 13.4, txt: 13.8, txtOut: 17.9, card: 17.9, logo: 18.0, line: 18.2, plat: 18.6 };
export const SHOTS = [{ id: 'beach', a: 0, b: T.impact }, { id: 'black', a: T.impact, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = 'IMAGINE IF · EP. 3', CAPTION = "Don't worry. Someone's watching.";
export const LINES = [
  { id: 'h1', who: 'SWIMMER', text: 'HELP!', a: 4.9, b: 6.9 },
  { id: 'l1', who: 'LIFEGUARD', text: 'One sec.', a: 7.0, b: 9.2 },
  { id: 'h2', who: 'SWIMMER', text: "Wait… I'm live.", a: 9.8, b: 12.4 },
];
export const TXT1 = 'Imagine if they\nscrolled like you do.', TXT2 = '';
export const LINE = 'WeLockIn helps you focus\non what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: '01qStKYB7ts' };
