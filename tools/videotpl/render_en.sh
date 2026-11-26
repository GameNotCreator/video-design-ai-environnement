#!/bin/sh
# usage: sh tools/videotpl/render_en.sh N [K] — English version (story.js with ?lang=en) from the French master's mix:
# output/video-N_vK_en.mp4. Run after render.sh (it needs out/mix.wav). Same lock: one render at a time.
STUDIO=$(cd "$(dirname "$0")/../.." && pwd -P); D=$STUDIO/video/video-$1; K=${2:-1}; mkdir -p "$STUDIO/.tools"
exec 9>"$STUDIO/.tools/render.lock"; flock 9
cd "$STUDIO" && . tools/env.sh && cd "$LIB" \
  && node core/render/video.mjs "$D" --size 1080x1920 --fps 30 --workers 3 --q 'ss=1&lang=en' --out "$D/out/video_en.mp4" > "$D/out_render_en.log" 2>&1 \
  && sh core/render/mux.sh "$D/out/video_en.mp4" "$D/out/mix.wav" "$D/out/master_en.mp4" 30 0 >> "$D/out_render_en.log" 2>&1 \
  && sh "$STUDIO/tools/compress.sh" "$D/out/master_en.mp4" "$D/output/video-$1_v${K}_en.mp4" >> "$D/out_render_en.log" 2>&1
echo "EXIT $? video-$1 en" >> "$D/out_render_en.log"; tail -1 "$D/out_render_en.log"
