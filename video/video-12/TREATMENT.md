# video-12 — Treatment: "Can I cheat it? EP. 1"

New series for the softer, product-explainer formats (`docs/prompts/claude-soft-explainer-formats.md`): no death, no disaster; the
viewer leaves knowing one concrete thing: **a Nuclear lock survives a restart, an uninstall and a switch to another device**
(`brand/welockin/facts.md`: "It survives restarts and even uninstalling the app"; "one session locks every connected device at once").

## 1. Three structures, and the choice
1. **Three tries, three failures** (the escape-artist gag): one room, a plate "TRY n OF 3" per attempt, each failure lands on the same
   image (the padlock and the countdown that never stopped). Clear, funny, the product is the antagonist and the hero.
2. **Countdown race**: the timer shown big, he has 2 hours to break out, cutting between ever more desperate tricks. Faster, but the
   tricks blur and the countdown reads as stress, not comfort.
3. **Before / after**: last week without WeLockIn (he scrolls) vs. tonight on Nuclear (he can't). Explains less: the tricks are the lesson.

**Choice: 1.** Each try teaches one fact; the repetition is the joke (and the series' grammar: EP. 2 can be another trick). The turn
(he gives up, the lamp goes on) arrives at 64 % of the film, before the 70 % rule of `docs/performance-notes.md`.

## 2. Logline and arc
A student locks his phone for two hours and tries three ways out; the lock wins every time, so he finally studies.
Setup (frame 0: him, the locked phone, the hook) → three tries, each failing on the same padlock → the laptop locks too (music drop) →
he opens his book, the warm lamp takes over → "No pausing. No quitting. No bargaining." → end card. Loop: the end card cuts back to him
holding up the phone.

## 3. Benchmark
- **Learn**: silent-comedy escalation (a character trying ever bolder tricks against an indifferent object; the object never moves, the
  character's face does); RPG grammar for a "try" (a plate, a strike-through when it fails).
- **Don't take**: any existing gag, character, game UI or melody. No game is named on screen.

## 4. Shot list (1080 × 1920, 30 fps)
| # | t (s) | Framing / angle | Move | Why |
|---|---|---|---|---|
| 1 | 0–3.6 | medium, high 3/4: him on the bed holding the phone up beside his face; caption top, dialogue box bottom | slow push | frame 0 = the whole situation + the hook written (rule 2 of the performance notes) |
| 2 | 3.6–12.7 | close: his face (left) and the phone (right), the countdown readable | dive in, then a small lateral drift on try 2 | the phone is the stage of tries 1 and 2; the padlock + timer must read at phone size |
| 3 | 12.7–16.6 | medium on the desk: he walks over, sits, opens the laptop | pull back, then push to the laptop as it locks | the third try changes device; the same padlock lands on the drop |
| 4 | 16.6–22.5 | high wide of the room: bed (phone glowing), desk (laptop glowing), him under the lamp | rising pull-back, tilt-shift band on him | the turn: the act spreads outward; the warm lamp takes over from the cold screens |
| 5 | 22.5–26.5 | cream end card | — | logo, one line, platforms (AGENTS.md §7) |

## 5. Beats
- **0.0** frame 0: phone locked (padlock, 1:59:55), CAN I CHEAT IT? · EP. 1 / "Can I beat a Nuclear lock?", ME: "Two hours? Nope. Watch this."
- **3.6** TRY 1 · Restart the phone: 4.6 screen off, the room goes dark (near-silence); 5.8 boot; **6.4** the padlock slams back, timer kept counting.
- **8.6** TRY 2 · Delete the app: icons jiggle, the app's tile poofs (9.8); he taps a blocked app: **10.4** the padlock again.
- **12.7** TRY 3 · Use the laptop: walks to the desk, opens it, cold desktop; **15.6** same padlock, same countdown = music drop.
- **16.5** "Oh, come on." 17.0 he opens the book; **17.5** the desk lamp clicks on, shadows jump, warm light.
- **18.7** "No pausing. No quitting. No bargaining." / 19.5 "NUCLEAR LOCK".
- **22.5** end card: logo, "Nothing turns it off until the timer ends.", "iOS · macOS · Windows". **26.5** end (loops to frame 0).

## 6. Cue map
Music: catalogue **#6 "Scheming (Instrumental Slowed)"** (`assets/music/README.md`; 83.6 BPM measured, bar ≈ 2.87 s). Chosen for the
title (he is scheming) and its "sad edit" colour, a TikTok register that turns small defeats into comedy. Placed from the track's start at
film 1.2 s, so its drop (track 14.4 s, measured onset) lands on the laptop's lock (film 15.6 s). Music near-silent while the phone is off
(4.6–6.4: a held breath), ducked ~7 dB under every line, full after the drop, under the end card.

## 7. Sound design
| Section | Bed | Foley | Music |
|---|---|---|---|
| Hook | room tone | — | fades in at 1.2 |
| Try 1 | room tone | side button click, power-down sweep, boot two-note, lock thunk + latch | dips to near silence 4.6–6.4 |
| Try 2 | room tone | icon jiggle ticks, poof, tap, lock thunk | low |
| Try 3 | room tone | cloth, 4 footsteps on wood, phone lands on the quilt, lid creak + click, desktop pings, lock thunk + boom | drop at 15.6 |
| Turn | room tone | pages, lamp click + hum, text-card tones | full |
| End card | — | soft two-note | tail |

Voice: Kokoro `am_michael` (offline), 5 short lines, checked with `asr_check.py` (exit 0), low-passed at 7 kHz so it sits in the room.
`tt-humanizer --mode audit` on the spoken lines: no AI vocabulary, contractions and fragments, no reveal bridge; nothing to flag.

## 8. Subtitles and titles
Spoken lines are typed in the style's dialogue box (EB Garamond italic 62 px, name plate "ME" in Cinzel), inside the safe zone
(y 1236–1432). The try plates (Cinzel 34 px gold + EB Garamond 70 px) sit at y 236–412; a gold strike-through crosses the try when it
fails. Text cards: EB Garamond 74 px and Cinzel 76 px gold. End card: Figtree. `subtitles_en.srt` exported from the same lines.

## 9. Review (contact sheet, scores /10)
Hook 8 · try 1 insert 8 (fixed: the countdown hid under the dialogue box, phone raised) · try 2 8 (poof enlarged) · laptop 8 (reframed:
hand burnt by the laptop light, light moved) · lamp turn 8 · wide + text 7 (dark set, exposure lifted for the wide) · end card 9.

## 10. Not the demo again
Against the style demo (`DEMO.md`: a quest across harbour, forest and storm to relight a lighthouse): structure (three tries in one
room vs. a journey), opening (in the room, hook already written vs. chapter card and establishing wide), signature shot (the same padlock
on the music drop vs. the relit lighthouse), camera path, score (a library track cut on its drop vs. an original score) and ending (a
lamp and an end card vs. title over the harbour): 6 of 6 differ.

## v2 (2026-11-21): the client's notes and what changed
Notes: "I don't like the script, the voice or the scene." The client then chose: no voice; a bright public place; a short, almost silent
script (about 15 s, everything told by the picture, one sentence at the end).
- **Set**: a university library in daylight (three tall windows, sun beams with dust, bookcases, two students reading, one at the
  shelves) replaces the bedroom at night. Daylight key, warm haze, no practicals needed. `library.js` replaces `room.js`.
- **Script**: no dialogue. Frame 0 keeps the hook (CAN I CHEAT IT? · EP. 1 / "Can I beat a Nuclear lock?"). The three tries read as
  three pixel pictograms on one plate (restart, delete, laptop); the current one lit and underlined, each crossed out in gold when it
  fails. One sentence at the end: "Nothing turns off a Nuclear lock." End card: logo + "iOS · macOS · Windows".
- **Shots**: medium (hero ~1/3 of the frame) → close on the phone only (his face out of frame) for tries 1 and 2 → the laptop for try 3 →
  rising pull-back to the library. No more giant close-ups of the sprite.
- **Beats**: 0.0 hook · 3.0 try 1 (3.6 off, 4.35 boot, 4.9 lock back) · 5.6 try 2 (6.55 poof, 7.2 lock) · 8.0 try 3 (8.55 lid, 9.9 lock =
  drop) · 10.3 pull-back, 10.7 he opens his book · 11.1 the sentence · 14.6 end card · 17.6 end.
- **Sound**: no voice. "Scheming" now enters from track 4.5 s (already playing at frame 0), its drop (14.4 s) on the laptop's lock (9.9);
  near-silence while the phone is off; library room tone with a far page turn; same foley.
