"""video-9 mix (Imagine if #2, the surgeon): series theme, the heart monitor beeping in time with the ECG, ventilator,
the alarm, the flatline tone, silence. Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
ALARM, FLAT, IMP, CARD = e('alarm'), e('flat'), e('impact'), e('end') - .1
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('01qStKYB7ts')
place(mix, mus, .8, 0, FLAT, .45, .2, .02)
place(mix, mus, .8, CARD - .3, DUR - CARD + .3, .4, .6, 1.4)
hr = lambda t: 72 if t < ALARM else (72 + 96 * ((t - ALARM) / (FLAT - ALARM)) ** 1.4 if t < FLAT else 0)
ph, t = 0.0, 0.0
while t < FLAT:   # one beep per heartbeat, matching the monitor
    ph += hr(t) / 60 * .002; t += .002
    if ph >= 1: ph -= 1; add(mix, tone(1000 if t < ALARM else 1250, .12, .05), t, .12)
fl = np.sin(2 * np.pi * 1000 * t_(IMP - FLAT)); add(mix, fl, FLAT, .1)
vent = bp(noise(DUR), 300, 2500)[:N] * (np.sin(2 * np.pi * .25 * tt) ** 8) * (tt < FLAT); add(mix, norm(vent), 0, .04)
for k in range(int((FLAT - ALARM) / .4)): add(mix, tone(1568, .15, .06), ALARM + k * .4, .08, .3)
for x in EV:
    if x['type'] == 'chime': add(mix, chime(), x['t'], .08)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
finish(mix, HERE)
