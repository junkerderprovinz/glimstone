<script setup lang="ts">
import { computed, type Component } from "vue";
import { CONNECTION_ROW_KEYS, connectionTestFace, connectionTile, type ConnectionRowLabelKeys, type ConnectionRowText, type ConnectionTest, type TileMark } from "@glimstone/core";
import BrandMark from "./BrandMark.vue";
import Button from "./Button.vue";
import { IconCheck, IconClose } from "./glyphs";

// A connected service or account as a compact row ("Connections" in the design
// language): its mark lit on a tile the row's whole height, its name with the
// `badges` slot, one quiet line on how it stands, the default slot for more
// lines, and its test, edit and remove at the end. A button stands only where
// its listener is passed.
const props = defineProps<{
  /** The service's name, also the row's accessible name. */
  name: string;
  /** A brand's mark from a catalog, which stands on its own colour, or one of the app's glyphs, which stands on the accent. */
  mark: TileMark | Component;
  /** One quiet line under the name, such as who is signed in or where it connects. */
  status?: string;
  /** Where the test stands: `busy` while it runs, then `tone` and a `title` with what it found. */
  test?: ConnectionTest;
  text: ConnectionRowText;
  labelKeys?: Partial<ConnectionRowLabelKeys>;
  onTest?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
}>();

// On a phone the buttons show their glyphs alone, so they keep to one line.
const NARROW = 640;

const keys = computed(() => ({ ...CONNECTION_ROW_KEYS, ...props.labelKeys }));
const tile = computed(() => connectionTile(props.mark));
const face = computed(() => connectionTestFace(props.test));
const outcome = computed(() => (face.value.outcome === "check" ? IconCheck : face.value.outcome === "cross" ? IconClose : undefined));
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
        <span v-if="onTest || onEdit || onRemove" class="glim-connection-actions">
          <Button
            v-if="onTest"
            :label="text.test"
            :label-key="keys.test"
            :glyph="outcome"
            :tone="face.tone"
            :busy="test?.busy"
            :title="test?.title"
            :compact-below="NARROW"
            :class="{ 'glim-shake': face.shake }"
            data-connection="test"
            @click="onTest"
          />
          <Button v-if="onEdit" :label="text.edit" :label-key="keys.edit" :compact-below="NARROW" data-connection="edit" @click="onEdit" />
          <Button v-if="onRemove" :label="text.remove" :label-key="keys.remove" :compact-below="NARROW" data-connection="remove" @click="onRemove" />
        </span>
      </div>
    </div>
  </div>
</template>
