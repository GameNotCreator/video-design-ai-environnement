"""video-28 mix ("Desert island"): catalogue #7 "Acid Rain (Slowed)" from track 63.82 s so its drop (measured low-band
onset, track 73.82 s) lands as the ship gives up and sails away (film 10.0); out at his question. Surf, gulls, the ship's
engine growing and fading, three horn blasts. Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
LEAVE, UP, TXT, CARD = e('leave'), e('up'), e('card'), e('end') - .1
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('A9hzqHsocEA'); rng = np.random.default_rng(28)
place(mix, mus, 73.82 - LEAVE, 0, UP, .5, .3, .02, tail=.6)
place(mix, mus, 73.5, CARD - .3, DUR - CARD + .3, .42, .5, 1.4)
surf = lp(noise(DUR), 900)[:N] * (.5 + .5 * np.sin(2 * np.pi * .18 * tt) ** 2) * (tt < TXT); add(mix, norm(surf), 0, .09)
for i in range(6):
    at = rng.random() * (TXT - 1); d = .35; g = np.sin(2 * np.pi * (1400 - 600 * t_(d) / d) * t_(d)) * np.hanning(int(d * SR)); add(mix, norm(g), at, .03, rng.random() - .5)
eng = lp(brown(DUR), 120)[:N] * np.clip(np.minimum((tt - 1.2) / 4.2, 1 - (tt - LEAVE) / 3.6), 0, 1); add(mix, norm(eng), 0, .12, .3)
for x in EV:
    if x['type'] == 'horn': d = .45; h = (np.sin(2 * np.pi * 110 * t_(d)) + .6 * np.sin(2 * np.pi * 165 * t_(d)) + .3 * np.sin(2 * np.pi * 220 * t_(d))) * np.minimum(1, t_(d) / .04) * np.minimum(1, (d - t_(d)) / .08); add(mix, norm(lp(h, 1200)), x['t'], .3, .3)
    if x['type'] == 'chime': add(mix, chime(), x['t'], .07)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
finish(mix, HERE)
