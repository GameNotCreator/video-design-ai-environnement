"""video-32 mix ("Futur toi"): catalogue #1 "Stranger Things Main Theme" from track 2.0 s, so its pulse is already
running on frame 0; it dies with the ghost (film 14.3, low-passed tail). Silence, the tinny leak of the video in his
earbuds while he laughs, a click when he takes one out; the theme comes back under "Ton futur toi hurle." A shimmer
each time the ghost jumps to a new spot, three clicks as the volume goes up, a falling shimmer as he fades.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
FADE, LAUGH, UP = e('fade'), e('laugh'), e('up'); GONE = FADE + .7
TXT = min(x['t'] for x in EV if x['type'] == 'card')
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('01qStKYB7ts')
place(mix, mus, 2.0, 0, GONE, .5, .02, .6, tail=.8)
place(mix, mus, 14.0, TXT - .1, DUR - TXT + .1, .45, .4, 1.4)
room = bp(noise(DUR), 80, 400)[:N] * (tt < TXT); add(mix, norm(room), 0, .012)
def shimmer(d=.7, f0=1760, f1=2640):
    k = t_(d); f = f0 + (f1 - f0) * k / d; return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-k / (d / 3)) * np.minimum(1, k / .05))
for x in EV:
    ty = x['type']
    if ty == 'blink': add(mix, shimmer(), x['t'] - .05, .05)
    if ty == 'vol':
        for k in range(3): d = .03; add(mix, norm(bp(noise(d), 2000, 6000) * np.exp(-t_(d) / .006)), x['t'] + .15 + k * .2, .05)
    if ty == 'fade': add(mix, shimmer(1.2, 2640, 880), x['t'], .06)
    if ty == 'laugh':   # the video in his earbuds leaking: tiny, band-limited bursts
        for k in range(4): d = .14; add(mix, norm(bp(noise(d), 1500, 4000) * np.sin(np.pi * t_(d) / d)), x['t'] + k * .22, .018)
    if ty == 'up': d = .03; add(mix, norm(bp(noise(d), 1000, 5000) * np.exp(-t_(d) / .008)), x['t'], .05)
    if ty == 'chime': add(mix, chime(), x['t'], .06)
    if ty == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
finish(mix, HERE)
