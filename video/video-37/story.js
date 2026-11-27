// video-37 "L'été" (FR, EN with ?lang=en), series "Deux trajectoires": timeline, single source of truth.
// The same two months of summer, twice, one floor above the other. Upstairs he scrolls all summer; downstairs he locks
// his phone and learns the guitar. Back-to-school party: "Anyone play?" Upstairs another guy plays and he films it;
// downstairs he plays and everyone asks for one more.
export const DUR = 24.2;
export const EN = new URLSearchParams(globalThis.location?.search || '').get('lang') === 'en';
export const JUMPS = [3.0, 4.6, 6.2, 7.8, 13.6];
export const T = {
  capOut: 3.2, lock: .8, lockEnd: 3.0, down: 1.6, party: 7.8, take: 10.4, verdict: 13.6, end: 17.0,
  txt: 17.2, txt2: 18.2, txtOut: 21.0, card: 21.0, logo: 21.05, line: 21.15, plat: 21.35,
};
// phase: 0 the first day of the holidays, 1 July, 2 August, 3 late August (night), 4 the party, 5 the song
export const phaseAt = t => { let p = 0; JUMPS.forEach((j, i) => { if (t >= j) p = i + 1; }); return p; };
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = EN ? 'Two months of summer.' : 'Deux mois de vacances.';
export const LINES = [
  { id: 'h1', who: EN ? 'HER' : 'ELLE', text: EN ? 'Anyone know how to play?' : 'Quelqu\'un sait jouer ?', a: 8.2, b: 11.0, y: 900 },
  { id: 'y1', who: EN ? 'YOU' : 'TOI', text: EN ? 'I\'ll film it.' : 'Moi, je filme.', a: 11.05, b: 13.5, y: 900 },
  { id: 'h2', who: EN ? 'HER' : 'ELLE', text: EN ? 'One more!' : 'Encore une !', a: 13.8, b: 16.8, y: 900 },
];
export const COUNTER = EN ? [[JUMPS[0], 'JULY'], [JUMPS[1], 'AUGUST'], [JUMPS[2], 'LATE AUGUST'], [JUMPS[3], 'BACK TO SCHOOL']]
  : [[JUMPS[0], 'JUILLET'], [JUMPS[1], 'AOÛT'], [JUMPS[2], 'FIN AOÛT'], [JUMPS[3], 'LA RENTRÉE']];
export const CNT = { end: T.end, y0: 300, y1: 300, size: 76 };
export const EVENTS = [
  { t: T.lock, type: 'lock' }, { t: T.down + .5, type: 'strum', k: 0 }, { t: JUMPS[0] + .3, type: 'strum', k: 0 },
  { t: JUMPS[1] + .3, type: 'strum', k: 1 }, { t: JUMPS[2] + .3, type: 'strum', k: 2 }, { t: T.party, type: 'party' },
  { t: T.verdict, type: 'verdict' }, { t: T.verdict + .9, type: 'clap' },
];
export const TXT1 = EN ? 'Same summer.\nTwo Septembers.' : 'Même été.\nDeux rentrées.', TXT2 = EN ? 'Top or bottom?' : 'Haut ou bas ?';
export const LINE = EN ? 'Block your distractions.' : 'Bloque tes distractions.', PLAT = 'iOS · Windows · macOS';
export const MUSIC = { file: 'A9hzqHsocEA' };
