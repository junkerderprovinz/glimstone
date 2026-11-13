#!/usr/bin/env bash
# Runs the Playwright suite in Microsoft's Linux image, the platform the
# screenshot baselines are rendered on, and copies the baselines back. The
# repository is copied into the container first, so its node_modules stay
# the host's.
#
#   site/playwright-linux.sh --project=visual --update-snapshots
#   site/playwright-linux.sh --project=react-firefox
set -euo pipefail
repo=$(cd "$(dirname "$0")/.." && pwd)
version=$(grep -A1 '"node_modules/@playwright/test"' "$repo/package-lock.json" | sed -n 's/.*"version": "\(.*\)".*/\1/p')

docker run --rm --ipc=host -e CI=1 -v "$repo:/src" mcr.microsoft.com/playwright:v"$version"-noble bash -c '
  set -euo pipefail
  mkdir /w
  tar -C /src --exclude=node_modules --exclude=site/dist --exclude=site/test-results --exclude=site/src/gen -cf - . | tar -C /w -xf -
  cd /w && npm ci --no-audit --no-fund >/dev/null
  cd site && npm run build >/dev/null
  status=0
  npx playwright test "$@" || status=$?
  rm -rf /src/site/tests/__screenshots__/linux
  mkdir -p /src/site/tests/__screenshots__
  [ -d tests/__screenshots__/linux ] && cp -r tests/__screenshots__/linux /src/site/tests/__screenshots__/
  mkdir -p /src/site/test-results && cp test-results/raw.json /src/site/test-results/linux.json
  exit $status
' run "$@"
