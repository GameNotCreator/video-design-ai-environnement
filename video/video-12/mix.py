"""video-12 mix ("Can I cheat it? EP. 1"): catalogue #6 "Scheming (Instrumental Slowed)" under the bedroom, its drop (track 14.4 s)
on the laptop locking (film 15.6), a near-silence while the phone is off, the hero's Kokoro lines low-passed "in the world", foley on
every event of window.EV. Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
from sfx import click, thump, step, whoosh, creak, ding, pop
import soundfile as sf, soxr

DUR, EV = events(HERE)
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]
ev = lambda ty: [x for x in EV if x['type'] == ty]
e1 = lambda ty: ev(ty)[0]['t']

# —— voice: one WAV per line (out/voice, made by tts.py from lines.json), compressed, ~7 kHz low-pass, RMS-matched ——
vo = np.zeros(N); vmask = np.zeros(N)
for x in ev('voice'):
    w, sr = sf.read(os.path.join(HERE, 'out', 'voice', x['id'] + '.wav')); w = w if w.ndim == 1 else w.mean(1)
    w = soxr.resample(w, sr, SR); w = lp(hp(w, 110), 7000); w = compress(w / (np.abs(w).max() + 1e-9), thr=.3, ratio=3)
    w = w / (np.sqrt(np.mean(w ** 2)) + 1e-9) * .14
    s = int(x['t'] * SR); e = min(N, s + len(w)); vo[s:e] += w[:e - s]; vmask[max(0, s - 2400):min(N, e + 4800)] = 1

# —— music: the track from its start at film 1.2, so its drop (14.4) lands on the laptop's lock (15.6) ——
mus = track('BYGz4ttihm8'); M = np.zeros((N, 2)); place(M, mus, 0.0, 1.2, DUR - 1.2, 1.0, .8, 1.6)
g = np.ones(N) * .30
off, boot, relock = e1('off'), e1('boot'), ev('fail')[0]['t']
g[(tt >= off) & (tt < relock)] = .04                       # the phone is off: almost nothing (a held breath)
g[(tt >= e1('stand')) & (tt < 15.55)] *= .8
g[tt >= 15.55] = .42                                        # the drop: the laptop locks too
g[tt >= e1('end')] = .36
k = np.ones(int(.08 * SR)) / int(.08 * SR); g = np.convolve(g, k, 'same')
duck = np.convolve(vmask, np.ones(int(.12 * SR)) / int(.12 * SR), 'same'); g *= 1 - .68 * duck   # ~10 dB under the lines
mix += M * g[:, None]

# —— room tone ——
add(mix, norm(lp(brown(DUR), 380))[:N] * (tt < e1('end')), 0, .025)

# —— foley ——
def tone_seq(fs, d, tau): x = np.zeros(int(d * SR * len(fs))); [add2(x, tone(f, d * 1.6, tau), i * d) for i, f in enumerate(fs)]; return x
def add2(buf, s, at): a = int(at * SR); e = min(len(buf), a + len(s)); buf[a:e] += s[:e - a]
for x in ev('try'):  add(mix, norm(tone(587, 1.0, .25) + tone(880, 1.0, .18) * .5), x['t'], .06)
for i, x in enumerate(ev('fail')):                          # the lock slams back: low thunk + latch click
    add(mix, norm(thump(1.0, 62 if i == 2 else 78)), x['t'], .5 if i == 2 else .38); add(mix, norm(click(.8)), x['t'] + .01, .18)
    if i == 2: add(mix, norm(lp(noise(1.2), 300) * env_exp(1.2, .35)), x['t'], .25)   # the drop's boom
add(mix, norm(click(1.4)), e1('press'), .2)
d = .45; add(mix, norm(np.sin(2 * np.pi * np.cumsum(np.linspace(620, 110, int(d * SR))) / SR) * env_exp(d, .18)), off - .05, .16)   # power down
add(mix, norm(tone_seq([523, 784], .14, .25)), boot + .1, .08)          # boot
for k2 in range(6): add(mix, norm(click(2.2, .5)), e1('jiggle') + k2 * .11, .05, (-1) ** k2 * .2)
add(mix, norm(pop()), e1('poof'), .22); add(mix, norm(whoosh(.3)), e1('poof') + .02, .1)
add(mix, norm(click(1.8)), e1('tap'), .16)
add(mix, norm(bp(noise(.35), 300, 2500) * env_exp(.35, .1)), e1('stand'), .08)   # cloth
for x in ev('step'): st = lp(noise(.09), 700) * env_exp(.09, .02); st[:len(step())] += step() * .25; add(mix, norm(st), x['t'], .3)
add(mix, norm(lp(noise(.12), 900) * env_exp(.12, .03)), e1('toss'), .2)      # phone lands on the quilt
add(mix, norm(creak()), e1('lid'), .08); add(mix, norm(click(.9)), e1('lid') + .38, .12)
for k2 in range(2): add(mix, ping(), e1('desk') + .3 + k2 * .7, .07)          # the desktop pings once or twice
add(mix, norm(bp(noise(.4), 1200, 6000) * (env_exp(.4, .12) * (1 + .6 * np.sin(2 * np.pi * 22 * t_(.4))))), e1('book'), .1)   # pages
add(mix, norm(click(.7)), e1('lamp'), .25); add(mix, norm(lp(noise(.6), 120) * env_exp(.6, .3)), e1('lamp'), .05)
for x in ev('chime'): add(mix, chime(), x['t'], .045)
add(mix, tone(294, 2.2, .9), e1('card'), .07); add(mix, tone(392, 2.0, .8), e1('card2'), .05)
add(mix, norm(tone(587, 2.4, .9) + tone(880, 2.4, .7) * .4), e1('end') + .1, .05)

mix += np.stack([vo, vo], 1)
finish(mix, HERE)
