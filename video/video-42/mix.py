"""video-42 mix ("La coloc"): catalogue #6 "you lost - Scheming (Instrumental Slowed)" from track 0.4 s, so its drop
(track 14.4 s) lands on the verdict (film 14.0); it runs under the closing text and the card. The track's first bars are
~8 dB quieter than its drop: the Sunday night is lifted. A padlock click when the lower floor locks the phone, running
water while he washes up, a clock tick on each jump, the front door on Monday night, a pan sizzling when she cooks, a
short rise on the verdict, a chime on each line.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
V, END = e('verdict'), e('card')
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('BYGz4ttihm8')
place(mix, mus, 14.4 - V, 0, DUR, .55, .05, 1.6)
mix *= np.interp(tt, [0, 13.4, 14.0, DUR], [2.0, 2.0, 1.0, 1.0])[:, None]
room = bp(noise(DUR), 100, 600)[:N]; add(mix, norm(room), 0, .01)
for x in EV:
    ty = x['type']
    if ty == 'lock':
        d = .05; add(mix, norm(bp(noise(d), 1500, 6000) * np.exp(-t_(d) / .008)), x['t'], .08); add(mix, tone(1760, .25, .06), x['t'] + .06, .05)
    if ty == 'water':
        w = bp(noise(DUR), 800, 5000)[:N] * np.clip(np.minimum((tt - x['t'] - .3) / .3, (4.4 - tt) / .3), 0, 1) * (1 + .3 * np.sin(2 * np.pi * 3.1 * tt)); add(mix, norm(w), 0, .035, .3)
    if ty == 'tick':
        for k in range(2): d = .03; add(mix, norm(bp(noise(d), 2500, 7000) * np.exp(-t_(d) / .005)), x['t'] + k * .5, .06)
    if ty == 'door':
        d = .3; add(mix, norm(lp(noise(d), 400) * np.exp(-t_(d) / .07)), x['t'], .09); add(mix, norm(bp(noise(.06), 1500, 4000) * np.exp(-t_(.06) / .01)), x['t'] - .05, .04)
    if ty == 'sizzle':
        z = hp(noise(DUR), 3000)[:N] * np.clip(np.minimum((tt - x['t'] - .4) / .4, (END - .3 - tt) / .5), 0, 1) * (.7 + .3 * np.abs(np.sin(2 * np.pi * 7 * tt))); add(mix, norm(z), 0, .02, .3)
    if ty == 'verdict': d = .5; env = np.minimum(1, t_(d) / .45) ** 2; add(mix, norm(lp(noise(d), 1200) * env), x['t'] - .45, .04)
    if ty == 'chime': add(mix, chime(), x['t'], .06)
    if ty == 'card': add(mix, tone(294, 2.2, .9), x['t'], .06)
finish(mix, HERE)
