#!/bin/sh
# Compress a mastered film into the TikTok deliverable.
#   sh tools/compress.sh <master.mp4> <out.mp4> [crf=21]
# 1080x1920 H.264 High, yuv420p limited-range BT.709 (what phones expect), frame rate kept, AAC 192k 48 kHz,
# +faststart. Pixel art survives crf 20-23 well; lower the crf only if blocks show in dark fog or dithered gradients.
set -e
IN=${1:?usage: sh tools/compress.sh <master.mp4> <out.mp4> [crf]}
OUT=${2:?usage: sh tools/compress.sh <master.mp4> <out.mp4> [crf]}
CRF=${3:-21}
command -v ffmpeg >/dev/null || { echo "ffmpeg not on PATH: run  . tools/env.sh"; exit 1; }
mkdir -p "$(dirname "$OUT")"
TMP="${OUT%.mp4}.tmp.mp4"
ffmpeg -y -loglevel error -i "$IN" \
  -vf "scale=1080:1920:flags=lanczos:out_range=tv:out_color_matrix=bt709,format=yuv420p" \
  -c:v libx264 -preset slow -crf "$CRF" -maxrate 8M -bufsize 16M -profile:v high -level:v 4.2 \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -movflags +faststart "$TMP"
mv "$TMP" "$OUT"
ffprobe -v error -show_entries format=duration,size,bit_rate -show_entries stream=codec_name,width,height,r_frame_rate \
  -of default=nw=1 "$OUT" | tr '\n' ' '; echo
SIZE=$(wc -c < "$OUT")
echo "→ $OUT ($(awk "BEGIN{printf \"%.1f\", $SIZE/1048576}") MB)"
