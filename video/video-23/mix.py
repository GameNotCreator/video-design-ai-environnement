"""video-23 mix ("Transformation"): catalogue #4 "IMPXSTR - GALAXY!" from track 2.4 s so its heavy bass (track 5.4 s)
hits on DAY 30 (film 3.0); hard stop when he is asked for the bench. Gym foley: plates clanking on every rep, grunts
(filtered noise), the ticks of the days. Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); CARD = next(x['t'] for x in EV if x['type'] == 'end') - .1
ASK = [x['t'] for x in EV if x['type'] == 'chime'][0]
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('Q_rAdk72b-k'); rng = np.random.default_rng(23)
place(mix, mus, 2.4, 0, ASK, .5, .1, .02, tail=.4)
place(mix, mus, 5.4, CARD - .3, DUR - CARD + .3, .38, .5, 1.4)
for k in range(int(ASK * 2.2)):   # reps: the bar clanks at the top of each lift (three lifters, offset)
    for i in range(3):
        at = (k + i * .7 / 2.2) / 2.2 + .2
        if at < ASK - .3 and rng.random() < .7: d = .12; add(mix, norm(bp(noise(d), 1200, 6000) * np.exp(-t_(d) / .02) + .5 * tone(420 + i * 90, d, .04)), at, .035, -.4 + i * .4)
gym = bp(noise(DUR), 120, 900)[:N] * (tt < ASK + 2.5); add(mix, norm(gym), 0, .02)
for x in EV:
    if x['type'] == 'tick': d = .06; add(mix, norm(bp(noise(d), 1800, 7000) * np.exp(-t_(d) / .008)), x['t'], .12, .1)
    if x['type'] == 'chime': add(mix, chime(), x['t'], .07)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
finish(mix, HERE)
