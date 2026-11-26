#!/bin/sh
# usage: sh tools/videotpl/render.sh N [K] — master (events, readcheck, frames, mix, mux) then deliver vK (default 1).
# One render at a time on the machine (flock): run it in the background, never sleep-wait for it.
STUDIO=$(cd "$(dirname "$0")/../.." && pwd -P); D=$STUDIO/video/video-$1; mkdir -p "$STUDIO/.tools"
exec 9>"$STUDIO/.tools/render.lock"; flock 9
cd "$D" && sh build.sh master > out_render.log 2>&1 && sh build.sh deliver "${2:-1}" >> out_render.log 2>&1; echo "EXIT $? video-$1" >> out_render.log; tail -1 out_render.log
