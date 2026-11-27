// video-40 "Le projet" (FR, EN with ?lang=en), series "Deux trajectoires": timeline, single source of truth.
// The same app idea, sketched on a sticky note above the desk, twice, one floor above the other. Upstairs he scrolls;
// downstairs he locks his phone and builds it on his laptop. One year later, at a student demo day: "And the award
// goes to…" and the screen lights up with the sketch. Upstairs his friend walks on stage ("…that was my idea.");
// downstairs he does, and gets the trophy.
export const DUR = 24.2;
export const EN = new URLSearchParams(globalThis.location?.search || '').get('lang') === 'en';
export const JUMPS = [3.0, 4.6, 6.2, 7.8, 14.0];
export const T = {
  capOut: 3.2, lock: .8, lockEnd: 3.0, down: 1.6, demo: 7.8, reveal: 11.0, verdict: 14.0, end: 17.0,
  txt: 17.2, txt2: 18.2, txtOut: 21.0, card: 21.0, logo: 21.05, line: 21.15, plat: 21.35,
};
// phase: 0 the evening of the idea, 1 three months later, 2 six months, 3 nine months, 4 demo day, 5 the award
export const phaseAt = t => { let p = 0; JUMPS.forEach((j, i) => { if (t >= j) p = i + 1; }); return p; };
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = EN ? 'He has an app idea.' : 'Il a une idée d\'appli.';
export const LINES = [
  { id: 'h1', who: EN ? 'HOST' : 'ANIMATRICE', text: EN ? 'And the award goes to…' : 'Et le prix revient à…', a: 8.2, b: 11.0, y: 900 },
  { id: 'y1', who: EN ? 'YOU' : 'TOI', text: EN ? '…that was my idea.' : '…c\'était mon idée.', a: 11.1, b: 13.9, y: 900 },
  { id: 'h2', who: EN ? 'HOST' : 'ANIMATRICE', text: EN ? 'Well done!' : 'Bravo !', a: 14.2, b: 16.9, y: 900 },
];
export const COUNTER = EN ? [[JUMPS[0], '3 MONTHS LATER'], [JUMPS[1], '6 MONTHS LATER'], [JUMPS[2], '9 MONTHS LATER'], [JUMPS[3], 'ONE YEAR LATER']]
  : [[JUMPS[0], '3 MOIS PLUS TARD'], [JUMPS[1], '6 MOIS PLUS TARD'], [JUMPS[2], '9 MOIS PLUS TARD'], [JUMPS[3], 'UN AN PLUS TARD']];
export const CNT = { end: T.end, y0: 300, y1: 300, size: 64 };
export const EVENTS = [
  { t: T.lock, type: 'lock' }, { t: T.demo, type: 'crowd' }, { t: T.reveal, type: 'reveal' }, { t: T.verdict, type: 'verdict' }, { t: T.verdict + .3, type: 'clap' },
];
export const TXT1 = EN ? 'Same idea.\nTwo paths.' : 'Même idée.\nDeux trajectoires.', TXT2 = EN ? 'Top or bottom?' : 'Haut ou bas ?';
export const LINE = EN ? 'Block your distractions.' : 'Bloque tes distractions.', PLAT = 'iOS · Windows · macOS';
export const MUSIC = { file: '4JZ-o3iAJv4' };
