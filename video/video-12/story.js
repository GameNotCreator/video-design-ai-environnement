// video-12 "Can I cheat it? EP. 1": timeline, single source of truth (seconds)
export const DUR = 26.5;
export const T = {
  capOut: 3.6,
  try1: 3.6, press: 4.2, off: 4.6, boot: 5.8, relock: 6.4,
  try2: 8.6, home: 8.6, jiggle: 9.1, poof: 9.8, tapApp: 10.3, relock2: 10.4,
  try3: 12.7, stand: 12.9, sitDesk: 13.6, lid: 13.6, lidOpen: 14.0, lock3: 15.6,
  book: 17.0, lamp: 17.5, pull: 16.6,
  txt: 18.7, txt2: 19.5, txtOut: 22.5, card: 22.5, logo: 22.55, line: 22.6, plat: 22.9,
};
export const SHOTS = [{ id: 'room', a: 0, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
// the session: 2 hours, started 5 s before the film opens; the countdown never stops
export const SESSION = { total: 7200, start: -5 };
export const remainAt = t => SESSION.total - (t - SESSION.start);
export const SERIES = 'CAN I CHEAT IT? · EP. 1', CAPTION = 'Can I beat a\nNuclear lock?';
// hero lines (Kokoro voice in lines.json, same ids); a/b = dialogue box in/out, v = voice start
export const LINES = [
  { id: 'h1', who: 'ME', text: 'Two hours? Nope. Watch this.', a: 0, b: 3.6, v: .25, instant: true },
  { id: 's1', who: 'ME', text: 'Still locked. Seriously?', a: 6.6, b: 9.7, v: 6.8 },
  { id: 's2', who: 'ME', text: 'Deleted it. Still locked?', a: 10.7, b: 13.7, v: 10.85 },
  { id: 's3', who: 'ME', text: 'Okay. Laptop. Easy.', a: 13.75, b: 16.4, v: 13.85 },
  { id: 's4', who: 'ME', text: 'Oh, come on.', a: 16.45, b: 18.7, v: 16.55 },
];
export const TRIES = [
  { n: 1, text: 'Restart the phone', a: T.try1, b: T.try2 - .1, fail: T.relock },
  { n: 2, text: 'Delete the app', a: T.try2, b: T.try3 - .1, fail: T.relock2 },
  { n: 3, text: 'Use the laptop', a: T.try3, b: T.txt - .3, fail: T.lock3 },
];
export const TXT1 = 'No pausing. No quitting.\nNo bargaining.', TXT2 = 'Nuclear lock';
export const LINE = 'Nothing turns it off\nuntil the timer ends.', PLAT = 'iOS · macOS · Windows';
export const MUSIC = { file: 'BYGz4ttihm8', drop: 14.4, at: T.lock3 };
