"""video-7 mix: the client's track "Nightcrawler (Instrumental)" (catalogue #3) plays forward while evolution climbs (its
beat drop, track 7.9, on the student's arrival, film 6.0), then from the flip (8.3) the same music plays BACKWARDS and
slows to a tape-stop as he devolves into a cell. Silence and one tiny ping. The drop comes back on the end card.
Run:  . tools/env.sh && "$LIB/.venv/bin/python" mix.py   → out/mix.wav"""
import glob, json, os, subprocess, sys
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__)); STUDIO = os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, os.path.join(os.environ.get('LIB', os.path.join(STUDIO, '.lemo-opuscar')), 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, add, compress   # noqa: E402

EVJ = json.load(open(os.path.join(HERE, 'events.json'))); DUR, EV = EVJ['dur'], EVJ['ev']
ev1 = lambda ty: next(e['t'] for e in EV if e['type'] == ty)
FLIP = next(e['t'] for e in EV if e['type'] == 'morph' and e['form'] == 'cavephone'); STOP = ev1('stop'); CARD = ev1('end') - .1
N = int(DUR * SR); mix = np.zeros((N, 2))
track = glob.glob(os.path.join(STUDIO, 'assets/music/aQkfOkFvx2U__*.mp3'))[0]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', track, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
mus = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64); mus /= np.abs(mus).max()
lin = lambda n, a, b: np.linspace(a, b, n)[:, None]
OFF = 7.9 - 6.0                                   # track drop on the student's arrival
A = mus[int(OFF * SR):int((OFF + FLIP) * SR)].copy(); A[:int(.2 * SR)] *= lin(int(.2 * SR), 0, 1); mix[:len(A)] += A * .6
# backwards from the flip point, slowing down (varispeed) to a stop at STOP
dur_b = STOP - FLIP; n_b = int(dur_b * SR)
src_end = (OFF + FLIP) * SR                       # read position at the flip, moving backwards
speed = np.ones(n_b); slow0 = int(max(0, dur_b - 1.8) * SR); speed[slow0:] = np.linspace(1, 0, n_b - slow0) ** 1.5
pos = src_end - np.cumsum(speed); pos = np.clip(pos, 0, len(mus) - 2)
i0 = pos.astype(int); fr = (pos - i0)[:, None]; Bk = mus[i0] * (1 - fr) + mus[i0 + 1] * fr
Bk[-int(.05 * SR):] *= lin(int(.05 * SR), 1, 0)
mix[int(FLIP * SR):int(FLIP * SR) + n_b] += Bk * .6
# end card: the drop again
C0 = 7.9 - .5; C = mus[int(C0 * SR):int(C0 * SR) + (N - int((CARD - .5) * SR))].copy(); C[:int(.4 * SR)] *= lin(int(.4 * SR), 0, 1); C[-int(1.6 * SR):] *= lin(int(1.6 * SR), 1, 0)
s0 = int((CARD - .5) * SR); mix[s0:s0 + len(C)] += C[:N - s0] * .5

def tone(f, d, tau): x = np.sin(2 * np.pi * f * t_(d)) * np.exp(-t_(d) / tau); x[:96] *= np.linspace(0, 1, 96); return x
def ping(): x = np.zeros(int(.6 * SR)); a = tone(1568, .3, .08); b = tone(2349, .45, .12); x[:len(a)] += a; s = int(.11 * SR); x[s:s + len(b)] += b; return norm(x)
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'morph':   # a soft "pop" per change of form, pitched down once it goes backwards
        d = .18; f0 = 900 if t < FLIP else 380; x = np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f0 * (1.6 if t < FLIP else .6), int(d * SR))) / SR) * np.exp(-t_(d) / .05)
        add(mix, norm(x), t, .12)
    elif ty == 'ping': add(mix, ping(), t, .3)
    elif ty == 'tinyping': add(mix, ping() * .5, t, .12)
    elif ty == 'card': add(mix, tone(220, 2.2, .9), t, .07)
# primordial ooze bubbles after the water
rng = np.random.default_rng(5)
for i in range(18):
    at = 11 + rng.random() * 8; d = .08; x = np.sin(2 * np.pi * np.cumsum(np.linspace(300, 900, int(d * SR))) / SR) * np.exp(-t_(d) / .02); add(mix, x, at, .05, rng.random() - .5)
for c in range(2): mix[:, c] = compress(mix[:, c], thr=.5, ratio=2.5)
mix = np.tanh(mix * 1.05) / np.tanh(1.05)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR, subtype='FLOAT')
print(f'out/mix.wav {DUR:.2f}s rms {20*np.log10(np.sqrt(np.mean(mix**2))+1e-9):.1f} dBFS peak {20*np.log10(np.abs(mix).max()+1e-9):.1f} dBFS')
