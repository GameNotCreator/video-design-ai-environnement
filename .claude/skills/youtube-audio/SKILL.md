---
name: youtube-audio
description: Turn a YouTube link into an MP3 for a video's soundtrack (yt-dlp + ffmpeg), keep it in the studio's music library (assets/music/), measure its tempo, length and drops, and pick the library track that best fits a new TikTok. Use when the client sends YouTube links for music, when a new video needs a soundtrack, or when asked which track to use.
---

# YouTube → MP3, and choosing the soundtrack

The music library is `assets/music/`. Its catalogue is `assets/music/README.md`: one row per track (YouTube link,
title, length, BPM, mood, best for, status). Every agent (Claude Code, Codex) reads it before scoring a new TikTok.

## Download

```sh
sh .claude/skills/youtube-audio/scripts/yt2mp3.sh "<youtube-url>" ["<url>" …]   # → assets/music/<id>__<title>.mp3 + .info.json
sh .claude/skills/youtube-audio/scripts/yt2mp3.sh --info "<youtube-url>"           # title, channel, length, licence; no download
```

- Only the video in the link is taken, even when the URL has `&list=…` (playlist or radio mix).
- yt-dlp is installed from PyPI into `.tools/py` on first use; ffmpeg comes from `tools/env.sh`.
- `--catalog` downloads every link of `assets/music/README.md` that has no MP3 yet.
- **Where to run it**: YouTube refuses videos to cloud/datacenter IPs ("This video is not available", whatever the
  client), so in a cloud session the download fails even with the network open. Run it on a machine where YouTube works
  (the client's computer, or Codex running locally), then commit and push `assets/music/` (the MP3s, `.info.json`,
  `.analysis.json` and the catalogue are committed so every agent and every session has them). On the Mac:
  `brew install ffmpeg` once; the script installs yt-dlp itself.
- If the MP3 is missing when a video is made: keep the row "à télécharger", score that video with the synthesized tools
  (`core/audio/`), and say so in one line in the delivery message.

## Measure

```sh
. tools/env.sh && "$LIB/.venv/bin/python" .claude/skills/youtube-audio/scripts/analyze.py    # every MP3, or pass files
```

Writes `<id>.analysis.json` (length, BPM, loudness, energy every 2 s, the 3 strongest drops) and prints a summary.
Copy length, BPM and drops into the catalogue row, then write its **mood** and **best for** in a few words after
listening to the energy curve and reading the title (e.g. "lo-fi calme, 82 BPM, pas de drop : routine d'étude, fin apaisée").

## Choose the track for a new TikTok (every new video)

1. Read the treatment's arc (calm → turn → payoff?), its length and its key hit (the impact, the lock, the reveal).
2. Read the catalogue. Pick the track whose **own shape** matches the arc: a drop that can land on the key hit, a tempo
   that suits the cut rhythm (calm study scene 70–95 BPM; tension/action 110–150 BPM), a mood that fits the ending.
3. Write the choice and why in `TREATMENT.md` (Cue map), plus the time range used ("track 0:42–1:04, drop at 0:58 = impact").
4. Cut **inside** the piece at downbeats (style rule, hd-2d `STYLE.md` §7): place the track's drop on the visual hit,
   fade in on a bar, end on a phrase or a hard stop into a reverb tail. Never stitch two tracks.
5. In `mix.py`: load the MP3 (decode with ffmpeg), keep the synthesized foley on top, duck the music ~10 dB under voice,
   then `mux.sh` as usual (−14 LUFS).
6. `CREDITS`: title, artist/channel, YouTube URL, and the rights status from the catalogue.
7. Mark the track in the catalogue's "used in" column (`video-N vK`), so the next videos vary.

If no track fits (wrong mood, or not downloaded), score with the synthesized tools and say so in one line.

## Rights

The tracks in the catalogue were supplied by the client to be used in the videos: use them. Music from YouTube is
usually someone else's copyright, and TikTok posts marked as branded content ("Your brand") are limited to TikTok's
Commercial Music Library, so an uncleared song can get the video muted. Keep the catalogue's "droits" column filled from
the `.info.json` (licence field, channel), write the track and its status in `CREDITS` ("fournie par le client"), and
when a track is not cleared for commercial use, add one line about it in the delivery message. Nothing more.
