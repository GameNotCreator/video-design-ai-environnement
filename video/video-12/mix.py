"""video-12 v2 mix ("Can I cheat it? EP. 1", almost silent: no voice): catalogue #6 "Scheming (Instrumental Slowed)" from track 4.5 s,
so its drop (track 14.4 s) lands on the laptop's lock (film 9.9); a near-silence while the phone is off; library room tone (a quiet hall,
a page now and then); foley on every event of window.EV. Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
from sfx import click, thump, whoosh, creak, pop

DUR, EV = events(HERE)
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]
ev = lambda ty: [x for x in EV if x['type'] == ty]
e1 = lambda ty: ev(ty)[0]['t']
END, OFF, LOCK3 = e1('end'), e1('off'), ev('fail')[2]['t']

# —— music: in the track from 4.5 s (already playing at frame 0), its drop on the laptop's lock ——
mus = track('BYGz4ttihm8'); M = np.zeros((N, 2)); place(M, mus, 4.5, 0, DUR, 1.0, .15, 1.4)
g = np.ones(N) * .7
g[(tt >= OFF) & (tt < ev('fail')[0]['t'])] = .05      # the phone is off: almost nothing
g[tt >= LOCK3 - .05] = .44; g[tt >= END] = .38
g = np.convolve(g, np.ones(int(.08 * SR)) / int(.08 * SR), 'same'); mix += M * g[:, None]

# —— library room tone: a soft hall, a far page turn, a chair ——
add(mix, norm(lp(brown(DUR), 500))[:N] * (tt < END), 0, .03)
for at in (1.4, 6.8, 12.2): add(mix, norm(bp(noise(.3), 1500, 6000) * env_exp(.3, .08)), at, .025, .5)

# —— foley ——
for x in ev('try'): add(mix, norm(tone(587, 1.0, .25) + tone(880, 1.0, .18) * .5), x['t'], .06)
for i, x in enumerate(ev('fail')):                       # the lock slams back: low thunk + latch click
    add(mix, norm(thump(1.0, 62 if i == 2 else 78)), x['t'], .5 if i == 2 else .38); add(mix, norm(click(.8)), x['t'] + .01, .18)
    if i == 2: add(mix, norm(lp(noise(1.2), 300) * env_exp(1.2, .35)), x['t'], .25)
add(mix, norm(click(1.4)), e1('press'), .2)
d = .45; add(mix, norm(np.sin(2 * np.pi * np.cumsum(np.linspace(620, 110, int(d * SR))) / SR) * env_exp(d, .18)), OFF - .05, .16)   # power down
b = np.zeros(int(.6 * SR)); p1 = tone(523, .22, .25); p2 = tone(784, .22, .25); b[:len(p1)] += p1; s = int(.14 * SR); b[s:s + len(p2)] += p2
add(mix, norm(b), e1('boot') + .1, .08)
for k in range(6): add(mix, norm(click(2.2, .5)), e1('jiggle') + k * .11, .05, (-1) ** k * .2)
add(mix, norm(pop()), e1('poof'), .22); add(mix, norm(whoosh(.3)), e1('poof') + .02, .1)
add(mix, norm(click(1.8)), e1('tap'), .16)
add(mix, norm(lp(noise(.1), 900) * env_exp(.1, .02)), e1('down'), .22)     # phone laid on the table
add(mix, norm(creak()), e1('lid'), .08); add(mix, norm(click(.9)), e1('lid') + .38, .12)
for k in range(2): add(mix, ping(), e1('desk') + .25 + k * .55, .07)
add(mix, norm(bp(noise(.4), 1200, 6000) * (env_exp(.4, .12) * (1 + .6 * np.sin(2 * np.pi * 22 * t_(.4))))), e1('book'), .1)   # pages
add(mix, tone(294, 2.2, .9), e1('card'), .07)
add(mix, norm(tone(587, 2.4, .9) + tone(880, 2.4, .7) * .4), END + .1, .05)
finish(mix, HERE)
