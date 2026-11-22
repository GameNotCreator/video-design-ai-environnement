// video-30 "The zoo": timeline, single source of truth
export const DUR = 23.4;
export const T = { capOut: 3.2, pull: 3.6, plaque: 11.4, plaqueOut: 14.8, txt: 15.0, txt2: 16.0, txtOut: 19.2, card: 19.2, logo: 19.3, line: 19.4, plat: 19.7 };
export const SHOTS = [{ id: 'zoo', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = 'Everyone is looking at him.';
export const LINES = [
  { id: 'k1', who: 'KID', text: 'Mom, what is that?', a: 5.0, b: 7.6 },
  { id: 'm1', who: 'MOM', text: "A wild scroller. Don't feed it.", a: 7.7, b: 11.2 },
];
export const PLAQUE = ['HOMO SCROLLUS', 'Do not feed.'];
export const EVENTS = [{ t: T.pull, type: 'reveal' }, { t: 6.2, type: 'flash' }, { t: 9.0, type: 'peanut' }, { t: T.plaque, type: 'plaque' }];
export const TXT1 = "Look who's\nin the cage.", TXT2 = 'Stop scrolling.';
export const LINE = 'WeLockIn helps you focus\non what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: 'aQkfOkFvx2U' };
