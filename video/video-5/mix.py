"""video-5 mix: the client's track "Stranger Things Main Theme" (catalogue #1) under the funeral, hard stop on the overhead
coffin shot (rain only), the phone's notification + buzz on wood in the silence, then the theme again, low, under the text
and the end card. Run:  . tools/env.sh && "$LIB/.venv/bin/python" mix.py   → out/mix.wav"""
import glob, json, os, subprocess, sys
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__)); STUDIO = os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, os.path.join(os.environ.get('LIB', os.path.join(STUDIO, '.lemo-opuscar')), 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, add, compress   # noqa: E402

EVJ = json.load(open(os.path.join(HERE, 'events.json'))); DUR, EV = EVJ['dur'], EVJ['ev']
ev1 = lambda ty: next(e['t'] for e in EV if e['type'] == ty)
STOP, TXT = ev1('stop'), ev1('card')
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]
track = glob.glob(os.path.join(STUDIO, 'assets/music/01qStKYB7ts__*.mp3'))[0]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', track, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
mus = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64); mus /= np.abs(mus).max()
lin = lambda n, a, b: np.linspace(a, b, n)[:, None]
A = mus[int(.8 * SR):int(.8 * SR) + int(STOP * SR)].copy(); A[:int(.3 * SR)] *= lin(int(.3 * SR), 0, 1); mix[:len(A)] += A * .7
tail = mus[int(.8 * SR) + len(A):int(.8 * SR) + len(A) + int(.8 * SR)].copy(); tail = np.stack([lp(tail[:, c], 500) for c in range(2)], 1) * np.exp(-t_(.8) / .18)[:len(tail), None]
mix[len(A):len(A) + len(tail)] += tail * .7
B = mus[int(.8 * SR):int(.8 * SR) + (N - int(TXT * SR))].copy(); B[:int(1.0 * SR)] *= lin(int(1.0 * SR), 0, 1); B[-int(1.4 * SR):] *= lin(int(1.4 * SR), 1, 0)
mix[int(TXT * SR):int(TXT * SR) + len(B)] += B * .5

rng = np.random.default_rng(4)
def tone(f, d, tau): x = np.sin(2 * np.pi * f * t_(d)) * np.exp(-t_(d) / tau); x[:96] *= np.linspace(0, 1, 96); return x
rain = bp(noise(DUR), 800, 9000)[:N] + lp(noise(DUR), 400)[:N] * .5
drops = np.zeros(N); idx = rng.integers(0, N - 2000, 900)
for i in idx: d = int(.012 * SR); drops[i:i + d] += hp(noise(.012), 3000)[:d] * np.exp(-np.arange(d) / (.002 * SR)) * (rng.random() * .8 + .2)
renv = np.clip(np.minimum(tt / .4, (TXT + 2 - tt) / 1.5), .25, 1); renv = np.where(tt > DUR - 4.6, renv * np.clip((DUR - tt) / 4.6, 0, 1), renv)
add(mix, norm(rain) * renv, 0, .08); add(mix, norm(drops) * renv, 0, .05, .3)
def ping(): x = np.zeros(int(.7 * SR)); a = tone(1568, .3, .09); b = tone(2349, .5, .14); x[:len(a)] += a; s = int(.11 * SR); x[s:s + len(b)] += b; return norm(x)
def buzz():
    d = .5; q = t_(d); gate = ((q < .18) | ((q > .26) & (q < .44))).astype(float)
    x = np.sign(np.sin(2 * np.pi * 150 * q)) * .4 + np.sin(2 * np.pi * 150 * q); rattle = bp(noise(d), 300, 1500) * (np.abs(np.sin(2 * np.pi * 150 * q)) > .9)   # on the coffin wood
    return norm(lp(x, 1800) * gate + rattle * gate * .8)
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'chime': add(mix, tone(2637, 1.0, .3) * .5 + tone(3951, 1.0, .2) * .25, t, .1)
    elif ty == 'rec': add(mix, tone(1800, .12, .03), t, .08, .4)
    elif ty == 'swipe': w = bp(noise(.25), 1500, 7000) * np.sin(np.pi * t_(.25) / .25) ** 2; add(mix, norm(w), t, .06, .4)
    elif ty == 'ping': add(mix, ping(), t, .3)
    elif ty == 'buzz': add(mix, buzz(), t, .3)
    elif ty == 'card': add(mix, tone(294, 2.2, .9), t, .08)
for c in range(2): mix[:, c] = compress(mix[:, c], thr=.5, ratio=2.5)
mix = np.tanh(mix * 1.05) / np.tanh(1.05)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR, subtype='FLOAT')
print(f'out/mix.wav {DUR:.2f}s rms {20*np.log10(np.sqrt(np.mean(mix**2))+1e-9):.1f} dBFS peak {20*np.log10(np.abs(mix).max()+1e-9):.1f} dBFS')
