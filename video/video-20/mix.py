"""video-20 mix ("Fetch"): catalogue #2 "Can You Hear The Music" (Ludwig Goransson): from track 12.38 s so its rise
(measured low-band onset, track 24.98 s, rise.txt) lands on the empty bed (film 12.6); stop at the cards. Barks (young and loud, then old and
soft), the tail thumping, the ball's squeak, counter ticks. Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
GONE, UP, TXT, CARD = e('gone'), e('up'), e('card'), e('end') - .1
RISE = float(open(os.path.join(HERE, 'rise.txt')).read()) if os.path.exists(os.path.join(HERE, 'rise.txt')) else 24.8
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('4JZ-o3iAJv4'); rng = np.random.default_rng(20)
place(mix, mus, RISE - GONE, 0, TXT - .2, .5, .3, .8)
place(mix, mus, RISE, CARD - .3, DUR - CARD + .3, .42, .5, 1.4)
def bark(v):
    d = .18; f0 = 520 - 180 * (1 - v); s = np.sin(2 * np.pi * (f0 * t_(d) - 300 * t_(d) ** 2)) + .5 * np.sin(4 * np.pi * f0 * t_(d))
    return norm((s + .4 * bp(noise(d), 600, 3000)) * np.exp(-t_(d) / .07) * (t_(d) > .005))
for x in EV:
    if x['type'] == 'bark': add(mix, bark(x['v']), x['t'], .22 * x['v'] + .05, .2)
    if x['type'] == 'tick': d = .06; add(mix, norm(bp(noise(d), 1800, 7000) * np.exp(-t_(d) / .008)), x['t'], .1, .1)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
for k in range(int(GONE * 2)):   # the tail thumping on the floor, slower over the years
    at = k * .5 + .2
    if at < GONE: v = max(.1, 1 - at / GONE); d = .06; add(mix, norm(lp(noise(d), 300) * np.exp(-t_(d) / .015)), at, .05 * v, .3)
d = .25; add(mix, norm(np.sin(2 * np.pi * (1400 + 600 * t_(d) / d) * t_(d)) * np.exp(-t_(d) / .08)), .5, .05, .1)   # the ball squeaks
finish(mix, HERE)
