// video-42 "La coloc" (FR, EN with ?lang=en), series "Deux trajectoires": timeline, single source of truth.
// Sunday night, his turn to clean the flat he shares, twice, one floor above the other. Upstairs he scrolls on the sofa
// while the dishes pile up; downstairs he locks his phone, washes up, wipes the table, goes to bed. Monday night his
// flatmate comes home: upstairs "It was your turn." / "…I was gonna do it." and she walks out; downstairs the kitchen
// shines and she cooks for him.
export const DUR = 24.2;
export const EN = new URLSearchParams(globalThis.location?.search || '').get('lang') === 'en';
export const JUMPS = [3.0, 4.6, 6.2, 7.8, 14.0];
export const T = {
  capOut: 3.2, lock: .8, lockEnd: 3.0, down: 1.6, home: 7.8, verdict: 14.0, end: 17.0,
  txt: 17.2, txt2: 18.2, txtOut: 21.0, card: 21.0, logo: 21.05, line: 21.15, plat: 21.35,
};
// phase: 0 8 p.m., 1 9 p.m., 2 10 p.m., 3 11 p.m., 4 Monday night, 5 the verdict
export const phaseAt = t => { let p = 0; JUMPS.forEach((j, i) => { if (t >= j) p = i + 1; }); return p; };
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = EN ? 'Tonight: his turn to clean.' : 'Ce soir : son tour de ménage.';
export const LINES = [
  { id: 'c1', who: EN ? 'FLATMATE' : 'COLOC', text: EN ? 'It was your turn.' : 'C\'était ton tour.', a: 8.2, b: 11.0, y: 900 },
  { id: 'y1', who: EN ? 'YOU' : 'TOI', text: EN ? '…I was gonna do it.' : '…j\'allais le faire.', a: 11.1, b: 13.9, y: 900 },
  { id: 'c2', who: EN ? 'FLATMATE' : 'COLOC', text: EN ? 'Dinner\'s on me.' : 'Je te fais à dîner.', a: 14.2, b: 16.9, y: 900 },
];
export const COUNTER = EN ? [[JUMPS[0], '9 PM'], [JUMPS[1], '10 PM'], [JUMPS[2], '11 PM'], [JUMPS[3], 'MONDAY NIGHT']]
  : [[JUMPS[0], '21:00'], [JUMPS[1], '22:00'], [JUMPS[2], '23:00'], [JUMPS[3], 'LUNDI SOIR']];
export const CNT = { end: T.end, y0: 300, y1: 300, size: 76 };
export const EVENTS = [
  { t: T.lock, type: 'lock' }, { t: T.down, type: 'water' }, { t: T.home, type: 'door' }, { t: T.verdict, type: 'verdict' }, { t: T.verdict + .2, type: 'sizzle' },
];
export const TXT1 = EN ? 'Same chores.\nTwo Mondays.' : 'Même corvée.\nDeux lundis.', TXT2 = EN ? 'Top or bottom?' : 'Haut ou bas ?';
export const LINE = EN ? 'Block your distractions.' : 'Bloque tes distractions.', PLAT = 'iOS · Windows · macOS';
export const MUSIC = { file: 'BYGz4ttihm8' };
