// video-34 "Partiels" (FR), series "Deux trajectoires": timeline, single source of truth.
// The same student, the same evening, twice: two identical rooms stacked like a cut-away house. Upstairs he scrolls;
// downstairs he locks his phone with WeLockIn and works. Night passes (22:00, 23:30, 01:00), then exam day, then grades.
export const DUR = 24.0;
// the night, the exam, the grades (shared by both floors)
export const JUMPS = [3.0, 4.6, 6.2, 7.8, 13.4];
export const T = {
  capOut: 3.0, lock: .8, lockEnd: 3.0, down: 1.6, exam: 7.8, grades: 13.4, gradeB: 13.9, end: 16.6,
  txt: 17.0, txt2: 18.0, txtOut: 20.8, card: 20.8, logo: 20.85, line: 20.95, plat: 21.15,
};
// phase: 0 21:00, 1 22:00, 2 23:30, 3 01:00, 4 exam day, 5 grades
export const phaseAt = t => { let p = 0; JUMPS.forEach((j, i) => { if (t >= j) p = i + 1; }); return p; };
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = 'Même soir, même étudiant.';
// y: where the dialogue box sits (top box over the floor slab between the rooms, bottom box over the lower room)
export const LINES = [
  { id: 'th', who: 'EN HAUT', text: '…on a vu ça en cours ?', a: 8.5, b: 11.2, y: 900 },
  { id: 'bh', who: 'EN BAS', text: 'Facile.', a: 11.3, b: 13.3, y: 1030 },
];
// the shared clock / day at the top of the frame
export const COUNTER = [[JUMPS[0], '22:00'], [JUMPS[1], '23:30'], [JUMPS[2], '01:00'], [JUMPS[3], 'JOUR J'], [JUMPS[4], 'RÉSULTATS']];
export const CNT = { end: T.end, y0: 300, y1: 300, size: 92 };
export const EVENTS = [
  { t: T.lock, type: 'lock' }, ...JUMPS.slice(0, 3).map(t => ({ t, type: 'tick' })), { t: T.exam, type: 'bell' },
  { t: T.grades, type: 'paper' }, { t: T.gradeB, type: 'paper' },
];
export const TXT1 = 'Même soirée.\nDeux résultats.', TXT2 = 'Haut ou bas ?';
export const LINE = 'Bloque tes distractions.', PLAT = 'iOS · Windows · macOS';
export const MUSIC = { file: 'kn5HyDC8q7c' };
