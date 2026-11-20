// video-13 "How it works EP. 1: Block it once. Locked everywhere.": timeline, single source of truth (seconds)
// Music: catalogue #7 "Acid Rain (Slowed)" from track 21.25 s, so its three hits (24.45, 27.15, 29.6) land on the tap, the last device and the lamp.
export const DUR = 15.8;
export const T = {
  capOut: 3.0, push: 2.0, start: 2.55, tap: 3.2, mac: 4.1, ipad: 5.0, pc: 5.9, pull: 3.25,
  labelsOut: 8.3, lamp: 8.35, txt: 8.7, txt2: 9.3, txtOut: 11.9, card: 11.9, logo: 11.95, line: 12.0, plat: 12.3,
};
export const SHOTS = [{ id: 'room', a: 0, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
// the session starts at the tap: 2 hours; every device shows the same countdown
export const SESSION = { total: 7200, start: T.tap };
export const remainAt = t => SESSION.total - Math.max(0, t - SESSION.start);
export const SERIES = 'HOW IT WORKS · EP. 1', CAPTION = 'One tap.\nEvery screen.';
export const LINES = [
  { id: 'h1', who: 'ME', text: 'Okay. Too many pings.', a: 0, b: 3.0, v: .2, instant: true },
  { id: 'p1', who: 'ME', text: 'Peace.', a: 6.6, b: 8.6, v: 6.75 },
];
// one label per device, in the order they lock (the same hit grid as the music)
export const DEVICES = [{ id: 'phone', label: 'iPhone', t: T.tap }, { id: 'mac', label: 'Mac', t: T.mac }, { id: 'ipad', label: 'iPad', t: T.ipad }, { id: 'pc', label: 'Windows PC', t: T.pc }];
export const TXT1 = 'Block it once.', TXT2 = 'Locked everywhere';
export const LINE = 'One session locks\nevery device at once.', PLAT = 'iOS · macOS · Windows';
export const MUSIC = { file: 'A9hzqHsocEA', src: 21.25 };
