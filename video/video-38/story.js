// video-38 "Erasmus" (FR, EN with ?lang=en), series "Deux trajectoires": timeline, single source of truth.
// Six months before a semester in Madrid, twice, one floor above the other. Upstairs he scrolls; downstairs he locks
// his phone and learns Spanish (flashcards, a podcast in his earbuds). In Madrid, at a café terrace: upstairs he points
// at the menu and ends up alone with his phone; downstairs he orders, talks, and the girl at the next table joins him.
export const DUR = 24.2;
export const EN = new URLSearchParams(globalThis.location?.search || '').get('lang') === 'en';
export const JUMPS = [3.0, 4.6, 6.2, 7.8, 13.6];
export const T = {
  capOut: 3.2, lock: .8, lockEnd: 3.0, down: 1.6, madrid: 7.8, point: 11.05, verdict: 13.6, end: 17.0,
  txt: 17.2, txt2: 18.2, txtOut: 21.0, card: 21.0, logo: 21.05, line: 21.15, plat: 21.35,
};
// phase: 0 the evening it starts, 1 six months to go, 2 three months to go, 3 the night before, 4 Madrid, 5 the verdict
export const phaseAt = t => { let p = 0; JUMPS.forEach((j, i) => { if (t >= j) p = i + 1; }); return p; };
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = EN ? 'Soon: a semester in Madrid.' : 'Bientôt : Erasmus à Madrid.';
// the Spanish lines stay in Spanish in both versions (that is the point); his answer upstairs is in the viewer's language
export const LINES = [
  { id: 'w1', who: EN ? 'WAITER' : 'SERVEUR', text: '¿Qué vas a tomar?', a: 8.2, b: 11.0, y: 900 },
  { id: 'y1', who: EN ? 'YOU' : 'TOI', text: EN ? 'Uh… this?' : 'Euh… ça ?', a: 11.05, b: 13.5, y: 900 },
  { id: 'l1', who: 'LUCÍA', text: '¡Hablas muy bien!', a: 13.8, b: 16.8, y: 900 },
];
export const COUNTER = EN ? [[JUMPS[0], '6 MONTHS TO GO'], [JUMPS[1], '3 MONTHS TO GO'], [JUMPS[2], 'TOMORROW'], [JUMPS[3], 'MADRID']]
  : [[JUMPS[0], 'DANS 6 MOIS'], [JUMPS[1], 'DANS 3 MOIS'], [JUMPS[2], 'DEMAIN'], [JUMPS[3], 'MADRID']];
export const CNT = { end: T.end, y0: 300, y1: 300, size: 76 };
export const EVENTS = [
  { t: T.lock, type: 'lock' }, { t: T.madrid, type: 'plane' }, { t: T.madrid, type: 'cafe' }, { t: T.verdict, type: 'verdict' },
];
export const TXT1 = EN ? 'Same trip.\nTwo semesters.' : 'Même départ.\nDeux Erasmus.', TXT2 = EN ? 'Top or bottom?' : 'Haut ou bas ?';
export const LINE = EN ? 'Block your distractions.' : 'Bloque tes distractions.', PLAT = 'iOS · Windows · macOS';
export const MUSIC = { file: 'kn5HyDC8q7c' };
