"""video-21 mix ("Final call"): catalogue #7 "Acid Rain (Slowed)" from track 63.02 s so its drop (measured low-band
onset, track 73.82 s) lands on the last departure (YOUR 20s, film 10.8); hard stop when the agent speaks. Terminal
ambience, PA chimes on every final call, jets pushing back and taking off, board flaps. Run: . tools/env.sh && "$LIB/.venv/bin/python" mix.py"""
import os, sys; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../tools'))
from mixkit import *
DUR, EV = events(HERE); CARD = next(x['t'] for x in EV if x['type'] == 'end') - .1
DEP = [x['t'] for x in EV if x['type'] == 'depart']; LAST = DEP[-1]; AGENT = [x['t'] for x in EV if x['type'] == 'chime'][-1]
N = int(DUR * SR); mix = np.zeros((N, 2)); tt = t_(DUR)[:N]; mus = track('A9hzqHsocEA')
place(mix, mus, 73.82 - LAST, 0, AGENT, .55, .3, .02, tail=.6)
place(mix, mus, 73.5, CARD - .3, DUR - CARD + .3, .42, .5, 1.4)
hall = bp(noise(DUR), 150, 1500)[:N] * (.6 + .4 * np.abs(np.sin(2 * np.pi * .7 * tt))) * (tt < AGENT + 3.2); add(mix, norm(hall), 0, .025)
for x in EV:
    if x['type'] in ('pa',): add(mix, norm(tone(988, .35, .25)) + norm(np.pad(tone(784, .5, .3), (int(.3 * SR), 0))[:int(.35 * SR)]), x['t'], .07)
    if x['type'] == 'depart':
        d = 3.0; jet = bp(noise(d), 200, 3000) * np.sin(np.linspace(0, np.pi, int(d * SR))) ** 2; add(mix, norm(jet), x['t'], .09, .4)
        for k in range(4): d2 = .03; add(mix, norm(bp(noise(d2), 1500, 6000) * np.exp(-t_(d2) / .006)), x['t'] + k * .05, .05, -.2)   # the board flaps
    if x['type'] == 'chime': add(mix, chime(), x['t'], .07)
    if x['type'] == 'card': add(mix, tone(294, 2.2, .9), x['t'], .07)
add(mix, norm(tone(988, .35, .25)), .0, .06)
finish(mix, HERE)
