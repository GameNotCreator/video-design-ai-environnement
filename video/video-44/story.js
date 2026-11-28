// video-44 "Mamie" (FR, EN with ?lang=en), series "Deux trajectoires": timeline, single source of truth.
// Sunday, he promised to visit his grandmother, twice, one floor above the other. Upstairs he keeps scrolling, and at
// her place she lays two plates, waits at the window, calls him ("…are you still coming?" / "On my way, 5 minutes!").
// Downstairs he locks his phone and goes: they bake a cake together and eat it, laughing. "Come back Sunday!"
export const DUR = 24.2;
export const EN = new URLSearchParams(globalThis.location?.search || '').get('lang') === 'en';
export const JUMPS = [3.0, 4.6, 6.2, 7.8, 14.0];
export const T = {
  capOut: 3.2, lock: .8, lockEnd: 3.0, down: 1.6, leave: 1.9, call: 7.8, verdict: 14.0, end: 17.0,
  txt: 17.2, txt2: 18.2, txtOut: 21.0, card: 21.0, logo: 21.05, line: 21.15, plat: 21.35,
};
// phase: 0 1 p.m. at his place, 1 2 p.m. at hers, 2 4 p.m., 3 6 p.m., 4 7:30 p.m. (the call), 5 the verdict
export const phaseAt = t => { let p = 0; JUMPS.forEach((j, i) => { if (t >= j) p = i + 1; }); return p; };
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = EN ? 'He promised to visit Grandma.' : 'Il a promis de voir Mamie.';
export const LINES = [
  { id: 'm1', who: EN ? 'GRANDMA' : 'MAMIE', text: EN ? '…are you still coming?' : 'Tu viens toujours ?', a: 8.2, b: 11.0, y: 900 },
  { id: 'y1', who: EN ? 'YOU' : 'TOI', text: EN ? 'On my way, 5 min!' : 'J\'arrive dans 5 min !', a: 11.1, b: 13.9, y: 900 },
  { id: 'm2', who: EN ? 'GRANDMA' : 'MAMIE', text: EN ? 'Come back Sunday!' : 'Reviens dimanche !', a: 14.2, b: 16.9, y: 900 },
];
export const COUNTER = EN ? [[JUMPS[0], '2 PM'], [JUMPS[1], '4 PM'], [JUMPS[2], '6 PM'], [JUMPS[3], '7:30 PM']]
  : [[JUMPS[0], '14:00'], [JUMPS[1], '16:00'], [JUMPS[2], '18:00'], [JUMPS[3], '19:30']];
export const CNT = { end: T.end, y0: 300, y1: 300, size: 76 };
export const EVENTS = [
  { t: T.lock, type: 'lock' }, { t: JUMPS[0], type: 'doorbell' }, { t: JUMPS[1], type: 'oven' }, { t: T.call, type: 'ring' }, { t: T.verdict, type: 'verdict' },
];
export const TXT1 = EN ? 'Same promise.\nTwo Sundays.' : 'Même promesse.\nDeux dimanches.', TXT2 = EN ? 'Top or bottom?' : 'Haut ou bas ?';
export const LINE = EN ? 'Block your distractions.' : 'Bloque tes distractions.', PLAT = 'iOS · Windows · macOS';
export const MUSIC = { file: '4JZ-o3iAJv4' };
