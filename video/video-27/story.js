// video-27 "World record": timeline, single source of truth
export const DUR = 23.8;
export const T = { capOut: 3.3, door: 2.4, confetti: 3.2, flash: 9.4, trophy: 12.0, leave: 12.4, nice: 13.0, txt: 15.4, txt2: 16.4, txtOut: 19.6, card: 19.6, logo: 19.7, line: 19.8, plat: 20.1 };
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = "He hasn't looked up\nin 14 years.";
export const LINES = [
  { id: 'o1', who: 'OFFICIAL', text: "It's official!", a: 3.2, b: 5.6 },
  { id: 'o2', who: 'OFFICIAL', text: '14 years without looking up.', a: 5.7, b: 9.1 },
  { id: 'o3', who: 'OFFICIAL', text: 'A new world record!', a: 9.2, b: 12.0 },
  { id: 'y1', who: 'YOU', text: '…nice.', a: T.nice, b: 15.2 },
];
export const EVENTS = [{ t: T.door, type: 'door' }, { t: T.confetti, type: 'confetti' }, { t: T.flash, type: 'flash' }, { t: T.flash + .6, type: 'flash' }, { t: T.flash + 1.2, type: 'flash' }, { t: T.trophy, type: 'trophy' }];
export const TXT1 = 'Congratulations.\nNobody is proud.', TXT2 = 'Stop scrolling.';
export const LINE = 'WeLockIn helps you focus\non what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: '01qStKYB7ts' };
