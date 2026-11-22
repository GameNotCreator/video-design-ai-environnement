"""video-27 mix ("World record"): catalogue #1 "Stranger Things Main Theme" from track 0.8 s (its pulse builds the
ceremony), hard stop on his "…nice." so it lands in silence. Door bursting open, party horn and confetti, applause,
camera flashes, the trophy set down. Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
DOOR, CONF, TROPHY, CARD = e('door'), e('confetti'), e('trophy'), e('end') - .1
NICE = [x['t'] for x in EV if x['type'] == 'chime'][-1]
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('01qStKYB7ts'); rng = np.random.default_rng(27)
place(mix, mus, .8, 0, NICE, .5, .2, .02, tail=.5)
place(mix, mus, .8, CARD - .3, DUR - CARD + .3, .4, .6, 1.4)
d = .35; add(mix, norm(lp(noise(d), 500) * np.exp(-t_(d) / .06)), DOOR, .3)
d = .5; horn = np.sign(np.sin(2 * np.pi * (440 + 120 * t_(d)) * t_(d))) * np.exp(-t_(d) / .3); add(mix, norm(lp(horn, 3000)), CONF - .05, .12)
d = .9; add(mix, norm(bp(noise(d), 2000, 8000) * np.exp(-t_(d) / .25)), CONF, .1)
claps = np.zeros(N)
for i in range(180):
    at = CONF + rng.random() * 2.2; s = int(at * SR); dd = int(.02 * SR); claps[s:s + dd] += bp(noise(.02), 800, 5000)[:dd] * np.exp(-np.arange(dd) / (.003 * SR)) * rng.random()
add(mix, norm(claps), 0, .12)
for x in EV:
    if x['type'] == 'flash': d = .25; add(mix, norm(bp(noise(.04), 2000, 8000) * np.exp(-t_(.04) / .006)), x['t'], .1); add(mix, norm(tone(3000, d, .08)), x['t'] + .02, .03)
    if x['type'] == 'chime': add(mix, chime(), x['t'], .07)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
d = .12; add(mix, norm(bp(noise(d), 600, 4000) * np.exp(-t_(d) / .03) + .6 * tone(1200, d, .05)), TROPHY + .1, .1)
finish(mix, HERE)
