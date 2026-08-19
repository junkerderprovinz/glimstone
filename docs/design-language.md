# The design language

A layered, low-noise interface system: a small light in dark masonry.

**The palette is not ours to invent.** The ground, the surfaces, the text ramp and the state hues are IBM Carbon's neutral greys and support tones — the same values already used consistently across every app that shares this language. GlimStone briefly had a warm near-black of its own, and it read as brown beside everything else. A design language shared across apps has to share its ground first; what GlimStone contributes is the *system* — the rules below, the shape engine, the rainbow, the info bubble — not a second set of greys.

## The palette

| Role | Dark | Light |
|---|---|---|
| Ground | `#161616` | `#f4f4f4` |
| Surface / sidebar | `#262626` | `#ffffff` |
| Surface 2 | `#393939` | `#e8e8e8` |
| Surface 3 / selection | `#525252` | `#d1d1d1` |
| Hover | `#353535` | `#e0e0e0` |
| Border | `#393939` | `#d1d1d1` |
| Text | `#f4f4f4` | `#161616` |
| Text, secondary | `#c6c6c6` | `#525252` |
| Text, muted | `#8d8d8d` | `#6f6f6f` |
| **Accent (default)** | `#FCC419` | `#8E6A00` |
| Settled | `#6fdc8c` | `#0e6027` |
| Fault | `#ff8389` | `#da1e28` |
| Warning | `#f1c21b` | `#8E6A00` |

Accent presets in the picker are the same five across every app: Sunflower `#FCC419`, Blue `#1D99F3`, Green `#6FDC8C`, Red `#FF8389`, Purple `#BE95FF`. Someone who picks "Blue" in one app finds the same blue in the next.

The light accent is **the same hue, darkened** (`#8E6A00`), not a different colour: gold on white is unreadable at 11px, and Carbon's own answer to that is to darken the hue rather than switch it.

## The type scale

Not an engine, on purpose: an engine resolves a *variable* input (a setting, an OS signal) into tokens. Nobody sets their own type scale — this is a fixed reference table, the same category as the palette above, not a mechanism.

| Size | Role |
|---|---|
| 20px | Heading — a section or page title. |
| 14px | Body — the default for everything that isn't one of the other rows. |
| 12px | Dense — list rows, table cells, anywhere many instances stack and body size would crowd. |
| 11px | Caption — three treatments of the *same size*, not three sizes: a plain muted caption, `.glim-eyebrow`'s uppercase+letter-spaced label, and the info bubble's popover text. The treatment carries the distinction, not the size. |

**Two sizes exist and are deliberately *not* part of this scale**, so nobody extends them into steps that don't exist: a page's one hero figure (rule 2) is sized on its own merits case by case, not from a repeated "display" step — forcing every hero into one fixed size would fight the same rule that says there's exactly one hero and everything else is quiet. A wordmark or brand-name instance is typography for a specific, singular piece of chrome, not a heading size available for reuse elsewhere. Treat any large one-off number the same way: it's not a gap in the scale, it's a case the scale was never meant to cover.

**How this table got here:** three near-identical caption sizes (10px, 11px, 11.5px) drifted apart across an app's history before being consolidated to the single 11px row above — the same failure mode rule about badge sizing warns against, just for text instead of boxes. If a future audit finds a fourth size claiming to be a caption, that's the bug to fix, not a fourth row to add.

## The name

Middle English *glimme*, "shining brightness; radiance", attested around 1400 in *Pearl* — MS Cotton Nero A.x, the same manuscript that carries *Sir Gawain and the Green Knight*. The Gawain-poet himself alliterates the two halves together in line 172: *"euer glemered & glent al of grene stones."* The later thieves'-cant sense ("douse the glim", 1700) is a narrowing of a word that had already been English for three centuries. The German ear hears the same root in *glimmen* and *Glimmer* — the gold that sits in dark rock.

Considered and rejected, so nobody reinvents them: **GlimWard** (the 2016 fantasy series *Glimwarden* already uses exactly this word, exactly this sense), **GleedStone** (best etymology of the lot — Old English *glēd* = ember — but German final devoicing turns it into *Glied*, "limb"), **GlimSolar** (a castle's solar is its private chamber, but a German reader hears "solar panel"), **GlimHearth** (too close to Hearthstone), **GlimCloister** (Cloister is a typeface), **WickStone** (Wick reads as a cough remedy).

The CSS prefix is `glim-`.

## The rules that keep it calm

1. **One raised surface.** `.glim-card` is the only elevation. Never nest a card inside a card — group content with spacing and a section title instead.
2. **One hero per page.** Exactly one element carries weight. Everything else is supporting detail at small type.
3. **The accent marks activity, nothing else.** It is reserved for the active nav item, the single primary action, progress fills, and the brand mark. A page has at most one solid accent button. A control that is *always* on in every row is not activity — it has to be de-coloured.
4. **Four state hues.** accent = running · green = settled · red = fault · neutral = waiting. Paused shares the neutral tone; its label and its resume control carry the difference. Never introduce a fifth hue.
5. **Hierarchy from type and colour step, not from borders.** Separators are hairlines at low opacity; boxes are a last resort. **No vertical marks at all** — no rails, no leading-edge bars, no 3px accent stripes. What is selected is *filled* with the accent; what owns a rainbow position is *washed* with it. A rail also breaks under the square corner setting, where it stops reading as a mark and starts reading as a stray border.
6. **Secondary actions appear on hover.** A long list reads as content, not as a wall of buttons. The primary action for a row stays visible.
7. **Digits use `.glim-num`** (tabular + lining numerals) wherever they change or stack, so nothing jitters while counting.
8. **Explanations live in a bubble, not on the page.** A control that needs explaining carries a neutral `(i)` beside its label; the text appears on hover or focus. Prose printed under every control is read once and then costs vertical space forever, and a page of grey paragraphs hides the controls it was meant to clarify. If something cannot be explained in a bubble, the control is wrong, not the label.
9. **Colour modes are three-way, never two-way — and they apply to everything.** Every coloured element needs *three* states: normal/rainbow (mode colour) · reactive-rest (neutral grey) · reactive-hover (mode colour). This applies to **every** element on a page, not just the obvious ones: badges, buttons, links, fields, switches, icons. A page is only finished once **nothing** is left that ignores the mode — "half of it respects the mode" is a bug, not a state. Checking off "accent applied" and stopping there ships the wrong thing for anyone running reactive.
10. **Reactive is a colour rule, not a motion rule.** Animations keep running under it. Muting a pulsing indicator in reactive mode turns the feature off for the person who asked for it.
11. **Every heading is a filled section badge** — never bare text, never a full-width bar with no radius. A section badge is **always coloured**: it is a heading, not a control, so rule 9 does not apply to it.
12. **Headings align to the content edge, not the window edge.** Inside a foreign host UI, the reference edge is the **host's own main navigation**, not the column beneath it — the section badge lines up flush-left with the host's menu bar. That edge is **measured** (e.g. a `--align-left` custom property), never guessed as a fixed padding value, or it drifts with theme, font size, and fixed-vs-fluid width.
13. **Everything clickable is a badge — including links.** A plain blue text link between badges is a foreign object.
14. **Form fields are borderless and filled**, focus is a brightness step rather than a ring. Anyone setting `appearance: none` **has to supply the arrow** themselves. A native `<select>`'s open dropdown stays OS chrome — that's a compromise, and it gets named as one, not sold as "on brand." **A closed `<select>` also answers the mouse wheel**: scrolling while hovering steps `selectedIndex` up or down and fires `change`, without opening the native dropdown at all — the platform default only wires the wheel up once the list is already open, and a value someone reaches for constantly (a font, a preset, a language) shouldn't cost a click first. `reference/selectScroll.ts`.
15. **A window is a window**, no matter who renders it. Same surface, same radius, same elevation, title as a badge, button row at the bottom. **Opacity is off-limits**: `opacity` on a container composites the whole subtree, darkening happens through colour instead. For long content, the title and button row stay anchored — only the region between them scrolls.
16. **A control that only appears on hover has to survive hovering itself** — otherwise it vanishes at the exact moment someone reaches for it.
17. **Never override a foreign container with `display: … !important`.** The host shows and hides it on its own; forcing `display` leaves it stuck visible.
18. **A native control gets replaced, not persuaded.** Where the host UI renders a widget whose insides CSS can't reach (an open native `<select>`), there is exactly one right answer: swap in the app's own replacement, which it already has anyway. "Closed, it looks on-brand" is not an adoption, it's a half-finished rebuild, and it reads as one.
19. **Controls that belong together share one box.** Same height, same radius, same font, one row. Elements that live in different parents can never share a row — move the element itself, don't nudge the spacing to fake it.

## The info bubble

`<InfoBubble tip="…" />`; a `Field` given a `hint` gets it automatically — no call site had to change.

- **Neutral, never the accent.** The icon is furniture; the accent means activity.
- **Rendered into `<body>`, positioned from the icon.** Anchored locally, it's at the mercy of every card, table and scroll container above it — one `overflow: hidden` and the explanation is a sliver. Closes on scroll instead of drifting away from what it explains.
- **Hover *and* focus, Escape closes**, text as `aria-label`, bubble is `pointer-events: none` (never swallows a click).

Why bother at all: grey prose under every control gets read once and then costs vertical space forever.

## The one horizontal selector

Tabs, filter bars, segmented controls and the corner-style picker are **the same thing**: a row from which one (or several) item is chosen. Build it as **one** component (`select="one" | "many"`, built from a filled/unfilled segment style), not a bespoke set of buttons per picker — a second, hand-rolled selector drifts from the first one the moment either changes. This is for **small, fixed** sets that all fit on screen at once — a list with dozens of entries (see the language picker below) is a different component, not a wrapping tab strip.

- **No wrapping bar.** The filled tab already says which one is selected; a box around the row says nothing and is one elevation too many (rule 1). The container is gone entirely; the gap alone carries the separation. Measured: a bare strip, no background, no padding — the tabs sit on the page as badges.
- **Top, with an icon.** Settings pages line their tabs up **horizontally at the top**, each with a glyph. A tab with no label is a gap; a tab with the wrong glyph is a lie — no icon beats the wrong one.
- **It wraps, it never scrolls.** A horizontally scrolling tab strip hides pages behind a gesture nobody makes on desktop.
- **Roving tabindex**, arrow keys/Home/End, direction-aware (RTL).

**The trap:** `Field` is a `<label>`. A label wrapped around *three* tabs hands its click to the first one — clicking the "Corners" caption reset the app to "round", and the first tab announced the caption as its own name to a screen reader. So: `Field` for **one** control, **`FieldGroup`** for a set.

## The sidebar

A persistent left rail is how a multi-destination app is navigated: the brand mark at the top, a vertical icon+label list filling the middle, and Settings pinned at the bottom below a spacer — no separate top app-bar at all, the brand lives inside the rail. This is a **different component** from the horizontal selector above, not a vertical variant of it: a sidebar destination is real navigation (which whole content area is showing), not "which of a small fixed set is chosen" — it uses `aria-current="page"` semantics, not the ARIA tabs pattern, and in an app without a URL router it's the same idea an SPA reaches for when it swaps a content area without touching the address bar.

- **Own surface token.** The rail reads `--carbon-sidebar`, not `--carbon-surface` — same value today, but a distinct token, because the rail is chrome that spans full height flush against the window edge, not a card floating on the ground colour. No elevation, no border: the page's own background colour change *is* the separation.
- **Filled when active**, same idea as the horizontal selector: the accent fills the active item (`background: var(--accent)`, `color: var(--accent-contrast)`), nothing else marks selection — no rail-beside-the-rail, no left border (rule 5 already forbids vertical marks generally, and a sidebar is exactly where the temptation to add one is strongest).
- **A quiet hover moves, it doesn't just recolour.** A 2px horizontal nudge on hover (motion-safe-gated) reads as "this is reachable" more than a colour change alone does on a rail this visually quiet.
- **Two groups, one state.** The main destinations fill the available height (`flex: 1` on the list); Settings sits in its own group below, separated only by the space the flex spacer creates — never a rule line between them (rule 5 again). Both groups share one "which destination is active" state; only one content area is ever showing.
- **Version numbers live in Settings, never in a persistent footer** — and specifically at the **very bottom of the Settings destination itself**, outside every card, not tucked inside whichever card happens to be last. A version string sitting in permanent page chrome is read once and then costs a line forever (the same objection rule 8 makes about explanatory prose), so it belongs where someone actually goes looking for it; putting it inside one particular card (Appearance, say) makes it read as *that card's* property instead of the whole app's, and ties its position to wherever that card happens to land if Settings ever gains or reorders cards.

**A lightweight alternative for a genuinely simple app.** Not every adopter has enough real destinations to justify a full rail — a single-workspace tool with only "the work" and "Settings" can skip the sidebar entirely and put a small square badge (`--radius-control`, not the pill) carrying a gear glyph in the page's own top-right corner instead, opening Settings as its own full-page view (still no preview, no working cards behind it — see rule 15, a window is a window). This is a real, sanctioned pattern, not a workaround: state which one an app uses and why in that app's own style-guide subnote, since a future pass shouldn't "fix" a deliberately simple app back toward the rail.

## Switches

- **Flush, no indent.** Sub-switches don't get indented — they're already dimmed when the parent switch is off, and that says the relationship better than indentation does. Indenting only left the switch tracks starting at two different x-positions.
- **No second label.** If the heading directly above already says it ("Rainbow"), the switch below doesn't need its own caption — "Use palette" repeated the same decision twice. `Toggle` has `hideLabel` for exactly this: the text survives as `aria-label`, the eye just doesn't see it twice. **Never a reason to skip the label entirely** — a nameless switch is a control nobody can describe.
- **Switched off, not hidden.** A control that disappears never teaches anyone what the mode does.
- **Glyph, not a colour swatch.** The corner-style picker shows its radius as an **outline** in the text colour (`border-[1.5px] border-current`), not a filled accent square: three coloured dots beside three captions is decoration, and the accent means activity (rule 3).

## The reveal eye (password/token fields)

A field holding a secret carries its show/hide control **inside the field** at the trailing edge: a bare eye that becomes a slashed eye once the value is visible.

- **A bare icon, never a badge or a second button.** The eye is furniture — a glyph the field's own trailing padding reserves room for, not a chrome button beside it. On a page inside a foreign host UI whose global `button` styling would paint any `<button>` as a filled badge, the eye is a `<span role="button" tabindex="0">` so nothing themes it. An app that owns its own CSS may use a real button — the look is identical either way: just the eye, nothing around it.
- **Neutral, never the accent.** Like the `(i)`, it means "look", not "activity".
- **It doesn't change the field's width.** The wrapper that positions the eye fills the column exactly like a plain field; a shrink-to-content wrapper makes secret fields read as narrower than every other field — the one thing the eye should *not* draw attention to. A verify/check action goes on its own line **below**, not beside it.

## Badges

Rules 11 and 13 already say a lot is a badge — every heading, everything clickable. What a badge actually *is* has four shape registers and a sizing discipline of its own.

- **Four shapes, not the shape engine's three.** Pill (`--radius-pill`, fully round) for standalone chips and count/data badges; rounded (a small fixed radius, matching `--radius-control`) for compact inline badges; square (0) mirrors the shape engine's square setting; circle (`--radius-pill` again, but width locked to height) for icon-only or single-glyph badges — same radius value as pill, but a distinct semantic use: a pill implies text content, a circle implies "just a glyph."
- **Cap the pill radius to the badge's own height.** A blind `border-radius: var(--radius-pill)` on a very compact badge over-rounds once the radius exceeds half the badge's height, and it stops reading as a pill and starts reading as a pointed lozenge. Use `border-radius: min(var(--radius-pill), 50%)` rather than the raw token value on anything short enough for this to matter.
- **Sizes are named stages with one canonical source, not per-instance values.** A handful of named stages (however many an app genuinely needs — small/medium/large is usually enough) each fix a font-size, padding and height together; every badge instance reads its stage's tokens rather than repeating literals. This isn't a nice-to-have: a real regression shrunk one row's badge height in a single stylesheet while five other stylesheets styling the same row still referenced the old literal value — a 30px badge can never share a line with a 26px button next to it, no matter what alignment logic runs afterward.
- **Same stage means pixel-identical, regardless of the underlying element.** A `<button>` and a `<span>` styled to the same badge stage must resolve to the exact same rendered height — claim the full box model (`box-sizing`, an explicit `height`, `min-height: 0`, `appearance: none` on native elements) and read padding/font-size from the stage's own tokens, never from whatever that element type defaults to. Two badges built from the "same" helper function still rendered visibly different heights until this was enforced explicitly.
- **The `font-size: 0` + `vertical-align: middle` trap.** A wrapper set to `font-size: 0` (the usual fix for whitespace-node gaps between inline children) combined with `vertical-align: middle` moves the line box's strut baseline to `line-height / 2` with zero x-height, so content centers on that baseline instead of the wrapper's true middle — landing a few pixels off from a same-height sibling that still has a real font-size. Removing the `font-size: 0` while `vertical-align: middle` stays in place pushes the content back up unexpectedly in the other direction. Fix the two together, never just one.

## Toasts

`.glim-toast`/`glim-toast-in` (in `reference/tokens.css`) is the CSS half; the other half is behavioral and framework-specific, so it's spec here rather than a copyable file.

- **A fixed duration, not "until dismissed."** 4 seconds is long enough to read, short enough not to pile up — a toast is a notice, not a to-do list.
- **Stacked, not replaced.** Multiple toasts queue in a fixed corner rather than one overwriting the next; each is independently dismissible.
- **Hover or focus pauses the countdown — and preserves the remaining time**, rather than restarting it. Resetting to the full duration on every hover means a toast under a wandering cursor never actually expires.
- **A "quiet" mode filters by severity, not by muting everything.** Failures and anything that blocks progress (a captcha waiting for input, an account that just got benched) always surface; routine completions can be suppressed for someone who's turned the volume down. The two categories that already have a dedicated, persistent surface elsewhere (a captcha panel, an account-health strip) skip the toast entirely rather than duplicating the notice in two places at once — a toast is for something that has no other place to live.

## Empty states

A list, table or panel with nothing in it gets a **deliberate empty state**, not blank space: a `.glim-card`, a muted icon at reduced opacity, a muted title, an optional one-line hint, an optional action button (e.g. "Add one"). The same shape serves two related but distinct situations — genuinely nothing exists yet, versus a filter/search matched nothing — with different copy for each; conflating them ("No results" when the real answer is "you haven't added anything yet") sends the user looking for a filter to clear that was never set. A spot where the shared empty-state shape genuinely doesn't fit is fine as a one-off exception — document *why* inline where it happens, so it reads as a deliberate call and not an overlooked gap.

## Destructive and confirmable actions

Not every removal deserves the same friction, and treating them identically is itself the bug.

- **Reversible actions don't ask.** Dropping a row from a working list (re-addable in one step) fires immediately — a confirmation dialog in front of an undoable action just teaches people to click through confirmations without reading them.
- **Irreversible actions get a real confirmation that states the stakes**, not a generic "Are you sure?" — the exact count and, where it applies, the size of what's about to be gone. It's the standard `.glim-card` window (rule 15), not a native browser dialog: a native `confirm()` can't be styled, can't be localized consistently with the rest of the UI, and blocks the entire tab while it's open.
- **The destructive control is always the fault colour.** Not the accent, never a neutral grey "Delete" sitting next to neutral "Cancel" — the one control on the screen that ends something permanently is the one place status-red belongs on a button.

## Charts (provisional — extracted from a single example, revisit once a second chart exists)

- **Hand-drawn SVG, not a charting library.** A smoothed line path, filled underneath with an accent-colour gradient fading to transparent, stroked in the accent at a hairline weight.
- **One colour source: the accent, never rainbow or status hues.** A chart shows a quantity over time, not a set of distinct identities — the plural colour modes exist for the latter.
- **No axes, no gridlines, no tick labels.** A single eyebrow-style caption states the current or peak value in words; the shape of the line is the point, not a coordinate system to read precisely.
- **The live edge pulses** (`.glim-live`), same treatment as any other "this is happening now" indicator elsewhere in the system — a chart isn't a special case, it's rule 4's accent-means-running applied to a curve instead of a badge.
- **Idle degrades to a flat, muted hairline — not a gold line sitting at zero.** The accent means activity; a coloured line with nothing happening behind it is the same mistake rule 3 already rules out elsewhere, just easier to miss on a chart.

## Inside a foreign host UI (Unraid plugins)

A plugin page inherits the host's global form and button CSS. Two things that have cost real time:

- **Specificity beats a single class.** Unraid's `button[type=button]:where(…)` (0,1,1) beats `.my-btn` (0,1,0) — the button gets the host's ghost styling (transparent, accent text, gradient border). Component rules should therefore be **prefixed with the app's root class** (`.app-cfg .app-btn` = 0,2,0), the same way input rules already have to be. Icons (the eye, the `(i)`) stay `<span>`, never `<button>`, so no button chrome applies; a hidden toggle checkbox needs `position: absolute !important` hard-pulled out of flow, or a host reset shoves it back and the pill drifts.
- **Native by default, GlimStone only with the companion app installed** (one markup base, two looks). Without that companion, the page should look **fully native to the host** — style layout only, lean on the host's own form CSS (underlined inputs, native checkbox toggles, the host's own type). The GlimStone look (cards, wells, eyebrows, pill tabs/toggles, filled chips) lives in a **second layer**, gated behind a class the companion app stamps onto `<html>` when it's present, with higher specificity, reading the shared tokens only then. GlimStone is **progressive enhancement, not the default.** The anti-pattern seen in the wild: GlimStone applied unconditionally with token fallbacks baked in — the page then stands there as "GlimStone in the host's own orange" when the companion app isn't installed, and doesn't read as native to anyone.

## The user-owned axes

Theme, shape, accent and language are all settings, and every one of them is **applied once at the app root** — never by the page that edits it. A settings page reads the current value and writes the new one; it never carries the styling logic itself, or two pages would be free to disagree about how "square" looks.

Two of these axes hand off to a named **engine** — a single mechanism that turns one input (or, for colour, three) into every token a component reads, so nothing downstream has to know which setting produced the value it got. Shape has one: the **shape engine**, below. Theme, accent and rainbow share one: the **colour engine**, below that. Language doesn't — it changes structure (`lang`, `dir`, which glyphs get requested) rather than resolving to a token set, so it stays "an axis" and not "an engine."

- **Theme** sets `data-theme` on `<html>`: `light` · `dark` · unset, which follows the OS via `prefers-color-scheme`. **Default is system**, not a hard-coded light or dark — an app that opens dark on a light-mode OS made a choice nobody asked it to make. A user who picks light or dark explicitly overrides the OS until they clear it.
- **Shape** sets `data-shape` on `<html>`: `round` (16/10px) · `soft` (8/5px) · `square` (0). **One** token drives every radius, no exception list — this is the whole shape engine; there is no further mechanism beyond the three token sets in `reference/tokens.css`.
- **Accent** overrides `--accent`; `--accent-contrast` is **computed** from sRGB luminance, never asked for as a second setting — asking for a second colour just to make the first one legible is a trap, not a preference. **The default, before anyone has touched the setting, is Sunflower gold `#FCC419`** (`DEFAULT_ACCENT` in `reference/appearance.ts`) — a fresh install of any app that shares this language opens in the same colour, so the family reads as one product from the very first screen, not just after someone finds the picker.
- **Language** sets `lang` (and `dir`, see below) on `<html>`. Default is the browser's own locale (`navigator.language`) if it's supported, English otherwise — never a hard-coded language shown to everyone regardless of their system. The picker itself is a plain `<select>` (rule 14), not the horizontal selector above: a language list runs to dozens of entries, and a control built for "everything visible at once" stops working once it has to wrap or scroll.
  - **Each option carries its flag as an emoji prefix** (`🇬🇧 English`, `🇩🇪 Deutsch`), not a background-image/sprite flag icon library. A native `<option>` can only ever hold plain text — no image, no CSS background — so a "real" flag icon (an SVG sprite, a `flag-icons`-style CSS class) forces a custom-built dropdown to render it at all, which is exactly the `<select>` this rule just ruled out for a 26-entry list. The regional-indicator emoji sequence (two Unicode codepoints per ISO 3166-1 alpha-2 code, e.g. `GB` → `🇬` + `🇧`) renders as a real flag glyph on every modern OS and needs nothing beyond string concatenation — `reference/flagEmoji.ts`. The closed select's own displayed text already shows the selected option's flag for free, since it's just that option's text.
  - This is deliberately the plain-`<select>`-compatible answer, not a requirement to match a sibling app's own fancier implementation — an app built with a component framework may reasonably build a custom dropdown with real flag-icon sprites instead (crisper rendering, its own hover states) if it already isn't using a native select for other reasons. Framework-free adopters should default to the emoji-prefix approach above rather than reaching for a custom dropdown just to get flags.

**On engines we don't have.** Chromium, Gecko and WebKit differences (clipboard permissions, native widget chrome, form-control quirks) are real, but they live in *application* code, not here — every axis above resolves through standard CSS custom properties and media queries (`prefers-color-scheme`, `prefers-reduced-motion`, logical properties), which behave identically across engines. A "browser engine" would only earn a place here if GlimStone itself ever needed to branch its own *visual* rules by engine; nothing in this document currently does.

## Right-to-left languages

Setting `dir="rtl"` on `<html>` (Arabic, Hebrew) mirrors layout through the Bidi algorithm, and most of the system holds up under it for free — the token-driven spacing and alignment already use logical properties (`margin-inline-start`, not `margin-left`), so a card, a form field or a section badge just flips. Two things don't get to flip automatically:

- **Technical content stays pinned left-to-right.** A path, URL, filename, API key or log line is not language — it's data, and the Bidi algorithm reorders neutral characters (`/`, `.`, `-`) inside it as if it were prose. `/data/downloads` under `dir="rtl"` renders as `data/downloads/`: still the same string, but visually a different path, and a user reading it will believe their files live somewhere else. Any field or display showing technical content gets `dir="ltr"` **and** `text-align: start` (so its *position* still follows the surrounding RTL layout — only the text *inside* it stays LTR).
- **Directional icons mirror, symmetric ones don't.** An arrow, a chevron, a "forward" glyph that implies a reading direction gets mirrored under `dir="rtl"` (`transform: scaleX(-1)`, or a dedicated RTL glyph if mirroring distorts it). An icon with no inherent direction — a gear, a trash can, the reveal eye — never does; mirroring it just makes it look subtly wrong for no reason anyone can name.

Verify RTL on the rendered page, not by reading the CSS: a logical property used correctly and one used incorrectly look identical in the source and only differ once the browser actually flips the layout.

## Non-Latin scripts

The font stack ends in `system-ui, sans-serif`, not a fixed list of named fonts, and that's deliberate: a browser missing a glyph in the first-choice font (Segoe UI's CJK coverage is thin) falls back **per character** to whatever the OS already has installed for that script — it does not need every script's font to be listed by name to render correctly. Two things that font stack alone doesn't cover:

- **Letter-spacing is a Latin assumption.** The base `-0.008em` tightening reads as normal kerning on Latin letterforms and as crowding on CJK, which is set in full-width square cells that don't kern the same way. Scope it out for CJK content: `:lang(ja), :lang(zh), :lang(ko) { letter-spacing: normal; }`.
- **`.glim-num`'s tabular figures are a Latin-digit feature.** `font-variant-numeric: tabular-nums` only affects the Western Arabic numerals (0–9) most fonts ship as monospaced-width by convention; it has no defined effect on native digit systems (Eastern Arabic-Indic, Devanagari) some locales display instead. Where a locale's own digits are shown, column alignment has to come from a fixed-width container instead of the numeral feature.

## The colour engine

Theme, accent and rainbow are three inputs into one mechanism, not three separate systems: **theme** picks which half of the palette (`:root` vs `[data-theme="light"]`) is active, **accent** overrides the activity hue on top of it, **rainbow** multiplies that hue by list position. All three ultimately resolve to the same handful of tokens — `--accent`, `--accent-contrast`, `--accent-soft`, and whichever `--carbon-*` step theme selected — so a component reading `var(--accent)` never needs to know which of the three produced the value.

The four state hues (rule 4) are the one thing that never runs through this engine: settled/fault/warning/neutral are fixed per theme, not user-editable, and never rainbowed — green has to mean "finished" everywhere, unconditionally.

### Rainbow — the accent, plural

Eight colours handed out by **position** instead of one colour everywhere. Three sub-switches:

| Switch | Meaning |
|---|---|
| `rainbow` | master |
| `rainbowReactive` | rests neutral, colour on hover + on whatever is active |
| `rainbowRotate` + `rainbowSeed` | offsets the starting colour; **the seed lives on the instance**, not the browser — two clients of the same server must never disagree about a download's colour |
| `rainbowPalette` | all eight editable; taken **only as a complete set** |

**Mechanism:** an element that owns a position sets `--item-hue` (`hueVars`) and carries `.glim-hue`; the stylesheet redefines `--accent` **for that subtree**. Every component that already paints activity picks the colour up automatically — none of them has to know the mode exists. `.glim-hue-icon` additionally colours the glyph, `.glim-tint` washes the whole row at 7% (as an inset shadow, so the row's own hover tint still shows through).

**Three traps, all hit in production:**

- **Position, not an id hash.** A hash keeps a row's colour as rows above it finish — sounds better, until three rows land in the same bucket and two neighbours share a colour. Position is exactly what the mode exists to prevent.
- **The row needs the wash.** Without it, colour only reaches the row through the progress fill — and that turns green on completion (rule 4). On a list of finished downloads, the one mode built for lists showed nothing at all.
- **Tailwind's `@theme` resolves once, at `:root`.** `--color-accent: var(--accent)` inside `@theme` gets evaluated at `:root` and frozen there — every utility generated from it (`bg-accent`, `text-accent`) points at the global accent forever, and a `.glim-hue` subtree that redefines `--accent` never reaches it. Rainbow coloured everything that read `var(--accent)` directly and nothing that went through a utility class. The hue rules have to set `--color-accent`, `--color-accentContrast` and `--color-accentSoft` **themselves**.

**Security:** every palette colour lands in a CSS custom property. Validate server-side with `^#[0-9a-fA-F]{6}$`, and take it **all-or-nothing** — seven good colours plus one injected value isn't an 87%-safe palette, it's an invisible line.

## The motion engine

Four keyframes cover everything that moves: `glim-page-in` (a page or section settling in, 280ms), `glim-toast-in` (a notification sliding in, 220ms), `glim-fade-in` (the info bubble and other transient UI, 110ms), `glim-pulse` (the `.glim-live` dot, 2s, infinite). All four exist to answer one question — is this new, arriving, or ongoing — and nothing else in the system animates: a settled page doesn't idle-animate, a card doesn't breathe, hover states change instantly.

- **Fast by default, and faster the closer it is to input.** Entrances that follow user intent (opening a page) get the full 280ms with an ease-out curve; something the pointer is already waiting on (the info bubble) gets 110ms flat — a bubble that fades in slowly reads as *lag*, not as *polish*, because the cursor got there first.
- **`prefers-reduced-motion: reduce` swaps entrances for a plain fade, never nothing.** `glim-page-in`/`glim-toast-in` drop their translate and shrink to a 160–180ms opacity-only fade under the media query — an element still needs to *arrive* legibly, just without the motion component. This is the accessibility signal, not a GlimStone setting (see "the axes we don't have" above): no in-app toggle duplicates it today.
- **An infinite animation gets a true stop under reduced motion, not a slower version.** `.glim-live`'s pulse communicates "this is happening now" — under `prefers-reduced-motion` it renders as a static, fully-opaque dot instead: `.glim-live { animation: none; opacity: 1; }`. A continuous animation is exactly the category `prefers-reduced-motion` exists for (unlike a one-shot 110–280ms entrance), and "this item is live" still has to read from its colour and position alone once the pulse is gone.
- **This is independent of the colour engine's reactive mode.** Rule 10 exists because of a real regression: reactive rainbow (colour rests neutral, appears on hover) was once implemented by also suppressing nearby animation, which silently turned `.glim-live` off for anyone running reactive. Colour mode and motion are two different engines reading two different signals (a setting vs. an OS preference); neither one gets to reach into the other.

## Tokens (the contract)

Defined under `:root` / `[data-theme="light"]`.

| Token | Role |
|---|---|
| `--carbon-bg` | page ground |
| `--carbon-sidebar` | nav rail ground (a touch deeper than the page) |
| `--carbon-surface` | the raised surface — cards, active nav |
| `--carbon-surface2` | inputs, wells, quiet fills |
| `--carbon-surface3` | tracks, hover on surface2 |
| `--carbon-hover` | row hover on the page ground |
| `--carbon-border` | hairline separators |
| `--carbon-text` / `-sub` / `-muted` | three-step text ramp |
| `--sidebar-text` | nav label colour |
| `--accent` / `--accent-contrast` / `--accent-soft` | activity |
| `--status-{ok,fail,warn,info,neutral}-{text,bg,solid}` | states |
| `--elevation`, `--hairline` | the one shadow + its top light |
| `--focus-ring` | focus outline colour |
| `--radius-card`, `--radius-control`, `--radius-pill` | the shape engine |
| `--text-heading`, `--text-body`, `--text-dense`, `--text-caption` | the type scale |

Utility classes: `.glim-card` (the surface), `.glim-well` (inset grouping), `.glim-eyebrow` (small uppercase label), `.glim-num` (tabular digits), `.glim-bubble` (the info bubble), `.glim-hue` (owns a rainbow position), `.glim-hue-icon`, `.glim-tint`, `.glim-page-enter`, `.glim-toast`, `.glim-fade`, `.glim-live` (pulsing dot).

**The token names are the contract, the values are the look.** A sibling app adopts GlimStone by pointing its own components at these same names — nothing about a component's markup has to change, because every colour already flows through a token.

## Adopting GlimStone in another app

1. Copy the `:root` / `[data-theme="light"]` blocks from [`reference/tokens.css`](../reference/tokens.css) into the app's stylesheet.
2. Copy the `.glim-card` / `.glim-well` / `.glim-eyebrow` / `.glim-num` helpers, plus the base `body`/font rules and the scrollbar and focus rules, from the same file.
3. Add whatever tokens the app doesn't have yet: `--accent-soft`, `--elevation`, `--hairline`, `--focus-ring`, `--radius-card`, `--radius-control`, `--radius-pill`.
4. Replace hard-coded `rounded-lg` / `shadow-*` on panels with `.glim-card`; fill the selected nav item, tab or segment with the accent (`segBase`/`segOn`/`segOff`, see the componentry note in each app's own style guide).
5. For rainbow, copy [`reference/appearance.ts`](../reference/appearance.ts) — it's dependency-free and talks only to `document.documentElement` and its own settings object.
6. For the scroll-to-cycle `<select>` behaviour (rule 14), copy [`reference/selectScroll.ts`](../reference/selectScroll.ts) and call `enableSelectScroll()` on every `<select>` the app mounts.
7. For flag-emoji-prefixed language options (the user-owned axes, Language), copy [`reference/flagEmoji.ts`](../reference/flagEmoji.ts) and prefix each `<option>`'s text with `flagEmoji(locale.flag) + ' ' + locale.label`.

Nothing else is required: component markup stays exactly as it is, because every colour already flows through the tokens.

If the app is using Tailwind v4, [`reference/tailwind-theme.css`](../reference/tailwind-theme.css) is the optional `@theme` layer that maps the tokens onto Tailwind utility classes (`bg-carbon-surface`, `text-accent`, …). Apps not using Tailwind can skip it entirely and use the custom properties directly.

## Where the per-app detail lives

This document is app-agnostic: palette, rules, the colour-mode model, componentry vocabulary. Anything that's true for only one app — its exact token names if they diverge, class prefixes, measured pixel values, quirks of a specific host UI — belongs in that app's own style guide, not here. Each adopting app keeps a short note listing only its exceptions and gating classes; if a rule shows up in both places, delete it from the app-specific one — if it's universal, it belongs here.
