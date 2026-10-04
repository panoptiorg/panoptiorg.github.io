#!/bin/sh
# Screenshots tools/og.html into assets/img/og.png (1200 x 630) with headless Chrome.
# Needs Google Chrome and network access for the fonts.
set -eu
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --virtual-time-budget=8000 \
  --screenshot="$PWD/assets/img/og.png" "file://$PWD/tools/og.html"
echo "assets/img/og.png"
