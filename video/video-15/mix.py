"""video-15 mix ("The statue"): catalogue #1 "Stranger Things Main Theme" (its steady pulse is the years going by),
hard stop when the plaque appears; seasons in foley (birds, wind, snow), the carrot pop, pigeons, the stone grinding
in, a metal ting on the plaque. Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
POP, MELT, STONE, PLAQ, TXT, CARD = e('pop'), e('melt'), e('stone'), e('plaque'), e('card'), e('end') - .1
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('01qStKYB7ts'); rng = np.random.default_rng(15)
place(mix, mus, .8, 0, PLAQ + .05, .55, .2, .02, tail=.8)
place(mix, mus, .8, CARD - .3, DUR - CARD + .3, .4, .6, 1.4)
# birds in spring / summer, wind in winter
for i in range(14):
    at = rng.random() * 5.0 if i < 8 else MELT + rng.random() * 3.5; d = .12
    ch = np.sin(2 * np.pi * (3200 + 900 * np.sin(np.linspace(0, 9, int(d * SR)))) * t_(d)) * np.hanning(int(d * SR)); add(mix, norm(ch), at, .04, rng.random() - .5)
wind = bp(noise(DUR), 300, 2500)[:N] * ((tt > 5.2) & (tt < MELT)) * (.6 + .4 * np.sin(2 * np.pi * .3 * tt)); add(mix, norm(wind), 0, .06)
add(mix, norm(bp(noise(.08), 600, 3000) * np.exp(-t_(.08) / .02)) + norm(tone(900, .08, .02)), POP, .14)            # the carrot
for k in range(3): d = .25; add(mix, norm(lp(noise(d), 900) * np.exp(-t_(d) / .08)), MELT + .1 + k * .25, .05)       # snow sliding off
for k in range(4): d = .35; coo = np.sin(2 * np.pi * (320 + 40 * np.sin(2 * np.pi * 6 * t_(d))) * t_(d)) * np.hanning(int(d * SR)); add(mix, norm(coo), MELT + .6 + k * 1.3, .05, .3)
d = .9; add(mix, norm(lp(brown(d), 200) * np.exp(-t_(d) / .4)) + .5 * norm(bp(noise(d), 200, 1200) * np.exp(-t_(d) / .3)), STONE, .3)   # stone grinds in
add(mix, norm(tone(1760, 1.6, .6) + .5 * tone(2637, 1.6, .4)), PLAQ, .1)                                              # the plaque
for x in EV:
    if x['type'] == 'tick': d = .06; add(mix, norm(bp(noise(d), 1800, 7000) * np.exp(-t_(d) / .008)) + .4 * norm(tone(1600, d, .01)), x['t'], .12, .1)
    if x['type'] == 'chime': add(mix, chime(), x['t'], .07)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
finish(mix, HERE)
