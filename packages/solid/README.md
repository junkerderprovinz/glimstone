# @glimstone/solid

The components of [GlimStone](https://junkerderprovinz.github.io/glimstone/) for
Solid, on `@glimstone/core`. They are the components of `@glimstone/react`
with the same names, the same props and defaults, the same behaviour contracts
and the same markup, so an app moves between the two by changing its imports.

```sh
npm install @glimstone/core @glimstone/solid
```

```tsx
import "@glimstone/core/tokens.css";
import { createSignal } from "solid-js";
import { applyCachedAppearance, applyStoredLabelModes } from "@glimstone/core";
import { Button, Toggle, setGlyphResolver, useConfirm } from "@glimstone/solid";
import { Select } from "@glimstone/solid/Select";

applyCachedAppearance();
applyStoredLabelModes();
setGlyphResolver((key) => appGlyph(key));

function Settings() {
  const [quiet, setQuiet] = createSignal(true);
  const [zone, setZone] = createSignal<string | null>("Europe/Vienna");
  const { confirm, confirmDialog } = useConfirm({ title: "Confirm", cancel: "Cancel", confirm: "Confirm" });
  return (
    <>
      <Toggle label="Quiet notifications" checked={quiet()} onChange={setQuiet} />
      <Select label="Time zone" value={zone()} onChange={setZone} options={zones} />
      <Button label="Delete" labelKey="delete" onClick={() => confirm("Delete the snapshot?")} />
      {confirmDialog}
    </>
  );
}
```

- Values are controlled as in React: `checked` or `value` with `onChange`.
- `class` takes the place of `className`, and attributes such as `id` or
  `aria-*` go to the element as in React.
- Markup props take a `JSX.Element`. A Solid node stands in one place only, so
  the resolver given to `setGlyphResolver` draws a new glyph on every call, and
  a glyph that shows on a select's trigger and in its list is a function.
- The engines are primitives in the shape of `createSignal`: `useLabelMode`
  returns an accessor, and `useRainbow`, `useShape`, `useMotion`, `useAccent`
  and `useDensity` return an accessor and a setter that writes the document.
- Portalled parts, such as bubbles, menus and windows, go straight into the
  body or the open sheet, without the wrapper Solid's `Portal` would add.
- `Select`, `Combobox` and `Slider` come from their own entries and need
  `@zag-js/solid` with their machine packages (`@zag-js/select` and
  `@zag-js/menu`, `@zag-js/combobox`, `@zag-js/slider`).
