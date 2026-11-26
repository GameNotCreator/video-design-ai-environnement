// video-32 "Futur toi" (FR): timeline, single source of truth.
// He scrolls on his bed, earbuds in. Behind him, the ghost of himself at 80 shakes him, shouts, then begs, fading with
// every regret. He turns the volume up. The ghost is gone. He takes out an earbud: "…t'as dit un truc ?"
export const DUR = 25.1;
export const T = {
  capOut: 3.0, vol: 4.0, volEnd: 5.4, fade: 13.6, gone: 14.3, laugh: 14.2, up: 15.1,
  txt: 18.1, txt2: 19.1, txtOut: 21.9, card: 21.9, logo: 21.95, line: 22.05, plat: 22.25,
};
// the ghost: one stance per beat, more transparent with every regret; a flicker on each jump (he teleports)
export const GHOST = [
  { a: 0.0, pose: 'shake', op: .92 },   // shaking him, behind his shoulder
  { a: 3.0, pose: 'shout', op: .92 },   // "LÈVE LES YEUX !"
  { a: 4.0, pose: 'reach', op: .85 },   // reaches for the phone: his hand goes through it
  { a: 5.6, pose: 'talk', op: .78 },    // "J'ai jamais vu Tokyo."
  { a: 8.5, pose: 'sit', op: .62 },     // sits next to him: "Je lui ai jamais dit."
  { a: 11.3, pose: 'kneel', op: .46 },  // kneels in front of him: "J'ai jamais essayé."
];
export const SHOTS = [{ id: 'room', a: 0, b: T.txt - .2 }, { id: 'black', a: T.txt - .2, b: T.card }, { id: 'card', a: T.card, b: DUR }];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
export const SERIES = '', CAPTION = "Lui, c'est toi à 80 ans.";
export const LINES = [
  { id: 'g1', who: 'FUTUR TOI', text: 'LÈVE LES YEUX !', a: 3.0, b: 5.4 },
  { id: 'g2', who: 'FUTUR TOI', text: "J'ai jamais vu Tokyo.", a: 5.6, b: 8.35 },
  { id: 'g3', who: 'FUTUR TOI', text: 'Je lui ai jamais dit.', a: 8.5, b: 11.2 },
  { id: 'g4', who: 'FUTUR TOI', text: "J'ai jamais essayé.", a: 11.3, b: 14.0 },
  { id: 'y1', who: 'TOI', text: "…t'as dit un truc ?", a: 15.3, b: 17.9 },
];
export const EVENTS = [
  { t: 0, type: 'ghost' }, ...GHOST.slice(3).map(g => ({ t: g.a, type: 'blink' })),
  { t: T.vol, type: 'vol' }, { t: T.fade, type: 'fade' }, { t: T.laugh, type: 'laugh' }, { t: T.up, type: 'up' },
];
export const TXT1 = 'Ton futur toi hurle.', TXT2 = 'Arrête de scroller.';
export const LINE = 'Bloque tes distractions.', PLAT = 'iOS · Windows · macOS';
export const MUSIC = { file: '01qStKYB7ts' };
