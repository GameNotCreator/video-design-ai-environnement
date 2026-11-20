"""Shared helpers for the videos' mix.py: load a library track, place segments, tones, simple foley. Import with:
    sys.path.insert(0, os.path.join(STUDIO, 'tools')); from mixkit import *"""
import glob, json, os, subprocess, sys
import numpy as np

STUDIO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.join(os.environ.get('LIB', os.path.join(STUDIO, '.lemo-opuscar')), 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, add, compress   # noqa: E402,F401


def events(here):
    j = json.load(open(os.path.join(here, 'events.json'))); return j['dur'], j['ev']


def track(file_id):
    f = glob.glob(os.path.join(STUDIO, f'assets/music/{file_id}__*.mp3'))[0]
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    m = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64); return m / np.abs(m).max()


def place(mix, mus, src_t, at, dur, gain=1.0, fade_in=.3, fade_out=.3, tail=0.0):
    """Copy mus[src_t : src_t+dur] to mix at `at`; optional low-passed decaying tail after a hard stop."""
    a, n = int(src_t * SR), int(dur * SR); seg = mus[a:a + n].copy(); n = len(seg)
    fi, fo = int(fade_in * SR), int(fade_out * SR)
    if fi: seg[:fi] *= np.linspace(0, 1, fi)[:, None]
    if fo: seg[-fo:] *= np.linspace(1, 0, fo)[:, None]
    s = int(at * SR); e = min(len(mix), s + n); mix[s:e] += seg[:e - s] * gain
    if tail:
        tl = mus[a + n:a + n + int(tail * SR)].copy()
        tl = np.stack([lp(tl[:, c], 600) for c in range(2)], 1) * np.exp(-t_(tail) / (tail / 4))[:len(tl), None]
        s2 = e; e2 = min(len(mix), s2 + len(tl)); mix[s2:e2] += tl[:e2 - s2] * gain


def tone(f, d, tau):
    x = np.sin(2 * np.pi * f * t_(d)) * np.exp(-t_(d) / tau); x[:96] *= np.linspace(0, 1, 96); return x


def chime(): return tone(2637, 1.0, .3) * .5 + tone(3951, 1.0, .2) * .25
def ping():
    x = np.zeros(int(.6 * SR)); a = tone(1568, .3, .08); b = tone(2349, .45, .12); x[:len(a)] += a; s = int(.11 * SR); x[s:s + len(b)] += b; return norm(x)


def finish(mix, here, name='mix.wav'):
    import soundfile as sf
    for c in range(2): mix[:, c] = compress(mix[:, c], thr=.5, ratio=2.5)
    mix = np.tanh(mix * 1.05) / np.tanh(1.05)
    os.makedirs(os.path.join(here, 'out'), exist_ok=True)
    sf.write(os.path.join(here, 'out', name), mix.astype(np.float32), SR, subtype='FLOAT')
    m = mix.mean(1); dur = len(m) / SR
    print(f'out/{name} {dur:.2f}s rms {20*np.log10(np.sqrt(np.mean(mix**2))+1e-9):.1f} dBFS peak {20*np.log10(np.abs(mix).max()+1e-9):.1f} dBFS')
    print(' '.join(f'{s:.0f}:{20*np.log10(np.sqrt((m[int(s*SR):int((s+1)*SR)]**2).mean())+1e-9):.0f}' for s in np.arange(0, dur, 1)))
