<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, useSlots, watch } from "vue";
import { openSheet } from "@glimstone/core";
import Badge from "./Badge.vue";
import type { WindowAction } from "./windowParts";
import WindowFootRow from "./WindowFootRow.vue";

// A panel at the end edge, or rising from the bottom on a phone, for the
// details of a row or a longer form beside the list. It is a <dialog> shown
// modal: the page behind it is inert, Escape and a press on the scrim close it,
// and focus goes back to the control that opened it. Its foot works as a
// Window's, with Cancel or Close added, so it has no close mark in its head.
const props = withDefaults(
  defineProps<{
    open: boolean;
    /** The notch's words, also the sheet's accessible name. */
    title: string;
    /** The foot's buttons, in reading order, as a Window's. */
    actions?: WindowAction[];
    /** A quiet line at the start of the foot; the `start` slot takes markup. */
    start?: string;
    /** The words of the way out the sheet adds. */
    text: { cancel: string; close: string };
  }>(),
  { actions: () => [] },
);
const emit = defineEmits<{ close: [] }>();
const slots = useSlots();
const el = ref<HTMLDialogElement | null>(null);
const titleId = useId();
const hasStart = computed(() => props.start !== undefined || !!slots.start);
let stop: (() => void) | undefined;

watch(
  [() => props.open, el],
  ([open, dialog]) => {
    stop?.();
    stop = undefined;
    if (open && dialog) stop = openSheet(dialog, () => emit("close"));
  },
  { flush: "post" },
);
onBeforeUnmount(() => stop?.());
</script>

<template>
  <dialog v-if="open" ref="el" :aria-labelledby="titleId" class="glim-sheet">
    <div class="glim-sheet-panel">
      <h2 :id="titleId" class="glim-sheet-title">
        <Badge tone="heading" size="heading" wrap :inset-start="5">{{ title }}</Badge>
      </h2>
      <div class="glim-sheet-body"><slot /></div>
      <WindowFootRow :actions="actions" :start="start" :has-start="hasStart" :text="text" @close="emit('close')">
        <template v-if="$slots.start" #start><slot name="start" /></template>
      </WindowFootRow>
    </div>
  </dialog>
</template>
