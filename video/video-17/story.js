// video-17 "Class of…": timeline, single source of truth
export const DUR = 23.4;
export const FR = new URLSearchParams(globalThis.location?.search || '').get('lang') === 'fr';   // ?lang=fr: French version (TikTok, Facebook, Instagram)
// each tick: a class throws its caps and a new one sits down; he stays
export const TICKS = [3.0, 4.1, 5.2, 6.3, 7.2, 8.1, 9.0];
export const T = { capOut: 3.0, newbie: 9.3, close: 9.9, txt: 15.3, txt2: 16.3, txtOut: 19.3, card: 19.3, logo: 19.4, line: 19.5, plat: 19.8 };
export const SHOTS = [{ id: 'hall', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = (FR ? 'Premier jour de fac.' : 'First day of uni.');
export const COUNTER = [[0, (FR ? 'ANNÉE 1 · 2026' : 'YEAR 1 · 2026')], [3.0, (FR ? 'ANNÉE 2 · 2027' : 'YEAR 2 · 2027')], [4.1, (FR ? 'ANNÉE 3 · 2028' : 'YEAR 3 · 2028')], [5.2, (FR ? 'ANNÉE 4 · 2029' : 'YEAR 4 · 2029')], [6.3, (FR ? 'ANNÉE 7 · 2032' : 'YEAR 7 · 2032')], [7.2, (FR ? 'ANNÉE 15 · 2040' : 'YEAR 15 · 2040')], [8.1, (FR ? 'ANNÉE 28 · 2053' : 'YEAR 28 · 2053')], [9.0, (FR ? 'ANNÉE 41 · 2066' : 'YEAR 41 · 2066')]];
export const CNT = { end: 10.0, size: 88 };
export const ageAt = t => TICKS.filter(a => t >= a).length;   // 0..7
export const LINES = [
  { id: 'n1', who: (FR ? 'NOUVEAU' : 'FRESHMAN'), text: (FR ? 'Vous êtes le prof ?' : 'Are you the professor?'), a: 10.0, b: 12.85 },
  { id: 'y1', who: (FR ? 'TOI' : 'YOU'), text: (FR ? '…En L1.' : '…Freshman.'), a: 12.9, b: 15.1 },
];
export const EVENTS = TICKS.map(t => ({ t: t - .45, type: 'caps' }));
export const TXT1 = (FR ? 'Tout le monde a son diplôme.\nUn jour.' : 'Everyone graduates.\nEventually.'), TXT2 = (FR ? 'Arrête de scroller.' : 'Stop scrolling.');
export const LINE = (FR ? 'Bloque tes distractions.' : 'WeLockIn helps you focus\non what matters.'), PLAT = (FR ? 'iOS · Windows · macOS' : 'Available on iOS · Windows · macOS');
export const MUSIC = { file: 'aQkfOkFvx2U' };
