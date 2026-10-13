#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
THEME_DIR="$ROOT/blog/themes/hugo-paper"
THEME_REV=$(cat "$ROOT/blog/theme-version.txt")
HUGO_BIN=${HUGO_BIN:-hugo}
HUGO_VERSION=0.111.3

case "$("$HUGO_BIN" version)" in
  "hugo v$HUGO_VERSION "*|"hugo v$HUGO_VERSION+"*) ;;
  *) echo "Use Hugo $HUGO_VERSION (set HUGO_BIN to its path)." >&2; exit 1 ;;
esac

if [ ! -d "$THEME_DIR/.git" ]; then
  git clone https://github.com/nanxiaobei/hugo-paper.git "$THEME_DIR"
fi
if [ "$(git -C "$THEME_DIR" rev-parse HEAD)" != "$THEME_REV" ]; then
  if [ -n "$(git -C "$THEME_DIR" status --porcelain)" ]; then
    echo "Theme has local changes; refusing to replace them." >&2; exit 1
  fi
  git -C "$THEME_DIR" checkout --detach "$THEME_REV"
fi

DEST=${1:-"$ROOT/.build/public"}
case "$DEST" in /*) ;; *) DEST="$ROOT/$DEST" ;; esac
"$HUGO_BIN" --source "$ROOT/blog" --destination "$DEST" --gc --minify
printf '\nSite built: %s\n' "$DEST"
