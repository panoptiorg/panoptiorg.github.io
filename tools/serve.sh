#!/bin/sh
# Builds or serves the site locally with the same image GitHub Pages builds it with
# (actions/jekyll-build-pages: the github-pages gem, Jekyll 3.10). Needs Docker.
#
#   sh tools/serve.sh                 serve on http://localhost:4000, rebuilding on change
#   sh tools/serve.sh --drafts        ... including _drafts/
#   sh tools/serve.sh build           one production build into _site/, exactly as on GitHub
#
# JS and CSS are served from assets/, so run `npm run watch` alongside to reshape on change.
set -eu
cd "$(dirname "$0")/.."
IMAGE=ghcr.io/actions/jekyll-build-pages:v1.0.13
NWO=panoptiorg/panoptiorg.github.io

if [ "${1:-}" = build ]; then
  exec docker run --rm --platform linux/amd64 -v "$PWD:/github/workspace" \
    -e GITHUB_WORKSPACE=/github/workspace -e INPUT_SOURCE=. -e INPUT_DESTINATION=_site \
    -e GITHUB_REPOSITORY="$NWO" -e INPUT_TOKEN="${GITHUB_TOKEN:-}" \
    "$IMAGE"
fi

# interactive (Ctrl-C to stop) when run from a terminal
TTY=""
[ -t 0 ] && TTY="-it"
exec docker run --rm $TTY --platform linux/amd64 -p 4000:4000 -v "$PWD:/site" \
  -e PAGES_REPO_NWO="$NWO" -e JEKYLL_GITHUB_TOKEN="${GITHUB_TOKEN:-}" -e BUNDLE_GEMFILE=/Gemfile \
  --entrypoint bundle "$IMAGE" exec jekyll serve --source /site --destination /tmp/_site \
  --host 0.0.0.0 --port 4000 --force_polling "$@"
