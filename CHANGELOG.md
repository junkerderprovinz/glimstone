# Changelog

All notable changes to the GlimStone design language are documented here. Versioned independently of any app that adopts it.

## 1.0.0 — 2026-08-17

### ✨ Added

- Initial repository. Extracted the design language out of KnightLoader, where it had lived as `docs/design-language.md` + `web/src/index.css` + `web/src/lib/appearance.ts` since 2026-08-06, and merged it with the more complete rule set that had since evolved in the vault-only style guide (rules 9 through 19: three-way colour modes, section badges, content-edge alignment, everything-clickable-is-a-badge, borderless form fields, the window contract, hover-survives-hover, no forced `display`, replace-not-persuade, shared-box grouping — none of which had made it back into the KnightLoader repo copy).
- [`docs/design-language.md`](docs/design-language.md) — the full spec, all nineteen rules, the palette, the name's etymology, componentry (info bubble, horizontal selector, switches, the reveal eye, foreign-host-UI plugins), the two user-owned axes, the rainbow colour-mode system and its three known traps, the token contract, and the adoption steps.
- [`reference/tokens.css`](reference/tokens.css) — framework-free reference tokens and utility classes.
- [`reference/tailwind-theme.css`](reference/tailwind-theme.css) — the optional Tailwind v4 `@theme` mapping layer, split out from the framework-free tokens so a non-Tailwind app can skip it entirely.
- [`reference/appearance.ts`](reference/appearance.ts) — the shape/accent/rainbow logic, genericised from KnightLoader's copy (cache key, code comments) so it drops into any adopting app unchanged.

### 🎨 Design

- This is the first version to carry a token reference table and an explicit utility-class list (`.glim-hue-icon`, `.glim-tint`, `.glim-page-enter`, `.glim-toast`, `.glim-fade`, `.glim-live`) alongside the rules — previously only implicit in the CSS itself.
