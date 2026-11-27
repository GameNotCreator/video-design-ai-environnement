"""video-37 mix ("L'été"): catalogue #7 "Acid Rain (Slowed)" from track 60.22 s, so its drop (measured low-band onset,
track 73.82 s) lands on the song at the party (film 13.6); it runs under the closing text and the card.
A padlock click when the lower floor locks the phone; guitar strums (Karplus-Strong) as he learns: muted and wrong in
July, a clean chord in August, an arpeggio in late August; party murmur from the back-to-school party; applause after
the song starts; a chime on each line.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
V, PARTY, END = e('verdict'), e('party'), e('card')
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('A9hzqHsocEA'); rng = np.random.default_rng(37)
place(mix, mus, 73.82 - V, 0, DUR, .5, .05, 1.6)
room = bp(noise(DUR), 100, 600)[:N]; add(mix, norm(room), 0, .01)

def pluck(f, d=1.6, damp=.996, bright=.5):
    n = int(d * SR); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p); buf = lp(buf, 2000 + 5000 * bright) if p > 64 else buf
    out = np.zeros(n)
    for i in range(n): out[i] = buf[i % p]; buf[i % p] = damp * .5 * (buf[i % p] + buf[(i + 1) % p])
    return out
def strum(fs, at, gain, gap=.012, **k):
    for i, f in enumerate(fs): add(mix, norm(pluck(f, **k)), at + i * gap, gain / len(fs) ** .5, (i / len(fs) - .5) * .4)
G = [98.0, 123.5, 146.8, 196.0, 246.9, 392.0]          # a G major chord
for x in EV:
    ty = x['type']
    if ty == 'lock':
        d = .05; add(mix, norm(bp(noise(d), 1500, 6000) * np.exp(-t_(d) / .008)), x['t'], .08); add(mix, tone(1760, .25, .06), x['t'] + .06, .05)
    if ty == 'strum':
        k = x['k']
        if k == 0: strum([98.0, 130.0, 147.0, 185.0], x['t'], .11, gap=.03, d=.5, damp=.985, bright=.1)          # muted, wrong
        elif k == 1: strum(G, x['t'], .16, d=1.4); strum(G, x['t'] + .55, .11, d=1.2)
        else:
            for i, f in enumerate([98.0, 146.8, 196.0, 246.9, 293.7, 246.9]): add(mix, norm(pluck(f, d=1.4)), x['t'] + i * .16, .1, (i / 6 - .5) * .4)
    if ty == 'party':
        mur = bp(brown(DUR), 200, 1200)[:N] * np.clip(np.minimum((tt - PARTY) / .4, (END - .3 - tt) / .6), 0, 1); add(mix, norm(mur), 0, .05)
    if ty == 'verdict': d = .5; env = np.minimum(1, t_(d) / .45) ** 2; add(mix, norm(lp(noise(d), 1200) * env), x['t'] - .45, .04)
    if ty == 'clap':
        for i in range(90):
            at = x['t'] + rng.random() * 2.4 * (1 - .3 * rng.random()); d = .02
            add(mix, norm(bp(noise(d), 900, 4000) * np.exp(-t_(d) / .004)), at, .02 * (1 - (at - x['t']) / 3.0), rng.random() - .5)
    if ty == 'chime': add(mix, chime(), x['t'], .06)
    if ty == 'card': add(mix, tone(294, 2.2, .9), x['t'], .06)
finish(mix, HERE)
