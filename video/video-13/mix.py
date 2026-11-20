"""video-13 mix ("How it works EP. 1"): catalogue #7 "Acid Rain (Slowed)" from track 21.25 s, so its hits (24.45, 27.15, 29.6) land on
the tap (film 3.2), the last screen locking (5.9) and the desk lamp (8.35). Every device pings in its own pitch until it locks; each lock is a
latch plus one note of a rising chord; rain on the window throughout. Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
from sfx import click, thump
import soundfile as sf, soxr

DUR, EV = events(HERE)
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]
ev = lambda ty: [x for x in EV if x['type'] == ty]
e1 = lambda ty: ev(ty)[0]['t']
END, TAP, LAMP = e1('end'), e1('tap'), e1('lamp')

# —— voice ——
vo = np.zeros(N); vmask = np.zeros(N)
for x in ev('voice'):
    w, sr = sf.read(os.path.join(HERE, 'out', 'voice', x['id'] + '.wav')); w = w if w.ndim == 1 else w.mean(1)
    w = soxr.resample(w, sr, SR); w = lp(hp(w, 110), 7000); w = compress(w / (np.abs(w).max() + 1e-9), thr=.3, ratio=3)
    w = w / (np.sqrt(np.mean(w ** 2)) + 1e-9) * .12
    s = int(x['t'] * SR); e = min(N, s + len(w)); vo[s:e] += w[:e - s]; vmask[max(0, s - 2400):min(N, e + 4800)] = 1

# —— music: in the track from 21.25 s, already playing at frame 0 ——
mus = track('A9hzqHsocEA'); M = np.zeros((N, 2)); place(M, mus, 21.25, 0, DUR, 1.0, .12, 1.4)
g = np.where(tt < TAP, .30, .40); g[tt >= END] = .36
g = np.convolve(g, np.ones(int(.08 * SR)) / int(.08 * SR), 'same')
duck = np.convolve(vmask, np.ones(int(.12 * SR)) / int(.12 * SR), 'same'); g *= 1 - .55 * duck
mix += M * g[:, None]

# —— rain on the window (the set's bed), a little softer once the lamp is on ——
rain = bp(noise(DUR), 900, 7000)[:N] * (.75 + .25 * np.sin(2 * np.pi * .23 * tt)); drops = np.zeros(N)
rng = np.random.default_rng(13)
for at in rng.random(140) * DUR: s = int(at * SR); d = int(.012 * SR); drops[s:s + d] += hp(noise(.012), 2500)[:len(drops[s:s + d])] * rng.random()
bed = norm(rain) * .5 + norm(drops) * .5; bed *= np.where(tt < LAMP, 1.0, .75) * (tt < END)
add(mix, bed, 0, .05, .1)

# —— every device pings in its own pitch until it locks ——
PITCH = [(1568, 2349), (1319, 1976), (1760, 2637), (1175, 1760)]; PAN = [-.35, .05, .4, .2]
def ping2(a, b): x = np.zeros(int(.6 * SR)); p = tone(a, .3, .08); q = tone(b, .45, .12); x[:len(p)] += p; s = int(.11 * SR); x[s:s + len(q)] += q; return norm(x)
for x in ev('ping'): add(mix, ping2(*PITCH[x['n']]), x['t'], .07, PAN[x['n']])

# —— the tap, then each lock: a latch + one note of a rising chord (C, E, G, high C) ——
add(mix, norm(click(1.6)), TAP, .2)
add(mix, norm(tone(659, .8, .2) + tone(988, .8, .15) * .5), e1('open'), .05)
NOTE = [262, 330, 392, 523]
for x in ev('lock'):
    n = x['n']; add(mix, norm(thump(1.0, 80 - n * 4)), x['t'], .32, PAN[n]); add(mix, norm(click(.8)), x['t'] + .01, .16, PAN[n])
    add(mix, norm(tone(NOTE[n], 2.4, .9) + tone(NOTE[n] * 2, 2.4, .6) * .35 + tone(NOTE[n] * 3, 2.4, .3) * .12), x['t'], .1, PAN[n] * .5)
add(mix, norm(click(.7)), LAMP, .25); add(mix, norm(lp(noise(.6), 120) * env_exp(.6, .3)), LAMP, .05)
for x in ev('chime'): add(mix, chime(), x['t'], .045)
add(mix, tone(294, 2.2, .9), e1('card'), .07); add(mix, tone(392, 2.0, .8), e1('card2'), .05)
add(mix, norm(tone(523, 2.4, .9) + tone(784, 2.4, .7) * .4), END + .1, .05)

mix += np.stack([vo, vo], 1)
finish(mix, HERE)
