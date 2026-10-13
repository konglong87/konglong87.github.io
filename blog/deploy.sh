#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
"$ROOT/scripts/build.sh" "$ROOT/docs"
printf '\nBuild complete. Review docs/ and run the project tests before committing and pushing.\n'
