// video-13 v2 "How it works EP. 1": timeline, single source of truth (seconds). Almost silent: no voice, no dialogue;
// the hook at frame 0, then the picture (one tap, three screens lock), one sentence at the end.
// Music: catalogue #7 "Acid Rain (Slowed)" from track 21.25 s, so its hits (24.45, 27.15, 29.6) land on the tap (3.2), the last screen (5.9) and 8.35.
export const DUR = 13.6;
export const T = {
  capOut: 3.0, push: 2.0, start: 2.55, tap: 3.2, mac: 4.55, ipad: 5.9, pull: 3.25, down: 6.6,
  txt: 7.0, txtOut: 10.6, card: 10.6, logo: 10.65, plat: 10.85,
};
export const SHOTS = [{ id: 'room', a: 0, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
// the session starts at the tap: 2 hours; every device shows the same countdown
export const SESSION = { total: 7200, start: T.tap };
export const remainAt = t => SESSION.total - Math.max(0, t - SESSION.start);
export const SERIES = 'HOW IT WORKS · EP. 1', CAPTION = 'One tap.\nEvery screen.';
export const DEVICES = [{ id: 'phone', t: T.tap }, { id: 'mac', t: T.mac }, { id: 'ipad', t: T.ipad }];
export const TXT1 = 'Block it once.\nLocked everywhere.';
export const PLAT = 'iOS · macOS · Windows';
export const MUSIC = { file: 'A9hzqHsocEA', src: 21.25 };
