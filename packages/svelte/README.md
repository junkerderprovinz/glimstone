# @glimstone/svelte

The components of [GlimStone](https://junkerderprovinz.github.io/glimstone/) for
Svelte 5, on `@glimstone/core`. They are the components of `@glimstone/react`
with the same names, the same props and defaults, the same behaviour contracts
and the same markup, written with runes.

```sh
npm install @glimstone/core @glimstone/svelte
```

```ts
import "@glimstone/core/tokens.css";
import { applyCachedAppearance, applyStoredLabelModes } from "@glimstone/core";
import { setGlyphResolver } from "@glimstone/svelte";

applyCachedAppearance();
applyStoredLabelModes();
setGlyphResolver((key) => appGlyph(key));
```

```svelte
<script lang="ts">
  import { Button, Toggle, useConfirm } from "@glimstone/svelte";
  import { Select } from "@glimstone/svelte/Select";

  let quiet = $state(true);
  let zone = $state<string | null>("Europe/Vienna");
  const ask = useConfirm({ title: "Confirm", cancel: "Cancel", confirm: "Confirm" });
</script>

<Toggle bind:checked={quiet} label="Quiet notifications" />
<Select bind:value={zone} label="Time zone" options={zones} />
<Button label="Delete" labelKey="delete" onClick={() => ask.confirm("Delete the snapshot?")} />
<ask.confirmDialog />
```

- A value binds with `bind:value`, `bind:checked` or `bind:open`, and the
  component still reports each change through React's callback, such as
  `onChange`.
- Events are callback props with React's names (`onClick`, `onChange`,
  `onOpenChange`). `class` and attributes such as `id` or `aria-*` go to the
  element.
- Markup props are snippets, and so are glyphs: `setGlyphResolver` returns one,
  which `createRawSnippet` builds from an SVG string, and `IconClose` and the
  other marks are snippets too.
- The engines are boxes whose `current` follows the document and writes back
  through the core: `useLabelMode`, `useRainbow`, `useShape`, `useMotion`,
  `useAccent`, `useDensity`, and `useHue` to read a rainbow position.
- `Select`, `Combobox` and `Slider` come from their own entries and need
  `@zag-js/svelte` with their machine packages (`@zag-js/select` and
  `@zag-js/menu`, `@zag-js/combobox`, `@zag-js/slider`).
- The package ships its `.svelte` sources, built by `svelte-package`, so the
  app's own Svelte compiles them.
