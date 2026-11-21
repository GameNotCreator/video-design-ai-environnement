"""video-24 mix ("Right in front of you"): catalogue #2 "Can You Hear The Music" (Ludwig Goransson) from track 14.98 s
so its rise (measured low-band onset, track 24.98 s) lands on the match (film 10.0); stop at the cards. Train rumble
and rail clacks (slowing into Central, the doors), the match notification. Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
BRAKE, DOORS, MATCH, UP, TXT, CARD = e('brake'), e('doors'), e('match'), e('up'), e('card'), e('end') - .1
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('4JZ-o3iAJv4')
place(mix, mus, 24.98 - MATCH, 0, TXT - .2, .55, .3, .8)
place(mix, mus, 24.98, CARD - .3, DUR - CARD + .3, .42, .5, 1.4)
stopA, stopB = BRAKE + 1.6, DOORS + 1.2
spd = np.where(tt < BRAKE, 1, np.where(tt < stopA, 1 - (tt - BRAKE) / 1.6, np.where(tt < stopB, 0, np.clip((tt - stopB) / 1.2, 0, 1)))) * (tt < TXT)
rum = lp(brown(DUR), 160)[:N] * (.25 + .75 * spd); add(mix, norm(rum), 0, .12)
pos = 0.0; k = 0
for i in range(int(TXT / .02)):
    t0 = i * .02; s = spd[min(N - 1, int(t0 * SR))]; pos += s * .02 * 2.2
    if pos >= 1: pos -= 1; d = .07; add(mix, norm(bp(noise(d), 300, 2500) * np.exp(-t_(d) / .02)), t0, .07, -.2); add(mix, norm(bp(noise(d), 300, 2500) * np.exp(-t_(d) / .02)), t0 + .12, .05, .2)
d = 1.4; add(mix, norm(bp(noise(d), 2500, 7000) * np.sin(np.linspace(0, np.pi, int(d * SR)))), BRAKE + .3, .05)   # brake squeal
d = .6; add(mix, norm(bp(noise(d), 200, 1500) * np.hanning(int(d * SR))), DOORS - .2, .08, .4)   # doors
add(mix, norm(tone(1568, .4, .12) + np.pad(tone(2093, .5, .15), (int(.12 * SR), 0))[:int(.4 * SR)]), MATCH + .02, .14)   # the match
for x in EV:
    if x['type'] == 'chime': add(mix, chime(), x['t'], .07)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
finish(mix, HERE)
