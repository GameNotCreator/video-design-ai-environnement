"""video-17 mix ("Class of…"): catalogue #3 "Nightcrawler (Instrumental)" from track 4.72 s so its drop (measured
low-band onset, track 7.72 s) lands on the first class's caps (film 3.0); the beat runs the years; hard stop on his
answer (12.9), silence, then the cards. Lecture-hall murmur, pencils, cheers and cap whooshes before every tick.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); CARD = next(x['t'] for x in EV if x['type'] == 'end') - .1
ANS = [x['t'] for x in EV if x['type'] == 'chime'][-1]
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('aQkfOkFvx2U'); rng = np.random.default_rng(17)
place(mix, mus, 7.72 - 3.0, 0, ANS, .5, .2, .02, tail=.5)
place(mix, mus, 7.72 - .3, CARD - .3, DUR - CARD + .3, .4, .5, 1.4)
mur = bp(noise(DUR), 250, 1400)[:N] * (.5 + .5 * np.abs(np.sin(2 * np.pi * 2.7 * tt))) * (tt < ANS); add(mix, norm(mur), 0, .02)
pen = np.zeros(N)
for i in range(60):
    at = rng.random() * (ANS - .3); s = int(at * SR); dd = int((.05 + rng.random() * .1) * SR); pen[s:s + dd] += bp(noise(dd / SR), 2500, 8000)[:dd] * np.hanning(dd) * (.3 + rng.random())
add(mix, norm(pen), 0, .035, .2)
for x in EV:
    if x['type'] == 'caps':
        d = .5; cheer = bp(noise(d), 400, 2500) * np.hanning(int(d * SR)); add(mix, norm(cheer), x['t'], .1)
        d = .35; wh = bp(noise(d), 800, 6000) * np.sin(np.linspace(0, np.pi, int(d * SR))) ** 2; add(mix, norm(wh), x['t'] + .05, .06, .3)
    if x['type'] == 'tick': d = .06; add(mix, norm(bp(noise(d), 1800, 7000) * np.exp(-t_(d) / .008)), x['t'], .1, .1)
    if x['type'] == 'chime': add(mix, chime(), x['t'], .07)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
finish(mix, HERE)
