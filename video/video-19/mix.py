"""video-19 mix ("Group project"): catalogue #5 "I'll Do It (Instrumental)" from track 6.6 s so its rise (track 17 s)
lands on presentation day (film 10.4); hard stop on the professor's question, then only the room tone and the silence
of the three turning to him. Library: keyboards, pages, the lamp clicking on each night. Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
PRES, TURN, CARD = e('pres'), e('turn'), e('end') - .1
PROF = [x['t'] for x in EV if x['type'] == 'chime'][-1]
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('kn5HyDC8q7c'); rng = np.random.default_rng(19)
place(mix, mus, 17.0 - PRES, 0, PROF, .5, .3, .02, tail=.6)
place(mix, mus, 16.6, CARD - .3, DUR - CARD + .3, .42, .5, 1.4)
keys = np.zeros(N)
for i in range(260):
    at = rng.random() * (PRES - .2); s = int(at * SR); dd = int(.018 * SR); keys[s:s + dd] += bp(noise(.018), 1500, 7000)[:dd] * np.exp(-np.arange(dd) / (.004 * SR)) * (.4 + rng.random())
add(mix, norm(keys), 0, .06, -.2)
for x in EV:
    if x['type'] == 'tick':
        d = .06; add(mix, norm(bp(noise(d), 1800, 7000) * np.exp(-t_(d) / .008)), x['t'], .1, .1)
        add(mix, norm(bp(noise(.03), 2000, 6000) * np.exp(-t_(.03) / .005)), x['t'] + .05, .06, .4)   # the lamp switch
    if x['type'] == 'chime': add(mix, chime(), x['t'], .07)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
room = bp(noise(DUR), 150, 900)[:N] * ((tt >= PRES) & (tt < e('card'))); add(mix, norm(room), 0, .02)
for k in range(3): d = .15; add(mix, norm(lp(noise(d), 600) * np.exp(-t_(d) / .04)), TURN + k * .12, .05, -.3 + k * .2)   # three shoes turning
finish(mix, HERE)
