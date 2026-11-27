// video-36 "Le stage" (FR, EN with ?lang=en), series "Deux trajectoires": timeline, single source of truth.
// The evening before an internship interview, twice, one floor above the other. Upstairs he scrolls until 1 a.m.;
// downstairs he locks his phone, writes his notes, rehearses, sleeps. Interview day: "Euh…" upstairs; downstairs,
// "Bienvenue dans l'équipe !" and a handshake.
export const DUR = 24.2;
export const EN = new URLSearchParams(globalThis.location?.search || '').get('lang') === 'en';
export const JUMPS = [3.0, 4.6, 6.2, 7.8, 13.6];
export const T = {
  capOut: 3.2, lock: .8, lockEnd: 3.0, down: 1.6, office: 7.8, verdict: 13.6, end: 17.0,
  txt: 17.2, txt2: 18.2, txtOut: 21.0, card: 21.0, logo: 21.05, line: 21.15, plat: 21.35,
};
// phase: 0 21:00, 1 22:00, 2 23:30, 3 01:00, 4 the interview, 5 the verdict
export const phaseAt = t => { let p = 0; JUMPS.forEach((j, i) => { if (t >= j) p = i + 1; }); return p; };
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = EN ? 'Tomorrow: the interview.' : 'Demain : entretien de stage.';
export const LINES = [
  { id: 'r1', who: EN ? 'RECRUITER' : 'RECRUTEUSE', text: EN ? 'Tell me about yourself.' : 'Parlez-moi de vous.', a: 8.2, b: 11.0, y: 900 },
  { id: 'y1', who: EN ? 'YOU' : 'TOI', text: EN ? 'Uh… so… um…' : 'Euh… alors… euh…', a: 11.05, b: 13.5, y: 900 },
  { id: 'r2', who: EN ? 'RECRUITER' : 'RECRUTEUSE', text: EN ? 'Welcome to the team!' : 'Bienvenue dans l\'équipe !', a: 13.8, b: 16.8, y: 1030 },
];
export const COUNTER = EN ? [[JUMPS[0], '10 PM'], [JUMPS[1], '11:30 PM'], [JUMPS[2], '1 AM'], [JUMPS[3], 'THE INTERVIEW'], [JUMPS[4], 'THE VERDICT']]
  : [[JUMPS[0], '22:00'], [JUMPS[1], '23:30'], [JUMPS[2], '01:00'], [JUMPS[3], 'L\'ENTRETIEN'], [JUMPS[4], 'LE VERDICT']];
export const CNT = { end: T.end, y0: 300, y1: 300, size: 76 };
export const EVENTS = [
  { t: T.lock, type: 'lock' }, ...JUMPS.slice(0, 3).map(t => ({ t, type: 'tick' })), { t: T.office, type: 'door' },
  { t: T.verdict, type: 'verdict' },
];
export const TXT1 = EN ? 'Same night.\nTwo interviews.' : 'Même soirée.\nDeux entretiens.', TXT2 = EN ? 'Top or bottom?' : 'Haut ou bas ?';
export const LINE = EN ? 'Block your distractions.' : 'Bloque tes distractions.', PLAT = 'iOS · Windows · macOS';
export const MUSIC = { file: 'Q_rAdk72b-k' };
