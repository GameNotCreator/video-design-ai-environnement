"""video-34 mix ("Partiels"): catalogue #5 "I'll Do It (Instrumental)" from track 3.6 s, so its rise (track 17.0 s)
lands on the results (film 13.4); it runs on under the closing text and the card. A padlock click when the lower floor
locks the phone, a clock tick on each jump in the night, a school bell on exam day, a paper slap for each marked paper,
a chime on each line.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
GR = e('paper')
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('kn5HyDC8q7c')
place(mix, mus, 17.0 - GR, 0, DUR, .55, .05, 1.6)
room = bp(noise(DUR), 100, 600)[:N]; add(mix, norm(room), 0, .01)
for x in EV:
    ty = x['type']
    if ty == 'lock':
        d = .05; add(mix, norm(bp(noise(d), 1500, 6000) * np.exp(-t_(d) / .008)), x['t'], .08); add(mix, tone(1760, .25, .06), x['t'] + .06, .05)
    if ty == 'tick':
        for k in range(2): d = .03; add(mix, norm(bp(noise(d), 2500, 7000) * np.exp(-t_(d) / .005)), x['t'] + k * .5, .06)
    if ty == 'bell':
        b = sum(tone(f, 1.4, .5) * a for f, a in [(880, 1), (1318, .5), (2200, .25)]); m = (np.sin(2 * np.pi * 18 * t_(1.4)) > 0) * .6 + .4; add(mix, norm(b * m[:len(b)]), x['t'], .07)
    if ty == 'paper': d = .12; add(mix, norm(bp(noise(d), 600, 4000) * np.exp(-t_(d) / .03)), x['t'], .09)
    if ty == 'chime': add(mix, chime(), x['t'], .06)
    if ty == 'card': add(mix, tone(294, 2.2, .9), x['t'], .06)
finish(mix, HERE)
