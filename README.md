<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/glimstone-banner-dark.png">
    <img src=".github/assets/glimstone-banner.png" alt="GlimStone" width="100%">
  </picture>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-AGPL--3.0-blue?style=for-the-badge&logo=gnu&logoColor=white" alt="License: AGPL-3.0" height="36"></a>
</p>

<p align="center">The shared design language behind a family of apps by the same author: a layered, low-noise interface system built on IBM Carbon's neutral palette, four engines a user drives from the app root (shape, colour, motion, labels), one shared glyph assortment, and a house style for componentry (cards, tabs, switches, the info bubble, the reveal eye).</p>

<p align="center">
  <a href="https://buymeacoffee.com/junkerderprovinz">
    <img src=".github/assets/button-buy-me-a-coffee.svg" alt="Buy me a coffee" width="220">
  </a>
</p>

This repository is the canonical source — the written spec, and the reference token files an adopting app copies from. It has no build step and ships no package; adoption is copy-and-paste by design, so a plain-CSS Unraid plugin and a React/Tailwind app can both read the same design language without sharing a runtime.

GlimStone documents a house style shared across the author's own apps. It's published for reference and transparency rather than as a general-purpose design system for outside adoption — see [`docs/design-language.md`](docs/design-language.md) for the full reasoning and everything else.

<br>

## Contents

1. [What's in this repo](#1-whats-in-this-repo)
2. [The short version](#2-the-short-version)
3. [The engines](#3-the-engines)
4. [Adopting GlimStone in an app](#4-adopting-glimstone-in-an-app)
5. [Where per-app detail lives](#5-where-per-app-detail-lives)
6. [Versioning](#6-versioning)
7. [License](#7-license)
8. [Support this project](#8-support-this-project)

<br>

## 1. What's in this repo

- [`docs/design-language.md`](docs/design-language.md) — the full spec: the palette, the name and its etymology, all twenty rules, the componentry vocabulary (info bubble, horizontal selector, switches, the reveal eye, badges, toasts, empty states, destructive actions, charts), all four engines, the token contract, and the adoption steps. This is the document to read start to finish; everything below just points back into it.
- [`reference/tokens.css`](reference/tokens.css) — the palette and component classes as plain CSS custom properties, and where the shape, colour and motion engines resolve to actual values. No build step, no framework. Copy the parts an app needs.
- [`reference/tailwind-theme.css`](reference/tailwind-theme.css) — the optional Tailwind v4 `@theme` layer that maps the tokens onto utility classes. Skip it entirely on a non-Tailwind app.
- [`reference/appearance.ts`](reference/appearance.ts) — the shape/accent/rainbow logic. Framework-free (talks only to `document.documentElement` and `localStorage`), so it drops into any app unchanged.
- [`reference/controls.ts`](reference/controls.ts) — the label engine: four modes (text, text+glyph, glyph, reactive) across three independent surfaces, plus the width stages that let a mode change happen without the page reflowing. Framework-free the same way.
- [`reference/colorPicker.ts`](reference/colorPicker.ts) — the floating saturation/value picker, drawn in the app's own DOM. Never a native `<input type="color">`, which hands off to a surface outside the page.
- [`reference/numberField.ts`](reference/numberField.ts) — in-field steppers for a plain `<input type="number">`, driving the input's own `stepUp()`/`stepDown()` so min/max/step stay in the markup.
- [`reference/tooltip.ts`](reference/tooltip.ts) — the shared tooltip and info-bubble mechanism, so an explanation never becomes a native `title` balloon.
- [`reference/selectScroll.ts`](reference/selectScroll.ts) — keeps a long option list scrollable without the list deciding the page's height.
- [`reference/flagEmoji.ts`](reference/flagEmoji.ts) — turns an ISO 3166-1 alpha-2 code into its regional-indicator emoji, for language options a native `<option>` can actually hold.
- [`reference/glyphs.md`](reference/glyphs.md) — the shared glyph assortment: which icon means what, where each comes from and under which licence, and the sizing rules that make a set of icons read as one set.
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
| **Motion** | motion intensity | `data-motion` | `off` · `subtle` · `full` | `full` | [`tokens.css`](reference/tokens.css) |
| **Label** | how much of a control is shown | `data-labels-buttons`, `data-labels-sidebar`, `data-labels-tabs` | `text` · `textGlyph` · `glyph` · `reactive` | `textGlyph` | [`controls.ts`](reference/controls.ts) |

Three things are worth knowing before adopting them:

- **One token set each, no exception list.** Shape resolves every radius in the app through one token; motion resolves every duration and distance through another, feeding the *same* keyframes at every intensity. "Subtle" and "off" are smaller numbers, not forked animations.
- **Motion composes with `prefers-reduced-motion`, it never overrides it.** The OS signal stays unconditional and still wins; `data-motion` only resolves inside the `no-preference` block. A user who picks "off" without OS-level reduced motion gets the same numbers the reduced-motion block already uses.
- **Language is an axis, not an engine.** It sets `lang` and `dir`, which changes structure rather than resolving to a token set, so it deliberately stays outside this table.

A new control has to point its own CSS at these tokens as it is built. Adopting them is not automatic just because the tokens exist in the file, and the gap is invisible at the defaults: a hard-coded `rounded-full` and a shape-engine-correct `rounded-pill` render identically until somebody switches to square.

<br>

## 4. Adopting GlimStone in an app

1. Copy the `:root` / `[data-theme="light"]` blocks from [`reference/tokens.css`](reference/tokens.css) into the app's stylesheet.
2. Copy `.glim-card` / `.glim-well` / `.glim-eyebrow` / `.glim-num`, plus the base `body`/font rules and the scrollbar and focus rules, from the same file.
3. Add whatever tokens the app doesn't have yet — the full list is in the file's own comments and in the design-language doc's token table.
4. Replace hard-coded `rounded-lg` / `shadow-*` with `.glim-card`; fill the selected nav item, tab or segment with the accent.
5. For rainbow, copy [`reference/appearance.ts`](reference/appearance.ts) as-is.
6. For the label engine, copy [`reference/controls.ts`](reference/controls.ts) as-is, and call `applyStoredLabelModes()` at the app root before first render — not from the settings page that edits it, or the app opens in the default mode and snaps over on load.
7. For icons, generate from [`reference/glyphs.md`](reference/glyphs.md) rather than copying SVGs, and take its sizing rules with them: artwork from different sets fills its own viewBox by wildly different amounts, so a set assembled without normalising arrives on screen at several sizes.

Nothing else is required — component markup stays as it is, because every colour already flows through a token. Full detail (including the three traps that have bitten every adopter so far) is in [`docs/design-language.md`](docs/design-language.md#adopting-glimstone-in-another-app).

<br>

## 5. Where per-app detail lives

This repository is deliberately app-agnostic. Anything true for only one app — its exact token names if they diverge from the reference, class prefixes, measured pixel values, quirks of a specific host UI it runs inside — belongs in that app's own style guide, not here. If the same rule shows up in both places, it gets deleted from the app-specific one: universal belongs here, an exception belongs there.

<br>

## 6. Versioning

GlimStone the language is versioned independently of any app that adopts it — a rule added here doesn't imply every adopting app has picked it up yet. See [`CHANGELOG.md`](CHANGELOG.md) for what changed and when.

<br>

## 7. License

**Copyright (C) 2026 Junker der Provinz.**

GlimStone is free software under the **GNU Affero General Public License v3.0** (AGPL-3.0); see [LICENSE](LICENSE). You may run, study, share and modify it. If you distribute it, or run a modified version as a network service, you must release your source under the same AGPL-3.0 terms and keep the existing copyright and attribution notices intact.

**Name and branding are not licensed.** The AGPL covers the source and documentation only. "GlimStone", its logo and its branding remain reserved: a fork or derivative must use its own distinct name and branding, and may not present itself as GlimStone. This keeps it unambiguous which project is the original.

<br>

## 8. Support this project

Bugs, ideas or questions? Please [open a GitHub issue](https://github.com/junkerderprovinz/glimstone/issues).

This is a one-person project, maintained in whatever free time is available. If it's been useful as a reference, you're welcome to buy me a coffee.

<p align="center">
  <a href="https://buymeacoffee.com/junkerderprovinz">
    <img src=".github/assets/button-buy-me-a-coffee.svg" alt="Buy me a coffee" width="220">
  </a>
</p>
