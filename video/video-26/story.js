// video-26 "The mirror": timeline, single source of truth
export const DUR = 24.2;
export const FR = new URLSearchParams(globalThis.location?.search || '').get('lang') === 'fr';   // ?lang=fr: French version (TikTok, Facebook, Instagram)
// the reflection's trips out of the mirror: [leave, back, what it comes back with]
export const TRIPS = [{ out: 4.2, back: 5.4, with: 'medal' }, { out: 6.6, back: 7.8, with: 'grad' }, { out: 9.0, back: 10.2, with: 'girl' }];
export const T = { capOut: 3.2, drop: 3.0, gone: 12.4, up: 12.8, txt: 15.8, txt2: 16.8, txtOut: 20.0, card: 20.0, logo: 20.1, line: 20.2, plat: 20.5 };
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = (FR ? 'Son reflet en a marre.' : 'His reflection had enough.');
export const LINES = [
  { id: 'r1', who: (FR ? 'REFLET' : 'REFLECTION'), text: (FR ? 'Salut, mec.' : 'See you, man.'), a: 10.2, b: 12.7 },
  { id: 'y1', who: (FR ? 'TOI' : 'YOU'), text: (FR ? '…attends, t\'es où ?' : '…wait, where are you?'), a: T.up, b: 15.7 },
];
export const EVENTS = [{ t: T.drop, type: 'drop' }].concat(TRIPS.flatMap(x => [{ t: x.out, type: 'step' }, { t: x.back, type: 'back' }]), [{ t: T.gone, type: 'step' }, { t: T.up, type: 'up' }]);
export const TXT1 = (FR ? 'Même ton reflet\na une vie.' : 'Even your reflection\ngot a life.'), TXT2 = (FR ? 'Arrête de scroller.' : 'Stop scrolling.');
export const LINE = (FR ? 'Bloque tes distractions.' : 'WeLockIn helps you focus\non what matters.'), PLAT = (FR ? 'iOS · Windows · macOS' : 'Available on iOS · Windows · macOS');
export const MUSIC = { file: 'kn5HyDC8q7c' };
