"""video-2 mix: the client's track "you lost - Scheming (Instrumental Slowed)" cut to picture (bass entry on the time-lapse,
hard stop on the downbeat at his death, quiet intro back under the text and end card) + synthesized foley from events.json.
Run with the library's Python (. tools/env.sh first):  "$LIB/.venv/bin/python" mix.py   → out/mix.wav"""
import glob, json, os, subprocess, sys
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
STUDIO = os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, os.path.join(os.environ.get('LIB', os.path.join(STUDIO, '.lemo-opuscar')), 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, add, compress   # noqa: E402

EVJ = json.load(open(os.path.join(HERE, 'events.json')))
DUR, EV = EVJ['dur'], EVJ['ev']
ev = lambda ty: [e for e in EV if e['type'] == ty]
DIE = ev('slump')[0]['t']
# must match story.js MUSIC
OFFSET, STOP_TRACK, OUTRO_AT, OUTRO_LEN = 9.8, 25.56, 18.0, DUR - 18.0

track = glob.glob(os.path.join(STUDIO, 'assets/music/BYGz4ttihm8__*.mp3'))[0]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', track, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
mus = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)
mus /= np.abs(mus).max()

N = int(DUR * SR)
mix = np.zeros((N, 2))
fade = lambda n, a, b: np.linspace(a, b, n)[:, None]

# —— A: track 9.8 → 25.56 at film 0 → 15.76; quieter under the hook, full from the bass entry ——
a0, a1 = int(OFFSET * SR), int(STOP_TRACK * SR); A = mus[a0:a1].copy()
A[:int(.25 * SR)] *= fade(int(.25 * SR), 0, 1)
g = np.ones(len(A)); k0, k1 = int(3.6 * SR), int(4.6 * SR); g[:k0] = .62; g[k0:k1] = np.linspace(.62, 1, k1 - k0); A *= g[:, None]
mix[:len(A)] += A * .8
# hard stop + a short dark tail (low-passed, decaying echo of the last beat)
tail_src = mus[a1 - int(.7 * SR):a1]; tail = np.zeros((int(2.2 * SR), 2))
for i, (d, gn) in enumerate([(0, .55), (.33, .32), (.66, .18), (1.0, .1)]):
    s = int(d * SR); seg = tail_src[:len(tail) - s]; tail[s:s + len(seg)] += seg * gn
tail = np.stack([lp(tail[:, c], 700, 2) for c in range(2)], 1) * np.exp(-t_(2.2) / .55)[:, None]
add_at = int(DIE * SR); mix[add_at:add_at + len(tail)] += tail[:N - add_at] * .8

# —— B: the track's quiet intro under the text and the end card ——
B = mus[:int(OUTRO_LEN * SR)].copy() * .5
B[:int(1.2 * SR)] *= fade(int(1.2 * SR), 0, 1); B[-int(1.6 * SR):] *= fade(int(1.6 * SR), 1, 0)
o = int(OUTRO_AT * SR); mix[o:o + len(B)] += B[:N - o]

# —— foley ——
rng = np.random.default_rng(5)
def tone(f, d, tau): tt = t_(d); x = np.sin(2 * np.pi * f * tt) * np.exp(-tt / tau); x[:96] *= np.linspace(0, 1, 96); return x
def tap(): d = .03; return norm(hp(noise(d), 2500) * env_exp(d, .003) + tone(3200, d, .004) * .3)
def ping(): x = np.zeros(int(.6 * SR)); a = tone(1568, .3, .08); b = tone(2349, .45, .12); x[:len(a)] += a; s = int(.11 * SR); x[s:s + len(b)] += b; return norm(x)
def tick(hi): d = .04; return norm(bp(noise(d), 2500 if hi else 1800, 6000) * env_exp(d, .004) + tone(2600 if hi else 2100, d, .006) * .4)
def thud_wood(): d = .5; tt = t_(d); return norm(np.sin(2 * np.pi * 140 * tt) * np.exp(-tt / .05) + bp(noise(d), 600, 4000) * np.exp(-tt / .015) * .7 + tone(1900, d, .01) * .3)
def cloth(): d = .5; return norm(lp(noise(d), 900) * np.sin(np.pi * t_(d) / d) ** 2)
def click(): d = .05; return norm(hp(noise(d), 3000) * env_exp(d, .004))

for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'tap' and t < DIE: add(mix, tap(), t, .05 if t < 4.6 else .03, pan=.2)
    elif ty == 'ping': add(mix, ping(), t, .16 if t < DIE else .2, pan=.15)
    elif ty == 'year': add(mix, tick(e['age'] % 2 == 0), t, .07, pan=-.35 if e['age'] % 2 else .35)
    elif ty == 'chime': add(mix, tone(2637, 1.0, .35) * .5 + tone(3951, 1.0, .2) * .25, t, .18)
    elif ty == 'slump': add(mix, cloth(), t, .12)
    elif ty == 'land': add(mix, thud_wood(), t, .45, pan=.1)
    elif ty == 'off': add(mix, click(), t, .12)
    elif ty == 'card': add(mix, tone(330, 2.2, .9), t, .14); add(mix, tone(660, 1.6, .5) * .3, t, .14)
    elif ty == 'end': add(mix, tone(523, 2.6, 1.0) * .6, t, .12); add(mix, tone(784, 2.2, .8) * .4, t, .12)

# room tone (very low) so the silence after the death isn't digital zero
rt = lp(noise(DUR), 300) * .004; mix[:len(rt)] += np.stack([rt, np.roll(rt, 600)], 1)[:N]

for c in range(2): mix[:, c] = compress(mix[:, c], thr=.5, ratio=2.5)
mix = np.tanh(mix * 1.05) / np.tanh(1.05)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR, subtype='FLOAT')
print(f'out/mix.wav {DUR:.2f}s rms {20*np.log10(np.sqrt(np.mean(mix**2))+1e-9):.1f} dBFS peak {20*np.log10(np.abs(mix).max()+1e-9):.1f} dBFS')
