"""video-6 mix: the client's phonk track "GALAXY!" (catalogue #4) from its attack (track 0.5 = film 0) through the freefall,
wind rising with the speed, hard stop dead at the impact (thud, then nothing), birds in the meadow, and the track's big hit
(track 18.76) back on the end card (film 22.6). Run:  . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import glob, json, os, subprocess, sys
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__)); STUDIO = os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, os.path.join(os.environ.get('LIB', os.path.join(STUDIO, '.lemo-opuscar')), 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, add, compress   # noqa: E402

EVJ = json.load(open(os.path.join(HERE, 'events.json'))); DUR, EV = EVJ['dur'], EVJ['ev']
ev1 = lambda ty: next(e['t'] for e in EV if e['type'] == ty)
IMP, MEAD, CARD = ev1('impact'), ev1('meadow'), ev1('end') - .1
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]
track = glob.glob(os.path.join(STUDIO, 'assets/music/Q_rAdk72b-k__*.mp3'))[0]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', track, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
mus = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64); mus /= np.abs(mus).max()
lin = lambda n, a, b: np.linspace(a, b, n)[:, None]
A = mus[int(.5 * SR):int(.5 * SR) + int(IMP * SR)].copy(); mix[:len(A)] += A * .62            # hard stop at the impact
B0 = 18.76 - .6; B = mus[int(B0 * SR):int(B0 * SR) + (N - int((CARD - .6) * SR))].copy()
B[:int(.5 * SR)] *= lin(int(.5 * SR), 0, 1); B[-int(1.6 * SR):] *= lin(int(1.6 * SR), 1, 0)
s0 = int((CARD - .6) * SR); mix[s0:s0 + len(B)] += B[:N - s0] * .55

def tone(f, d, tau): x = np.sin(2 * np.pi * f * t_(d)) * np.exp(-t_(d) / tau); x[:96] *= np.linspace(0, 1, 96); return x
# wind: rising with the fall, cut at the impact
w = bp(noise(DUR), 200, 3000)[:N] * .6 + lp(brown(DUR), 300)[:N]
wenv = np.where(tt < IMP, .35 + .65 * (tt / IMP) ** 1.5, 0); add(mix, norm(w) * wenv, 0, .14)
# the impact: one dull thud, then silence
d = .6; q = t_(d); thud = np.sin(2 * np.pi * 52 * q * (1 - .3 * q)) * np.exp(-q / .12) + lp(noise(d), 600) * np.exp(-q / .03)
add(mix, norm(thud), IMP, .9)
# meadow: birds + soft wind in the grass
rng = np.random.default_rng(2); birds = np.zeros(N)
for i in range(40):
    at = MEAD + .5 + rng.random() * (CARD - MEAD - 1); dd = .1 + rng.random() * .12; f0 = 2600 + rng.random() * 1600; s = int(at * SR)
    ch = np.sin(2 * np.pi * np.cumsum(f0 + 800 * np.sin(2 * np.pi * 16 * t_(dd))) / SR) * np.sin(np.pi * t_(dd) / dd) ** 2; birds[s:s + len(ch)] += ch[:max(0, N - s)]
add(mix, birds, 0, .05, .3)
grass = bp(noise(DUR), 1500, 6000)[:N] * np.clip(np.minimum((tt - MEAD) / 1.0, (CARD + 1 - tt) / 1.0), 0, 1); add(mix, norm(grass), 0, .02, -.2)
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'chime': add(mix, tone(2637, .8, .25) * .5 + tone(3951, .8, .15) * .25, t, .1)
    elif ty == 'card': add(mix, tone(330, 2.0, .8), t, .07)
for c in range(2): mix[:, c] = compress(mix[:, c], thr=.5, ratio=2.5)
mix = np.tanh(mix * 1.05) / np.tanh(1.05)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR, subtype='FLOAT')
print(f'out/mix.wav {DUR:.2f}s rms {20*np.log10(np.sqrt(np.mean(mix**2))+1e-9):.1f} dBFS peak {20*np.log10(np.abs(mix).max()+1e-9):.1f} dBFS')
