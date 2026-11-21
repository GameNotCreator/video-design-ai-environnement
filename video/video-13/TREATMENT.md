# video-13 — Treatment: "How it works EP. 1: Block it once. Locked everywhere."

First episode of the HOW IT WORKS series (softer, product-explainer formats: `docs/prompts/claude-soft-explainer-formats.md`). The viewer
leaves knowing one concrete thing: **one session locks every connected device at once, on iOS, macOS and Windows**
(`brand/welockin/facts.md`: "Sync: one session locks every connected device at once ('Block it once. Locked everywhere.')").

## 1. Three structures, and the choice
1. **Chain reaction**: one tap, then the screens lock one after the other on the music's hits, then calm. One cause, four effects.
2. **Split screens**: the four devices in a 2 × 2 grid, each locking in turn. Clear but flat: it leaves the diorama (the 48-view lesson).
3. **Walk through the flat**: he locks his phone in the kitchen, then finds the Mac, the iPad and the PC already locked in other rooms.
   Funnier, but four sets and twice the length for the same fact.

**Choice: 1.** It is the style's own native move ("lights popping on one by one", a rising pull-back as "a system switching on") and the
fact itself: one gesture, every screen. 16 s, the whole idea readable without sound.

## 2. Logline and arc
A student drowning in notifications on four screens taps once, and every screen in the room locks, one after the other.
Setup (frame 0: four cold screens pinging, him with the phone, the hook) → the tap → the chain: Mac, iPad, Windows PC, each with a label →
"Peace." → the lamp, he writes → "Block it once. LOCKED EVERYWHERE" → end card. Loop: back to the cold, pinging room.

## 3. Benchmark
- **Learn**: the chain-reaction commercial (one cause, a series of effects in rhythm, each one readable on its own); the tabletop
  "lights popping on" of the style.
- **Don't take**: any existing ad's shots, objects or music; no device brand logo is drawn (the devices are plain dark slabs).

## 4. Shot list (1080 × 1920, 30 fps)
| # | t (s) | Framing / angle | Move | Why |
|---|---|---|---|---|
| 1 | 0–2.0 | wide, high 3/4: the desk with the four screens, him holding the phone; caption top, dialogue bottom | slow push | frame 0 = the whole situation + the hook |
| 2 | 2.0–3.25 | close on the phone: open padlock, 2:00:00 | push in | the one gesture must read: the tap |
| 3 | 3.25–7.4 | phone → whole desk | rising pull-back (fast, then slow), focus handed from the phone to the desk | the act spreads outward: each screen locks as it enters the frame |
| 4 | 7.4–11.9 | high wide, the warm room | slow push toward him and the lamp | the after: calm, one warm light |
| 5 | 11.9–15.8 | cream end card | — | logo, one line, platforms |

## 5. Beats
- **0.0** frame 0: four cold screens pinging, HOW IT WORKS · EP. 1 / "One tap. Every screen.", ME: "Okay. Too many pings."
- **2.55** he opens the session: open padlock, 2:00:00. **3.2** the tap: the phone locks (hit 1), label IPHONE.
- **4.1** MAC · **5.0** IPAD · **5.9** WINDOWS PC (hit 2): same padlock, same countdown on every screen; the room turns warm.
- **6.6** "Peace." 7.4 he puts the phone down. **8.35** the desk lamp (hit 3), he writes.
- **8.7** "Block it once." / 9.3 "LOCKED EVERYWHERE". **11.9** end card. **15.8** end (loops to frame 0).

## 6. Cue map
Music: catalogue **#7 "Acid Rain (Slowed)"** (`assets/music/README.md`; ~96 BPM, a hit every bar, measured onsets 24.45, 27.15, 29.6 s).
Chosen for its night-rain colour (rain is on the window) and its clean hits. Cut *inside* the track from 21.25 s, so it is already
playing at frame 0 and its hits land on the tap (film 3.2), the last screen (5.9) and the lamp (8.35). The Mac and iPad locks split the
bar in thirds (4.1, 5.0). Ducked under the two lines, tail under the end card.

## 7. Sound design
| Section | Bed | Foley | Music |
|---|---|---|---|
| Hook | rain on the window | every device pings in its own pitch (pings stop as each locks) | low, before the hit |
| Tap + chain | rain | tap click; each lock: latch thunk + one note of a rising chord (C, E, G, high C) | hits 1 and 2 |
| Calm | rain, softer | lamp click + hum, text-card tones | hit 3 |
| End card | — | soft two-note | tail |

Voice: Kokoro `am_michael` (offline), 2 lines, checked with `asr_check.py` (exit 0), low-passed at 7 kHz.
`tt-humanizer --mode audit`: "Okay. Too many pings." / "Peace." spoken, contracted, no AI tells; nothing to flag.

## 8. Subtitles and titles
Spoken lines in the dialogue box (EB Garamond italic 62 px, "ME" plate), y 1236–1432. Device labels: small gold Cinzel plates placed from
the 3D scene (one world → screen function, `desk.js`), clamped into the safe zone. Text cards: EB Garamond 96 px + Cinzel 62 px gold.
End card in Figtree. `subtitles_en.srt` exported from the same lines.

## 9. Review (contact sheet, scores /10)
Hook 8 (reframed: he was cut at the left edge) · tap insert 8 · chain 8 (labels: Mac and iPad moved under their devices so no label
covers a countdown) · calm + text 8 · end card 9.

## 10. Not the demo again
Against the style demo (a quest across harbour, forest and storm): structure, opening, signature shot (four screens locking on the hits),
camera path, score (a library track cut on its hits) and ending (lamp and end card): 6 of 6 differ.

## v2 (2026-11-21): the client's notes and what changed
Notes: "I don't like the script, the voice or the scene." The client then chose: no voice; a bright public place; a short, almost silent
script (about 15 s, everything told by the picture, one sentence at the end).
- **Set**: a café in daylight (shop window on the street, brick wall, counter with an espresso machine and a barista, chalk menu without
  words, pendant bulbs, plants, two customers) replaces the desk at night. `cafe.js` replaces `desk.js`.
- **Devices**: three that make sense on a café table: iPhone, MacBook, iPad (the Windows PC tower left with the desk; Windows stays on
  the end card). No labels, no dialogue.
- **Script**: frame 0 keeps the hook (HOW IT WORKS · EP. 1 / "One tap. Every screen."), then picture only: the screens ping, the tap,
  the three screens lock one after the other with the same padlock and the same countdown; he lays the phone down and writes. One sentence
  at the end: "Block it once. Locked everywhere." End card: logo + "iOS · macOS · Windows".
- **Beats**: 0.0 hook · 2.0 push to the phone · 2.55 open session · 3.2 tap (hit 1) · 4.55 Mac · 5.9 iPad (hit 2) · 6.6 phone laid down ·
  7.0 the sentence · 10.6 end card · 13.6 end.
- **Sound**: no voice; café bed (murmur, cups, the espresso machine) instead of rain; pings per device until it locks; latch + rising
  chord (C, E, G) on the three locks; "Acid Rain" unchanged (from track 21.25 s).
