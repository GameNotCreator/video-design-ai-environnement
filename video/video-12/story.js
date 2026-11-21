// video-12 v2 "Can I cheat it? EP. 1": timeline, single source of truth (seconds). Almost silent: no voice, no dialogue;
// the hook at frame 0, three pictograms for the three tries, one sentence at the end.
export const DUR = 17.6;
export const T = {
  capOut: 3.0,
  try1: 3.0, press: 3.35, off: 3.6, boot: 4.35, relock: 4.9,
  try2: 5.6, home: 5.6, jiggle: 6.0, poof: 6.55, tapApp: 7.1, relock2: 7.2,
  try3: 8.0, down: 8.05, lid: 8.55, lidOpen: 8.95, lock3: 9.9,
  pull: 10.3, book: 10.7, hudOut: 10.9,
  txt: 11.1, txtOut: 14.6, card: 14.6, logo: 14.65, plat: 14.85,
};
export const SHOTS = [{ id: 'room', a: 0, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
// the session: 2 hours, started 5 s before the film opens; the countdown never stops
export const SESSION = { total: 7200, start: -5 };
export const remainAt = t => SESSION.total - (t - SESSION.start);
export const SERIES = 'CAN I CHEAT IT? · EP. 1', CAPTION = 'Can I beat a\nNuclear lock?';
// the three tries, shown as pictograms (restart, delete, laptop), crossed out when they fail
export const TRIES = [{ n: 1, icon: 'restart', a: T.try1, fail: T.relock }, { n: 2, icon: 'trash', a: T.try2, fail: T.relock2 }, { n: 3, icon: 'laptop', a: T.try3, fail: T.lock3 }];
export const TXT1 = 'Nothing turns off\na Nuclear lock.';
export const PLAT = 'iOS · macOS · Windows';
export const MUSIC = { file: 'BYGz4ttihm8', drop: 14.4, at: T.lock3 };
