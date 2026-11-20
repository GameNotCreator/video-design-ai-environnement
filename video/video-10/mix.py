"""video-10 mix (Imagine if #3, the lifeguard): series theme, waves, gulls, the swimmer's splashing, the live ping, the
sink (bubbles), silence. Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
LIVE, SINK, IMP, CARD = e('live'), e('sink'), e('impact'), e('end') - .1
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('01qStKYB7ts')
place(mix, mus, .8, 0, SINK, .5, .2, .02, tail=.9)
place(mix, mus, .8, CARD - .3, DUR - CARD + .3, .4, .6, 1.4)
waves = lp(noise(DUR), 900)[:N] * (.55 + .45 * np.sin(2 * np.pi * .12 * tt) ** 2) * (tt < IMP); add(mix, norm(waves), 0, .1)
rng = np.random.default_rng(3)
for i in range(6):   # gulls
    at = rng.random() * 8; d = .35; f = 1800 + 500 * np.sin(np.pi * t_(d) / d); add(mix, norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t_(d) / d)), at, .03, rng.random() - .5)
spl = bp(noise(DUR), 800, 6000)[:N] * (np.abs(np.sin(2 * np.pi * 2 * tt)) ** 4) * ((tt > 3.8) & (tt < SINK)); add(mix, norm(spl), 0, .05, .3)
add(mix, ping(), LIVE, .2, .3)
for k in range(14): add(mix, norm(np.sin(2 * np.pi * np.cumsum(np.linspace(300, 900, int(.07 * SR))) / SR) * np.exp(-t_(.07) / .02)), SINK + .2 + k * .06 + rng.random() * .05, .05)
for x in EV:
    if x['type'] == 'chime': add(mix, chime(), x['t'], .08)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
finish(mix, HERE)
