# Decision log

The [design language](design-language.md) says what holds and why. This file keeps how a rule came about: the report or the measurement that started it, what was tried first and what it replaced. When a rule changes, its text in the design language is rewritten and the reading it replaces is added here.

## The type scale

Three near-identical caption sizes (10px, 11px and 11.5px) had drifted apart in one app before they were folded into a single caption row.

## Rule 6: a row's buttons appear on hover and on focus

It replaces an earlier rule that every row action is visible at rest, on every list at once.

## Rule 13: the icon variant follows the label mode

The variant first shipped as a glyph in every mode, on the reasoning that such a control is its symbol and that an ordinary button would print five verbs where a tidy strip had been. It was rejected in the words of the defect it was meant to fix: in `textGlyph` mode five controls in one card row printed no word while three beside them did. `IconButton` was asked for by a file list whose rows show their names first.

## Rule 19: two button heights

`--btn-h` came out of a report that buttons stood far too bulky beside the text fields. The half-rem step to `--btn-h-key` rests on another report: four pixels of difference between neighbours was filed as a bug, and eight never was.

## Rule 20: one gap between stacked cards

Measured first on a Settings page, where both the gap between cards and the gap below the tab strip went from `gap-6`, then the largest gap in that app, to `gap-10` at once.

## Rule 21: hover moves up the surface ramp

The ramp first stopped at surface3, so the controls standing on it had nowhere to go and each of them reached back down to `--carbon-hover`. `--carbon-hover-raised` was added for them.

The rule itself came from a list of filled tiles whose class said `hover:bg-carbon-hover` and which, correctly, seemed to have no hover at all. The token table had said "hover on surface2" beside `--carbon-surface3` from the start, and a table row proved too quiet: thirteen places in three apps had it the wrong way round. The same tiles had traded their focus ring for `brightness-125`, which read the same as the corrected hover, so the focus half joined the rule.

The step for the accent-filled button was decided after buttons that did not react to the pointer were reported across an app.

## Rule 22: a settings card configures, the shell operates

The password card had grown *Sign out* and *Sign out everywhere* along its bottom edge, so the two most consequential controls on a form with unsaved fields were the two that throw it away, and one of them repeated a control the shell already carried. *Sign out* left the card untouched because the shell offered it. *Sign out everywhere* had no second home, and deleting its only button would have removed the one way to revoke outstanding sessions. So it moved into the action that implies it: changing the password ends every other session, which is what somebody changing a password out of suspicion expected anyway.

## Rule 23: an action never ends in an ellipsis

Found where fourteen labels in one app carried one.

## Rule 24: a card keeps the height of its tallest choice

Found in a relay card whose four choices differ by up to two settings rows.

## Rule 25: an action that writes files says where

Found in an export, reported as "Export to where? Not clear."

## Rule 35: a dropdown or a one-line field stands beside its label

Found where a card that named some controls above and some beside read as two designs. The app keeps a source check that fails on a new field standing under its name.

## Rule 36: a `:has()` never tests `class` or `style`

Found on a host dashboard that animates its CPU bars through inline styles dozens of times a second. With the rules rewritten to read classes, the page's total blocking time fell from 8.4 s to 12 ms.

## Rule 37: a changing bar gets `contain: size layout`

Found on a host dashboard where jQuery animates each core's load bar frame by frame on every message and reads the width back before each step. Firefox spent 140 ms of every second blocked there, and 0 to 4 ms once the bars were contained.

## Rule 38: every button that carries words is filled

Found first in window feet and then across an app, where "Done" on a card and the copy buttons in the settings were reported as "not recognisable as a button".

## Rule 39: where a checkbox stands

The notice case was found on a notice that read "7 links were not added". The menu rows and the choices that take effect together were added for a file manager's menus, its column window and its cleanup list.

## Rule 40: every button takes the accent when it is reached for

Reverses "a button takes the hue of the card or row it sits in", which made every button of a card light up alike.

## Rule 41: only a running bar carries a sheen

Decided on a prototype that had the sheen on every bar.

## Rule 42: a menu opened with the pointer shows its focus on the first key

Found where every right-click lit the first row.

## The tooltip and info bubble

One app's info bubble and its toolbar tooltips disagreed on background colour, corner radius and shadow depth, because they were two unrelated pieces of code.

The clamp came from an app whose own `InfoBubble` and `SelectorTab` had never implemented it: both centred the bubble on the trigger and always opened downward. A long tip in Settings, on a trigger below the middle of the window, ran past the bottom edge. The fix ported the `show()` math from `tooltip.ts` into one tested function both call sites run before paint. Testing it at a narrow viewport showed the second hazard: that app's `.glim-bubble` lacked `width: max-content`, and a bubble shrank from 280px to about 155px wide and grew from about 126px to 253px tall after it had been positioned.

The fade bullet once said the bubble toggled `display` without a fade. `.glim-fade` already existed in `tokens.css` and the motion engine already said 110ms, so the bullet was corrected to match.
