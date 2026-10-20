#!/bin/sh
# Usage: mkws.sh <workspace dir>. A copy of the repository without git history, with node_modules linked and the page cache copied.
set -e
REPO=/home/user/MoesTools-Brainstormer
WS="$1"
rm -rf "$WS"
mkdir -p "$WS"
cd "$REPO"
git ls-files -z | xargs -0 -I{} cp --parents {} "$WS"/
ln -s "$REPO/node_modules" "$WS/node_modules"
if [ -d "$REPO/.cache" ]; then cp -r "$REPO/.cache" "$WS/.cache"; fi
echo "$WS"
