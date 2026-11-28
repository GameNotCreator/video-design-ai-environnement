// video-43 "Le chien" (FR, EN with ?lang=en), series "Deux trajectoires": timeline, single source of truth.
// His dog waits for its evening walk, the leash in its mouth, twice, one floor above the other. Upstairs he scrolls and
// the dog gives up by the door; downstairs he locks his phone, they go out, come back, play, fall asleep together. Six
// months later his sister visits: upstairs "Your dog got chubby…" / "…he's just fluffy."; downstairs "He looks so happy!"
// and the three of them go out.
export const DUR = 24.2;
export const EN = new URLSearchParams(globalThis.location?.search || '').get('lang') === 'en';
export const JUMPS = [3.0, 4.6, 6.2, 7.8, 14.0];
export const T = {
  capOut: 3.2, lock: .8, lockEnd: 3.0, down: 1.6, out: 1.7, later: 7.8, verdict: 14.0, end: 17.0,
  txt: 17.2, txt2: 18.2, txtOut: 21.0, card: 21.0, logo: 21.05, line: 21.15, plat: 21.35,
};
// phase: 0 7 p.m., 1 8 p.m., 2 9 p.m., 3 11 p.m., 4 six months later, 5 the verdict
export const phaseAt = t => { let p = 0; JUMPS.forEach((j, i) => { if (t >= j) p = i + 1; }); return p; };
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = EN ? 'He\'s waiting for his walk.' : 'Il attend sa balade.';
export const LINES = [
  { id: 's1', who: EN ? 'HIS SISTER' : 'SA SŒUR', text: EN ? 'Your dog got chubby…' : 'Il a grossi, ton chien…', a: 8.2, b: 11.0, y: 900 },
  { id: 'y1', who: EN ? 'YOU' : 'TOI', text: EN ? '…he\'s just fluffy.' : '…il est juste poilu.', a: 11.1, b: 13.9, y: 900 },
  { id: 's2', who: EN ? 'HIS SISTER' : 'SA SŒUR', text: EN ? 'He looks so happy!' : 'Il est en forme !', a: 14.2, b: 16.9, y: 900 },
];
export const COUNTER = EN ? [[JUMPS[0], '8 PM'], [JUMPS[1], '9 PM'], [JUMPS[2], '11 PM'], [JUMPS[3], '6 MONTHS LATER']]
  : [[JUMPS[0], '20:00'], [JUMPS[1], '21:00'], [JUMPS[2], '23:00'], [JUMPS[3], '6 MOIS PLUS TARD']];
export const CNT = { end: T.end, y0: 300, y1: 300, size: 64 };
export const EVENTS = [
  { t: T.lock, type: 'lock' }, { t: T.out, type: 'door' }, { t: JUMPS[0], type: 'door' }, { t: T.later, type: 'door' },
  { t: T.verdict, type: 'verdict' }, { t: T.verdict + .3, type: 'bark' },
];
export const TXT1 = EN ? 'Same dog.\nTwo lives.' : 'Même chien.\nDeux vies.', TXT2 = EN ? 'Top or bottom?' : 'Haut ou bas ?';
export const LINE = EN ? 'Block your distractions.' : 'Bloque tes distractions.', PLAT = 'iOS · Windows · macOS';
export const MUSIC = { file: 'A9hzqHsocEA' };
