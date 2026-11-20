#!/bin/sh
# video-12 — one command per step:  sh build.sh voice | stills | draft | master | deliver <K>
# Without a GPU (cloud VM, SwiftShader) the master renders at 30 fps without supersampling (?ss=1): ~3-4 s per frame.
# With a GPU: FPS=60 SS=2 sh build.sh master
set -e
HERE=$(cd "$(dirname "$0")" && pwd -P)
STUDIO=$(cd "$HERE/../.." && pwd -P); . "$STUDIO/tools/env.sh"
FPS=${FPS:-30}; SS=${SS:-1}
cd "$LIB"
case "${1:-master}" in
  voice)  "$LIB/.venv/bin/python" core/tts/tts.py "$HERE/lines.json" "$HERE/out/voice"
          "$LIB/.venv/bin/python" core/tts/asr_check.py "$HERE/lines.json" "$HERE/out/voice" --lang en ;;
  stills) node core/render/still.mjs "$HERE" 0.0 5.0 7.0 9.5 11.0 14.3 16.2 17.8 20.5 23.5 --size 1080x1920 --q ss=$SS --out "$HERE/stills" ;;
  draft)  node core/render/video.mjs "$HERE" --size 540x960 --fps 30 --workers 3 --q ss=1 --out "$HERE/out/draft.mp4" ;;
  master) [ -f "$HERE/out/voice/h1.wav" ] || sh "$HERE/build.sh" voice
          node core/render/events.mjs "$HERE" --size 1080x1920
          node core/render/readcheck.mjs "$HERE" --size 1080x1920 --q textonly=1
          node core/render/video.mjs "$HERE" --size 1080x1920 --fps "$FPS" --workers 3 --q ss=$SS --out "$HERE/out/video.mp4"
          "$LIB/.venv/bin/python" "$HERE/mix.py"
          sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/out/master.mp4" "$FPS" 0 ;;
  deliver) N=$(basename "$HERE"); sh "$STUDIO/tools/compress.sh" "$HERE/out/master.mp4" "$HERE/output/${N}_v${2:?version}.mp4" ;;
  *) echo "usage: sh build.sh voice | stills | draft | master | deliver <K>"; exit 2 ;;
esac
