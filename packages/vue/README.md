# @glimstone/vue

The components of [GlimStone](https://junkerderprovinz.github.io/glimstone/) for
Vue 3, on `@glimstone/core`. They are the same components as `@glimstone/react`,
with the same names, the same behaviour contracts and the same look, as
single-file components.

```sh
npm install @glimstone/core @glimstone/vue
```

```ts
import "@glimstone/core/tokens.css";
import { applyCachedAppearance, applyStoredLabelModes } from "@glimstone/core";
import { setGlyphResolver } from "@glimstone/vue";

applyCachedAppearance();
applyStoredLabelModes();
setGlyphResolver((key) => appGlyphs[key]);
```

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Toggle, useConfirm } from "@glimstone/vue";
import { Select } from "@glimstone/vue/Select";

const quiet = ref(true);
const zone = ref<string | null>("Europe/Vienna");
const { confirm, ConfirmHost } = useConfirm({ title: "Confirm", cancel: "Cancel", confirm: "Confirm" });
</script>

<template>
  <Toggle v-model="quiet" label="Quiet notifications" />
  <Select v-model="zone" label="Time zone" :options="zones" />
  <Button label="Delete" label-key="delete" @click="confirm('Delete the snapshot?')" />
  <ConfirmHost />
</template>
```

- Values bind with `v-model`; listeners and attributes such as `@click`,
  `class` and `aria-*` fall through to the element.
- A glyph is a component: `setGlyphResolver` returns one, and a `glyph` prop
  takes one.
- The engines are composables: `useLabelMode`, `useRainbow`, `useShape`,
  `useMotion`, `useAccent` and `useHue`, each a writable ref that follows the
  document.
- A component that waits for the app's answer, such as `SignInCard` or `Fortress`, takes
  async callbacks as props (`:on-sign-in`, or `@sign-in`, which Vue binds to the
  same prop), since an emitted event cannot answer.
- `Select`, `Combobox` and `Slider` come from their own entries and need
  `@zag-js/vue` with their machine packages (`@zag-js/select` and
  `@zag-js/menu`, `@zag-js/combobox`, `@zag-js/slider`).
- Vue counts `useId()` per app. A page that mounts several Vue apps gives each
  its own `app.config.idPrefix`.
