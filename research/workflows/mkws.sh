#!/bin/sh
# Usage: mkws.sh <workspace dir>. A copy of the repository's last commit without git history, with node_modules linked
# and the page cache copied. Prints the folder and the commit it copied.
set -e
REPO=/home/user/MoesTools-Brainstormer
WS="${1%/}"
usage() { echo "usage: mkws.sh <scratchpad>/r<N>/<phase>/ws-<job> (an absolute path)" >&2; exit 2; }
# The folder is deleted first, so only an absolute path to a ws- folder, with no . or .. in it.
case "$WS" in /*) ;; *) usage;; esac
case "$WS/" in */../*|*/./*) usage;; esac
case "$WS" in */scratchpad/r[0-9]*/*/ws-*) ;; *) usage;; esac
case "${WS##*/}" in ws-?*) ;; *) usage;; esac
# The commit, not the files on disk: uncommitted edits stay out, so the copy matches the commit it reports.
REV=$(git -C "$REPO" rev-parse HEAD)
rm -rf "$WS"
mkdir -p "$WS"
git -C "$REPO" archive "$REV" | tar -x -C "$WS"
ln -s "$REPO/node_modules" "$WS/node_modules"
if [ -d "$REPO/.cache" ]; then cp -r "$REPO/.cache" "$WS/.cache"; fi
echo "$WS $REV"
