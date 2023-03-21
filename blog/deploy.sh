#!/bin/sh

set -e

printf "发布 Deploying updates to KL GitHub...\n"

cp -r public/ ../docs

msg="[修改] rebuilding site $(date)"
if [ -n "$*" ]; then
    msg="$*"
fi

git commit -am "$msg"
git push
echo "all done."