"""video-43 mix ("Le chien"): catalogue #7 "Acid Rain (Slowed)" from track 59.82 s, so its drop (measured low-band
onset, track 73.82 s) lands on the verdict (film 14.0); it runs under the closing text and the card. The build before the
drop is ~10 dB under it: the evening is lifted ×2. A padlock click when the lower floor locks the phone, the front door
(out for the walk, back, the sister six months later), two short barks when the three of them go out, a short rise on the
verdict, a chime on each line.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
V = e('verdict')
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('A9hzqHsocEA')
place(mix, mus, 73.82 - V, 0, DUR, .5, .05, 1.6)
mix *= np.interp(tt, [0, 13.4, 14.0, DUR], [2.0, 2.0, 1.0, 1.0])[:, None]
room = bp(noise(DUR), 100, 600)[:N]; add(mix, norm(room), 0, .01)
def bark():
    d = .16; tt_ = t_(d); f0 = 520 * (1 - .35 * tt_ / d)
    x = np.sin(2 * np.pi * np.cumsum(f0) / SR) + .5 * np.sin(4 * np.pi * np.cumsum(f0) / SR) + .4 * bp(noise(d), 400, 2500)[:len(tt_)]
    return norm(x * np.minimum(1, tt_ / .01) * np.exp(-tt_ / .06))
for x in EV:
    ty = x['type']
    if ty == 'lock':
        d = .05; add(mix, norm(bp(noise(d), 1500, 6000) * np.exp(-t_(d) / .008)), x['t'], .08); add(mix, tone(1760, .25, .06), x['t'] + .06, .05)
    if ty == 'tick':
        for k in range(2): d = .03; add(mix, norm(bp(noise(d), 2500, 7000) * np.exp(-t_(d) / .005)), x['t'] + k * .5, .06)
    if ty == 'door':
        d = .3; add(mix, norm(lp(noise(d), 400) * np.exp(-t_(d) / .07)), x['t'], .08); add(mix, norm(bp(noise(.06), 1500, 4000) * np.exp(-t_(.06) / .01)), x['t'] - .05, .035)
    if ty == 'bark': add(mix, bark(), x['t'], .07, .2); add(mix, bark(), x['t'] + .28, .06, .2)
    if ty == 'verdict': d = .5; env = np.minimum(1, t_(d) / .45) ** 2; add(mix, norm(lp(noise(d), 1200) * env), x['t'] - .45, .04)
    if ty == 'chime': add(mix, chime(), x['t'], .06)
    if ty == 'card': add(mix, tone(294, 2.2, .9), x['t'], .06)
finish(mix, HERE)
