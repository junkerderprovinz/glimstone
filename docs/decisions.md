# Decision log

The [design language](design-language.md) says what holds and why. This file keeps how a rule came about: the report or the measurement that started it, what was tried first and what it replaced. When a rule changes, its text in the design language is rewritten and the reading it replaces is added here.

## The design language: one ground for every app

GlimStone briefly had a warm near-black of its own. Beside the other apps that share the language it read as brown, and the palette took Carbon's greys and support tones instead.

## The palette: warning is orange

Warning was yellow once. Beside the yellow accent, a highlighted button and a problem looked alike.

## The palette: the accent as two tokens

For a long time the accent was one token, darkened for the light theme. An adopting app's light theme then drew every badge, switch and filled button in olive-brown, and it was reported flatly. The token was split into the fill and the ink.

The ink was first an sRGB mix toward black, which did not follow a colour the user chose the way the derived ink does. Against white that mix put blue at 8.0:1 and Sunflower at 4.9:1, a spread of 4.9 to 8.0:1 across the presets, where the OKLab step keeps all eight between 5.2 and 5.9:1. The info text was `#8E6A00` before it took the same step, a shade lighter than the Sunflower ink `#836407`.

## The spacing scale: 31 distances

Before the scale the stylesheet held 31 different distances, 0.3, 0.35, 0.4, 0.45 and 0.55rem among them, within a pixel of each other and of the steps beside them. Each moved to the nearest step, so no distance changed by more than 2px.

## The type scale: five sizes

The five sizes replace the four the table used to hold: 20, 14, 12 and 11px. The 20px step served page headings, and a page has none since rule 30.

Three near-identical caption sizes (10px, 11px and 11.5px) had drifted apart in one app before they were folded into a single caption row.

## The name: names that were turned down

GlimWard: the 2016 fantasy series *Glimwarden* already uses exactly this word, in exactly this sense. GleedStone had the best etymology of the lot (Old English *glēd*, ember), but German final devoicing turns it into *Glied*, "limb". GlimSolar: a castle's solar is its private chamber, but a German reader hears "solar panel". GlimHearth was too close to Hearthstone, GlimCloister collides with the Cloister typeface, and WickStone reads as a cough remedy.

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

## Rule 47: elevation in fixed steps

Before the steps, each overlay carried a shadow someone had picked for it, so a select's list and a window each stood out by a different amount.

## Rule 48: a theme is written once

The stylesheet used to write every colour twice, once under `prefers-color-scheme` and once under `data-theme`, and the two copies had to be kept equal by hand.

## The tooltip and info bubble: one engine, the clamp and the fade

One app's info bubble and its toolbar tooltips disagreed on background colour, corner radius and shadow depth, because they were two unrelated pieces of code.

The clamp came from an app whose own `InfoBubble` and `SelectorTab` had never implemented it: both centred the bubble on the trigger and always opened downward. A long tip in Settings, on a trigger below the middle of the window, ran past the bottom edge. The fix ported the `show()` math from `tooltip.ts` into one tested function both call sites run before paint. Testing it at a narrow viewport showed the second hazard: that app's `.glim-bubble` lacked `width: max-content`, and a bubble shrank from 280px to about 155px wide and grew from about 126px to 253px tall after it had been positioned.

The fade bullet once said the bubble toggled `display` without a fade. `.glim-fade` already existed in `tokens.css` and the motion engine already said 110ms, so the bullet was corrected to match.

## The tooltip and info bubble: only a control's title becomes a bubble

Found on a host dashboard whose tiles lost their titles to the hover bubble. The host keys each tile by its `tbody`'s title and hashes it into the saved layout while the page starts, so a pointer resting on a tile at that moment broke the start-up and the tiles stayed empty.

## The tooltip and info bubble: a replaced trigger closes the bubble

Found on a Prune button that the prune it had just started disabled. Each press left one stuck bubble.

## The tooltip and info bubble: the focus outline on the info icon

Before the outline existed, the icon only went from `.8` to `1` opacity on focus, which reads the same as hover. A keyboard user tabbing to it had no reliable way to tell it was focused, a WCAG 2.2 SC 2.4.7 gap.

## The tooltip and info bubble: a tooltip that repeats its label

Found in production: a Rotate control's segmented buttons, which show "0°", "90°", "180°" and "270°" as visible text and are never truncated, carried tooltips repeating the same characters, while the icon-only buttons of the Flip control beside them had no tooltip at all and needed one.

## The tooltip and info bubble: every explanation is a bubble

Reported live and without qualification, after an adopting app's browser-extension options page shipped four separate grey sub-captions under its cards, each defensible on its own and together a wall of prose above the controls. That page was hand-written HTML with a stylesheet, and the lack of a component framework was the reasoning that had produced the sub-captions.

The rule for an explanation too long for a bubble was found where "What the relay sees" moved from a card to a button at the right of the relay selector.

## The tooltip and info bubble: the conditional bubble

Reported live on an adopting app's accent row, which dims and goes inert while rainbow mode owns the colours. Its explanation had been a grey line under the row, which made the card taller for everybody to answer a question only somebody who had just flipped the rainbow switch was asking.

## The time picker: why it exists

An hour and minute picker, so the value never has to be typed by hand, was asked for again and again. The picker was first built to replace every native `<input type="time">` in an app. The colour picker's `openColorPickerPopover` predates the shared positioning function, which is why it carries its own copy of the clamp.

## The time picker: the popover that closed itself

Found in production, live against a deployed container. The popover closed itself roughly 2ms after every open. A `MutationObserver` showed the trigger's `aria-expanded` flip to `true` and back to `false` almost at once, and the closing scroll event's target was the internal listbox column, not the window. Focus moving into the first option before the position was painted was a second, independent path to the same symptom. The tests ran in jsdom and caught neither bug.

## The one horizontal selector: tabs are badges at rest

An early build read "the tabs sit on the page as badges" as "bare until selected": no background at rest, and `bg-carbon-hover` only under the mouse. On a settings page with a dozen tabs the strip looked unfinished, most of it plain text.

## The one horizontal selector: one app-wide floor

Reported live one round after the "sized to its own content" fix landed: the selectors should be wider, and as equal in width as possible, not each narrow and content-hugging in its own way.

The floor was calibrated in one app. Its longest label in any equal-width selector, "Benachrichtigungen" in the Settings tab strip, measured 174px at its stage's type and padding. A round 200px floor cleared that and lifted the Theme card's two-option well (97px before, set by "Dunkel" and its icon) and the Shape card's three-option well (62px before, set by "Leicht") to the same 200px, so all three rendered identically, because none of the three call sites had a label that needed more.

## The one horizontal selector: spanning the card

Reported in one line: every selector should take the whole width of the card, or it does not look right. That reversed the earlier reading, which sized every strip to its content. The bullet for a selector in a settings row was added afterwards and replaced full-width segments there.

## The one horizontal selector: toolbars and free values

The toolbar rule was found in a download list whose filter chips, strip scope, saved views and speed window all sit in such rows.

The free-value field first stood beside the steps, took their width, and stopped the well short of the card's edge. That was reported in a Transform card. The pattern appeared first in a donation window, then in a rotation card.

## The one horizontal selector: the stretched strip

Found live: an app's Theme and Shape pickers were both bare flex children of a card's `flex flex-col` body, stretched to the full card width by the column's default cross-axis stretch. It stayed invisible until a fix elsewhere, removing an intentionally wide tab strip's full-width treatment, made the same unwrapped default visible on every other selector in the app.

## The one horizontal selector: one row at every width

"It keeps to one row" reverses "it wraps, it never scrolls", where a strip that ran out of room wrapped into even rows: a strip of three large segments wrapped onto two rows on a phone, and a filter stacked "Open" over "Closed in the last 30 days".

For strips that pick one value it also reverses "it cuts its long labels short, the whole label in the bubble". That was decided after strips with long labels, such as a set of presets ("Kurz / Ausgewogen / Lang / Eigene Werte") and a place picker that names the receiving server after the instance, showed labels cut short at 320px.

Several rules of the wrapping strip went with it:

"A selector that wraps fills its box" was written for a six-option well with long German labels, which pinned every segment to the app-wide floor, wrapped after three and left the end of each row empty inside a track stretched to the card width.

"A label wraps only when its box has no room left" was written for a long German option that wrapped at the 22rem cap of a three-option well while the two short options sat in segments just as wide. Its first half survives as the one-row rule's second step.

The mechanism was growth plus an even count per row. It balanced the rows of a wrapping strip (`perRowFor()`, since removed), so six options that fit four to a row went three and three.

"A partial last row stretches its cells rather than keeping the columns" was written so that seven options over two rows left no hole at the end of the last row.

The small scale followed the same rule with less machinery: its segments took `flex: 1 0 auto` to grow into the room a wrapped row left.

"Below 600px a selector whose labels run long sets its segments two to a row" was written because "Text and symbol" with its glyph did not fit half of a 360px row, so the Labels selector fell into a different layout from the selectors around it.

## The one horizontal selector: each selector's own colour under rainbow

Reverses "a selector wears its card's hue on the chosen segment": the four selectors of one card all showed the card's colour, and a page under rainbow read as one colour.

## The one horizontal selector: the `Field` trap

Found where clicking the "Corners" caption reset the app to "round", and the first tab announced the caption as its own name to a screen reader.

## The one horizontal selector: the well

The well was first built for a shape picker (round, soft, square), adapted from a "segmented row" widget already used the same way elsewhere. It first shipped with `background: var(--carbon-surface2)` for its track. The groove search described under "A compact selector's groove" landed one step deeper and superseded it.

Found live: a two-segment well (light and dark) truncated its longer label to a bare ellipsis the moment its ancestor stopped stretching it. `scrollWidth` exceeding `clientWidth` on the label span confirmed it was not a font-rendering artifact.

## The one horizontal selector: one variant at two scales

The small scale was built as a third `variant` first, for the pickers that repeat per card. Its one intended difference was that its idle segments each kept a visible fill, so the strip read as a groove holding keys rather than one slab with a single filled segment in it. That was reversed live in the words "the small ones should look like the big ones, and an unselected option is not a badge". Once the idle fill went transparent at both scales, the two variants differed in two things only: the pinning bundle, which the component already had a prop for, and the groove token. Drifting apart was the complaint being fixed, so collapsing the third variant back into the second was the fix rather than a tidy-up. The three big call sites' hand-rolled `inline-flex`/`align-self` wrappers were deleted in the same pass.

## The one horizontal selector: the groove

Reported live: the new horizontal selectors were not visible anywhere. Six of nine call sites were wrapped in a well painted the very token the strip had picked for its groove, so groove and parent both computed to `rgb(232,232,232)` and there was no enclosure on screen. Every class name was correct, which is why no check caught it.

Moving both scales to the deeper token strengthened the page-level picker: on the card it sits on, the enclosure went from 1.31:1 dark / 1.21:1 light to 1.94:1 / 1.53:1. The hover fill went from a near-invisible 1.06:1 dark / 1.08:1 light against the old groove to 1.57:1 / 1.16:1.

## Vertical tiles: one topic per tile

The rule gave Restore a tile of its own and brought an Apps tile back.

## The settings search: out of sight until asked for

Found where a sticky bar, and then a bar in the flow, were both still there whenever nobody wanted them.

The entries for former names came when an app folded its Off-site, Retention and Cloud tabs into Storage locations.

## Every other search: a button first

Showing every search on a page as a standing field was tried for one round, and the button came back.

## Two pages that do the same job: twin pages drifting apart

Found in an app where two list pages built as twins had grown four disagreements, none of which looked wrong on its own screen. The batch-order card sat above the filter on one page and below it on the other. The sort control sat inside the filter popover on one and beside the trigger on the other. The per-row toggle, the summary line and the expand control sat in three different slots. And one page's expander was the shared selector chip, the other's a hand-rolled button with its own chevron and its own state. The report put it plainly: one tab has it above the filter, the other below, and it should be the same everywhere.

The page that moved was the one that had two cards wedged between its filter and the rows that filter applies to.

## The sidebar: the rail as a card

The rail used to be chrome that spanned the full height, flush against the window edge, and the `--carbon-sidebar` token was justified by exactly that. A live report on one app changed it: every other element on that page floated on a ground, and the rail, the one element that did not, read as part of the window rather than of the app. 1.8.0 made the rail a card. The token bullet kept its old justification for a while after, and it was rewritten because a stale reason left beside a new rule is how the next reader argues their way back to the old one.

## The sidebar: one gutter for every app

The rule first said only that the gap between rail and content and the gap around them are "one number". Two apps each picked their own, and side by side the difference was the whole impression: at `1.5rem` the rail sat further from the edge and looked shorter than the same 14rem rail beside it. The number was then fixed at `1rem` for the house.

## The sidebar: the first row level with the rail

Asked for live on a Settings tab strip, and then taken for every page, because a list page's first row sat just as low.

## The sidebar: rainbow positions in the rail

The rail first shipped as "the rail never routes a rainbow position". The objection then was that a destination list is user-configured and can change length and order on any render, so a static literal index could never hold a stable position. One round later it was reported live that the sidebar's tabs were again outside rainbow mode and outside the colour engine. The objection turned out to be against a static index, not against a rainbow position as such, and the rule was reversed: the rail takes its position from a `nextHue()` counter in render order, like the horizontal selector's tabs.

## The sidebar: glyph sizes

The 20px rail glyph was never written down, and two apps in the house ended up with rail glyphs at 20px and at 14px: the second had no rule to follow and shipped whatever its icon generator emitted. It was reported the way an unwritten rule usually is, by somebody putting the two side by side.

Buttons first carried the 20px glyph beside their 14px words, and a row of them read as a toolbar of icons with captions. The glyph beside a button's words was brought down to the words' size.

## The sidebar: the narrow rail's width

The narrow rail's width used to be a calculation: each app derived it from its own brand mark plus its row padding. That produced 96px in one app and 64px in another, two rails of different widths doing the same job, and the calculation was replaced by `--rail-narrow` at 85px.

## The bottom bar (the phone's rail): settled on a phone

Everything in this section was settled on a real phone app rather than reasoned out in advance, which is why its numbers are measured rather than round.

Android's near-white window background showed through around the inset card, measured at `#fafafa` beside a page in `#161616`.

The bar's height started as `min-height: 44`. Every label mode cleared it except text-and-glyph, which measures a glyph, a gap, a line of caption and the padding and lands a couple of points over, so the bar grew by that much when the setting changed. The height was then fixed at the measured 48.

Short captions written for the bar were tried below 45rem and gave two pages the same word, and a German name such as Wiederherstellung ran into its neighbour. The bar was also the first place where borrowed glyphs showed as imports.

The copy trap was found live: one app caps its settings cards to the measured width of its own seven-tab strip, and copied literally into an app whose bar has three tabs, that gave a 230px column with every selector inside it standing vertical.

## Navigation and modules: pinning a module's page

An either-or version, where pinning moved a module's page out of Settings, made tabs vanish and was taken back. At first a pinned page also rendered in full through both doors, with the sidebar switch hidden on the rail's side, before its settings tile was cut down to the switches and an "Open" row.

## The content column: no cap on settings pages

The rule used to read "A settings form page is capped at 880px; the overview and lists stay wide." The cap was meant to keep a control near its label, which the row form does on its own. One app had grown a 1152px cap for every page instead, and on a wide window its settings stood in a column with a broad empty band beside it, while an app without a cap used the room.

## The tab-strip colour rule: idle colour outside Reactive mode

The rule was asked for live against both the horizontal selector's Settings tab strip and the sidebar's main nav. It was first implemented as the Settings tab strip's `.glim-hue-icon` and a separate, analogous rule for the sidebar. That first pass wired the icon's coloured declaration to `:hover`/`:focus-within` directly and dropped every mode gate, reasoning that `--accent`'s own per-mode value would cover every case for free. It did, but only once the icon read `--accent`, and gating that read behind hover left every idle tab colourless in Normal and Rainbow mode as well as Reactive. It was corrected one round later: the coloured declaration became unconditional, and the rest/hover swap moved into a Reactive-only override.

A further round later, once the sidebar's rainbow reversal gave the rail a position of its own, the sidebar's analogous rule was replaced by `.glim-hue-icon` itself, with no new CSS for the rail. The rail's own copy survives only for its one set-of-one control.

## Switches: native checkbox, selection mark and spinner

The native checkbox ban was reported live, and flatly, after an app's browser-extension options page used one for a feature switch. The selection mark was found in a prototype that drew native checkboxes with `accent-color`. The spinner ban was also reported live, and the second half of that report was that the arrows did not only look wrong but crowded the value, pressing a right-aligned field's digits against a widget from another design system.

## Switches: the number steppers

1.5.1 said the native spinner goes, which was right and incomplete. One release later it was reported, in three words, that a number field had lost its way to nudge the value. The first replacement got it wrong in the other direction: two filled squares beside the field in the page's surface token, three objects standing in a row, which copied the ground that had been the fault of the native spinner. The bullet was rewritten rather than extended, and its general form (a rule that removes a native widget owes the replacement in the same breath) came out of that.

1.6.0 shipped working code in `packages/core/src/numberField.ts` and the `.glim-num-*` rules, because the rule had been written twice in prose and built wrong twice. 1.6.0 also made the arrows solid triangles instead of outlined chevrons, and gave them rounded corners. Reading "remove the widget" as "design a replacement" had cost two rounds in the adopting app (chevrons, then sharp triangles) before the answer turned out to be the browser's own drawing minus its background.

## Switches: the stepper wrapper's width

`display: block` on the wrapper was enough until a number field stood in a labelled column. It was reported in an app in four places at once, all from that one declaration: the up and down arrows belong inside the field, not beside it. The wrapper was then sized by its content in every kind of parent.

## Switches: absent sub-switches and the dimmed exception

The sub-switch bullet used to say the opposite, that a sub-switch is dimmed while its parent is off. It was reported often enough to be reversed.

That reversal left the document contradicting itself. An app's accent picker goes inert while rainbow mode owns the colours, and the sub-switch rule said it should be absent while the conditional-bubble rule said the dimmed controls stay the signal that something changed. One review round moved the row one way and the next moved it back. The test "does the control still do anything" was written to settle it.

## Switches: a switch's own label

Hiding a switch's label under a Card title was tried and reversed three separate times in one project (a rainbow master toggle, an automatic restore-check toggle and a weekly-digest toggle), each time on the "single-purpose Card whose title is the decision" reasoning, each time reversed once someone looked at the row and saw a bare switch. A full-app audit after the third reversal found a fourth round of the same thing (a metrics-enable toggle, a Flash-ZIP-export toggle and a "Quiet toasts" toggle), and the prop behind it was deleted outright rather than patched again.

## Switches: giving shelved settings back

Reported plainly: a round trip through a "follow the source" switch did not give the earlier settings back.

## Switches: the knob

Found missing after shipping: the knob had stayed circular in an app that had every larger surface following the shape engine. Its ink on the accent first came from the light ramp's pale ground, which measured 1.46:1 against a Sunflower track and 2.77:1 against Blue, so it moved to `--accent-contrast`.

## Saving: from Save buttons to auto-save

Auto-save was first applied across one app's Settings page over several rounds: the Domains card (each domain toggle saves on click and shows or hides that domain's nav tab without a reload), two merges in the Paths & Storage card (immediate toggles and debounced text fields sharing one card), and the Schedules tab (every cadence picker, every off-site and self-backup cron field, and the "per-item schedules" and "sync to Containers" toggles). It was written down as the standing rule once the same shape had held on four different kinds of field. Before that, the PATCH waited behind a Save click.

A later sweep closed every remaining manual button on that Settings page's other tabs (Offsite, Notifications, System and a few stragglers the Schedules round had missed). Two of them were whole-object-POST cards, for cloud and for notifications, which passed the "does this field show a real live value" test despite the different transport. That sweep questioned each remaining Save button on its own instead of keeping it by default, and it is what forced the four exceptions into words. A per-item schedule override whose collapse toggle only hid the editor failed the Close test and was converted, while the "add a new one" editors for cloud credentials and for off-site targets reset their drafts on Close and kept their buttons.

## Defaults and exceptions: locked inherited values

The locked value with an override action and a "Use ‹parent›" action replaces a "like the parent / own value" switch, which hid the inherited value behind a state.

## Failure feedback: toast and shake for every button

Found and fixed on an integrity page, reported live and emphatically: when an error comes back it should show as a toast and the button should briefly shake, that should already be a GlimStone standard, and whenever anything fails the toggle or button should shake, system-wide. The page had a row of plain action buttons ("Verify", "Unlock", "Prune") with no optimistic value to revert. It left the raw backend error on the page as a permanent sentence next to the button, and below it a running list of every action's failure text, both staying until the next click overwrote them. Neither went through the toast system the same app already used elsewhere, and neither button shook. The persistent-status exception was drawn on that page's own append-only check.

## Failure feedback: untranslated fallbacks

An audit of one app that had shipped 42 languages for months found 56 untranslated fallback literals across seven files. A text search could not guard them, because that codebase documented its own history in comments that quoted these strings. The syntax-tree lint rule, checking three positions, found six further defects in a file the hand-written sweep had missed entirely.

## The second way in (second factor and passkey): where it was built

The section was built for a backup app whose default install is reached over `https://[IP]:3443` with a certificate covering only localhost, so the bare-address refusal was that app's regular case rather than an edge case.

Both findings under "where the explanation lives" came from measuring rather than reading. An app framed the address refusal in a tinted box and left the sibling refusal about the browser as a bare coloured line. The same box asked for a soft warning fill that was never defined: the warning family had a base and a strong tone, and only the failure family had a soft step, so the box had a border, a radius and no fill. `--status-warn-bg-soft` was added to the token contract for it.

The accent picker and rainbow mode were merged into one card on a report. The two enrolment buttons had grown two different verbs, *Enable* on the second factor and *Add passkey* on the passkey card, before both were given the app's one word for starting a setup.

## The second way in (second factor and passkey): eight recovery codes everywhere

The section once counted the number of recovery codes among the things local to the app it was built for. It became part of the language, eight in every app, so the recovery flow is the same everywhere: somebody who has kept the codes of one app meets the same number, the same screen and the same wording in the next. One pattern across all apps outweighs whatever a single app might gain from a count of its own.

## The sign-in card: one page instead of four

Before `SignInCard`, four apps had built their login page four ways: a logo in one and none in another, a pill over one card, a version number under another, labels in capitals, a narrow button. The component, with the flow in the core's `createSignInFlow`, became the one page for all of them.

## Badges: the pill cap

The `min(var(--radius-pill), 50%)` guard shipped in an app's rainbow-mode switch, a 44×24px track, and rendered there as an ellipse instead of a pill.

## Badges: size stages

The stage rule came from a regression that shrank one row's badge height in a single stylesheet while five other stylesheets styling the same row still used the old literal value. Two badges built from the same helper function also rendered visibly different heights until the full box model was claimed explicitly.

## Badges: the role search

An app's icon-only "add" badge sat directly beside a text field and was sized to a token that looked like a match: the same padding class as the field, checked with `getComputedStyle` against a deployed instance, with a confident comment recording the measurement. It was still wrong. The number matched the button as it had been before its conversion, a different element with a different font size that happened to share the padding, and the field next to it rendered 4px taller. The role already had a live-verified token at six other call sites. A better measurement would not have fixed it. Reusing that token did, and the rule became a role search before a fresh measurement.

## Badges: one icon badge size

After the role search, an app ran a proper audit: every icon-badge call site grouped by role, each role measured live against its nearest neighbour, and three stages shipped (a standalone corner pair, a badge beside a field, a badge in a dense list row). Every measurement in it was correct. It failed anyway, because all three roles appeared inside one expanded card, which measured 28, 28, 32, 32, 24 and 24px side by side. It was reported twice in the same words: there are three different sizes of square badge, and they should all be the same size.

The app settled on 32px, the measured height of its dominant text input and already its most common icon-badge size by call-site count. The 24px and 28px candidates each sat visibly short beside a 32px field and would have meant resizing a dozen controls that are not badges. In the dense list, what shipped was a bigger badge in a list of unchanged density, not a list that grew.

## Badges: the delete badge

A red delete badge was reported in the words: the delete badge is coloured differently, it shouldn't be, integrate it normally into the colour modes. The same call had already been made in that app for its "Disable"/"Deaktivieren" buttons. In 1.12.0 the commit button inside the confirmation window ("Destructive and confirmable actions") gave up its red as well, so trigger and commit stopped being two halves of one answer.

## Badges: the protection status

Share tiles put the protection state on the folder picture twice before it became a badge before the name. First a shield badge sat on the picture's corner, then the shield became a glyph on the folder's front, drawn in a dark shade of the folder so it read on yellow and on the resting grey alike. On the picture the state had to take the picture's colours, and only the glyph's shape told protected from not protected. The badge before the name was chosen over both.

## Badges: the notch inset

Both failures of the static-position fallback, the split positioned ancestor and the centred empty-state card, were found independently, months apart, in the same app. The bug kept coming back at different call sites over several review rounds, each time "fixed" by copying the structure of whichever card was flush at the time. The explicit inset prop was the answer to that.

## Badges: the numbered heading

The content test for an ordinal has not changed. Its visual form was built one way and then reversed.

The first form was two elements: a 24px `surface2` circle in the heading row beside the heading badge. It failed in three ways at once. It never joined the colour engine and stayed the same grey in every palette while its card's notch took a rainbow position, the grey-neutral drift the delete badge rule describes, arrived at from another direction. It was a second thing to position against rule 20's notch. And once the notch went `position: absolute` and left the heading row, the circle no longer shared a baseline with the badge it numbered.

It was replaced by one split pill, decided as "it is one badge with an internal seam, never a number chip parked beside a heading badge". The argument was that the number is part of the heading: it names which step a card is, as the title names what it is, so it belongs inside the same pill and not in a second element nearby. Folding it in as a cell of the one badge made all three failures disappear together, since only one box was left to place, colour and keep. It was filed at the time as "two variants whose only remaining difference is a prop that already exists are two chances to drift apart" (see "The one horizontal selector") at the level of a single control. The number's cell was shaded to mark the seam.

One round after the split pill shipped, it was reported against an app's Recovery tab: a numbered card-title badge is two separate badges, and the number badge is not shaded. The reversal did not go back to the circle. Each of the circle's failures belonged to that chip and not to having two elements, so two real badges with the same hue, the same hue hook and a shared group position answer all three. "One label, one box" was the right diagnosis of the circle and the wrong prescription. The shading went with the seam it existed to sell.

The group positioning came with the reversal. By then the app had shipped and removed the fixed-offset repair for a second notch twice.

## Badges: the inverse ink token

The split pill shaded its leading cell by moving the fill toward the ink and flipping the ink to the other end of the binary. For that it introduced `--accent-contrast-inv` and its rainbow-position counterpart, which had no other consumer. When the split was reversed, the pair, its rebinds across the rainbow and reactive blocks, its static fallbacks and both generators were removed instead of being left as dead machinery. The app asserted the token's absence in its own test instead of simply dropping the coverage.

The first version of the split's contrast table was computed while the formula was still being designed, not read off the deployed page. Two of its eight figures were wrong, and two of its rows named hues the page's rotation never produces.

## Icon glyphs: the sizing rules

Each of the seven sizing rules in `glyphs.md` was written down after a live review reported a glyph as "too big" or "too small" while every box on screen was already identical.

## Icon glyphs: a neutral button's glyph

Settled when the question came up why so many buttons had no colour.

## Toasts: the live regions

A toast card that carried `role="alert"` itself was read out by some screen readers and skipped by others, which is why the words go through two live regions that stay on the page.

## Toasts: whole pixels

Found in screenshot comparisons.

## Lists: the tools in the list

The rule that a list page has only its cards and its list replaced a row of Filter, Sort and Search buttons over the lists.

## Page actions: the corner

A width cap on the page had put the floating actions at the column's edge, in the middle of the window.

## Page actions: no second add button

Found where a tester looked for "add" inside a card and was pointed to the corner.

## Wording: one word per thing

Found where the rail entry and the tab both became "Backups".

## Wording: parallel explanations

Found where three relay sentences had three different formats.

## The dropdown: nineteen call sites

The groups, submenus and four widths of `Select` are what nineteen call sites needed between them.

## Pickers and wizards: the open search

The open search field replaced a search button that unfolded, along with four tiles to a row on a grey well and Cancel at the start of the button row.

## First start and what's new: the dots

Decided after a tester asked for the dots a prototype had used.

## First start and what's new: every release since the last one seen

Decided after a tester found every dot grey because the list still described an older release.

## First start and what's new: the toggle

The one toggle replaced a switch, a "7 of 25 left" line and two buttons that said the same thing three times.

## First start and what's new: one card per release

The cards with their notes replaced a window with two tabs and a button to open the notes.

## The Info tile and the About card: three cards and no footer

Version, Help and About were once one card, *About this app*, at the end of Settings, with the versions as a footer under its buttons.

Until 1.6.0 this section placed the build version and the GlimStone version in a quiet line of page chrome. The footer was defensible: one line, fixed to the window, legible on every settings tab without being implemented per tab. It moved into the Version card once it was clear that the next thing somebody does with a version number is report something, and that a footer gave them nowhere to go.

When the card first landed, the footer stayed beside it, and the result was reported straight away: one number in two type sizes twelve pixels apart. The card was first built across all three surfaces of one product in a single round (a web interface, a browser extension's options page and a phone app), which also served as the check that the rule holds across three frameworks.

## The Info tile and the About card: space above a sentence that follows controls

The extra step above a sentence that opens a new group was first noticed on the About card and then stated for every card.

## The Info tile and the About card: brand colours at rest

The adjusted resting colours rest on measurements taken on one app's two button grounds. On the light theme's `#d1d1d1`, Bitcoin's `#F7931A` read 1.5:1 and Buy Me a Coffee's `#FFDD00` read 1.14:1. On the dark theme's `#525252`, PayPal's navy and GitHub's near-black failed just as badly. All of them fell short of the 3:1 a graphic needs.

The note that a fill set on the `<svg>` reaches only paths without a fill of their own comes from one mark in five that kept the button's ink.

For one release the brand values existed only as prose in this section. The result was the drift a shared language exists to prevent: one app built its own set of four tokens, and the next skipped the rule and shipped marks in the button's ink. The tokens and classes then went into `packages/core/tokens.css`, and `AboutCard` began applying them itself.

## The Info tile and the About card: the copy's three rules

Each of the three rules for the card's copy (one sentence at most about what the app does not do, no itemised running costs, an opening paragraph that ends on the making of it) was got wrong first before it became a rule.

## The Info tile and the About card: where the design-language version is read from

An app once re-copied the engines but not the version number kept beside the card, so the card claimed GlimStone 1.7.5 while the files were newer. 1.7.5 had never been cut at all, because 1.7.1 through 1.7.10 were folded into 1.8.0. Since every version on the card is a link, the string opened a 404: that tag answered 404 and the real one answered 200. `gh release list` caught it, which is why the release list, not the changelog, is the check.

## The Info tile and the About card: only published versions

The rules that a version is not bumped before its release exists, and that a same-day correction keeps the version, were both learned in one afternoon. Five numbers were spent on one body of work, none of them released, and the apps quoting them had nowhere to send anybody. It was reported in one line: the version on screen has to point at the last release and show that release's own number, never an unpublished tag.

## The Info tile and the About card: no reading width

The card's prose first shipped capped at 42rem, a defensible measure in the abstract. On the page it was the only capped text, so its three paragraphs stopped two thirds of the way across a card whose neighbours ran their sentences the full width. It was reported as artificial line breaks and measured before it was believed: 672px of text inside a 1244px card.

## The crypto window: one address per network

The rule was bought by nearly shipping its opposite. The list of coins was first written grouped by coin, with a row "Tether" over the networks *BNB, Tron, Solana, Ethereum* and a single `0x…` address underneath. That address lives on EVM chains only, and a donor choosing Tron would have sent the money into nothing.

## The crypto window: the mark on the button

An earlier draft of the section said the button should wear a neutral wallet drawing, on the grounds that a currency's symbol names one chain out of eight and misleads about the rest. The argument was sound and the conclusion was wrong: the neutral drawing was correct while saying nothing, and ₿ is the symbol that reads as "crypto" to somebody who has never held any. The draft was reversed, and the rule that a brand mark is never reachable by pattern survived the change.

## The crypto window: square tiles and the label mode

Before the coin tiles became square, the mark had whatever size it happened to measure. The 112px tile with a 56px mark was taken from a sibling surface that had already solved the proportion.

The tiles once resolved the label mode to something of their own, on the argument that a grid of eight coins is something people search. The argument was good, and it was still the complaint: a control that quietly resolves a mode is a defect however good the reason.

## The crypto window: the picked coin's mark

The rule that a tile filled with an engine colour paints its mark in that colour's ink predates the brand hover and is kept for the picked coin. It rests on a measurement on one default accent, where a coin's own orange came out at 1.45:1, which on screen is an empty tile.

## Brand tiles: the hover colour

The hover on a brand tile used to be one grey for every tile, before each tile took its brand's colour.

## Pairing instances: the relay well

The relay well first spanned a fixed share of the row at the taller page-level height, and it broke into two rows of two beside a lot of empty card. It was then pinned to one width at the button height, kept to one row.

## The fortress: where the phrase is changed and shown

The Change phrase button once floated over the cards and read as part of the card it covered, which is why changing the phrase and leaving moved into the pairing settings.

On one page Show phrase stood in the fortress corner while the pairing card held Change and Leave further down, so the phrase had two places on one page. That led to the rule that the phrase shows in one place.

## Reordering by dragging: the tremble

The tremble was once 0.3deg every 360ms at `subtle`, and nobody saw it. The faster, larger turn replaced it.

The lift for full-width rows was found in a download queue.

A held column marked with its own `data-col-drag="held"` trembled with the rest, which is why only the three markers count.

`useDragArmed` came from lists that each set `glim-drag-armed` by hand, where the settings tiles had forgotten it.

## Reordering by dragging: the grip badge

The grip badge was found in a host's Docker list, where it took the place of the host's orange move arrow.

## Reordering by dragging: placing by the leading edge

Placing by the leading edge was found in a table's columns.

## The overview cards: about five cards at first

Showing every card at first was tried. With all of them on, the runs appeared three times and the anomalies and the storage twice each, which rule 28 forbids.

## Destructive and confirmable actions: no red on delete

Until 1.12.0 the language said that the destructive control is always the fault colour: not the accent, never a neutral grey "Delete" next to a neutral "Cancel", because the one control that ends something permanently was the one place status-red belonged on a button. The reasoning was that the delete badge rule drew a line between the trigger that opens a confirmation and the control that actually ends something, and kept red for the second. An app where every delete already asked first overturned it: the red never appeared without a sentence beside it saying the same thing louder, so it carried no information the window was not already carrying better.

## Charts: the second series

The text-colour second series was found in a network chart, where outbound traffic ran as the accent at 70% beside inbound until it took the text colour.

## Charts: axes on a relative scale

The section once said "no axes, no tick labels" without exception, on the strength of one chart whose peak lived in a caption beside it. That held until the caption became something a state could hide, and then the picture said nothing and could not be made to. It was reported as the abscissa and the ordinate always having to be shown.

A strip of vertical ticks down the left of a chart on a settings card was reported because the plot then read as narrower than everything else in the card.

## Inside a foreign host UI: the two traps

Both traps, host specificity beating a single class and GlimStone applied without the companion plugin, cost real time before they were written down. The second was seen in the wild: a plugin page applied GlimStone unconditionally with token fallbacks baked in.

## The user-owned axes: the System segment of the theme selector

System joined Dark and Light after a report on a selector that had only those two, where a choice once made could not be undone.

## The user-owned axes: the leaf shape

The first candidate for the found shape was a bevelled "faceted" one, which suits the name better. It was dropped because `corner-shape` draws only in Chromium, so in Safari, Firefox, the WebKit desktop shells and a phone app the secret would have looked like soft.

## The user-owned axes: wiring a new control into the engines

Controls that skipped the tokens turned up in production more than once, each time in a small, low-visibility control (a dismiss "×", a quick-fill button, a handful of ad-hoc status chips) and never in a whole new component. Whoever wrote each one had reached for a familiar Tailwind class instead of checking how the nearest sibling control was styled.

## The user-owned axes: the colour picker popover

The requirement for a colour field inside the page was first stated while a host plugin was being built. An adopting app later tried the native `<input type="color">` shortcut anyway, and the rejection came back nearly word for word: no completely separate window may open.

That plugin's picker was permanently embedded at first. Once the always-embedded version visibly bloated a settings card, the same requirement asked for a picker floating from the card, and that became the default for cards.

A single custom colour and a palette's positions used to have two layouts: the single value shown permanently, the palette revealed on click. The shared popover replaced both.

## The user-owned axes: swatches that select and edit

The accent row once had a ninth swatch, a standalone custom-colour trigger. Dropping it was right, but the first implementation replaced it by making every swatch open the picker, which took away the row's original job: every click produced a popover and set nothing. The report held both halves in one sentence: the swatches cannot be selected any more, the picker opens every time. Select on the first click and edit on the second came out of it.

## The user-owned axes: the inactive colour row

Only one direction was reported, a colour row that stayed bright and clickable while nothing read it. The other direction was written down at the same time, so that nobody fixes it a year later believing they found a new bug.

## The user-owned axes: the language picker

The "Automatic" entry was reported flatly on an adopting app's extension options page, where the closed field said "Automatic" while the interface was plainly in German.

The flag paragraph once spoke of a 26-entry list. One app shipped 42 locales, and another went from 26 to the same 42 for cross-app parity, in one sitting by one writer. A translation split into parallel batches had failed silently before: one batch ended before its work was saved, and another wrote the same files while the first was still running.

## The user-owned axes: the motion level names

The top level was renamed from `full` to `wild` (see "The top intensity" under the disco section). Afterwards the document said `full` in two places and `wild` in a third, every adopting app said `full`, and this repo's own `appearance.ts` wrote `wild` onto the root while its stylesheet keyed two component rules to `[data-motion="full"]`, which therefore matched nothing on any surface. A `[data-motion="wild"]` selector that left out `storm` turned up in the same pass. That is why the four names are fixed as a wire format. The level lists of the seven further animations still said off/subtle/full and were corrected to off/subtle/wild with this rewrite.

## The user-owned axes: motion intensity as a setting

As of 2026-08-18 motion intensity was considered accessibility's job, not a style preference, and the motion engine section said: "This is the accessibility signal, not a GlimStone setting (see 'the axes we don't have' above): no in-app toggle duplicates it today." On 2026-08-23 that was reversed explicitly, when a real engine with its own user-facing switch was asked for, rather than an implementer quietly bringing back what had been ruled out. The old sentence stayed in the spec as the record of that call, with a bullet under "Motion intensity" explaining that it had been superseded and was not a correction.

## The user-owned axes: the first port of the motion axis

The first adopting app to build the axis covered four of the five reference keyframes: `glim-page-in` (under a local name), `glim-toast-in`, `glim-fade-in` and `glim-shake`. It had never adopted `glim-pulse`, so there was nothing of that name to retrofit. Its `glim-shake` off state swapped to that app's own fade pulse, a local keyframe that already served as the shake's reduced-motion substitute and predated the axis, rather than to the reference's `glim-pulse`.

## The user-owned axes: the storm

The storm was asked for by somebody who had just been given the livelier top level and wanted to know whether there was more. Its first build stored a "found it" flag, so one gesture put a fourth option in the picker for ever after. That was reported flatly, and the rule that an egg stays switchable and never becomes a permanent settings entry came from it.

Both wild and storm used to scale the wrapper in as well, `.96` and `.9`, until the scale dial was removed from every level.

## The user-owned axes: the storm and reduced motion

Until 2026-09-15 the `(reduce)` block was untouched by the motion axis, and the storm composed with `prefers-reduced-motion` exactly like the other three levels, inside the same `no-preference` gate. The argument was that a hidden "more animation" switch must not be usable to talk a browser out of an accessibility signal. On 2026-09-15 that was reversed for the storm alone. The accessibility position did not change. The reading of the gesture did: the argument holds for a value somebody inherited and not for one they had to go and find.

## The user-owned axes: the default motion level

`wild` used to be the default, on the reasoning that the axis only ever makes already-shipped animations quicker, smaller or absent, so booting at the top changed nobody's interface. That stopped being true when distance and curve became per-level tokens. The top level then scaled the whole route wrapper on every page change while the cards inside staggered in on their own transforms. A reporter on one engine read the result as the page trembling before it settled, and on another as a green flash. The nesting explains the trembling. It does not explain the green, although the spec once said it did. Nobody had asked for either, and the default moved to `subtle`.

In a shipped app that change stood as the whole answer. A changed default never reaches a stored choice, so the person who reported the flash saw it again the moment they updated, and anybody who picked the top level on purpose still met it. That is where "making a bug the non-default is mitigation, not a fix" comes from. The scale then came out of the page keyframe at every level, `storm` included.

## Rainbow, the accent, plural: the icon toggle badge

Two rounds in a row washed the idle toggle badge's background: first the plain `.glim-tint`, then the stronger `.glim-tint-badge` once the first read as too faint. An adopting app rejected both, since the badges should not be coloured at all until clicked, and a half-darkened wash at rest was not wanted. An even earlier revision had recoloured the glyph through `.glim-hue-icon`, and that was rejected first: only the badges' backgrounds take colour, never the icons. The right behaviour was already there unused, `.glim-hue` together with the component's own checked-state fill.

## Rainbow, the accent, plural: the five traps

All five traps were hit in production. The original 7% wash shipped in 1.0.0, tested fine in isolation and drew three independent "the mode does nothing when I turn it on" reports from one adopting app before anybody measured the rendered colour instead of judging it by eye. It was applying correctly the whole time. It was raised to 16%, 22% when selected.

The specificity problem with the active row showed up in every adopting app that never carried `.glim-active`. The fix in 1.4.0 was scoped to `reactive` at first, because that was the only mode the bug report happened to demonstrate, and the advice to check sibling modes comes from that.

## Rainbow, the accent, plural: the position on the container

An adopting app placed the position on the section badge itself and shipped a mode that coloured eight badges and nothing else: the buttons, the switches and two entire secondary windows kept the single accent. The report said "rainbow mode doesn't work in most of the app", which was fair. Moving the same call one element outward fixed all of it at once.

## Rainbow, the accent, plural: the heading notch

Reported live: the card-section badges should stay coloured in reactive mode as soon as the pointer is anywhere in their own card. The wider reveal target was then checked across the whole system.

## Disco, the palette walks: no transforms

The report that moved the motion default down a level was about two entrance animations nesting their transforms, so an effect built out of transforms was never considered for disco.

## Disco, the palette walks: the top intensity

Every duration used to be a token and every travel a literal, so "full" and "subtle" ran the same six-pixel slide at two speeds, and the top level earned the flat name it had. It was reported as a naming question and answered as a design one: travel and a per-intensity curve became tokens, and the top level was renamed from "full" to "wild". A `--motion-page-scale` shipped beside them and was later removed at every level, because it resampled every animating thing inside the page it scaled.

## The motion engine: an ancestor's transform

The rule was corrected on 2026-09-15. It had given one cause for two symptoms: a flat green (`#38FF38`) badge flash on Firefox/macOS and a trembling page on Chromium. The trembling is explained by the rule. The green is not: the adopting app removed the scale and the rotation on that theory, shipped it as a fix, and the reporter saw no change. The arithmetic argues against it too, since `#38FF38` is rgb(56, 255, 56), with two channels exactly equal and one clipped, which is the shape of one wrong byte rather than of uninitialised memory.

The evidence pointed further than the rule goes, toward an ancestor that animates no transform at all while its contents do. That stronger form was not adopted.

## The motion engine: opacity on a spring

The rule was found the hard way, and only half of the report has an answer. An adopting app's top motion level flashed a flat green badge on Firefox/macOS. Two releases chased mechanisms inferred from reading the stylesheet, and neither helped. What moved it was a four-panel test file walking through the change that introduced the spring: the panel with opacity taken off the spring came back clean and the others flickered, but none of them reproduced the green. Writing the green down as solved would have been the third wrong conclusion in a row.

The second shape of the rule, the fade inside the keyframe on a curve that does not spring, exists because 66 staggered rows with a two-animation shorthand took an adopting app's test from passing to 8.8 s against a 5 s budget. Pages and toasts once shared a single curve token, and it was split in two so that a page may spring where a toast may not.

## The motion engine: reactive mode and animation

Rule 10 came from a regression. Reactive rainbow was once implemented by also suppressing nearby animation, which silently turned `.glim-live` off for anyone running reactive.

## The motion engine: the seven further animations

They came from a second pass at the motion axis, which did not stop at retrofitting the five keyframes that existed but added seven, each reading the tokens and resolving inside the gate from the start rather than as a follow-up.

The colour-wipe trap was caught live, not by reading the rule. `getComputedStyle().transitionProperty` showed only `border-radius` on a hued button mid-wipe, and about 50 sampled animation frames showed no interpolated frame at all. Doubling the wipe rule's class fixed it.

## The motion engine: move mode

Found in a host's Docker list, which the host's lock makes sortable.

## Illustrations: the scene pointer, the slosh and the folder

The rule that the pointer's click lands before its result was found where the pointer first arrived after the result. The lively slosh, with bubbles that pop, was picked from a page of variants. The opening folder was found in share tiles, where it stands in a tile the size of the Docker and Plugins logo tiles.

## On a phone: the success swell

Found when one phone app swelled on a copy and another did nothing.

## The label engine: how it came about

The label mode was asked for as a real engine rather than a per-app switch. A phone app's bottom bar is the case that established that a surface in one app gets its own axis. The default stays at `textGlyph` on the argument the motion engine once used for its own default, which the motion engine gave up when the surprise at the top of its range moved its default down a level.

A width stage computed from the words alone let "Refresh" grow by 12px when its glyph came on, which a test that really switched the mode found. The missing `gap: 0` was reported as the symbol not sitting centred. The first app to build this axis shipped exactly the missing boot call: every other engine's boot call was present, and this one had been added to the settings page instead of the root. The `em` cap was found on a 47-unit German label that still lost its tail at `1.25ch`.

## On markup the app does not own: the Labels card

Found where a Labels card in a plugin's settings picks the mode for the host's own buttons.

## Behaviour contracts: the first run

The first run of the contract tests found five gaps in the reference. ConfirmDialog had no Escape, no Tab trap and no way back to the control that opened it, because the hook that owns those three existed only inside the apps, where two of them had closed the same gap twice and in two ways. DropdownListbox had no typeahead. A busy Button showed a spinner and told a screen reader nothing. None of the five showed up in a screenshot or a code review.

## Adopting GlimStone in another app: why the components ship

Two apps built from the design language alone landed on the same language in two dialects. One called the switch `Toggle` in its own file, the other called it `Switch` inside a shared `Field.tsx` beside six other controls. One had `ConfirmDialog` and the other `Confirm`, one `DropdownListbox` and the other `Choice`, and one kept `Card` in a settings-page helper while the other kept it in a `Shell.tsx`.
