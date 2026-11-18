# Source this before running any render tool:   . tools/env.sh      (from the repo root, in sh, bash or zsh)
# From a script elsewhere, set STUDIO first:     STUDIO=/path/to/repo; . "$STUDIO/tools/env.sh"
# Sets LIB / LEMO_OPUSCAR_HOME to the repo-local library and puts the ffmpeg 7+ shim first on PATH.
if [ -z "$STUDIO" ] || [ ! -f "$STUDIO/tools/env.sh" ]; then
  if [ -n "$BASH_SOURCE" ]; then STUDIO=$(cd "$(dirname "$BASH_SOURCE")/.." && pwd -P)
  else case "$0" in */env.sh|env.sh) STUDIO=$(cd "$(dirname "$0")/.." && pwd -P) ;;   # zsh sets $0 to the sourced file
         *) [ -f tools/env.sh ] && STUDIO=$(pwd -P) ;; esac
  fi
fi
if [ -z "$STUDIO" ] || [ ! -f "$STUDIO/tools/env.sh" ]; then
  echo "! tools/env.sh: run it from the repo root, or set STUDIO to the repo path first" >&2
else
  export STUDIO
  export LEMO_OPUSCAR_HOME="$STUDIO/.lemo-opuscar"
  export LIB="$LEMO_OPUSCAR_HOME"
  case ":$PATH:" in *":$STUDIO/.tools/bin:"*) ;; *) export PATH="$STUDIO/.tools/bin:$PATH" ;; esac
  [ -f "$STUDIO/tools/.env.local.sh" ] && . "$STUDIO/tools/.env.local.sh"
  [ -f "$LIB/core/render/video.mjs" ] || echo "! the lemo-opuscar library is missing: run  sh tools/setup.sh" >&2
fi
