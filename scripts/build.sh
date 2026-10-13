#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
THEME_DIR="$ROOT/blog/vendor/hugo-paper"
HUGO_BIN=${HUGO_BIN:-hugo}
HUGO_VERSION=0.111.3

case "$("$HUGO_BIN" version)" in
  "hugo v$HUGO_VERSION "*|"hugo v$HUGO_VERSION+"*) ;;
  *) echo "Use Hugo $HUGO_VERSION (set HUGO_BIN to its path)." >&2; exit 1 ;;
esac

if [ ! -f "$THEME_DIR/theme.toml" ] || [ ! -f "$THEME_DIR/LICENSE" ]; then
  echo "Vendored hugo-paper runtime or license is missing." >&2; exit 1
fi

DEST=${1:-"$ROOT/.build/public"}
case "$DEST" in /*) ;; *) DEST="$ROOT/$DEST" ;; esac
"$HUGO_BIN" --source "$ROOT/blog" --destination "$DEST" --gc --minify
printf '\nSite built: %s\n' "$DEST"
