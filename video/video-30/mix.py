"""video-30 mix ("The zoo"): catalogue #3 "Nightcrawler (Instrumental)" from track 4.12 s so its drop (measured
low-band onset, track 7.72 s) lands as the camera pushes through the bars (film 3.6); out on the sign. Zoo ambience
(crowd, birds, a distant animal), the kid's laugh, a camera click, the peanut. Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
REV, FLASH, PEANUT, PLAQ, TXT, CARD = e('reveal'), e('flash'), e('peanut'), e('plaque'), e('card'), e('end') - .1
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('aQkfOkFvx2U'); rng = np.random.default_rng(30)
place(mix, mus, 7.72 - REV, 0, PLAQ + .05, .5, .2, .02, tail=.6)
place(mix, mus, 7.42, CARD - .3, DUR - CARD + .3, .4, .5, 1.4)
crowd = bp(noise(DUR), 250, 1600)[:N] * (.5 + .5 * np.abs(np.sin(2 * np.pi * 2.3 * tt))) * (tt < TXT); add(mix, norm(crowd), 0, .03)
for i in range(8):
    at = rng.random() * (TXT - 1); d = .12; ch = np.sin(2 * np.pi * (3000 + 900 * np.sin(np.linspace(0, 9, int(d * SR)))) * t_(d)) * np.hanning(int(d * SR)); add(mix, norm(ch), at, .03, rng.random() - .5)
d = 1.2; roar = lp(noise(d), 300) * np.sin(np.linspace(0, np.pi, int(d * SR))); add(mix, norm(roar), 2.0, .04, -.6)
d = .04; add(mix, norm(bp(noise(d), 2000, 8000) * np.exp(-t_(d) / .006)), FLASH, .12)
for k in range(5): d = .09; add(mix, norm(tone(900 + 80 * k, d, .04)), 5.2 + k * .11, .03, -.3)   # the kid laughing
d = .05; add(mix, norm(bp(noise(d), 1500, 5000) * np.exp(-t_(d) / .01)), PEANUT + .6, .06)
add(mix, norm(tone(1760, 1.4, .5) + .5 * tone(2637, 1.4, .3)), PLAQ, .07)
for x in EV:
    if x['type'] == 'chime': add(mix, chime(), x['t'], .07)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
finish(mix, HERE)
