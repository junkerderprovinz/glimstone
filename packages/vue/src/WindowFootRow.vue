<script setup lang="ts">
import { computed } from "vue";
import { windowFoot } from "@glimstone/core";
import Button from "./Button.vue";
import { IconCancel, IconClose } from "./glyphs";
import type { WindowAction } from "./windowParts";

// The foot of a Window or a Sheet: a quiet start line and the actions at the
// end, with Cancel or Close added by windowFoot() in the core. The `start` slot
// takes markup for the start line.
const props = defineProps<{
  actions: WindowAction[];
  start?: string;
  hasStart: boolean;
  text: { cancel: string; close: string };
}>();
const emit = defineEmits<{ close: [] }>();

const foot = computed(() =>
  windowFoot<WindowAction>(props.actions, props.hasStart, {
    cancel: { label: props.text.cancel, labelKey: "common.cancel", glyph: IconCancel, wayOut: true },
    close: { label: props.text.close, labelKey: "common.close", glyph: IconClose, wayOut: true },
  }),
);

function press(action: WindowAction) {
  if (action.onClick?.() !== false) emit("close");
}
</script>

<template>
  <div v-if="foot.length" class="glim-modal-foot">
    <span v-if="hasStart" class="glim-window-start"><slot name="start">{{ start }}</slot></span>
    <Button
      v-for="(a, i) in foot"
      v-bind="a.attrs"
      :key="i"
      :label="a.label"
      :label-key="a.labelKey"
      :glyph="a.glyph"
      :tone="a.primary ? 'accent' : 'neutral'"
      :disabled="a.disabled"
      @click="press(a)"
    />
  </div>
</template>
