"""video-13 v2 mix ("How it works EP. 1", almost silent: no voice): catalogue #7 "Acid Rain (Slowed)" from track 21.25 s, so its hits
(24.45, 27.15, 29.6) land on the tap (film 3.2), the last screen locking (5.9) and 8.35. A café bed (murmur, a cup, the espresso machine),
every device pinging in its own pitch until it locks, each lock a latch plus one note of a rising chord. Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
from sfx import click, thump

DUR, EV = events(HERE)
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]
ev = lambda ty: [x for x in EV if x['type'] == ty]
e1 = lambda ty: ev(ty)[0]['t']
END, TAP = e1('end'), e1('tap')

# —— music: in the track from 21.25 s, already playing at frame 0 ——
mus = track('A9hzqHsocEA'); M = np.zeros((N, 2)); place(M, mus, 21.25, 0, DUR, 1.0, .12, 1.4)
g = np.where(tt < TAP, .5, .45); g[tt >= END] = .4
g = np.convolve(g, np.ones(int(.08 * SR)) / int(.08 * SR), 'same'); mix += M * g[:, None]

# —— café bed: murmur, a cup on a saucer now and then, the espresso machine once ——
mur = bp(noise(DUR), 250, 1600)[:N] * (.55 + .45 * np.abs(np.sin(2 * np.pi * 2.7 * tt + 2 * np.sin(2 * np.pi * .35 * tt))))
add(mix, norm(mur) * (tt < END), 0, .035, -.15)
for at in (1.1, 5.2, 9.3): add(mix, norm(tone(3100, .35, .06) + tone(4300, .35, .04) * .6), at, .03, .4)
add(mix, norm(hp(noise(1.6), 2500) * np.sin(np.pi * t_(1.6) / 1.6) ** 2), 7.6, .03, .6)

# —— every device pings in its own pitch until it locks ——
PITCH = [(1568, 2349), (1319, 1976), (1760, 2637)]; PAN = [-.35, .05, .35]
def ping2(a, b): x = np.zeros(int(.6 * SR)); p = tone(a, .3, .08); q = tone(b, .45, .12); x[:len(p)] += p; s = int(.11 * SR); x[s:s + len(q)] += q; return norm(x)
for x in ev('ping'): add(mix, ping2(*PITCH[x['n']]), x['t'], .07, PAN[x['n']])

# —— the tap, then each lock: a latch + one note of a rising chord (C, E, G) ——
add(mix, norm(click(1.6)), TAP, .2)
add(mix, norm(tone(659, .8, .2) + tone(988, .8, .15) * .5), e1('open'), .05)
NOTE = [262, 330, 392]
for x in ev('lock'):
    n = x['n']; add(mix, norm(thump(1.0, 80 - n * 4)), x['t'], .32, PAN[n]); add(mix, norm(click(.8)), x['t'] + .01, .16, PAN[n])
    add(mix, norm(tone(NOTE[n], 2.4, .9) + tone(NOTE[n] * 2, 2.4, .6) * .35 + tone(NOTE[n] * 3, 2.4, .3) * .12), x['t'], .1, PAN[n] * .5)
add(mix, norm(lp(noise(.1), 900) * env_exp(.1, .02)), e1('down'), .2)     # phone laid on the table
add(mix, tone(294, 2.2, .9), e1('card'), .07)
add(mix, norm(tone(523, 2.4, .9) + tone(784, 2.4, .7) * .4), END + .1, .05)
finish(mix, HERE)
