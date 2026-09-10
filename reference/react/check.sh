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

# 5. Hover moves UP the surface ramp (rule 21), and these components must obey
#    the rule they document.
#
#    This exists because they did not. `--carbon-hover-raised` was added in
#    1.8.0, rule 21 was written around it, the token table listed it - and the
#    button's own tone table still hovered a surface3 fill and a surface2 fill
#    both to `--carbon-hover`. On the dark ramp that value is #353535, BELOW
#    surface2's #393939, so a filled control hovered with it goes darker at the
#    moment somebody is looking straight at it. An adopting app had the fix and
#    the language did not, which is the wrong direction for a correction to
#    travel, and nothing here could notice.
#
#    The check is deliberately narrow: only a class list that FILLS with
#    surface2 or surface3 is examined. A bare control on a card - the toast's
#    close button - has no fill of its own and `--carbon-hover` is exactly right
#    for it, so a blanket ban on the token would flag the one correct use.
#
#    The name must END there, or `hover:bg-carbon-hoverRaised` contains
#    `hover:bg-carbon-hover` and every correct control reports as the mistake.
#    That is not hypothetical either: the first version of this guard, in an
#    adopting app, did exactly that.
while IFS= read -r line; do
  case "$line" in
    *bg-carbon-surface2*|*bg-carbon-surface3*)
      case "$line" in
        *"hover:bg-carbon-hoverRaised"*) continue ;;
      esac
      printf '%s\n' "$line" | grep -qE "hover:bg-carbon-hover([^A-Za-z-]|$)" \
        && note "a surface-filled control hovers DOWN the ramp (rule 21): ${line%%:*}"
      ;;
  esac
done < <(grep -nE '"[^"]*bg-carbon-surface[23][^"]*"' reference/react/*.tsx)

if [ "$fail" -eq 0 ]; then
  echo "OK  every class, utility and property the components use is defined here"
fi
exit "$fail"
