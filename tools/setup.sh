#!/bin/sh
# One-command bootstrap for this studio (Claude Code and Codex alike). Idempotent: run it at the start of any session.
#   sh tools/setup.sh            library + core/voice/music packages + ffmpeg 7+ shim, then writes tools/.env.local.sh
# Afterwards, in every shell that runs a render tool:   . tools/env.sh
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd -P)
export LEMO_OPUSCAR_HOME="$ROOT/.lemo-opuscar"
SKILL="$ROOT/.claude/skills/lemo-opuscar/scripts/setup.sh"

# ffmpeg 7+ (lemo's mux.sh refuses 6.x). Use the system one when recent enough, else the static build shipped on PyPI by imageio-ffmpeg.
mkdir -p "$ROOT/.tools/bin"
ffv=$(ffmpeg -version 2>/dev/null | sed -n '1s/^ffmpeg version n\{0,1\}\([0-9][0-9]*\)\..*/\1/p')
if [ -n "$ffv" ] && [ "$ffv" -ge 7 ]; then
  echo "== ffmpeg $ffv.x from the system is fine"
  rm -f "$ROOT/.tools/bin/ffmpeg" "$ROOT/.tools/bin/ffprobe"
else
  echo "== ffmpeg ${ffv:-missing}.x is too old: installing imageio-ffmpeg (PyPI) into .tools/py"
  [ -d "$ROOT/.tools/py/imageio_ffmpeg" ] || python3 -m pip install --quiet --disable-pip-version-check --target "$ROOT/.tools/py" imageio-ffmpeg
  bin=$(ls -d "$ROOT"/.tools/py/imageio_ffmpeg/binaries/ffmpeg-* | head -1)
  chmod +x "$bin"; ln -sfn "$bin" "$ROOT/.tools/bin/ffmpeg"
  command -v ffprobe >/dev/null && ln -sfn "$(command -v ffprobe)" "$ROOT/.tools/bin/ffprobe"
  "$ROOT/.tools/bin/ffmpeg" -version | head -1
fi

export PATH="$ROOT/.tools/bin:$PATH"

echo "== lemo-opuscar library ($LEMO_OPUSCAR_HOME)"
sh "$SKILL" | tail -3
echo "== packages (core, voice, music)"
sh "$SKILL" deps voice music 2>&1 | grep -vE '^\s*#|%' | tail -4

# Machine-specific settings, sourced by tools/env.sh
{
  echo "# written by tools/setup.sh on $(date -u +%Y-%m-%dT%H:%MZ); machine-specific, not committed"
  # No real GPU (cloud VMs, CI): WebGL must run on SwiftShader, or the HD-2D renders come out blank.
  if [ "$(uname)" = Linux ] && ! ls /dev/dri/renderD* >/dev/null 2>&1; then echo "export LEMO_ANGLE=\${LEMO_ANGLE:-swiftshader}"; fi
} > "$ROOT/tools/.env.local.sh"

STUDIO=$ROOT; . "$ROOT/tools/env.sh"
echo "== ready: LIB=$LIB"
echo "   ffmpeg: $(ffmpeg -version | head -1 | cut -c1-60)"
[ -n "$LEMO_ANGLE" ] && echo "   WebGL: LEMO_ANGLE=$LEMO_ANGLE (no GPU found)"
exit 0
