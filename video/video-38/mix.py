"""video-38 mix ("Erasmus"): catalogue #5 "I'll Do It (Instrumental)" from track 3.4 s, so its rise (track 17.0 s)
lands on the verdict at the café (film 13.6); it runs under the closing text and the card. A padlock click when the
lower floor locks the phone, a clock tick on each jump, the two-tone cabin chime when the plane lands in Madrid, the
terrace (murmur, cups) from Madrid on, a short rise on the verdict, a chime on each line.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
V, MAD, END = e('verdict'), e('cafe'), e('card')
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('kn5HyDC8q7c'); rng = np.random.default_rng(38)
place(mix, mus, 17.0 - V, 0, DUR, .55, .05, 1.6)
room = bp(noise(DUR), 100, 600)[:N]; add(mix, norm(room), 0, .01)
for x in EV:
    ty = x['type']
    if ty == 'lock':
        d = .05; add(mix, norm(bp(noise(d), 1500, 6000) * np.exp(-t_(d) / .008)), x['t'], .08); add(mix, tone(1760, .25, .06), x['t'] + .06, .05)
    if ty == 'tick':
        for k in range(2): d = .03; add(mix, norm(bp(noise(d), 2500, 7000) * np.exp(-t_(d) / .005)), x['t'] + k * .5, .06)
    if ty == 'plane': add(mix, tone(988, 1.2, .45), x['t'], .05); add(mix, tone(784, 1.4, .5), x['t'] + .45, .05)
    if ty == 'cafe':
        mur = bp(brown(DUR), 250, 1400)[:N] * np.clip(np.minimum((tt - MAD) / .5, (END - .3 - tt) / .6), 0, 1); add(mix, norm(mur), 0, .05)
        for i in range(7):
            at = MAD + .6 + rng.random() * (END - MAD - 1.5); d = .25
            add(mix, norm(tone(2800 + rng.random() * 900, d, .05) + .5 * tone(4100 + rng.random() * 600, d, .03)), at, .02, rng.random() - .5)
    if ty == 'verdict': d = .5; env = np.minimum(1, t_(d) / .45) ** 2; add(mix, norm(lp(noise(d), 1200) * env), x['t'] - .45, .04)
    if ty == 'chime': add(mix, chime(), x['t'], .06)
    if ty == 'card': add(mix, tone(294, 2.2, .9), x['t'], .06)
finish(mix, HERE)
