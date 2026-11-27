"""video-41 mix ("Le sommeil"): catalogue #4 "IMPXSTR - GALAXY!" (phonk, immediate attack) from track 4.0 s, so the
track's strongest bar (track 18 s) lands on the answer (film 14.0); it runs under the closing text and the card. A
padlock click when the lower floor locks the phone, a clock tick on each jump in the night, the class bell at 8, a short
rise on the answer, a chime on each line.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
V = e('verdict')
N = int(DUR * SR); mix = np.zeros((N, 2)); mus = track('Q_rAdk72b-k')
place(mix, mus, 18.0 - V, 0, DUR, .5, .05, 1.6)
room = bp(noise(DUR), 100, 600)[:N]; add(mix, norm(room), 0, .01)
for x in EV:
    ty = x['type']
    if ty == 'lock':
        d = .05; add(mix, norm(bp(noise(d), 1500, 6000) * np.exp(-t_(d) / .008)), x['t'], .08); add(mix, tone(1760, .25, .06), x['t'] + .06, .05)
    if ty == 'tick':
        for k in range(2): d = .03; add(mix, norm(bp(noise(d), 2500, 7000) * np.exp(-t_(d) / .005)), x['t'] + k * .5, .06)
    if ty == 'bell':
        d = 1.2; b = (np.sin(2 * np.pi * 880 * t_(d)) + .5 * np.sin(2 * np.pi * 1320 * t_(d))) * (1 + .5 * np.sin(2 * np.pi * 18 * t_(d))) * np.exp(-t_(d) / .5); add(mix, norm(b), x['t'], .05)
    if ty == 'verdict': d = .5; env = np.minimum(1, t_(d) / .45) ** 2; add(mix, norm(lp(noise(d), 1200) * env), x['t'] - .45, .05)
    if ty == 'chime': add(mix, chime(), x['t'], .06)
    if ty == 'card': add(mix, tone(294, 2.2, .9), x['t'], .06)
finish(mix, HERE)
