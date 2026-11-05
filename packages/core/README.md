# @glimstone/core

The part of [GlimStone](https://junkerderprovinz.github.io/glimstone/) that
needs no framework: the tokens, the glyphs, and the logic of every engine and
component. `@glimstone/react` and `@glimstone/vue` are thin wrappers around it,
and a page without a framework, such as an Unraid plugin, uses it directly.

```sh
npm install @glimstone/core
```

- `tokens.css` is the palette and every component class as CSS custom
  properties, where the shape, colour and motion engines resolve to values.
  Load it before the app's own stylesheet. `tailwind-theme.css` maps the tokens
  onto Tailwind v4 utilities for an app that uses Tailwind.
- `glyphs.json` and `glyphs.md` are the glyph assortment: which mark means
  what, where each comes from, and the sizing rules that make them one set.
- The engines: `appearance` (shape, accent, rainbow, motion), `controls` (the
  label engine and its width stages) and `setStoragePrefix`, which keeps an
  app's own names for what it stores.
- What a component shows, as functions: `buttonView`, `badgeClassName`, the
  select's list model, the Info tile's version links and update check, the
  README button's classes, where a bubble goes, a dialog's keys and the toast
  queue.
- What a text field and its row share: `textFieldClass` and `fieldWidthClass`
  say how a field looks and how wide it is, `pressRowControl` does what a click
  on a row's label does, `treeRows` and `treeStep` hold a tree's rows and keys, and
  `tableCellClass` says what a table's cell wears.
- What windows and menus share: `windowFoot` adds the way out, `stackWindow`
  gives Escape and Tab to the window in front, and `menu.ts` holds the menu
  model with `tidyMenu`, `menuRowView`, `placeMenu`, `menuMove`,
  `focusFirstMenuRow` and `claimMenu`. `menuIsOpen` and `windowIsOpen` tell an app's own key handler
  to stand back.
- What fields and bars share: `meterView` and `progressView` for a Meter and a
  ProgressBar, `copyText` with its fallback for plain http, and for the
  ColorPicker `floatColorPicker`, `placeColorPicker` and `nearestColorName`,
  which finds the closest name in OKLab in a list such as `COLOR_NAMES_DE`.
- What runs without a framework: `mountSelect`, `wireTooltips` with
  `infoIcon`, `openColorPickerPopover`, `attachNumberSteppers`,
  `enableSelectScroll` and `flagEmoji`.

The whole language, with the reasons behind each rule, is in
[docs/design-language.md](https://github.com/junkerderprovinz/glimstone/blob/main/docs/design-language.md).
