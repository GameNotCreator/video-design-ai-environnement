// video-3 "Life doesn't wait": timeline, single source of truth
export const DUR = 29.6;
export const T = {
  lookUp: 18.5,             // = track hit 19.00 (music offset 0.5)
  lampOn: 17.2, txt: 20.2, txtOut: 24.5,
  card: 24.5, logo: 24.6, line: 25.0, plat: 25.6,   // card = track hit 25.00
};
export const SHOTS = [{ id: 'park', a: 0, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];

// dialogue lines (typed): who, text, in, out
export const LINES = [
  { id: 'd1', who: 'ALEX', text: 'Come play with us!', a: .3, b: 3.15 },
  { id: 'd2', who: 'YOU', text: 'Later.', a: 3.25, b: 5.3 },
  { id: 'd3', who: 'ALEX', text: 'I graduated today!', a: 7.0, b: 9.75 },
  { id: 'd4', who: 'ALEX', text: "We're getting married!", a: 10.7, b: 13.7 },
  { id: 'd5', who: 'ALEX', text: 'Meet my son!', a: 14.2, b: 16.45 },
];
// seasons of his life on the park
export const SEASONS = [
  { id: 'spring', a: 0, b: 6.0 }, { id: 'summer', a: 6.0, b: 9.9 }, { id: 'autumn', a: 9.9, b: 13.6 },
  { id: 'winter', a: 13.6, b: 16.6 }, { id: 'dusk', a: 16.6, b: 99 },
];
export const seasonAt = t => SEASONS.find(s => t >= s.a && t < s.b);

// walkers: enter from the left, stop by the bench facing him, talk, leave right
// [walk in a→b], [stand b→c], [walk out c→d]
export const WALKS = {
  grad: [5.6, 6.9, 9.75, 11.0],
  wed: [9.3, 10.6, 13.7, 15.0],
  pram: [12.9, 14.1, 16.45, 17.8],
};
export const TXT = "Life doesn't wait for you to look up.";
export const LINE = 'WeLockIn helps you focus on what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: '4JZ-o3iAJv4', offset: .5 };
