// video-35 "Premier rendez-vous" (FR, EN with ?lang=en), series "Deux trajectoires": timeline, single source of truth.
// The same first date, twice, one floor above the other. Upstairs he scrolls and she leaves; downstairs he locks his
// phone and they laugh. One year later: upstairs alone on the sofa, downstairs the two of them.
export const DUR = 22.6;
export const EN = new URLSearchParams(globalThis.location?.search || '').get('lang') === 'en';
export const T = {
  capOut: 3.0, lock: .8, lockEnd: 3.0, down: 1.6, laugh: 2.4, leave: 7.6, jump: 9.6, end: 15.4,
  txt: 15.6, txt2: 16.6, txtOut: 19.4, card: 19.4, logo: 19.45, line: 19.55, plat: 19.75,
};
export const phaseAt = t => t >= T.jump ? 1 : 0;
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = EN ? 'Same date, same guy.' : 'Même date, même mec.';
export const LINES = [
  { id: 'h1', who: EN ? 'HER' : 'ELLE', text: EN ? '…are you even listening?' : '…tu m\'écoutes ?', a: 4.0, b: 6.9, y: 900 },
  { id: 'h2', who: EN ? 'HER' : 'ELLE', text: EN ? 'You\'re funny.' : 'T\'es drôle, toi.', a: 7.0, b: 9.4, y: 1290 },
  { id: 'y1', who: EN ? 'YOU' : 'TOI', text: EN ? '…wait, what was her name?' : '…elle s\'appelait comment, déjà ?', a: 11.8, b: 15.2, y: 900 },
];
export const COUNTER = [[T.jump, EN ? 'ONE YEAR LATER' : 'UN AN PLUS TARD']];
export const CNT = { end: T.end, y0: 300, y1: 300, size: 64 };
export const EVENTS = [{ t: T.lock, type: 'lock' }, { t: T.laugh, type: 'laugh' }, { t: T.leave, type: 'leave' }, { t: T.jump, type: 'jump' }];
export const TXT1 = EN ? 'Same date.\nTwo stories.' : 'Même date.\nDeux histoires.', TXT2 = EN ? 'Top or bottom?' : 'Haut ou bas ?';
export const LINE = EN ? 'Block your distractions.' : 'Bloque tes distractions.', PLAT = 'iOS · Windows · macOS';
export const MUSIC = { file: '4JZ-o3iAJv4' };
