"""video-45 mix ("Les amis"): catalogue #3 "Nightcrawler (Instrumental)" from track 4.72 s, so its quiet intro carries
the evening in his room and its drop (track 7.72 s) lands as the night out begins at the bar (film 3.0); it runs under
the closing text and the card. A padlock click when the lower floor locks the phone, the bar murmur, a clock tick on
each jump, a camera shutter on the group photo, a short rise on it, a chime on each line.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
BAR, END = e('bar'), e('card')
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('aQkfOkFvx2U')
place(mix, mus, 7.72 - BAR, 0, DUR, .45, .05, 1.6)
room = bp(noise(DUR), 100, 600)[:N]; add(mix, norm(room), 0, .01)
for x in EV:
    ty = x['type']
    if ty == 'lock':
        d = .05; add(mix, norm(bp(noise(d), 1500, 6000) * np.exp(-t_(d) / .008)), x['t'], .08); add(mix, tone(1760, .25, .06), x['t'] + .06, .05)
    if ty == 'tick':
        for k in range(2): d = .03; add(mix, norm(bp(noise(d), 2500, 7000) * np.exp(-t_(d) / .005)), x['t'] + k * .5, .05)
    if ty == 'bar':
        mur = bp(brown(DUR), 250, 1600)[:N] * np.clip(np.minimum((tt - BAR) / .4, (END - .3 - tt) / .6), 0, 1); add(mix, norm(mur), 0, .045)
    if ty == 'shutter':
        d = .05; add(mix, norm(bp(noise(d), 2000, 8000) * np.exp(-t_(d) / .006)), x['t'], .08); add(mix, norm(bp(noise(d), 1500, 6000) * np.exp(-t_(d) / .008)), x['t'] + .09, .06)
    if ty == 'verdict': d = .5; env = np.minimum(1, t_(d) / .45) ** 2; add(mix, norm(lp(noise(d), 1200) * env), x['t'] - .45, .035)
    if ty == 'chime': add(mix, chime(), x['t'], .06)
    if ty == 'card': add(mix, tone(294, 2.2, .9), x['t'], .06)
finish(mix, HERE)
