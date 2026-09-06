#!/usr/bin/env bash
# Does every class, utility and custom property these components touch actually
# exist in GlimStone?
#
# This exists because the first cut of this folder shipped components that read
# thirteen classes and seven tokens defined nowhere in the repository - they had
# been living in one app's own stylesheet all along, so a button copied out of
# here arrived with no height, no padding and no radius. Nothing about that is
# visible in the TypeScript: it typechecks perfectly, and the defect only shows
# up on screen, in the app that adopted it.
#
# Run from the repository root: bash reference/react/check.sh
set -uo pipefail
cd "$(dirname "$0")/../.."

fail=0
note() { echo "MISSING  $1"; fail=1; }

# 1. Every glim-* class the components put in a className.
#    `glim-convention-exception` is not a class: it is a marker inside a comment
#    that tags a deliberate, reviewed departure from a rule, so it is skipped.
#    The match has to END the name, or `.glim-btn-chip` would answer for a
#    deleted `.glim-btn` and the check would pass while every button lost its
#    box. That was not hypothetical: the first version of this script did
#    exactly that, and only breaking it on purpose showed it.
#    A name can arrive three ways: as a selector, as a keyframes name, or as a
#    custom property, so all three count as defined.
for c in $(grep -ohE "\bglim-[a-z0-9-]+" reference/react/*.tsx | sort -u); do
  [ "$c" = "glim-convention-exception" ] && continue
  grep -qE "(\.|@keyframes |--)${c}([^a-zA-Z0-9-]|$)" reference/tokens.css \
    || note "class $c (not in reference/tokens.css)"
done

# 2. Every themed Tailwind utility, against the @theme layer that maps them.
for u in $(grep -ohE "\b(bg|text|border|ring|fill|stroke)-(carbon|accent|status)[A-Za-z0-9-]*|\brounded-(card|control|pill)\b" reference/react/*.tsx | sort -u); do
  grep -q "${u#*-}" reference/tailwind-theme.css || note "utility $u (not in reference/tailwind-theme.css)"
done

# 3. Every custom property set inline from a component's own style object.
for v in $(grep -ohE '"--[a-zA-Z-]+"' reference/react/*.tsx | tr -d '"' | sort -u); do
  grep -q -- "$v" reference/tokens.css reference/appearance.ts || note "property $v"
done

# 4. Nothing may point at a file that only exists inside an adopting app.
grep -n "index\.css" reference/react/*.tsx && note "a comment names an app's own stylesheet"

if [ "$fail" -eq 0 ]; then
  echo "OK  every class, utility and property the components use is defined here"
fi
exit "$fail"
