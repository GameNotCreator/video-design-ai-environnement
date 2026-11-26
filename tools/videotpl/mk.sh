#!/bin/sh
# usage: sh tools/videotpl/mk.sh N — copy the shared page infrastructure into video/video-N (after tools/new-video.sh)
# Then write story.js (timeline), scene.js (build(): scene + update(t, shot, cam, post, renderer)), extra.js, mix.py.
set -e
STUDIO=$(cd "$(dirname "$0")/../.." && pwd -P); V=$STUDIO/video; D=$V/video-$1; S=$V/video-14; TPL=$STUDIO/tools/videotpl
mkdir -p "$D/tools" "$D/output"; cp -r "$S/fonts" "$S/assets" "$D/"
cp "$S/fx.js" "$S/kit.js" "$S/px.js" "$S/post_ts.js" "$S/index.html" "$S/build.sh" "$D/"; cp "$S/tools/render_range.mjs" "$D/tools/"
cp "$TPL/ui.js" "$TPL/main.js" "$TPL/people.js" "$D/"; sed -i "s/video-14/video-$1/g" "$D/index.html" "$D/build.sh"
echo "video-$1 ready: write story.js, scene.js, extra.js, mix.py (see tools/videotpl/README.md)"
