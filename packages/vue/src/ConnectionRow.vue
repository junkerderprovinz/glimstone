<script setup lang="ts">
import { computed, type Component } from "vue";
import { connectionButtons, connectionTestFace, connectionTile, type ConnectionRowLabelKeys, type ConnectionRowText, type ConnectionTest, type TileMark } from "@glimstone/core";
import BrandMark from "./BrandMark.vue";
import Button from "./Button.vue";
import { IconCheck, IconClose } from "./glyphs";
import type { ConnectionAction } from "./windowParts";

// A connected service or account as a compact row ("Connections" in the design
// language): its mark lit on a tile the row's whole height, its name with the
// `badges` slot, one quiet line on how it stands, the default slot for more
// lines, and at the end the app's own actions, then its test, edit and remove.
// A built-in button stands only where its listener is passed.
const props = defineProps<{
  /** The service's name, also the row's accessible name. */
  name: string;
  /** A brand's mark from a catalog, which stands on its own colour, or one of the app's glyphs, which stands on the accent. */
  mark: TileMark | Component;
  /** One quiet line under the name, such as who is signed in or where it connects. */
  status?: string;
  /** Where the test stands: `busy` while it runs, then `tone` and a `title` with what it found. */
  test?: ConnectionTest;
  /** Buttons of the app's own, such as Mount, before Test, Edit and Remove, so those keep their places at the end. */
  actions?: ConnectionAction[];
  text: ConnectionRowText;
  labelKeys?: Partial<ConnectionRowLabelKeys>;
  onTest?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
}>();

// On a phone the buttons show their glyphs alone, so they keep to one line.
const NARROW = 640;

const tile = computed(() => connectionTile(props.mark));
const buttons = computed(() =>
  connectionButtons(props).map((b) => {
    const face = connectionTestFace(b);
    return { ...b, face, glyph: face.outcome === "check" ? IconCheck : face.outcome === "cross" ? IconClose : b.glyph };
  }),
);
</script>

<template>
  <div data-glim="ConnectionRow" role="group" :aria-label="name" class="glim-well glim-connection">
    <span class="glim-connection-tile" :style="tile.style" aria-hidden="true">
      <span class="glim-connection-mark">
        <BrandMark v-if="tile.svg !== undefined" :svg="tile.svg" />
        <component :is="mark" v-else />
      </span>
    </span>
    <div class="glim-connection-main">
      <div class="glim-connection-head">
        <span class="glim-connection-name">{{ name }}</span>
        <span v-if="$slots.badges" class="glim-connection-badges"><slot name="badges" /></span>
      </div>
      <div class="glim-connection-foot">
        <div class="glim-connection-about">
          <p v-if="status" class="glim-connection-status">{{ status }}</p>
          <slot />
        </div>
        <span v-if="buttons.length > 0" class="glim-connection-actions">
          <Button
            v-for="b in buttons"
            :key="b.id"
            :label="b.label"
            :label-key="b.labelKey"
            :glyph="b.glyph"
            :tone="b.face.tone"
            :busy="b.busy"
            :title="b.title"
            :disabled="b.disabled"
            :compact-below="NARROW"
            :class="{ 'glim-shake': b.face.shake }"
            :data-connection="b.id"
            @click="b.onClick"
          />
        </span>
      </div>
    </div>
  </div>
</template>
