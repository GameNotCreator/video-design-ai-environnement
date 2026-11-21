"""video-22 mix ("Take a break?"): catalogue #6 "you lost - Scheming (Instrumental Slowed)" from track 2.0 s so its drop
(measured low-band onset, track 14.4 s) lands on the skeleton (film 12.4); stop at the cards. A notification ding on
every reminder, a tap on every "Remind me later", the years rushing by (wind, clock) before the bones.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
AGE, BONES, TXT, CARD = e('age'), e('bones'), e('card'), e('end') - .1
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('BYGz4ttihm8')
place(mix, mus, 14.4 - BONES, 0, TXT - .2, .55, .3, .8)
place(mix, mus, 14.4, CARD - .3, DUR - CARD + .3, .42, .5, 1.4)
for x in EV:
    if x['type'] == 'pop': add(mix, norm(tone(1318, .5, .15) + .6 * np.pad(tone(1760, .5, .2), (int(.09 * SR), 0))[:int(.5 * SR)]), x['t'] + .02, .12)
    if x['type'] == 'tap': d = .04; add(mix, norm(bp(noise(d), 1500, 6000) * np.exp(-t_(d) / .006)), x['t'], .12, .2)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
d = BONES - AGE + .4; rush = bp(noise(d), 300, 5000) * np.sin(np.linspace(0, np.pi, int(d * SR))) ** 2; add(mix, norm(rush), AGE - .2, .12)
for k in range(10): d2 = .03; add(mix, norm(tone(1800, d2, .008)), AGE + k * .1, .05, .3)   # the clock racing
finish(mix, HERE)
