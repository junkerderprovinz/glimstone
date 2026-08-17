# Changelog

All notable changes to the GlimStone design language are documented here. Versioned independently of any app that adopts it.

## 1.4.0 — 2026-08-18

### ✨ Added

- **Five new sections extracted from real, working code rather than invented:** Badges (four shape registers, named size stages with one canonical source, the pixel-parity-across-element-types discipline, the `font-size: 0` + `vertical-align: middle` trap — generalised from CannonadeCommand's production badge system, previously only in its app-specific subnote), Toasts (duration, stacking, hover-pauses-and-preserves-remaining-time, severity-filtered quiet mode, toast-vs-dedicated-surface judgement — from KnightLoader's `lib/toast.tsx`), Empty states (the shared `EmptyState` shape, and the zero-items-vs-zero-matches copy distinction), Destructive and confirmable actions (reversible fires immediately, irreversible gets a real modal stating exact stakes, the control is always the fault colour), and Charts, marked provisional since only one example (a speed graph) currently exists.
- A short technique note in `reference/tokens.css`: cap a pill radius against the element's own height (`min(var(--radius-pill), 50%)`) rather than applying the raw token, so a compact badge doesn't over-round into a lozenge.

## 1.3.0 — 2026-08-18

### ✨ Added

- **Repository made public**, with the license and funding files that implies: AGPL-3.0 (name and branding reserved, matching every other own-named product repo), `FUNDING.yml`, a License badge, and the Buy Me a Coffee button top and bottom.
- **Chosen mark: one lit block in a 3x3 grid of stone blocks** — literal to this document's own opening line. Replaces the faceted-gem concept from 1.1.0/1.2.0's banner, after drafting it alongside two other concepts (a seal with a sunburst was the other finalist) for comparison.

### 🎨 Design

- Dropped the "private, internal" framing from the README; GlimStone is now published for reference and transparency, though still not positioned as a general-purpose design system seeking outside adopters.

## 1.2.0 — 2026-08-18

### ✨ Added

- **Named the two existing mechanisms and added a third.** Shape was already called "the shape engine" in passing; formalised that, and named the theme/accent/rainbow mechanism **the colour engine** (one mechanism, three inputs, all resolving to the same handful of tokens). Added **the motion engine** as its own section — it existed as CSS (four keyframes, a `prefers-reduced-motion` block, rule 10) but was never documented as a system with its own timing rationale.
- A short "engines we don't have" note explaining why browser-engine differences (Chromium/Gecko/WebKit) stay out of scope: everything GlimStone does runs through standard CSS media queries and custom properties, which behave identically across engines — engine-specific branching is an application concern, not a design-language one.

### 🐛 Fixed

- `.glim-live`'s pulse had no `prefers-reduced-motion` fallback at all — an infinite 2s animation is exactly the category that preference exists for, unlike the one-shot entrances that already degraded correctly. It now renders as a static, fully-opaque dot under reduced motion instead of continuing to pulse.

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
