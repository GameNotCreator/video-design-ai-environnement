// video-1 timeline (seconds): the single source of truth for picture, overlay, events and mix
export const DUR = 17.8;
export const SHOTS = [
  { id: 'walk', a: 0.0, b: 3.2 },    // medium-close: face lit by the phone, inner voice typing
  { id: 'wide', a: 3.2, b: 6.4 },    // rising pull-back: the crossing as a toy map, he steps off the curb
  { id: 'car', a: 6.4, b: 8.3 },     // headlights from up the street, horn, screech
  { id: 'black', a: 8.3, b: 8.5 },   // impact (sound only)
  { id: 'phone', a: 8.5, b: 13.8 },  // the phone on the asphalt, text cards
  { id: 'card', a: 13.8, b: 17.8 },  // WeLockIn end card
];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];

export const T = {
  dlgIn: 0.25, typeA: 0.45, typeB: 1.45, dlgOut: 4.6,
  ping1: 1.9, ping2: 5.3,
  curb: 4.77,                 // steps off the kerb onto the road
  engine: 5.6, horn: 7.15, look: 7.55, screech: 7.7, flinch: 8.05, impact: 8.3,
  buzz1: 9.15, buzz2: 11.35,
  txt1: 9.6, txt2: 10.8, txtOut: 13.45,
  card: 13.8, logo: 14.0, pill: 14.4, plat: 14.75,
};

// Hero: walks +x across the road at x = HX(t); stops when he looks up
export const WALK_V = 0.755, HX0 = -7.6;
export const HX = t => HX0 + WALK_V * Math.min(t, T.look);
export const WALK_FPS = 7;                    // 4-frame cycle: contacts on frames 0 and 2
export const LANE_X = -1.9;                    // the car's lane centre = where he stops
// Car: front bumper reaches z = 0 at the impact; brakes from the screech
export function carFront(t) {
  const v = 12, tb = T.screech, dec = 9;
  if (t <= tb) return -(T.impact - tb) * (v - dec * (T.impact - tb) / 2) - v * (tb - t);
  const s = t - tb; return -(T.impact - tb) * (v - dec * (T.impact - tb) / 2) + v * s - dec * s * s / 2;
}

export const DLG = { who: 'YOU', text: 'Okay… one more video.' };
export const TXT1 = 'Stop scrolling.', TXT2 = 'You need to lock in.';
