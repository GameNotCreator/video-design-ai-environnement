"""video-33 mix ("Fais un vœu"): "Joyeux anniversaire" (traditional melody, public domain) played on a soft music box
from frame 0 while his friends sing; the candles flare on the drop of catalogue #3 "Nightcrawler (Instrumental)"
(track 7.72 s → film 7.5) and the song is cut mid-phrase. The track runs through the fire and the smoke alarm and
stops when the last friend is gone (14.5); silence on his question; the track again from its second rise (track 44 s)
under the closing text. Room tone, chairs, steps, the alarm's beeps, a chime on each line.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
FLARE, ALARM, UP = e('flare'), e('alarm'), e('up'); LAST = max(x['t'] for x in EV if x['type'] == 'leave') + 1.1
TXT = min(x['t'] for x in EV if x['type'] == 'card')
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('aQkfOkFvx2U')
# the birthday song (G major, 3/4, quarter = 0.5 s), music box: sine + octave, short decay
G4, A4, B4, C5, D5, E5, F5, G5 = 392.0, 440.0, 493.9, 523.3, 587.3, 659.3, 698.5, 784.0
SONG = [(G4, .375), (G4, .125), (A4, .5), (G4, .5), (C5, .5), (B4, 1.0),
        (G4, .375), (G4, .125), (A4, .5), (G4, .5), (D5, .5), (C5, 1.0),
        (G4, .375), (G4, .125), (G5, .5), (E5, .5), (C5, .5), (B4, .5), (A4, 1.0)]
def note(f, d):
    n = t_(d + .6); x = (np.sin(2 * np.pi * f * n) + .35 * np.sin(4 * np.pi * f * n) + .12 * np.sin(6 * np.pi * f * n)) * np.exp(-n / .45); x[:64] *= np.linspace(0, 1, 64); return x
song = np.zeros(int((FLARE + 1) * SR)); at = .05
for f, d in SONG:
    if at >= FLARE: break
    x = note(f, d); s = int(at * SR); song[s:s + len(x)] += x[:len(song) - s]; at += d
song[int(FLARE * SR):] = 0   # cut dead on the drop
add(mix, norm(song) * .9, 0, .32)
place(mix, mus, 7.72 - .02, FLARE - .02, LAST - FLARE, .55, .01, .3, tail=.6)
place(mix, mus, 44.0, TXT - .1, DUR - TXT + .1, .45, .4, 1.4)
room = bp(noise(DUR), 120, 700)[:N] * (tt < TXT); add(mix, norm(room), 0, .012)
for x in EV:
    ty = x['type']
    if ty == 'fire': d = 1.2; add(mix, norm(lp(noise(d), 1800) * np.minimum(1, t_(d) / .3)), x['t'], .05)
    if ty == 'alarm':
        for k in range(int((UP - .3 - x['t']) / .4)):   # T3 pattern beeps until he looks up
            b = tone(3150, .12, 1.0); b[-200:] *= np.linspace(1, 0, 200); add(mix, b, x['t'] + k * .4, .035)
    if ty == 'chairs':
        for k in range(4): d = .12; add(mix, norm(bp(noise(d), 200, 900) * np.exp(-t_(d) / .04)), x['t'] + k * .07, .06)
    if ty == 'leave':
        for k in range(4): d = .07; add(mix, norm(lp(noise(d), 700) * np.exp(-t_(d) / .02)), x['t'] + k * .25, .04)
    if ty == 'up': d = .05; add(mix, norm(bp(noise(d), 800, 3000) * np.exp(-t_(d) / .01)), x['t'], .03)
    if ty == 'chime': add(mix, chime(), x['t'], .06)
    if ty == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
finish(mix, HERE)
