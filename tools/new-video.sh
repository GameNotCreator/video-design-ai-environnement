#!/bin/sh
# Claim the next free video number and create its folder.
#   sh tools/new-video.sh <agent> "<short title>"      e.g.  sh tools/new-video.sh claude "nuclear lock hook"
# Numbers are shared by every agent (Claude Code, Codex) on every branch: the script looks at the local tree and at
# every branch on origin, takes the highest video-N it finds and creates video-(N+1). Commit and push the CLAIM file
# right away so the other agent sees the number is taken.
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd -P)
AGENT=${1:?usage: sh tools/new-video.sh <claude|codex> "<short title>"}
TITLE=${2:-untitled}
cd "$ROOT"
git fetch --quiet origin 2>/dev/null || echo "! could not fetch origin: numbering from the local state only" >&2

max=0
bump() { case $1 in ''|*[!0-9]*) return ;; esac; [ "$1" -gt "$max" ] && max=$1; return 0; }
for d in video/video-*; do [ -d "$d" ] && bump "${d##*/video-}"; done
for ref in $(git for-each-ref --format='%(refname)' refs/heads refs/remotes/origin 2>/dev/null); do
  for n in $(git ls-tree --name-only "$ref" video/ 2>/dev/null | sed -n 's#^video/video-\([0-9][0-9]*\)$#\1#p'); do bump "$n"; done
done

N=$((max + 1))
DIR="video/video-$N"
mkdir -p "$DIR/output"
cat > "$DIR/CLAIM" <<EOF
video: video-$N
agent: $AGENT
title: $TITLE
claimed: $(date -u +%Y-%m-%dT%H:%MZ)
branch: $(git branch --show-current 2>/dev/null)
EOF
echo "$DIR"
