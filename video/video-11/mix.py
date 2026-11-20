"""video-11 mix ("She said yes"): catalogue #5 "I'll Do It (Instrumental)" under the restaurant, its rise on the waiter's
"Yes." and the applause, a hard stop on the bill, silence while he looks up. Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
APPL, BILL, CARD = e('applause'), e('bill'), e('end') - .1
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('kn5HyDC8q7c')
# the track's rise (~17 s) lands on "Yes." (film 11.0)
place(mix, mus, 17.0 - 11.0, 0, BILL, .5, .3, .02, tail=.8)
place(mix, mus, 17.0 - .4, CARD - .4, DUR - CARD + .4, .45, .5, 1.4)
mur = bp(noise(DUR), 250, 1400)[:N] * (.5 + .5 * np.abs(np.sin(2 * np.pi * 3.1 * tt + 2 * np.sin(2 * np.pi * .4 * tt)))) * (tt < BILL); add(mix, norm(mur), 0, .03, -.2)
rng = np.random.default_rng(6)
for i in range(10): add(mix, norm(tone(3000 + rng.random() * 800, .4, .08)), .5 + rng.random() * 10, .03, rng.random() - .5)
claps = np.zeros(N)
for i in range(260):
    at = APPL + rng.random() * (BILL - APPL); s = int(at * SR); d = int(.02 * SR); claps[s:s + d] += bp(noise(.02), 800, 5000)[:d] * np.exp(-np.arange(d) / (.003 * SR)) * rng.random()
add(mix, norm(claps), 0, .18)
add(mix, norm(tone(2637, 1.4, .5) + tone(3520, 1.4, .3) * .5), 0, .06)   # the ring's shimmer
d = .2; add(mix, norm(bp(noise(d), 1500, 6000) * np.exp(-t_(d) / .03)), BILL + .3, .2)   # the bill lands
for x in EV:
    if x['type'] == 'chime': add(mix, chime(), x['t'], .07)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
finish(mix, HERE)
