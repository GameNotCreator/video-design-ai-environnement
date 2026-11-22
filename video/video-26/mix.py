"""video-26 mix ("The mirror"): catalogue #5 "I'll Do It (Instrumental)" from track 14.0 s so its rise (track 17 s)
lands as the reflection drops the phone (film 3.0); stop when he looks up, silence on his question. Room tone,
footsteps on each trip out of the mirror, a soft shimmer each time the reflection comes back.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
DROP, UP, CARD = e('drop'), e('up'), e('end') - .1
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('kn5HyDC8q7c')
place(mix, mus, 17.0 - DROP, 0, UP, .5, .3, .02, tail=.6)
place(mix, mus, 16.6, CARD - .3, DUR - CARD + .3, .42, .5, 1.4)
room = bp(noise(DUR), 100, 600)[:N] * (tt < e('card')); add(mix, norm(room), 0, .015)
for x in EV:
    if x['type'] in ('step', 'back'):
        for k in range(4): d = .08; add(mix, norm(lp(noise(d), 700) * np.exp(-t_(d) / .02)), x['t'] + k * .22, .05, .4)
    if x['type'] == 'back': add(mix, norm(tone(2093, .8, .3) + tone(2637, .8, .25) * .6), x['t'] + .6, .05)
    if x['type'] == 'drop': d = .1; add(mix, norm(bp(noise(d), 800, 4000) * np.exp(-t_(d) / .02)), x['t'], .08)
    if x['type'] == 'chime': add(mix, chime(), x['t'], .07)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
finish(mix, HERE)
