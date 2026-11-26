// video-24 "Right in front of you": timeline, single source of truth
export const DUR = 23.0;
export const FR = new URLSearchParams(globalThis.location?.search || '').get('lang') === 'fr';   // ?lang=fr: French version (TikTok, Facebook, Instagram)
export const T = { capOut: 3.4, stop: 5.0, rise: 7.6, leave: 8.6, gone: 9.6, match: 10.0, up: 13.2, txt: 14.4, txt2: 15.4, txtOut: 18.8, card: 18.8, logo: 18.9, line: 19.0, plat: 19.3 };
export const SHOTS = [{ id: 'train', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = (FR ? 'Elle te regarde. Encore.' : 'She keeps looking at you.');
export const LINES = [
  { id: 's1', who: 'TRAIN', text: (FR ? 'Prochain arrêt.' : 'Next stop: Central.'), a: T.stop - .1, b: T.rise },
];
export const MATCH = { a: T.match, b: T.up + .6, name: 'Emma, 21', dist: (FR ? 'à 0 km' : '0 km away') };
export const EVENTS = [{ t: T.stop, type: 'brake' }, { t: T.leave, type: 'doors' }, { t: T.match, type: 'match' }, { t: T.up, type: 'up' }];
export const TXT1 = (FR ? 'Elle était juste\nen face de toi.' : 'She was right\nin front of you.'), TXT2 = (FR ? 'Arrête de scroller.' : 'Stop scrolling.');
export const LINE = (FR ? 'Bloque tes distractions.' : 'WeLockIn helps you focus\non what matters.'), PLAT = (FR ? 'iOS · Windows · macOS' : 'Available on iOS · Windows · macOS');
export const MUSIC = { file: '4JZ-o3iAJv4' };
