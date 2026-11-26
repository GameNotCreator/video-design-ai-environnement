"""video-35 mix ("Premier rendez-vous"): catalogue #2 "Can You Hear The Music" from track 15.4 s, so its rise (track
24.98 s) lands on "un an plus tard" (film 9.6); it runs under the closing text and the card. A padlock click when the
lower floor locks the phone, two cups on the table as they laugh, her steps as she leaves upstairs, a low swell on the
jump in time, a chime on each line.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
J = e('jump')
N = int(DUR * SR); mix = np.zeros((N, 2)); mus = track('4JZ-o3iAJv4')
place(mix, mus, 24.98 - J, 0, DUR, .6, .05, 1.6)
room = bp(noise(DUR), 100, 600)[:N]; add(mix, norm(room), 0, .01)
for x in EV:
    ty = x['type']
    if ty == 'lock':
        d = .05; add(mix, norm(bp(noise(d), 1500, 6000) * np.exp(-t_(d) / .008)), x['t'], .08); add(mix, tone(1760, .25, .06), x['t'] + .06, .05)
    if ty == 'laugh':
        for k in range(2): add(mix, tone(2400 + 300 * k, .25, .05), x['t'] + k * .12, .03)
    if ty == 'leave':
        for k in range(5): d = .08; add(mix, norm(lp(noise(d), 700) * np.exp(-t_(d) / .02)), x['t'] + k * .25, .04)
    if ty == 'jump':
        d = .5; env = np.minimum(1, t_(d) / .45) ** 2; add(mix, norm(lp(noise(d), 900) * env), x['t'] - .45, .05)
    if ty == 'chime': add(mix, chime(), x['t'], .06)
    if ty == 'card': add(mix, tone(294, 2.2, .9), x['t'], .06)
finish(mix, HERE)
