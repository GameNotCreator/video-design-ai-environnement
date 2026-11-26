// video-33 "Fais un vœu" (FR): timeline, single source of truth.
// His birthday: friends round the table sing, the candles burn down while he scrolls, the cake catches fire, the smoke
// alarm goes off, everyone leaves. Alone with the burnt cake he looks up: "…attendez, c'est mon anniv ?"
export const DUR = 25.2;
export const FRIENDS_UP = 10.4, LEAVE = [11.6, 12.2, 12.8, 13.4];
export const T = {
  capOut: 3.0, melt: 3.5, flare: 7.5, fire: 8.5, smoke: 8.6, alarm: 9.0, fireOut: 11.5, burnt: 13.0, up: 14.6,
  txt: 18.2, txt2: 19.2, txtOut: 22.0, card: 22.0, logo: 22.05, line: 22.15, plat: 22.35,
};
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = "C'est son anniversaire.";
export const LINES = [
  { id: 'a1', who: 'AMIS', text: 'Joyeux anniversaire !', a: 3.0, b: 5.9 },
  { id: 'l1', who: 'LÉA', text: 'Souffle ! Fais un vœu !', a: 6.1, b: 8.9 },
  { id: 'h1', who: 'HUGO', text: '…il est sérieux ?', a: 9.1, b: 11.7 },
  { id: 'y1', who: 'TOI', text: "…attendez, c'est mon anniv ?", a: 14.8, b: 18.0 },
];
export const EVENTS = [
  { t: 0, type: 'song' }, { t: T.flare, type: 'flare' }, { t: T.fire, type: 'fire' }, { t: T.alarm, type: 'alarm' },
  { t: FRIENDS_UP, type: 'chairs' }, ...LEAVE.map(t => ({ t, type: 'leave' })), { t: T.up, type: 'up' },
];
export const TXT1 = "Fais un vœu.\nLève les yeux d'abord.", TXT2 = 'Arrête de scroller.';
export const LINE = 'Bloque tes distractions.', PLAT = 'iOS · Windows · macOS';
export const MUSIC = { file: 'aQkfOkFvx2U' };
