#!/usr/bin/env bash
# Runs the core under Hermes, the engine of a React Native app, which lacks
# several Intl constructors a browser has. A module that builds one while it
# loads stops the app before its first screen.
#
# Run from the repository root on Linux: bash scripts/check-hermes.sh
set -euo pipefail
cd "$(dirname "$0")/.."

version=v0.13.0
sum=aead6eb0b8f563bb022354352eae32dad96c933330b6c1941b6db17674ca68ae
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

curl -fsSL -o "$work/hermes.tar.gz" "https://github.com/facebook/hermes/releases/download/$version/hermes-cli-linux.tar.gz"
echo "$sum  $work/hermes.tar.gz" | sha256sum -c --quiet
tar xzf "$work/hermes.tar.gz" -C "$work"

npx rolldown packages/core/test/hermes/run.ts --format iife --file "$work/core.js" > /dev/null
"$work/hermes" "$work/core.js"
