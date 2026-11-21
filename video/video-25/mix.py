"""video-25 mix ("The elevator"): catalogue #3 "Nightcrawler (Instrumental)" from track 4.32 s so its drop (measured
low-band onset, track 7.72 s) hits as the doors first open (floor 22, film 3.4); hard stop at the last floor, then a
soft high chord (the light) until the cards. Elevator hum, a ding at every floor, the doors sliding.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); CARD = next(x['t'] for x in EV if x['type'] == 'end') - .1
DINGS = [x['t'] for x in EV if x['type'] == 'ding']; LAST = DINGS[-1]; TXT = next(x['t'] for x in EV if x['type'] == 'card')
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('aQkfOkFvx2U')
place(mix, mus, 7.72 - DINGS[0], 0, LAST, .5, .2, .02, tail=.6)
place(mix, mus, 7.42, CARD - .3, DUR - CARD + .3, .4, .5, 1.4)
hum = lp(brown(DUR), 120)[:N] * (tt < LAST); add(mix, norm(hum), 0, .05)
for x in EV:
    if x['type'] == 'ding': add(mix, norm(tone(1318, 1.0, .5) * .7 + tone(1975, 1.0, .35) * .4), x['t'] - .1, .1)
    if x['type'] in ('ding', 'close'): d = .45; add(mix, norm(bp(noise(d), 300, 2500) * np.hanning(int(d * SR))), x['t'] + (.05 if x['type'] == 'ding' else 0), .05)
    if x['type'] == 'tick': d = .05; add(mix, norm(bp(noise(d), 1800, 7000) * np.exp(-t_(d) / .008)), x['t'], .08, .1)
    if x['type'] == 'chime': add(mix, chime(), x['t'], .07)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
d = TXT - LAST; pad = sum(np.sin(2 * np.pi * f * t_(d)) for f in (523.25, 659.25, 783.99, 1046.5)) * np.minimum(1, t_(d) / 1.2) * np.minimum(1, (d - t_(d)) / .6); add(mix, norm(pad), LAST + .1, .06)
finish(mix, HERE)
