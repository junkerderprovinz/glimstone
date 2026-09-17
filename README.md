<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/glimstone-banner-dark.png">
    <img src=".github/assets/glimstone-banner.png" alt="GlimStone" width="100%">
  </picture>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-AGPL--3.0-blue?style=for-the-badge&logo=gnu&logoColor=white" alt="License: AGPL-3.0" height="36"></a>
</p>

<p align="center">
The shared design language behind a family of apps by the same author: one low-noise palette,<br>
four engines a user drives from the app root, and a house style for the componentry.<br>
<br>
No build step and no package. Adoption is copy-and-paste by design, so a plain-CSS Unraid plugin<br>
and a React app can speak the same language without sharing a runtime. Published for reference<br>
rather than for outside adoption; <a href="docs/design-language.md">docs/design-language.md</a> carries the reasoning and everything else.
</p>

<br>

<p align="center">
A one-knight job: I build it, keep it running, work through the issues and add what people ask for, until nothing is missing. It is free, with no accounts, no telemetry, no ads and no paid tier. No asterisk anywhere. Nothing readable ever leaves your own walls. Forged on evenings and weekends, with heart and stubbornness.
</p>

<p align="center">
If it has earned a place on your server or computer, toss a coin to your knight: it helps cover the costs and keeps the project alive. It also makes this knight's heart beat a little faster. Three ways below, whichever suits you.
</p>

<br>

<p align="center">
  <a href="https://buymeacoffee.com/junkerderprovinz"><img src="https://raw.githubusercontent.com/junkerderprovinz/junkerderprovinz/main/donate/buttons/give.svg#svgView(viewBox(0,0,841.9,245.3))" alt="Buy me a coffee" width="160" height="46.62"></a>
  &nbsp;
  <a href="https://www.paypal.com/donate/?hosted_button_id=76FVV52TKXTUS"><img src="https://raw.githubusercontent.com/junkerderprovinz/junkerderprovinz/main/donate/buttons/give.svg#svgView(viewBox(841.9,0,841.9,245.3))" alt="PayPal" width="160" height="46.62"></a>
  &nbsp;
  <a href="https://junkerderprovinz.github.io/junkerderprovinz/"><img src="https://raw.githubusercontent.com/junkerderprovinz/junkerderprovinz/main/donate/buttons/give.svg#svgView(viewBox(1683.8,0,841.9,245.3))" alt="Donate with crypto" width="160" height="46.62"></a>
</p>

<br>

## Contents

1. [What's in this repo](#1-whats-in-this-repo)
2. [The short version](#2-the-short-version)
3. [The engines](#3-the-engines)
4. [Easter eggs](#4-easter-eggs)
5. [Adopting GlimStone in an app](#5-adopting-glimstone-in-an-app)
6. [Where per-app detail lives](#6-where-per-app-detail-lives)
7. [Versioning](#7-versioning)
8. [License](#8-license)
9. [How AI is used here](#9-how-ai-is-used-here)
10. [Support this project](#10-support-this-project)

<br>

## 1. What's in this repo

- [`docs/design-language.md`](docs/design-language.md) — the full spec: the palette, the name and its etymology, all twenty rules, the componentry vocabulary (info bubble, horizontal selector, switches, the reveal eye, badges, toasts, empty states, destructive actions, charts, the sidebar and the phone's bottom bar), all four engines, the token contract, and the adoption steps. This is the document to read start to finish; everything below just points back into it.
- [`reference/tokens.css`](reference/tokens.css) — the palette and component classes as plain CSS custom properties, and where the shape, colour and motion engines resolve to actual values. No build step, no framework. Copy the parts an app needs.
- [`reference/tailwind-theme.css`](reference/tailwind-theme.css) — the optional Tailwind v4 `@theme` layer that maps the tokens onto utility classes. Skip it entirely on a non-Tailwind app.
- [`reference/appearance.ts`](reference/appearance.ts) — the shape, accent, rainbow and motion logic, including the four fixed motion level names and `stormTap()`, the gesture behind the hidden fourth one. Framework-free (talks only to `document.documentElement` and `localStorage`), so it drops into any app unchanged.
- [`reference/controls.ts`](reference/controls.ts) — the label engine: four modes (text, text+glyph, glyph, reactive) across three independent surfaces, plus the width stages that let a mode change happen without the page reflowing. Framework-free the same way.
- [`reference/colorPicker.ts`](reference/colorPicker.ts) — the floating saturation/value picker, drawn in the app's own DOM. Never a native `<input type="color">`, which hands off to a surface outside the page.
- [`reference/numberField.ts`](reference/numberField.ts) — in-field steppers for a plain `<input type="number">`, driving the input's own `stepUp()`/`stepDown()` so min/max/step stay in the markup.
- [`reference/tooltip.ts`](reference/tooltip.ts) — the shared tooltip and info-bubble mechanism, so an explanation never becomes a native `title` balloon.
- [`reference/selectScroll.ts`](reference/selectScroll.ts) — keeps a long option list scrollable without the list deciding the page's height.
- [`reference/flagEmoji.ts`](reference/flagEmoji.ts) — turns an ISO 3166-1 alpha-2 code into its regional-indicator emoji, for language options a native `<option>` can actually hold.
- [`reference/glyphs.md`](reference/glyphs.md) — the shared glyph assortment: which icon means what, where each comes from and under which licence, and the sizing rules that make a set of icons read as one set.
- [`reference/react/`](reference/react/) — the components themselves, as React source: `Button`, `Toggle`, `Card`, `Badge`, `DropdownListbox`, `ConfirmDialog`, `Toast`, `InfoBubble`, `IconTipButton`, `UnavailableNotice`, `AboutCard`, `CryptoDonateDialog`, plus the small hooks they need. The files above say what a control must look like; these say what it **is**. Two apps built from the prose alone produced the same language under different names — one `Toggle` and one `Switch`, one `ConfirmDialog` and one `Confirm` — and a third would have invented a third set. Every string is a prop and no component fetches anything, so the same file serves an app in any language.
- [`CHANGELOG.md`](CHANGELOG.md) — what changed in the language itself, versioned.

<br>

## 2. The short version

IBM Carbon's neutral greys for the ground and surfaces, one accent that means "this is happening" and nothing else, four state hues total, hierarchy from type and colour rather than borders, and every heading rendered as a filled section badge rather than bare text.

**Six axes belong to the user** — theme, corner shape, accent colour, rainbow, motion intensity and label mode — and every one of them is applied once at the app root, never by the page that edits it. Four resolve through a named engine, so nothing downstream has to know which setting produced the value it got: the **shape engine** (one radius token, no exception list), the **colour engine** (theme, accent and rainbow together), the **motion engine** (one set of duration and distance tokens feeding the same keyframes at every intensity) and the **label engine** (text, glyph or both, across three independent surfaces). Icons come from one shared assortment so a folder is the same folder in every app.

See [`docs/design-language.md`](docs/design-language.md) for the palette table and all twenty rules with their reasoning.

<br>

## 3. The engines

An engine is a single mechanism that turns one setting into every token a component reads, so nothing downstream has to know which setting produced the value it got. All four are applied once at the app root, never by the page that edits them — otherwise two pages would be free to disagree about how "square" looks.

| Engine | Drives | Set on `<html>` | Values | Default | Reference |
|---|---|---|---|---|---|
| **Shape** | corner shape | `data-shape` | `round` (16/10px) · `soft` (8/5px) · `square` (0) | `round` | [`tokens.css`](reference/tokens.css), [`appearance.ts`](reference/appearance.ts) |
| **Colour** | theme, accent, rainbow | `data-theme`, `--accent` | `light` · `dark` · unset (follows the OS); any accent, eight rainbow positions | system theme, Sunflower gold `#FCC419` | [`tokens.css`](reference/tokens.css), [`appearance.ts`](reference/appearance.ts), [`colorPicker.ts`](reference/colorPicker.ts) |
| **Motion** | motion intensity | `data-motion` | `off` · `subtle` · `wild`, plus `storm` below the picker's floor | `subtle` | [`tokens.css`](reference/tokens.css), [`appearance.ts`](reference/appearance.ts) |
| **Label** | how much of a control is shown | `data-labels-buttons`, `data-labels-sidebar`, `data-labels-tabs` | `text` · `textGlyph` · `glyph` · `reactive` | `textGlyph` | [`controls.ts`](reference/controls.ts) |

Three things are worth knowing before adopting them:

- **One token set each, no exception list.** Shape resolves every radius in the app through one token; motion resolves every duration and distance through another, feeding the *same* keyframes at every intensity. "Subtle" and "off" are smaller numbers, not forked animations.
- **Motion composes with `prefers-reduced-motion`, it never overrides it.** The OS signal stays unconditional and still wins; `data-motion` only resolves inside the `no-preference` block. A user who picks "off" without OS-level reduced motion gets the same numbers the reduced-motion block already uses.
- **Language is an axis, not an engine.** It sets `lang` and `dir`, which changes structure rather than resolving to a token set, so it deliberately stays outside this table.

A new control has to point its own CSS at these tokens as it is built. Adopting them is not automatic just because the tokens exist in the file, and the gap is invisible at the defaults: a hard-coded `rounded-full` and a shape-engine-correct `rounded-pill` render identically until somebody switches to square.

<br>

## 4. Easter eggs

The language has two, and they exist mostly to establish the rules that come with them.

**`storm`, a fourth motion level no picker lists.** Same keyframes as the other three with bigger numbers: page entrance 760ms over 34px on `cubic-bezier(.22, 1.94, .45, 1)`, and `springDamping: 0.34` on a phone. One token block, `:root[data-motion='storm']` in [`reference/tokens.css`](reference/tokens.css), is its entire cost.

**To find it: set the motion to the top level, then tap that same option five more times.** `stormTap()` in [`reference/appearance.ts`](reference/appearance.ts) is the whole mechanism. It is unreachable from any other level on purpose - tapping "off" five times means somebody is annoyed, not curious, and a secret that opens under annoyance is a bug report waiting to be filed.

**The rule, which is the part worth copying rather than the numbers: an easter egg that changes BEHAVIOUR must be switchable back off, and must not quietly become a permanent entry in a settings list.** The first build stored a "found it" flag, so one gesture added a fourth picker option for ever after - a secret turned into a setting somebody has to explain to themselves months later. What keeps it visible instead is the plain truth about the current state: it is offered while it is chosen, because a picker hiding the value it is showing would be lying, and otherwise only while that settings screen stays open. So `found` lives in the screen's own state and never in storage, while the chosen value persists like any other setting.

**`disco`, the colour engine's own: the eight rainbow colours step one position every second**, so every hued element moves to the next colour together while nothing else changes. It animates nothing — no keyframes, no new classes, just the rotation offset rainbow already carried, stepped on a timer. **To find it: turn Rainbow Mode on five times, each within three seconds of the last.** Only turn-ons count, which halves the clicks and leaves the gesture ending with rainbow ON, the one state where a walking palette is visible at all. `applyDisco()` and `discoTap()` in [`reference/appearance.ts`](reference/appearance.ts).

**A hidden switch may outrank the accessibility preference, and that reverses what this section said until 2026-09-15.** `storm` used to resolve only inside `@media (prefers-reduced-motion: no-preference)` like every other level. It no longer does: the `reduce` block exempts it from the gentler substitutes and restores the full animations for it, and disco carries no reduced-motion gate at all. The position on accessibility has not moved, the reading of the gesture has. The three levels a picker OFFERS keep obeying the OS unconditionally, because somebody who set reduced motion did not go looking for any of them — they got whichever one the app booted at. Five taps on an option already chosen, or five deliberate turn-ons of a mode, is not a value anybody inherited.

**Where that exemption lives is the whole design, and it has two halves.** It belongs in the `reduce` block, which swaps in gentler substitutes rather than switching motion off — those substitutes are the things that make the storm a storm. And exempting without RESTORING leaves the element with no animation at all, since the real rule sits in the block the media query replaced: quieter than the substitute just removed. Worse where the resting state is invisible, because then nothing takes its place on screen at all.

**The line both eggs stop at: anything continuous.** Wanting more movement is not wanting something that never stops, so the live-indicator pulse keeps its true stop at every level, and disco's one-second step stays well under the 3Hz flicker threshold photosensitivity guidance names.

An adopting app is free to have eggs of its own; they belong in that app's own notes, not here. What belongs here are the rules above, which apply to every one of them.

<br>

## 5. Adopting GlimStone in an app

1. Copy the `:root` / `[data-theme="light"]` blocks from [`reference/tokens.css`](reference/tokens.css) into the app's stylesheet.
2. Copy `.glim-card` / `.glim-well` / `.glim-eyebrow` / `.glim-num`, plus the base `body`/font rules and the scrollbar and focus rules, from the same file.
3. Add whatever tokens the app doesn't have yet — the full list is in the file's own comments and in the design-language doc's token table.
4. Replace hard-coded `rounded-lg` / `shadow-*` with `.glim-card`; fill the selected nav item, tab or segment with the accent.
5. For rainbow, copy [`reference/appearance.ts`](reference/appearance.ts) as-is.
6. For the label engine, copy [`reference/controls.ts`](reference/controls.ts) as-is, and call `applyStoredLabelModes()` at the app root before first render — not from the settings page that edits it, or the app opens in the default mode and snaps over on load.
7. For icons, generate from [`reference/glyphs.md`](reference/glyphs.md) rather than copying SVGs, and take its sizing rules with them: artwork from different sets fills its own viewBox by wildly different amounts, so a set assembled without normalising arrives on screen at several sizes.
8. For the controls themselves, copy [`reference/react/`](reference/react/) as a folder and register the app's own icons through its `setGlyphResolver`. This is the step that decides whether two apps end up the same: rebuilt from the prose, the same switch becomes `Toggle` in one app and `Switch` inside a shared `Field.tsx` in the next, and every rule in this repo then has to be applied by hand in both.

Nothing else is required — component markup stays as it is, because every colour already flows through a token. Full detail (including the three traps that have bitten every adopter so far) is in [`docs/design-language.md`](docs/design-language.md#adopting-glimstone-in-another-app).

<br>

## 6. Where per-app detail lives

This repository is deliberately app-agnostic. Anything true for only one app — its exact token names if they diverge from the reference, class prefixes, measured pixel values, quirks of a specific host UI it runs inside — belongs in that app's own style guide, not here. If the same rule shows up in both places, it gets deleted from the app-specific one: universal belongs here, an exception belongs there.

<br>

## 7. Versioning

GlimStone the language is versioned independently of any app that adopts it — a rule added here doesn't imply every adopting app has picked it up yet. See [`CHANGELOG.md`](CHANGELOG.md) for what changed and when.

<br>

## 8. License

**Copyright (C) 2026 Junker der Provinz.**

GlimStone is free software under the **GNU Affero General Public License v3.0** (AGPL-3.0); see [LICENSE](LICENSE). You may run, study, share and modify it. If you distribute it, or run a modified version as a network service, you must release your source under the same AGPL-3.0 terms and keep the existing copyright and attribution notices intact.

**Name and branding are not licensed.** The AGPL covers the source and documentation only. "GlimStone", its logo and its branding remain reserved: a fork or derivative must use its own distinct name and branding, and may not present itself as GlimStone. This keeps it unambiguous which project is the original.

<br>

## 9. How AI is used here

One knight builds this, and AI is one of the tools I work with, the same way I work with an editor or a compiler. It helps me write code and documentation and it checks my work, and that saves me a good many evenings. It does not make the decisions, though. I read and understand everything before it ships, and if something here breaks, that is on me and not on the tool.

You do not have to take my word for it. The code is open and every release note is written by hand. The issue tracker shows how problems actually get handled, including the ones I got wrong the first time. If you find something that is not right, open an issue and I will look at it.

<br>

## 10. Support this project

Bugs, ideas or questions? Please [open a GitHub issue](https://github.com/junkerderprovinz/glimstone/issues).

A one-knight job: I build it, keep it running, work through the issues and add what people ask for, until nothing is missing. It is free, with no accounts, no telemetry, no ads and no paid tier. No asterisk anywhere. Nothing readable ever leaves your own walls. Forged on evenings and weekends, with heart and stubbornness.

If it has earned a place on your server or computer, toss a coin to your knight: it helps cover the costs and keeps the project alive. It also makes this knight's heart beat a little faster. Three ways below, whichever suits you.

<p align="center">
  <a href="https://buymeacoffee.com/junkerderprovinz"><img src="https://raw.githubusercontent.com/junkerderprovinz/junkerderprovinz/main/donate/buttons/give.svg#svgView(viewBox(0,0,841.9,245.3))" alt="Buy me a coffee" width="160" height="46.62"></a>
  &nbsp;
  <a href="https://www.paypal.com/donate/?hosted_button_id=76FVV52TKXTUS"><img src="https://raw.githubusercontent.com/junkerderprovinz/junkerderprovinz/main/donate/buttons/give.svg#svgView(viewBox(841.9,0,841.9,245.3))" alt="PayPal" width="160" height="46.62"></a>
  &nbsp;
  <a href="https://junkerderprovinz.github.io/junkerderprovinz/"><img src="https://raw.githubusercontent.com/junkerderprovinz/junkerderprovinz/main/donate/buttons/give.svg#svgView(viewBox(1683.8,0,841.9,245.3))" alt="Donate with crypto" width="160" height="46.62"></a>
</p>
