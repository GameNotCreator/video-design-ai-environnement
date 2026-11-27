"""video-39 mix ("Le permis"): catalogue #3 "Nightcrawler (Instrumental)" from its start, so its quiet intro carries the
three months of study and its drop (track 7.72 s) lands as test day begins (film 7.8); it runs under the closing text
and the card. A padlock click when the lower floor locks the phone, a clock tick on each jump, the car engine on test
day, a plastic knock when the cone goes over upstairs, a short rise on the result, a chime on each line.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
TEST, END = e('engine'), e('card')
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('aQkfOkFvx2U')
place(mix, mus, 0, TEST - 7.72, DUR - (TEST - 7.72), .5, .05, 1.6)   # track 0 at film .08: its drop (7.72) on film 7.8
room = bp(noise(DUR), 100, 600)[:N]; add(mix, norm(room), 0, .01)
for x in EV:
    ty = x['type']
    if ty == 'lock':
        d = .05; add(mix, norm(bp(noise(d), 1500, 6000) * np.exp(-t_(d) / .008)), x['t'], .08); add(mix, tone(1760, .25, .06), x['t'] + .06, .05)
    if ty == 'tick':
        for k in range(2): d = .03; add(mix, norm(bp(noise(d), 2500, 7000) * np.exp(-t_(d) / .005)), x['t'] + k * .5, .06)
    if ty == 'engine':
        eng = lp(brown(DUR), 140)[:N] * (1 + .3 * np.sin(2 * np.pi * 28 * tt)) * np.clip(np.minimum((tt - TEST) / .4, (13.4 - tt) / .5), 0, 1); add(mix, norm(eng), 0, .07)
    if ty == 'bump':
        d = .18; add(mix, norm(bp(noise(d), 300, 2500) * np.exp(-t_(d) / .03)), x['t'], .09); add(mix, norm(bp(noise(.3), 800, 3000) * np.exp(-t_(.3) / .06)), x['t'] + .25, .04)
    if ty == 'verdict': d = .5; env = np.minimum(1, t_(d) / .45) ** 2; add(mix, norm(lp(noise(d), 1200) * env), x['t'] - .45, .04)
    if ty == 'chime': add(mix, chime(), x['t'], .06)
    if ty == 'card': add(mix, tone(294, 2.2, .9), x['t'], .06)
finish(mix, HERE)
