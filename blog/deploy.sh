#!/bin/sh

set -e

printf "发布 Deploying updates to KL GitHub...\n"
hugo
cp -r public/ ../docs

msg="[修改] rebuilding site $(date)"
if [ -n "$*" ]; then
    msg="$*"
fi

git commit -am "$msg"
git push
echo "[发布完成] all done."