#!/bin/sh
# usage: sh tools/videotpl/render_lang.sh N K LANG [SUFFIX] — render a language variant of video-N (story.js reads
# ?lang=LANG) with the existing out/mix.wav (same timings), → output/video-N_vK<SUFFIX>.mp4. Same lock as render.sh.
STUDIO=$(cd "$(dirname "$0")/../.." && pwd -P); D=$STUDIO/video/video-$1; K=$2; L=$3; SUF=${4:-}; mkdir -p "$STUDIO/.tools"
LOG="$D/out_render_$L.log"; exec 9>"$STUDIO/.tools/render.lock"; flock 9
cd "$STUDIO" && . tools/env.sh && cd "$LIB" \
  && node core/render/video.mjs "$D" --size 1080x1920 --fps 30 --workers 3 --q "ss=1&lang=$L" --out "$D/out/video_$L.mp4" > "$LOG" 2>&1 \
  && sh core/render/mux.sh "$D/out/video_$L.mp4" "$D/out/mix.wav" "$D/out/master_$L.mp4" 30 0 >> "$LOG" 2>&1 \
  && sh "$STUDIO/tools/compress.sh" "$D/out/master_$L.mp4" "$D/output/video-$1_v$K$SUF.mp4" >> "$LOG" 2>&1
echo "EXIT $? video-$1 $L" >> "$LOG"; tail -1 "$LOG"
