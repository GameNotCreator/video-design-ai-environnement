"""video-3 mix: the client's track "Can You Hear The Music" (catalogue #2) from 0.5 s, so its first big hit (track 19.00)
lands when he looks up (film 18.5) and the second (track 25.00) on the end card (film 24.5) + foley from events.json.
Run:  . tools/env.sh && "$LIB/.venv/bin/python" mix.py   → out/mix.wav"""
import glob, json, os, subprocess, sys
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
STUDIO = os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, os.path.join(os.environ.get('LIB', os.path.join(STUDIO, '.lemo-opuscar')), 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, add, compress   # noqa: E402

EVJ = json.load(open(os.path.join(HERE, 'events.json'))); DUR, EV = EVJ['dur'], EVJ['ev']
OFFSET = .5
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]

track = glob.glob(os.path.join(STUDIO, 'assets/music/4JZ-o3iAJv4__*.mp3'))[0]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', track, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
mus = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64); mus /= np.abs(mus).max()
M = mus[int(OFFSET * SR):int(OFFSET * SR) + N]
g = np.ones(len(M)); fo = int(1.8 * SR); g[-fo:] = np.linspace(1, 0, fo); g[:int(.3 * SR)] = np.linspace(0, 1, int(.3 * SR))
early = np.ones(len(M)); e1 = int(18.3 * SR); early[:e1] = 1.7; early[e1 - int(.4 * SR):e1] = np.linspace(1.7, 1.0, int(.4 * SR))   # lift the quiet opening of the piece
mix[:len(M)] += M * (g * early)[:, None]

rng = np.random.default_rng(3)
def tone(f, d, tau): x = np.sin(2 * np.pi * f * t_(d)) * np.exp(-t_(d) / tau); x[:96] *= np.linspace(0, 1, 96); return x
def env_between(a, b, fi=.6, fo=.6): return np.clip(np.minimum((tt - a) / fi, (b - tt) / fo), 0, 1)
def bed(x, e, gain, pan=0): x = x[:N] * e; add(mix, x, 0, gain, pan)

# ambience per season (see story.js SEASONS)
birds = np.zeros(N)
for i in range(60):
    at = rng.random() * 9.9; d = .12 + rng.random() * .1; f0 = 2600 + rng.random() * 1800; s = int(at * SR); n = int(d * SR)
    ch = np.sin(2 * np.pi * np.cumsum(f0 + 900 * np.sin(2 * np.pi * 18 * t_(d))) / SR) * np.sin(np.pi * t_(d) / d) ** 2; birds[s:s + len(ch)] += ch[:max(0, N - s)]
bed(birds, env_between(0, 9.9), .05, .3)
wind = lp(brown(DUR), 500); bed(norm(wind), env_between(13.6, 16.6) * 1.0 + env_between(16.6, DUR, 1.5, 2) * .5, .08, -.2)
crick = np.zeros(N)
for i in range(120):
    at = 17.5 + rng.random() * 7; s = int(at * SR); d = .05; c = np.sin(2 * np.pi * 4300 * t_(d)) * (np.sin(2 * np.pi * 40 * t_(d)) > 0) * np.sin(np.pi * t_(d) / d); crick[s:s + len(c)] += c[:max(0, N - s)]
bed(crick, env_between(17.6, DUR - .5, 1.5, 1), .015, .4)
leaves = bp(noise(DUR), 2000, 7000) * (np.abs(np.sin(2 * np.pi * .7 * tt)) ** 6); bed(norm(leaves), env_between(16.6, 24.5, 1, 1), .02, -.3)

def kick(): d = .25; return norm(np.sin(2 * np.pi * 90 * t_(d)) * np.exp(-t_(d) / .04) + lp(noise(d), 900) * np.exp(-t_(d) / .015))
def step(): d = .1; return norm(bp(noise(d), 1200, 6000) * env_exp(d, .02))   # gravel
def chime(): return tone(2637, 1.0, .3) * .5 + tone(3951, 1.0, .2) * .25
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'kick': add(mix, kick(), t, .08, pan=.4)
    elif ty == 'step': add(mix, step(), t, .05, pan=.25)
    elif ty == 'chime': add(mix, chime(), t, .12)
    elif ty == 'lamp': add(mix, norm(hp(noise(.06), 3000) * env_exp(.06, .01)), t, .1, pan=.3); add(mix, norm(np.sin(2 * np.pi * 100 * t_(1.5)) * .3 + np.sin(2 * np.pi * 200 * t_(1.5)) * .1) * np.exp(-t_(1.5) / .8), t, .03, pan=.3)
    elif ty == 'card': add(mix, tone(392, 2.4, 1.0), t, .08)

for c in range(2): mix[:, c] = compress(mix[:, c], thr=.5, ratio=2.5)
mix = np.tanh(mix * 1.05) / np.tanh(1.05)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR, subtype='FLOAT')
print(f'out/mix.wav {DUR:.2f}s rms {20*np.log10(np.sqrt(np.mean(mix**2))+1e-9):.1f} dBFS peak {20*np.log10(np.abs(mix).max()+1e-9):.1f} dBFS')
