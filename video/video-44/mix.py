"""video-44 mix ("Mamie"): catalogue #2 "Can You Hear The Music" from track 10.98 s, so its rise (track 24.98 s) lands
on the verdict (film 14.0); its intro is ~10 dB under the rise, so the afternoon is lifted ×2.4. A padlock click when the
lower floor locks the phone, the doorbell when he arrives, the oven humming, a phone ringing before her call, a short
rise on the verdict, a chime on each line.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
V = e('verdict')
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('4JZ-o3iAJv4')
place(mix, mus, 24.98 - V, 0, DUR, .6, .05, 1.6)
mix *= np.interp(tt, [0, 13.4, 14.0, DUR], [2.4, 2.4, 1.0, 1.0])[:, None]
room = bp(noise(DUR), 100, 600)[:N]; add(mix, norm(room), 0, .01)
for x in EV:
    ty = x['type']
    if ty == 'lock':
        d = .05; add(mix, norm(bp(noise(d), 1500, 6000) * np.exp(-t_(d) / .008)), x['t'], .08); add(mix, tone(1760, .25, .06), x['t'] + .06, .05)
    if ty == 'tick':
        for k in range(2): d = .03; add(mix, norm(bp(noise(d), 2500, 7000) * np.exp(-t_(d) / .005)), x['t'] + k * .5, .06)
    if ty == 'doorbell': add(mix, tone(659, 1.0, .35), x['t'], .05); add(mix, tone(523, 1.2, .4), x['t'] + .35, .05)
    if ty == 'oven':
        h = lp(noise(1.6), 300)[:int(1.6 * SR)] * np.minimum(1, t_(1.6) / .2) * np.minimum(1, (1.6 - t_(1.6)) / .3); add(mix, norm(h), x['t'], .03)
    if ty == 'ring':
        for k in range(2):
            d = .9; r = (np.sin(2 * np.pi * 440 * t_(d)) + np.sin(2 * np.pi * 480 * t_(d))) * (np.sin(2 * np.pi * 20 * t_(d)) > 0) * np.minimum(1, t_(d) / .02) * np.minimum(1, (d - t_(d)) / .05)
            add(mix, norm(r), x['t'] - 1.1 + k * 1.2 - 1.0, .02)
    if ty == 'verdict': d = .5; env = np.minimum(1, t_(d) / .45) ** 2; add(mix, norm(lp(noise(d), 1200) * env), x['t'] - .45, .04)
    if ty == 'chime': add(mix, chime(), x['t'], .06)
    if ty == 'card': add(mix, tone(294, 2.2, .9), x['t'], .06)
finish(mix, HERE)
