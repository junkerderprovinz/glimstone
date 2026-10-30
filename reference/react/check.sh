#!/usr/bin/env bash
# Checks that every class, utility and custom property these components touch is
# defined in GlimStone. A component that reads a class defined only in an adopting
# app typechecks fine and arrives there with no height, padding or radius.
#
# Run from the repository root: bash reference/react/check.sh
set -uo pipefail
cd "$(dirname "$0")/../.."

fail=0
note() { echo "MISSING  $1"; fail=1; }

# 1. Every glim-* class the components put in a className.
#    `glim-convention-exception` is a marker in a comment that tags a reviewed
#    departure from a rule, not a class.
#    The match has to end the name, or `.glim-btn-chip` would answer for a
#    deleted `.glim-btn`.
#    A name counts as defined as a selector, a keyframes name or a custom property.
for c in $(grep -ohE "\bglim-[a-z0-9-]+" reference/react/*.tsx | sort -u); do
  [ "$c" = "glim-convention-exception" ] && continue
  grep -qE "(\.|@keyframes |--)${c}([^a-zA-Z0-9-]|$)" reference/tokens.css \
    || note "class $c (not in reference/tokens.css)"
done

# 2. Every themed Tailwind utility, against the @theme layer that maps them.
for u in $(grep -ohE "\b(bg|text|border|ring|fill|stroke)-(carbon|accent|status)[A-Za-z0-9-]*|\brounded-(card|control|pill)\b|\btext-(title|body|subline|meta|heading|dense|caption)\b" reference/react/*.tsx | sort -u); do
  grep -q "${u#*-}" reference/tailwind-theme.css || note "utility $u (not in reference/tailwind-theme.css)"
done

# 3. Every custom property set inline from a component's own style object.
for v in $(grep -ohE '"--[a-zA-Z-]+"' reference/react/*.tsx | tr -d '"' | sort -u); do
  grep -q -- "$v" reference/tokens.css reference/appearance.ts || note "property $v"
done

# 4. Nothing may point at a file that only exists inside an adopting app.
grep -n "index\.css" reference/react/*.tsx && note "a comment names an app's own stylesheet"

# 5. Hover moves up the surface ramp (rule 21). On the dark ramp `--carbon-hover`
#    is #353535, below surface2's #393939, so a control filled with surface2 or
#    surface3 that hovers to it goes darker. Only filled controls are examined: a
#    bare control on a card, such as the toast's close button, is right to use
#    `--carbon-hover`.
#    The name must end there, or `hover:bg-carbon-hoverRaised` would match
#    `hover:bg-carbon-hover`.
while IFS= read -r line; do
  case "$line" in
    *bg-carbon-surface2*|*bg-carbon-surface3*)
      case "$line" in
        *"hover:bg-carbon-hoverRaised"*) continue ;;
      esac
      printf '%s\n' "$line" | grep -qE "hover:bg-carbon-hover([^A-Za-z-]|$)" \
        && note "a surface-filled control hovers down the ramp (rule 21): ${line%%:*}"
      ;;
  esac
done < <(grep -nE '"[^"]*bg-carbon-surface[23][^"]*"' reference/react/*.tsx)

# 6. A :has() never tests the class or style attribute (rule 36). Chrome then
#    restyles the whole page whenever a class or an inline style changes, and a
#    page that animates a bar through either stalls on every frame. The scripts
#    and components are read too, for a Tailwind variant such as
#    `has-[[class*=open]]:` in a class list. Comments are dropped first, and the
#    argument is matched with its nested brackets.
while IFS= read -r hit; do
  note "a :has() reads the class or style attribute (rule 36): $hit"
done < <(perl -0777 -ne '
  s{/\*.*?\*/}{}gs; s{^\s*//.*$}{}gm;
  while (/(:has(\((?:[^()]++|(?2))*\))|\bhas-(\[(?:[^\[\]]++|(?3))*\]))/g) {
    my ($hit, $arg) = ($1, $2 // $3);
    print "$ARGV $hit\n" if $arg =~ /\[\s*(?:class|style)\b/;
  }' reference/*.css reference/*.ts reference/react/*.ts reference/react/*.tsx)

if [ "$fail" -eq 0 ]; then
  echo "OK  every class, utility and property the components use is defined here"
fi
exit "$fail"
