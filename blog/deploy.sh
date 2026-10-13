#!/usr/bin/env bash
set -euo pipefail
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"
readonly PUBLISH_BRANCH=main
readonly AUTHOR_NAME=konglong
readonly AUTHOR_EMAIL=konglong@com
readonly DEFAULT_MESSAGE='build: publish curated project blog'
PUBLISH_PATHS=(.gitignore README.md blog/config.toml blog/deploy.sh blog/theme-version.txt
  blog/archetypes blog/assets blog/content blog/layouts blog/static blog/vendor scripts docs)

is_publish_path() {
  local file=$1 scope
  for scope in "${PUBLISH_PATHS[@]}"; do
    if [[ "$file" == "$scope" || "$file" == "$scope/"* ]]; then return 0; fi
  done
  return 1
}

if [[ "$(git branch --show-current)" != "$PUBLISH_BRANCH" ]]; then
  echo "Refusing to publish from a branch other than $PUBLISH_BRANCH." >&2; exit 1
fi
git remote get-url origin >/dev/null
while IFS= read -r -d '' file; do
  if ! is_publish_path "$file"; then
    echo "Unrelated staged file; review or unstage it first: $file" >&2; exit 1
  fi
done < <(git diff --cached --name-only -z)

# A preview URL inherited from the environment must never reach production.
env -u HUGO_BASEURL "$ROOT/scripts/build.sh" "$ROOT/docs"
python3 "$ROOT/scripts/check-site.py" "$ROOT/docs"
git add -- "${PUBLISH_PATHS[@]}"
if ! git diff --cached --quiet; then
  GIT_AUTHOR_NAME="$AUTHOR_NAME" GIT_AUTHOR_EMAIL="$AUTHOR_EMAIL" \
  GIT_COMMITTER_NAME="$AUTHOR_NAME" GIT_COMMITTER_EMAIL="$AUTHOR_EMAIL" \
    git commit -m "${*:-$DEFAULT_MESSAGE}"
else
  printf 'No new site changes to commit. Checking pending push.\n'
fi
git push origin "$PUBLISH_BRANCH"
printf '\nPublished the curated blog source and output to %s.\n' "$PUBLISH_BRANCH"
