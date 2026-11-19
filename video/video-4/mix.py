"""video-4 mix: the client's track "Acid Rain (Slowed)" (catalogue #7): its soft intro under the three dinners, hard stop
into silence on the empty chair (17.2), then back from track 20.25 so its beat entry (track 24.45) lands on the end card
(film 24.6) + foley (room murmur, cutlery, candle, clock) from events.json.
Run:  . tools/env.sh && "$LIB/.venv/bin/python" mix.py   → out/mix.wav"""
import glob, json, os, subprocess, sys
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
STUDIO = os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, os.path.join(os.environ.get('LIB', os.path.join(STUDIO, '.lemo-opuscar')), 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, add, compress   # noqa: E402

EVJ = json.load(open(os.path.join(HERE, 'events.json'))); DUR, EV = EVJ['dur'], EVJ['ev']
SIL = next(e['t'] for e in EV if e['type'] == 'silence'); TXT = next(e['t'] for e in EV if e['type'] == 'card')
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]

track = glob.glob(os.path.join(STUDIO, 'assets/music/A9hzqHsocEA__*.mp3'))[0]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', track, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
mus = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64); mus /= np.abs(mus).max()
ramp_ = lambda n, a, b: np.linspace(a, b, n)[:, None]
# A: intro under the dinners, hard stop with a 0.6 s low-passed tail
A = mus[:int(SIL * SR)].copy(); A[:int(.4 * SR)] *= ramp_(int(.4 * SR), 0, 1); mix[:len(A)] += A * .95
tl = mus[int(SIL * SR):int((SIL + .9) * SR)].copy(); tl = np.stack([lp(tl[:, c], 600) for c in range(2)], 1) * np.exp(-t_(.9) / .2)[:len(tl), None]
mix[len(A):len(A) + len(tl)] += tl * .9
# B: from track 20.25 at the first text card, beat entry on the end card
B0 = 20.25; B = mus[int(B0 * SR):int(B0 * SR) + (N - int(TXT * SR))].copy()
B[:int(.8 * SR)] *= ramp_(int(.8 * SR), 0, 1); B[-int(1.5 * SR):] *= ramp_(int(1.5 * SR), 1, 0)
mix[int(TXT * SR):int(TXT * SR) + len(B)] += B * .95

rng = np.random.default_rng(9)
def tone(f, d, tau): x = np.sin(2 * np.pi * f * t_(d)) * np.exp(-t_(d) / tau); x[:96] *= np.linspace(0, 1, 96); return x
def clink(): d = .5; return norm(sum(tone(f, d, .08 + rng.random() * .06) * a for f, a in [(2900 + rng.random() * 400, 1), (4100 + rng.random() * 500, .6), (6200, .3)]))
# family murmur under the dinners (band-passed, syllable-modulated noise), gone in the last year
mur = bp(noise(DUR), 250, 1400) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 3.1 * tt + 2 * np.sin(2 * np.pi * .4 * tt))))
menv = np.clip(np.minimum(tt / .5, (SIL - tt) / .3), 0, 1); add(mix, norm(mur[:N]) * menv, 0, .03, -.2)
for i in range(14):
    at = .8 + rng.random() * (SIL - 1.5); add(mix, clink(), at, .035, pan=rng.random() - .5)
# last year: clock ticking and a soft candle crackle in the silence
for k in range(int((TXT - SIL) / .9) + 1):
    at = SIL + .3 + k * .9; d = .04; add(mix, norm(bp(noise(d), 2000, 6000) * env_exp(d, .004)), at, .05, pan=-.4)
crack = hp(noise(DUR), 2500) * (rng.random(len(tt)) > .9993); add(mix, crack[:N] * np.clip((tt - SIL) / .5, 0, 1) * np.clip((DUR - 5 - tt), 0, 1), 0, .3, .2)
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'chime': add(mix, tone(2637, 1.0, .3) * .5 + tone(3951, 1.0, .2) * .25, t, .1 if e.get('who') == 'YOU' else .13)
    elif ty == 'year': w = bp(noise(.7), 300, 3000) * np.sin(np.pi * t_(.7) / .7) ** 2; add(mix, norm(w), t - .35, .05)
    elif ty == 'card' and t > TXT: add(mix, tone(330, 2.0, .8), t, .08)
rt = lp(noise(DUR), 250) * .004; mix[:N] += np.stack([rt, np.roll(rt, 700)], 1)[:N]

for c in range(2): mix[:, c] = compress(mix[:, c], thr=.5, ratio=2.5)
mix = np.tanh(mix * 1.05) / np.tanh(1.05)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR, subtype='FLOAT')
print(f'out/mix.wav {DUR:.2f}s rms {20*np.log10(np.sqrt(np.mean(mix**2))+1e-9):.1f} dBFS peak {20*np.log10(np.abs(mix).max()+1e-9):.1f} dBFS')
