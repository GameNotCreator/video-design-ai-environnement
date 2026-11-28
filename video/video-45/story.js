// video-45 "Les amis" (FR, EN with ?lang=en), series "Deux trajectoires": timeline, single source of truth.
// Saturday night his friends go out, twice, one floor above the other. Upstairs he stays in his room scrolling: at the
// bar his seat on the sofa stays empty ("Il vient pas, lui ?"). Downstairs he locks his phone and goes. Group photo:
// upstairs it has three people, downstairs four, him in the middle.
export const DUR = 24.2;
export const EN = new URLSearchParams(globalThis.location?.search || '').get('lang') === 'en';
export const JUMPS = [3.0, 4.6, 6.2, 7.8, 14.0];
export const T = {
  capOut: 3.2, lock: .8, lockEnd: 3.0, down: 1.6, leave: 1.9, selfie: 12.8, verdict: 14.0, end: 17.0,
  txt: 17.2, txt2: 18.2, txtOut: 21.0, card: 21.0, logo: 21.05, line: 21.15, plat: 21.35,
};
// phase: 0 8 p.m. in his room, 1 9 p.m. at the bar, 2 11 p.m., 3 midnight, 4 1 a.m. (the photo), 5 the photo
export const phaseAt = t => { let p = 0; JUMPS.forEach((j, i) => { if (t >= j) p = i + 1; }); return p; };
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = EN ? 'His friends are going out.' : 'Ses potes sortent ce soir.';
export const LINES = [
  { id: 'p1', who: EN ? 'HIS FRIEND' : 'SON POTE', text: EN ? 'Isn\'t he coming?' : 'Il vient pas, lui ?', a: 8.2, b: 11.0, y: 900 },
  { id: 'p2', who: EN ? 'HIS FRIEND' : 'SON POTE', text: EN ? 'Group photo!' : 'Photo de groupe !', a: 11.1, b: 13.9, y: 900 },
  { id: 'p3', who: EN ? 'HER' : 'ELLE', text: EN ? 'Best night ever!' : 'Meilleure soirée !', a: 14.2, b: 16.9, y: 1290 },
];
export const COUNTER = EN ? [[JUMPS[0], '9 PM'], [JUMPS[1], '11 PM'], [JUMPS[2], 'MIDNIGHT'], [JUMPS[3], '1 AM']]
  : [[JUMPS[0], '21:00'], [JUMPS[1], '23:00'], [JUMPS[2], 'MINUIT'], [JUMPS[3], '01:00']];
export const CNT = { end: T.end, y0: 300, y1: 300, size: 76 };
export const EVENTS = [
  { t: T.lock, type: 'lock' }, { t: JUMPS[0], type: 'bar' }, { t: T.verdict, type: 'shutter' }, { t: T.verdict, type: 'verdict' },
];
export const TXT1 = EN ? 'Same night.\nTwo photos.' : 'Même soirée.\nDeux photos.', TXT2 = EN ? 'Top or bottom?' : 'Haut ou bas ?';
export const LINE = EN ? 'Block your distractions.' : 'Bloque tes distractions.', PLAT = 'iOS · Windows · macOS';
export const MUSIC = { file: 'aQkfOkFvx2U' };
