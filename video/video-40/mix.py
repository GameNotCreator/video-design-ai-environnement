"""video-40 mix ("Le projet"): catalogue #2 "Can You Hear The Music" from track 10.98 s, so its rise (track 24.98 s)
lands on the award (film 14.0); it runs under the closing text and the card. A padlock click when the lower floor locks
the phone, a clock tick on each jump, keyboard clicks while he codes, the hall murmur on demo day, a shimmer when the
screen lights up, applause on the award, a chime on each line. The track's intro is ~10 dB quieter than its rise: the first 7.4 s are lifted.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
V, DEMO, END = e('verdict'), e('crowd'), e('card')
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('4JZ-o3iAJv4'); rng = np.random.default_rng(40)
place(mix, mus, 24.98 - V, 0, DUR, .6, .05, 1.6)
room = bp(noise(DUR), 100, 600)[:N]; add(mix, norm(room), 0, .01)
t0 = 1.6
while t0 < 6.0:   # typing downstairs, in bursts
    if rng.random() > .25: d = .015; add(mix, norm(bp(noise(d), 2000, 7000) * np.exp(-t_(d) / .003)), t0, .025, .3)
    t0 += .07 + rng.random() * .09 + (.4 if rng.random() > .93 else 0)
for x in EV:
    ty = x['type']
    if ty == 'lock':
        d = .05; add(mix, norm(bp(noise(d), 1500, 6000) * np.exp(-t_(d) / .008)), x['t'], .08); add(mix, tone(1760, .25, .06), x['t'] + .06, .05)
    if ty == 'tick':
        for k in range(2): d = .03; add(mix, norm(bp(noise(d), 2500, 7000) * np.exp(-t_(d) / .005)), x['t'] + k * .5, .06)
    if ty == 'crowd':
        mur = bp(brown(DUR), 250, 1400)[:N] * np.clip(np.minimum((tt - DEMO) / .5, (END - .3 - tt) / .6), 0, 1) * np.where((tt > 10.4) & (tt < 11.0), .4, 1); add(mix, norm(mur), 0, .05)
    if ty == 'reveal':
        for k, f in enumerate([1318.5, 1760.0, 2349.3]): add(mix, tone(f, 1.6, .5), x['t'] + k * .08, .025)
    if ty == 'verdict': d = .5; env = np.minimum(1, t_(d) / .45) ** 2; add(mix, norm(lp(noise(d), 1200) * env), x['t'] - .45, .04)
    if ty == 'clap':
        for i in range(110):
            at = x['t'] + rng.random() * 2.6 * (1 - .3 * rng.random()); d = .02
            add(mix, norm(bp(noise(d), 900, 4000) * np.exp(-t_(d) / .004)), at, .022 * (1 - (at - x['t']) / 3.2), rng.random() - .5)
    if ty == 'chime': add(mix, chime(), x['t'], .06)
    if ty == 'card': add(mix, tone(294, 2.2, .9), x['t'], .06)
mix *= np.interp(tt, [0, 7.4, 8.0, DUR], [2.4, 2.4, 1.0, 1.0])[:, None]   # the track's intro is quiet: lift the year at home
finish(mix, HERE)
