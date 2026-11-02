#!/usr/bin/env bash
# Checks that every class and custom property the components touch is defined
# in GlimStone, and that they carry no Tailwind utility. A component that reads
# a class defined only in an adopting app typechecks fine and arrives there with
# no height, padding or radius.
#
# Run from the repository root: bash scripts/check-classes.sh
set -uo pipefail
cd "$(dirname "$0")/.."

fail=0
note() { echo "MISSING  $1"; fail=1; }

tokens=packages/core/tokens.css
# The component sources, and the core modules that hand them class names.
components=$(ls packages/react/src/*.tsx packages/vue/src/*.vue 2>/dev/null)
views="packages/core/src/button.ts packages/core/src/badge.ts packages/core/src/selectModel.ts packages/core/src/readmeButton.ts"

# 1. Every glim-* class the components put in a class list. A name that ends in
#    a hyphen is the fixed part of a template such as `glim-badge--${size}`.
#    `glim-convention-exception` is a marker in a comment that tags a reviewed
#    departure from a rule, not a class.
#    The match has to end the name, or `.glim-btn-chip` would answer for a
#    deleted `.glim-btn`.
#    A name counts as defined as a selector, a keyframes name or a custom property.
for c in $(grep -ohE "\bglim-[a-z0-9-]+" $components $views | sort -u); do
  case "$c" in *-|glim-convention-exception) continue ;; esac
  grep -qE "(\.|@keyframes |--)${c}([^a-zA-Z0-9-]|$)" $tokens || note "class $c (not in $tokens)"
done

# 2. No Tailwind utility in a class list, so an app without Tailwind gets the
#    same look as one with it.
grep -nP "class(Name)?=[^>]*(?<![\w-])(flex|grid|inline-flex|items-[a-z]+|justify-[a-z]+|gap-[0-9.]+|p[xytbse]?-[0-9.]+|m[xytbse]?-[0-9.]+|-m-[0-9]|(bg|text|border|ring)-(carbon|accent|status)[A-Za-z0-9-]*|text-(xs|sm|base|lg)|rounded-(card|control|pill|full)|shrink-0|sr-only|hover:[a-z-]+)(?![\w-])" $components \
  && note "a Tailwind utility in a component (above)"

# 3. Every custom property set inline from a component's own style object.
for v in $(grep -ohE '"--[a-zA-Z-]+"' $components | tr -d '"' | sort -u); do
  grep -q -- "$v" $tokens packages/core/src/appearance.ts || note "property $v"
done

# 4. Nothing may point at a file that only exists inside an adopting app.
grep -n "index\.css" $components && note "a comment names an app's own stylesheet"

# 5. Hover moves up the surface ramp (rule 21). On the dark ramp `--carbon-hover`
#    is #353535, below surface2's #393939, so a control filled with surface2 or
#    surface3 that hovers to it goes darker. A bare control on a card, such as a
#    row's glyph button, is right to use `--carbon-hover`.
while IFS= read -r hit; do
  note "a surface-filled control hovers down the ramp (rule 21): $hit"
done < <(perl -0777 -ne '
  s{/\*.*?\*/}{}gs;
  my %fill;
  while (/([^{}]+)\{([^{}]*)\}/g) {
    my ($sel, $body) = ($1, $2);
    next unless $body =~ /background(?:-color)?:\s*var\(--carbon-surface[23]\)/;
    $fill{$_} = 1 for map { s/^\s+|\s+$//gr } split /,/, $sel;
  }
  while (/([^{}]+)\{([^{}]*)\}/g) {
    my ($sel, $body) = ($1, $2);
    next unless $body =~ /background(?:-color)?:\s*var\(--carbon-hover\)/;
    for my $s (map { s/^\s+|\s+$//gr } split /,/, $sel) {
      (my $base = $s) =~ s/:hover//;
      print "$s\n" if $fill{$base};
    }
  }' $tokens)

# 6. A :has() never tests the class or style attribute (rule 36). Chrome then
#    restyles the whole page whenever a class or an inline style changes, and a
#    page that animates a bar through either stalls on every frame. Comments are
#    dropped first, and the argument is matched with its nested brackets.
while IFS= read -r hit; do
  note "a :has() reads the class or style attribute (rule 36): $hit"
done < <(perl -0777 -ne '
  s{/\*.*?\*/}{}gs; s{^\s*//.*$}{}gm;
  while (/(:has(\((?:[^()]++|(?2))*\))|\bhas-(\[(?:[^\[\]]++|(?3))*\]))/g) {
    my ($hit, $arg) = ($1, $2 // $3);
    print "$ARGV $hit\n" if $arg =~ /\[\s*(?:class|style)\b/;
  }' packages/core/*.css packages/core/src/*.ts $components)

if [ "$fail" -eq 0 ]; then
  echo "OK  every class and property the components use is defined here"
fi
exit "$fail"
