"""Measure the tracks of the music library so an agent can pick one for a TikTok without listening.
For each assets/music/*.mp3: duration, tempo (BPM), loudness, energy curve, and the strongest "drops" (biggest energy rise),
written to assets/music/<id>.analysis.json and summarised on stdout.
Run with any Python that has numpy + scipy (the library's):  "$LIB/.venv/bin/python" analyze.py [files…]
Needs ffmpeg on PATH (. tools/env.sh)."""
import glob, json, os, subprocess, sys
import numpy as np
from scipy.signal import stft

HERE = os.path.dirname(os.path.abspath(__file__))
MUSIC = os.path.abspath(os.path.join(HERE, '../../../../assets/music'))
SR = 22050


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def tempo(x):
    f, t, Z = stft(x, SR, nperseg=1024, noverlap=1024 - 512)
    mag = np.log1p(np.abs(Z)); flux = np.maximum(0, np.diff(mag, axis=1)).sum(0); flux -= flux.mean()
    hop = 512 / SR
    ac = np.correlate(flux, flux, 'full')[len(flux) - 1:]
    lags = np.arange(len(ac)) * hop; ok = (lags > 60 / 190) & (lags < 60 / 60)
    lag = lags[ok][np.argmax(ac[ok])]; bpm = 60 / lag
    while bpm < 80: bpm *= 2
    while bpm > 170: bpm /= 2
    return round(float(bpm), 1)


def analyse(path):
    x = load(path); dur = len(x) / SR
    win = SR  # 1 s energy blocks
    e = np.array([np.sqrt(np.mean(x[i:i + win] ** 2) + 1e-12) for i in range(0, len(x) - win, win)])
    db = 20 * np.log10(e)
    rise = np.convolve(np.diff(db), np.ones(2), 'same')
    drops = [int(i + 1) for i in np.argsort(rise)[::-1][:3]]
    curve = [round(float(v), 1) for v in db[::2]]   # every 2 s
    return {
        'file': os.path.basename(path), 'duration_s': round(dur, 1), 'bpm': tempo(x[: SR * 90]),
        'rms_db': round(float(20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)), 1),
        'quiet_intro_s': int(np.argmax(db > db.max() - 12)), 'drops_s': sorted(drops), 'energy_db_every_2s': curve,
    }


files = sys.argv[1:] or sorted(glob.glob(os.path.join(MUSIC, '*.mp3')))
for p in files:
    a = analyse(p)
    json.dump(a, open(os.path.splitext(p)[0] + '.analysis.json', 'w'), indent=1)
    print(f"{a['file'][:58]:58s} {a['duration_s']:6.1f}s  {a['bpm']:5.1f} BPM  rms {a['rms_db']:5.1f} dB  drops at {a['drops_s']} s")
