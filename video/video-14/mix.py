"""video-14 mix ("You", Imagine if… EP. 5): catalogue #7 "Acid Rain (Slowed)": its quiet stretch under the night, its
drop (track 73.82 s) on the alarm at 07:58 (film 8.0), running through the exam, hard stop on "Pens down", silence, the
grade stamp, then the cards. Clock ticks on each jump of the night, alarm beeps, pencils in the exam hall.
Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); e = lambda ty: next(x['t'] for x in EV if x['type'] == ty)
ALARM, EXAM, PENS, GRADE, CARD = e('alarm'), e('exam'), e('pens'), e('grade'), e('end') - .1
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('A9hzqHsocEA')
DROP = 73.82                                   # measured: low-band onset of the track's drop
place(mix, mus, DROP - ALARM, 0, PENS + .05, .55, .4, .02, tail=.6)
place(mix, mus, DROP - .3, CARD - .3, DUR - CARD + .3, .42, .5, 1.4)
rng = np.random.default_rng(14)
# night: a low room hum; the clock jumps
hum = lp(brown(DUR), 180)[:N] * (tt < EXAM); add(mix, norm(hum), 0, .025)
for x in EV:
    if x['type'] == 'tick': d = .06; add(mix, norm(bp(noise(d), 1800, 7000) * np.exp(-t_(d) / .008)) + .4 * norm(tone(1600, d, .01)), x['t'], .16, .1)
# the alarm: two beeps, four times a second, until the cut
d = EXAM - ALARM; ph = (t_(d) * 4) % 1; gate = ((ph < .12) | ((ph > .22) & (ph < .34))).astype(float)
beep = lp(np.sign(np.sin(2 * np.pi * 2093 * t_(d))), 5000) * gate * np.exp(-t_(d) / 3); add(mix, norm(beep), ALARM, .1, -.3)
# exam hall: room tone and pencils
room = bp(noise(DUR), 200, 1200)[:N] * ((tt >= EXAM) & (tt < GRADE + 1)); add(mix, norm(room), 0, .02)
pen = np.zeros(N)
for i in range(70):
    at = EXAM + rng.random() * (PENS - EXAM - .2); s = int(at * SR); dd = int((.05 + rng.random() * .12) * SR)
    pen[s:s + dd] += bp(noise(dd / SR), 2500, 8000)[:dd] * np.hanning(dd) * (.3 + rng.random())
add(mix, norm(pen), 0, .05, .2)
# the grade: a stamp
d = .5; stamp = norm(lp(noise(d), 300) * np.exp(-t_(d) / .05)) + .6 * norm(tone(85, d, .12)) + .3 * norm(bp(noise(d), 2000, 6000) * np.exp(-t_(d) / .01))
add(mix, norm(stamp), GRADE, .45)
for x in EV:
    if x['type'] == 'chime': add(mix, chime(), x['t'], .07)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
finish(mix, HERE)
