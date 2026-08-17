# Changelog

All notable changes to the GlimStone design language are documented here. Versioned independently of any app that adopts it.

## 1.1.0 — 2026-08-17

### ✨ Added

- **The user-owned axes, expanded from two to four.** Theme (light/dark/system, default system) and language now get the same explicit governance as shape and accent: applied once at the app root, never by the page that edits them. The accent's default — Sunflower gold `#FCC419` on first install, before anyone touches the picker — is now stated in prose, not just implied by a table annotation.
- **Right-to-left languages**, promoted from a single aside on the horizontal selector to its own section: logical properties handle most of the mirroring for free, but technical content (paths, URLs, filenames, log lines) stays pinned `dir="ltr"` + `text-align: start` regardless of page direction, and directional icons mirror while symmetric ones don't.
- **Non-Latin scripts**: how the font stack's fallback actually works (per-glyph, not a fixed named list), plus two concrete fixes — CJK letter-spacing reset (the base tightening reads as crowding on full-width glyphs) and a note that `.glim-num`'s tabular-figure feature is a Latin-digit convention with no defined effect on other numeral systems.
- A banner (`.github/assets/`), generated procedurally rather than hand-illustrated: a faceted gold gem set into fractured stone, the name's own etymology drawn literally. The gem is the constant core across both theme variants; only the rock's tone swaps to keep reading against its background — the same pattern every other logo pair in this house style follows.

### 🐛 Fixed

- `reference/tokens.css` was missing the base `body` rule (background, font stack, letter-spacing) and `* { box-sizing: border-box; }` entirely — dropped during the original extraction from KnightLoader's `index.css`. An app following the adoption steps literally would have gotten every component class but not the page-level defaults they assume.
- Generalised the few remaining named references to specific sibling apps (README opener, the info-bubble and horizontal-selector sections) — this document was already meant to be app-agnostic; the wording hadn't fully caught up.

## 1.0.0 — 2026-08-17

### ✨ Added

- Initial repository. Extracted the design language out of KnightLoader, where it had lived as `docs/design-language.md` + `web/src/index.css` + `web/src/lib/appearance.ts` since 2026-08-06, and merged it with the more complete rule set that had since evolved in the vault-only style guide (rules 9 through 19: three-way colour modes, section badges, content-edge alignment, everything-clickable-is-a-badge, borderless form fields, the window contract, hover-survives-hover, no forced `display`, replace-not-persuade, shared-box grouping — none of which had made it back into the KnightLoader repo copy).
- [`docs/design-language.md`](docs/design-language.md) — the full spec, all nineteen rules, the palette, the name's etymology, componentry (info bubble, horizontal selector, switches, the reveal eye, foreign-host-UI plugins), the two user-owned axes, the rainbow colour-mode system and its three known traps, the token contract, and the adoption steps.
- [`reference/tokens.css`](reference/tokens.css) — framework-free reference tokens and utility classes.
- [`reference/tailwind-theme.css`](reference/tailwind-theme.css) — the optional Tailwind v4 `@theme` mapping layer, split out from the framework-free tokens so a non-Tailwind app can skip it entirely.
- [`reference/appearance.ts`](reference/appearance.ts) — the shape/accent/rainbow logic, genericised from KnightLoader's copy (cache key, code comments) so it drops into any adopting app unchanged.

### 🎨 Design

- This is the first version to carry a token reference table and an explicit utility-class list (`.glim-hue-icon`, `.glim-tint`, `.glim-page-enter`, `.glim-toast`, `.glim-fade`, `.glim-live`) alongside the rules — previously only implicit in the CSS itself.
