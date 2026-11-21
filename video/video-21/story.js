// video-21 "Final call": timeline, single source of truth
export const DUR = 23.8;
export const T = { capOut: 0, last: 10.8, agent: 11.6, txt: 15.0, txt2: 16.0, txtOut: 19.6, card: 19.6, logo: 19.7, line: 19.8, plat: 20.1 };
export const SHOTS = [{ id: 'gate', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = '';
// the departures board: each flight boards, gets its final call, leaves without him
export const FLIGHTS = [
  { time: '08:10', dest: 'PARIS', board: -9, final: -1, gone: 3.0 },
  { time: '09:40', dest: 'TOKYO', board: 1.0, final: 4.4, gone: 5.6 },
  { time: '11:00', dest: 'DREAM JOB', board: 3.0, final: 7.0, gone: 8.2 },
  { time: '12:30', dest: 'YOUR 20s', board: 5.6, final: 9.6, gone: T.last },
];
export const statusAt = (f, t) => t >= f.gone ? 'DEPARTED' : t >= f.final ? 'FINAL CALL' : t >= f.board ? 'BOARDING' : 'ON TIME';
export const LINES = [
  { id: 'g1', who: 'GATE 20', text: 'Final call for passenger… You.', a: 0, b: 3.4, instant: true },
  { id: 'a1', who: 'GATE AGENT', text: 'That was the last flight.', a: T.agent, b: 14.8 },
];
export const EVENTS = FLIGHTS.map(f => ({ t: f.gone, type: 'depart' })).concat(FLIGHTS.slice(1).map(f => ({ t: f.final, type: 'pa' })));
export const TXT1 = "Your 20s don't have\na next flight.", TXT2 = 'Stop scrolling.';
export const LINE = 'WeLockIn helps you focus\non what matters.', PLAT = 'Available on iOS · Windows · macOS';
export const MUSIC = { file: 'A9hzqHsocEA' };
