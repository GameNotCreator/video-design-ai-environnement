#!/bin/sh
# YouTube link → MP3 (yt-dlp + ffmpeg), into the studio's music library.
#   sh .claude/skills/youtube-audio/scripts/yt2mp3.sh <youtube-url> [<url> …]   → assets/music/<id>__<title>.mp3 + .info.json
#   sh .claude/skills/youtube-audio/scripts/yt2mp3.sh --catalog                    → every catalogue link not downloaded yet
#   sh .claude/skills/youtube-audio/scripts/yt2mp3.sh --info <url>                 → title, channel, duration, licence only (no download)
# Only the single video is taken, even when the URL carries &list=… (a playlist / radio mix).
set -e
ROOT=$(cd "$(dirname "$0")/../../../.." && pwd -P)
STUDIO=$ROOT; . "$ROOT/tools/env.sh"
OUT=${YT_OUT:-$ROOT/assets/music}
mkdir -p "$OUT"
if ! PYTHONPATH="$ROOT/.tools/py" python3 -c 'import yt_dlp' 2>/dev/null; then
  python3 -m pip install --quiet --disable-pip-version-check --target "$ROOT/.tools/py" yt-dlp
fi
yt() { PYTHONPATH="$ROOT/.tools/py" python3 -m yt_dlp --no-playlist --no-warnings "$@"; }
if [ "$1" = "--catalog" ]; then   # every YouTube link of assets/music/README.md not downloaded yet
  set -- $(grep -o 'https://www.youtube.com/watch?v=[A-Za-z0-9_-]*' "$OUT/README.md" | sort -u | while read -r u; do id=${u##*=}; ls "$OUT/$id"__*.mp3 >/dev/null 2>&1 || echo "$u"; done)
  [ $# -gt 0 ] || { echo "catalogue already downloaded"; exit 0; }
fi
if [ "$1" = "--info" ]; then
  shift
  for u in "$@"; do yt --skip-download --print '%(id)s | %(title)s | %(channel)s | %(duration_string)s | licence: %(license|unknown)s' "$u" || echo "! $u: not reachable from here"; done
  exit 0
fi
[ $# -ge 1 ] || { echo "usage: sh yt2mp3.sh [--info] <youtube-url> [<url> …]"; exit 2; }
for u in "$@"; do
  yt -x --audio-format mp3 --audio-quality 0 --embed-metadata --write-info-json \
     --restrict-filenames -o "$OUT/%(id)s__%(title).60B.%(ext)s" "$u"
done
ls -la "$OUT"/*.mp3
