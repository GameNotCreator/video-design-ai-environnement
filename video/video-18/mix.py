"""video-18 mix ("1%"): catalogue #6 "you lost - Scheming (Instrumental Slowed)": its slow intro (track 0.4 s) under
the battery running down, hard stop when the phone dies, silence, then the track's drop (measured low-band onset,
track 14.4 s) hard in when he looks up at the ruins; stop at the cards. City street then birds, wind and the deer.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
DEAD, UP, DEER, TXT, CARD = e('dead'), e('up'), e('deer'), e('card'), e('end') - .1
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('BYGz4ttihm8'); rng = np.random.default_rng(18)
place(mix, mus, .4, 0, DEAD, .55, .3, .02)
place(mix, mus, 14.4, UP, TXT - UP - .2, .55, .02, .6)
place(mix, mus, 14.4, CARD - .3, DUR - CARD + .3, .4, .5, 1.4)
city = bp(noise(DUR), 120, 1500)[:N] * (tt < DEAD); add(mix, norm(city), 0, .04)
for i in range(6): d = .4; add(mix, norm(bp(noise(d), 300, 1200) * np.hanning(int(d * SR))), rng.random() * (DEAD - 1), .03, rng.random() - .5)   # cars passing
add(mix, norm(tone(660, .12, .05) * (t_(.12) < .1)), 8.4, .05); add(mix, norm(tone(440, .3, .2)), DEAD - .05, .08)   # low battery, power down
wind = bp(noise(DUR), 200, 2200)[:N] * (tt > UP) * (tt < TXT) * (.6 + .4 * np.sin(2 * np.pi * .25 * tt)); add(mix, norm(wind), 0, .05)
for i in range(10):
    at = UP + .5 + rng.random() * (TXT - UP - 1); d = .12; ch = np.sin(2 * np.pi * (3000 + 900 * np.sin(np.linspace(0, 9, int(d * SR)))) * t_(d)) * np.hanning(int(d * SR)); add(mix, norm(ch), at, .035, rng.random() - .5)
for k in range(6): d = .08; add(mix, norm(lp(noise(d), 800) * np.exp(-t_(d) / .02)), DEER + .3 + k * .45, .05, -.4)   # hooves in the grass
for x in EV:
    if x['type'] == 'tick': d = .06; add(mix, norm(bp(noise(d), 1800, 7000) * np.exp(-t_(d) / .008)), x['t'], .1, .1)
    if x['type'] == 'chime': add(mix, chime(), x['t'], .07)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
finish(mix, HERE)
