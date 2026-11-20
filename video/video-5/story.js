// video-5 "RIP (double tap)": timeline, single source of truth
export const DUR = 24.6;
export const T = { swipe: 10.9, coffin: 11.0, ping: 12.6, buzz: 14.0, txt: 15.6, txt2: 16.4, txtOut: 20.0, card: 20.0, logo: 20.1, line: 20.5, plat: 21.1 };
export const SHOTS = [{ id: 'funeral', a: 0, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const LINES = [
  { id: 'p1', who: 'PRIEST', text: 'He was taken from us too soon.', a: .3, b: 3.9 },
  { id: 'g1', who: 'GIRL', text: 'RIP king.', a: 8.1, b: 10.5 },
];
export const TXT1 = "They'll scroll at\nyour funeral too.", TXT2 = "Don't waste the time before it.";
export const LINE = 'WeLockIn helps you focus on what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: '01qStKYB7ts', offset: .8 };
