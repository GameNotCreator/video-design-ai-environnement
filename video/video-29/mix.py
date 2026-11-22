"""video-29 mix ("Overdue"): catalogue #6 "you lost - Scheming (Instrumental Slowed)" from track 6.4 s so its drop
(measured low-band onset, track 14.4 s) lands on the knock (film 8.0); stop on his answer. A page turning that never
happens, years ticking, three knocks, the door, the librarian's cane on the floor. Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
KNOCK, DOOR, CARD = e('knock'), e('door'), e('end') - .1
ANS = [x['t'] for x in EV if x['type'] == 'chime'][-1]
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('BYGz4ttihm8')
place(mix, mus, 14.4 - KNOCK, 0, ANS, .55, .3, .02, tail=.6)
place(mix, mus, 14.4, CARD - .3, DUR - CARD + .3, .42, .5, 1.4)
for k in range(3): d = .12; add(mix, norm(lp(noise(d), 400) * np.exp(-t_(d) / .025)), KNOCK - .45 + k * .22, .35, .5)
d = .8; add(mix, norm(bp(noise(d), 200, 1800) * np.hanning(int(d * SR))), DOOR, .08, .5)
for k in range(6): d = .06; add(mix, norm(lp(noise(d), 900) * np.exp(-t_(d) / .015)), DOOR + .3 + k * .35, .06, .3)   # cane taps
for x in EV:
    if x['type'] == 'tick': d = .06; add(mix, norm(bp(noise(d), 1800, 7000) * np.exp(-t_(d) / .008)), x['t'], .1, .1)
    if x['type'] == 'chime': add(mix, chime(), x['t'], .07)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
finish(mix, HERE)
