// video-31 "Premiers pas" (FR): timeline, single source of truth.
// His baby daughter walks to him for the first time; he scrolls. Three jumps in time (6, 12, 18 years), each with
// one line from her; she leaves with a suitcase. He looks up: "…attends, elle marche ?"
export const DUR = 24.9;
// phases: 0 baby (her first steps), 1 six, 2 twelve, 3 eighteen, 4 he looks up
export const JUMPS = [5.7, 8.5, 11.7];
export const T = {
  capOut: 3.1, go: .4, arrive: 2.8, turn: 4.2, hug: 5.4,
  away: 10.5, pack: 12.9, door: 13.0, out: 14.0, shut: 14.2, up: 14.4,
  txt: 17.7, txt2: 18.7, txtOut: 21.7, card: 21.7, logo: 21.75, line: 21.85, plat: 22.05,
};
export const phaseAt = t => t >= T.up ? 4 : t >= JUMPS[2] ? 3 : t >= JUMPS[1] ? 2 : t >= JUMPS[0] ? 1 : 0;
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = 'Ses premiers pas. Vers toi.';
export const LINES = [
  { id: 'b1', who: 'ELLE', text: 'Pa… pa ?', a: 3.0, b: 5.0 },
  { id: 'b2', who: 'ELLE', text: 'Papa, regarde !', a: 5.9, b: 8.3 },
  { id: 'b3', who: 'ELLE', text: 'Papa ?… Laisse tomber.', a: 8.7, b: 11.5 },
  { id: 'b4', who: 'ELLE', text: 'Salut papa.', a: 11.9, b: 14.1 },
  { id: 'y1', who: 'TOI', text: '…attends, elle marche ?', a: 14.6, b: 17.5 },
];
// her age, top of frame, during the jumps (diegetic time, readable without sound)
export const COUNTER = [[JUMPS[0], '6 ANS'], [JUMPS[1], '12 ANS'], [JUMPS[2], '18 ANS']];
export const CNT = { end: T.shut + .1, y0: 380, y1: 380, size: 96 };
export const EVENTS = [
  ...[.9, 1.5, 2.1, 2.7].map(t => ({ t, type: 'babystep' })),
  ...[4.5, 4.9, 5.3].map(t => ({ t, type: 'babystep' })),
  ...JUMPS.map(t => ({ t, type: 'jump' })),
  { t: T.door, type: 'dooropen' }, { t: T.shut, type: 'doorshut' }, { t: T.up, type: 'up' },
];
export const TXT1 = "Ils ne font leurs premiers pas\nqu'une fois.", TXT2 = 'Arrête de scroller.';
export const LINE = 'Bloque tes distractions.', PLAT = 'iOS · Windows · macOS';
export const MUSIC = { file: 'BYGz4ttihm8' };
