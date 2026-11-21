"""video-16 mix ("10 minutes"): catalogue #4 "IMPXSTR - GALAXY!" from track 0.6 s (its sparse intro under the first
alert, the heavy bass from track 5.4 s = film 4.8 while the flat panics), hard stop on the impact, a long white-noise
boom into silence. TV alert beeps, the roommate's run, rumble growing with the rock. Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
RUN, IMP, CARD = e('run'), e('impact'), e('end') - .1
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('Q_rAdk72b-k')
place(mix, mus, .6, 0, IMP, .5, .1, .02)
place(mix, mus, 5.4, CARD - .3, DUR - CARD + .3, .38, .5, 1.4)
# TV emergency tone: three beeps every 2.5 s
for k in range(int(IMP / 2.5) + 1):
    for j in range(3): add(mix, norm(tone(1050, .14, .5) * (t_(.14) < .12)), k * 2.5 + .2 + j * .2, .05, -.5)
rum = lp(brown(DUR), 90)[:N] * np.clip(tt / IMP, 0, 1) ** 2 * (tt < IMP); add(mix, norm(rum), 0, .25)
for k in range(5): d = .1; add(mix, norm(lp(noise(d), 500) * np.exp(-t_(d) / .03)), RUN + k * .2, .1, .3)   # footsteps
d = 4.5; boom = norm(lp(noise(d), 250) * np.exp(-t_(d) / 1.0)) + .6 * norm(bp(noise(d), 300, 5000) * np.exp(-t_(d) / .5)); add(mix, norm(boom), IMP, .7)
for x in EV:
    if x['type'] == 'tick': d = .06; add(mix, norm(bp(noise(d), 1800, 7000) * np.exp(-t_(d) / .008)), x['t'], .1, .1)
    if x['type'] == 'chime': add(mix, chime(), x['t'], .07)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
finish(mix, HERE)
