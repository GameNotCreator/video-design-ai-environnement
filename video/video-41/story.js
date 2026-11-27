// video-41 "Le sommeil" (FR, EN with ?lang=en), series "Deux trajectoires": timeline, single source of truth.
// The night before an 8 a.m. class, twice, one floor above the other. Upstairs he scrolls until 3 a.m.; downstairs he
// locks his phone at 11 p.m. and sleeps. The next morning in the lecture hall: "Who knows the answer?" Upstairs he is
// asleep in his seat ("Are you asleep?"); downstairs his hand goes up ("Exactly!").
export const DUR = 24.2;
export const EN = new URLSearchParams(globalThis.location?.search || '').get('lang') === 'en';
export const JUMPS = [3.0, 4.6, 6.2, 7.8, 14.0];
export const T = {
  capOut: 3.2, lock: .8, lockEnd: 3.0, down: 1.6, bed: 2.2, hall: 7.8, ask: 8.2, verdict: 14.0, end: 17.0,
  txt: 17.2, txt2: 18.2, txtOut: 21.0, card: 21.0, logo: 21.05, line: 21.15, plat: 21.35,
};
// phase: 0 11 p.m., 1 midnight, 2 1:30, 3 3 a.m., 4 the lecture hall, 5 the answer
export const phaseAt = t => { let p = 0; JUMPS.forEach((j, i) => { if (t >= j) p = i + 1; }); return p; };
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = EN ? 'Tomorrow: class at 8 AM.' : 'Demain : cours à 8 h.';
export const LINES = [
  { id: 'p1', who: EN ? 'PROFESSOR' : 'PROF', text: EN ? 'Who knows the answer?' : 'Qui a la réponse ?', a: 8.2, b: 11.0, y: 900 },
  { id: 'p2', who: EN ? 'PROFESSOR' : 'PROF', text: EN ? 'Are you asleep?' : 'Vous dormez ?', a: 11.1, b: 13.9, y: 900 },
  { id: 'p3', who: EN ? 'PROFESSOR' : 'PROF', text: EN ? 'Exactly!' : 'Exactement !', a: 14.2, b: 16.9, y: 900 },
];
export const COUNTER = EN ? [[JUMPS[0], '12 AM'], [JUMPS[1], '1:30 AM'], [JUMPS[2], '3 AM'], [JUMPS[3], '8 AM']]
  : [[JUMPS[0], '00:00'], [JUMPS[1], '01:30'], [JUMPS[2], '03:00'], [JUMPS[3], '08:00']];
export const CNT = { end: T.end, y0: 300, y1: 300, size: 76 };
export const EVENTS = [
  { t: T.lock, type: 'lock' }, { t: T.hall, type: 'bell' }, { t: T.verdict, type: 'verdict' },
];
export const TXT1 = EN ? 'Same night.\nTwo mornings.' : 'Même nuit.\nDeux réveils.', TXT2 = EN ? 'Top or bottom?' : 'Haut ou bas ?';
export const LINE = EN ? 'Block your distractions.' : 'Bloque tes distractions.', PLAT = 'iOS · Windows · macOS';
export const MUSIC = { file: 'Q_rAdk72b-k' };
