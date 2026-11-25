"""video-31 mix ("Premiers pas"): catalogue #6 "Scheming (Instrumental Slowed)" from track 8.7 s, so its drop (track
14.4 s) lands on the first jump in time (film 5.7); it stops when the door shuts behind her, silence on his question,
and the drop comes back under "Ils ne font leurs premiers pas qu'une fois." Room tone, her tiny steps, a low swell on
each jump, the door, a chime on each line.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
J0, SHUT, CARD = e('jump'), e('doorshut'), e('end') - .1
TXT = min(x['t'] for x in EV if x['type'] == 'card')
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('BYGz4ttihm8')
place(mix, mus, 14.4 - J0, 0, SHUT, .55, .05, .25)
place(mix, mus, 14.4, TXT - .1, DUR - TXT + .1, .45, .4, 1.4)
room = bp(noise(DUR), 100, 600)[:N] * (tt < TXT); add(mix, norm(room), 0, .015)
for x in EV:
    ty = x['type']
    if ty == 'babystep': d = .05; add(mix, norm(lp(noise(d), 500) * np.exp(-t_(d) / .012)), x['t'], .03, .3)
    if ty == 'jump':   # a short swell that peaks on the cut
        d = .45; env = np.minimum(1, t_(d) / .4) ** 2; add(mix, norm(lp(noise(d), 900) * env), x['t'] - .4, .05)
        add(mix, tone(98, .6, .25), x['t'], .05)
    if ty == 'dooropen': d = .5; add(mix, norm(bp(noise(d), 300, 1400) * np.exp(-t_(d) / .2)), x['t'], .03)
    if ty == 'doorshut': d = .25; add(mix, norm(lp(noise(d), 200) * np.exp(-t_(d) / .05)), x['t'], .12); add(mix, tone(70, .5, .15), x['t'], .08)
    if ty == 'up': d = .06; add(mix, norm(bp(noise(d), 1200, 5000) * np.exp(-t_(d) / .015)), x['t'], .04)
    if ty == 'chime': add(mix, chime(), x['t'], .06)
    if ty == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
finish(mix, HERE)
