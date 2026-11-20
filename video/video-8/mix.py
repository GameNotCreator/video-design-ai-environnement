"""video-8 mix (Imagine if #1, the pilot): series theme (catalogue #1 "Stranger Things Main Theme"), cabin hum, the terrain
alarm, wind rising, then dead silence at the cut. Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
CUT, ALARM, IMP, CARD = e('cut'), e('alarm'), e('impact'), e('end') - .1
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('01qStKYB7ts')
place(mix, mus, .8, 0, IMP, .55, .2, .02)
place(mix, mus, .8, CARD - .3, DUR - CARD + .3, .4, .6, 1.4)
hum = lp(brown(DUR), 250)[:N] * np.where(tt < IMP, 1, 0); add(mix, norm(hum), 0, .07)
wind = bp(noise(DUR), 400, 4000)[:N] * np.clip((tt - ALARM) / (IMP - ALARM), 0, 1) ** 2 * (tt < IMP); add(mix, norm(wind), 0, .15)
for k in range(int((IMP - ALARM) / .5)):   # two-tone terrain alarm
    at = ALARM + k * .5; add(mix, norm(tone(880 if k % 2 == 0 else 660, .22, .5) * (t_(.22) < .2)), at, .14)
add(mix, chime(), CUT + .1, .08)
for x in EV:
    if x['type'] == 'chime': add(mix, chime(), x['t'], .08)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
d = .35; add(mix, norm(lp(noise(d), 300) * np.exp(-t_(d) / .05)), IMP, .5)
finish(mix, HERE)
