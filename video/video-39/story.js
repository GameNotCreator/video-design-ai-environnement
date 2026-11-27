// video-39 "Le permis" (FR, EN with ?lang=en), series "Deux trajectoires": timeline, single source of truth.
// Three months before the driving test, twice, one floor above the other. Upstairs he scrolls; downstairs he locks his
// phone and learns the road signs. The test, in the driving-school car: "Park right here." Upstairs he knocks the cone
// over ("Oups."), the examiner shakes his head; downstairs he parks, gets out and holds up his licence.
export const DUR = 24.2;
export const EN = new URLSearchParams(globalThis.location?.search || '').get('lang') === 'en';
export const JUMPS = [3.0, 4.6, 6.2, 7.8, 13.6];
export const T = {
  capOut: 3.2, lock: .8, lockEnd: 3.0, down: 1.6, test: 7.8, park: 10.6, bump: 11.3, verdict: 13.6, end: 17.0,
  txt: 17.2, txt2: 18.2, txtOut: 21.0, card: 21.0, logo: 21.05, line: 21.15, plat: 21.35,
};
// phase: 0 the evening it starts, 1 two months to go, 2 one month to go, 3 the night before, 4 the test, 5 the result
export const phaseAt = t => { let p = 0; JUMPS.forEach((j, i) => { if (t >= j) p = i + 1; }); return p; };
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = EN ? 'Driving test in 3 months.' : 'Dans 3 mois : le permis.';
export const LINES = [
  { id: 'e1', who: EN ? 'EXAMINER' : 'EXAMINATEUR', text: EN ? 'Park right here.' : 'Garez-vous ici.', a: 8.2, b: 11.0, y: 900 },
  { id: 'y1', who: EN ? 'YOU' : 'TOI', text: EN ? 'Oops.' : 'Oups.', a: 11.4, b: 13.5, y: 1290 },
  { id: 'e2', who: EN ? 'EXAMINER' : 'EXAMINATEUR', text: EN ? 'Congratulations!' : 'Félicitations !', a: 13.8, b: 16.8, y: 1290 },
];
export const COUNTER = EN ? [[JUMPS[0], '2 MONTHS TO GO'], [JUMPS[1], '1 MONTH TO GO'], [JUMPS[2], 'THE NIGHT BEFORE'], [JUMPS[3], 'THE TEST']]
  : [[JUMPS[0], 'DANS 2 MOIS'], [JUMPS[1], 'DANS 1 MOIS'], [JUMPS[2], 'LA VEILLE'], [JUMPS[3], 'L\'EXAMEN']];
export const CNT = { end: T.end, y0: 300, y1: 300, size: 76 };
export const EVENTS = [
  { t: T.lock, type: 'lock' }, { t: T.test, type: 'engine' }, { t: T.bump, type: 'bump' }, { t: T.verdict, type: 'verdict' },
];
export const TXT1 = EN ? 'Same test.\nTwo drivers.' : 'Même examen.\nDeux conducteurs.', TXT2 = EN ? 'Top or bottom?' : 'Haut ou bas ?';
export const LINE = EN ? 'Block your distractions.' : 'Bloque tes distractions.', PLAT = 'iOS · Windows · macOS';
export const MUSIC = { file: 'aQkfOkFvx2U' };
