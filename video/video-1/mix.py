"""video-1 mix: night city bed, foley on window.EV (events.json), a small celesta lullaby that dies at the impact,
tinnitus + silence, phone buzzes, card chimes, warm end chord. Everything synthesized (numpy), no samples.
Run with the library's Python:  "$LIB/.venv/bin/python" mix.py   → out/mix.wav"""
import json, os, sys
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.environ.get('LIB', os.path.join(HERE, '../../.lemo-opuscar')), 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, add, compress, limit   # noqa: E402

EVJ = json.load(open(os.path.join(HERE, 'events.json')))
DUR, EV = EVJ['dur'], EVJ['ev']
IMPACT = next(e['t'] for e in EV if e['type'] == 'impact')
N = int(DUR * SR) + SR // 2
mix = np.zeros((N, 2))
rng = np.random.default_rng(11)


def tone(f, d, partials=((1, 1, 1),), tau=.4, vib=0):
    """bell/celesta-like tone: partials (ratio, amp, decay factor)"""
    tt = t_(d); x = sum(a * np.sin(2 * np.pi * f * r * tt + vib * np.sin(2 * np.pi * 5 * tt)) * np.exp(-tt / (tau * k)) for r, a, k in partials)
    a = int(.004 * SR); x[:a] *= np.linspace(0, 1, a); return x


CELESTA = ((1, 1, 1), (2, .35, .5), (3.01, .12, .3), (4.2, .06, .2))
def celesta(midi, d=1.6, v=1.0): return tone(440 * 2 ** ((midi - 69) / 12), d, CELESTA, tau=.55) * v


def pad(freqs, d, v=1.0, cutoff=900):
    tt = t_(d); x = sum(np.sign(np.sin(2 * np.pi * f * (1 + dt) * tt)) * .3 + np.sin(2 * np.pi * f * tt) for f in freqs for dt in (-.003, .003))
    x = lp(x, cutoff, 3); e = np.minimum(1, tt / .8) * np.minimum(1, (d - tt) / 1.0); return norm(x) * e * v


def footstep(surf):
    d = .14; tt = t_(d)
    scuff = bp(noise(d), 250, 3200 if surf == 'pave' else 2200) * env_exp(d, .018)
    heel = np.sin(2 * np.pi * (95 if surf == 'pave' else 80) * tt) * env_exp(d, .03)
    return norm(scuff * .9 + heel * .6) * (.9 + rng.random() * .2)


def ping():
    a = tone(1568, .25, ((1, 1, 1), (2, .2, .5)), tau=.08); b = tone(2349, .45, ((1, 1, 1), (2, .2, .5)), tau=.12)
    x = np.zeros(int(.6 * SR)); x[:len(a)] += a; s = int(.11 * SR); x[s:s + len(b)] += b; return norm(x)


def horn(d=.62):
    tt = t_(d); x = sum(np.sign(np.sin(2 * np.pi * f * tt)) * .5 + np.sin(2 * np.pi * f * tt) for f in (415, 523))
    x = bp(x, 300, 3000, 2); e = np.minimum(1, tt / .015) * np.minimum(1, (d - tt) / .04); return norm(x * e)


def screech(d):
    tt = t_(d); f = 2900 + 350 * np.sin(2 * np.pi * 7 * tt) + 200 * tt
    car = np.sin(2 * np.pi * np.cumsum(f) / SR) + .4 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
    x = car * (.6 + .4 * np.abs(np.sin(2 * np.pi * 31 * tt))) + bp(noise(d), 2000, 5000) * .5
    return norm(x * np.minimum(1, tt / .05) * (0.6 + 0.4 * tt / d))


def engine(d, prox):
    """rumble + engine harmonic, louder and higher as the car nears (prox 0..1 over d)"""
    tt = t_(d); p = prox(tt)
    f0 = 38 + 26 * p; ph = 2 * np.pi * np.cumsum(f0) / SR
    x = np.sin(ph) + .5 * np.sin(2 * ph) + .25 * np.sin(3 * ph) + lp(brown(d), 300) * .8 + bp(noise(d), 400, 1800) * .25 * p
    return x * (.05 + .95 * p ** 2.2)


def impact_sound():
    d = 1.4; tt = t_(d)
    boom = np.sin(2 * np.pi * 48 * tt * (1 - .2 * tt)) * np.exp(-tt / .35)
    body = lp(noise(d), 1500) * np.exp(-tt / .09)
    glass = hp(noise(d), 4500) * np.exp(-tt / .25) * (rng.random(len(tt)) > .7)
    crunch = bp(noise(d), 600, 3000) * np.exp(-tt / .05)
    return norm(boom * 1.0 + body * .8 + glass * .5 + crunch * .7)


def buzz():
    d = .62; tt = t_(d)
    gate = ((tt < .2) | ((tt > .3) & (tt < .5))).astype(float)
    x = np.sign(np.sin(2 * np.pi * 165 * tt)) * .4 + np.sin(2 * np.pi * 165 * tt)
    rattle = bp(noise(d), 900, 3500) * (np.abs(np.sin(2 * np.pi * 165 * tt)) > .96) * .9   # the case rattling on asphalt
    return norm(lp(x, 2500) * gate + rattle * gate) * np.minimum(1, (d - tt) / .02)


# —— beds ——
city = lp(brown(DUR), 450) * .9 + lp(noise(DUR), 160) * .5
cityL, cityR = city, np.roll(city, int(.013 * SR))
tt = t_(DUR)
env_city = np.where(tt < IMPACT, np.minimum(1, tt / .3), 0.0)
env_city += np.where(tt > 9.8, np.minimum(1, (tt - 9.8) / 2.0) * .35, 0) * np.where(tt < 13.8, 1, np.maximum(0, 1 - (tt - 13.8) / .4))
for ch, c in ((0, cityL), (1, cityR)): mix[:len(c), ch] += norm(c) * env_city * .09
# far traffic swells before the car (L/R)
for at, pan in ((1.1, -.6), (3.9, .5)):
    sw = lp(brown(2.2), 900) * np.sin(np.pi * t_(2.2) / 2.2) ** 2; add(mix, norm(sw) * .07, at, pan=pan)

# —— music: celesta lullaby (90 BPM), low pulse from the wide, hard stop at the impact ——
beat = 60 / 90
mel = [76, 79, 83, 79, 76, 79, 84, 83, 76, 79, 83, 79, 74, 78, 81, 78, 76, 79, 83, 86, 84]
for i, m in enumerate(mel):
    at = .35 + i * beat * .5
    if at > IMPACT - .05: break
    add(mix, celesta(m, 1.4, .11 if at < 5 else .08), at, pan=.15 * np.sin(i))
for i in range(40):
    at = 3.2 + i * beat
    if at > IMPACT - .02: break
    k = (at - 3.2) / (IMPACT - 3.2); d = .45
    p = np.sin(2 * np.pi * 49 * t_(d)) * np.exp(-t_(d) / .18) + lp(noise(d), 200) * np.exp(-t_(d) / .03) * .3
    add(mix, norm(p) * (.12 + .35 * k * k), at)
pad1 = pad([110, 164.8, 196], IMPACT - 3.2 + .1, .1, 700); add(mix, pad1 * np.linspace(.4, 1, len(pad1)), 3.2)

# —— foley from events ——
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'step': add(mix, footstep(e.get('surf', 'pave')), t, .16, pan=-.1)
    elif ty == 'chime':
        add(mix, celesta(88, 1.2, .22), t, pan=.1); add(mix, celesta(95, 1.2, .14), t + .09, pan=.1)
        for i in range(21): add(mix, hp(noise(.02), 3000) * env_exp(.02, .004) * .05, .45 + i * (1.0 / 21))   # typewriter ticks
    elif ty == 'ping': add(mix, ping(), t, .2, pan=.25)
    elif ty == 'engine':
        d = IMPACT - t
        def prox(x, d=d): return np.clip(x / d, 0, 1) ** 1.6
        eng = engine(d, prox); add(mix, norm(eng) * .5, t)
    elif ty == 'horn': add(mix, horn(), t, .42)
    elif ty == 'screech': sc = screech(IMPACT - t); add(mix, sc * .4, t)
    elif ty == 'impact': add(mix, impact_sound(), t, .95)
    elif ty == 'buzz': add(mix, buzz(), t, .3, pan=.05)
    elif ty == 'card':
        add(mix, tone(330, 2.4, ((1, 1, 1), (2, .3, .6), (2.76, .15, .4)), tau=.9) * .16, t)
        add(mix, tone(494, 2.0, ((1, 1, 1), (2, .25, .5)), tau=.8) * .08, t + .05)
    elif ty == 'end':
        add(mix, pad([130.8, 196, 261.6, 329.6], DUR - t + .2, .14, 1400), t - .2)
        for i, m in enumerate([72, 76, 79, 84, 86]): add(mix, celesta(m, 2.2, .13), t + i * .12, pan=-.3 + i * .15)

# —— tinnitus after the impact, then silence ——
d = 2.6; ti = np.sin(2 * np.pi * 4150 * t_(d)) * np.exp(-t_(d) / 1.1) * np.minimum(1, t_(d) / .05)
add(mix, ti * .035, IMPACT + .05)

# —— master bus ——
for ch in range(2): mix[:, ch] = compress(mix[:, ch], thr=.35, ratio=3.0)
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix = mix[:int(DUR * SR)]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR, subtype='FLOAT')
rms = 20 * np.log10(np.sqrt(np.mean(mix ** 2)) + 1e-9); pk = 20 * np.log10(np.abs(mix).max() + 1e-9)
print(f'out/mix.wav  {DUR:.2f}s  rms {rms:.1f} dBFS  peak {pk:.1f} dBFS  events {len(EV)}')
