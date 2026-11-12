<script setup lang="ts">
import { onBeforeUnmount, ref, useId, watch } from "vue";
import { anchorName, openPopover } from "@glimstone/core";

// A small panel beside the control that opened it, such as a filter. It lives
// in the top layer through the popover attribute, so no card or scroll box
// clips it, and it renders where it stands rather than in a portal. Escape and
// a press beside it close it, and focus goes back to the trigger.
const props = defineProps<{
  /** Whether it shows. */
  open: boolean;
  /** The control it stands beside. */
  anchor: HTMLElement | null;
  /** Its accessible name. */
  label: string;
}>();
const emit = defineEmits<{ close: [] }>();
const el = ref<HTMLElement | null>(null);
const name = anchorName(useId() ?? "popover");
let stop: (() => void) | undefined;

watch(
  [() => props.open, () => props.anchor, el],
  ([open, anchor, popover]) => {
    stop?.();
    stop = undefined;
    if (open && anchor && popover) stop = openPopover(popover, anchor, name, () => emit("close"));
  },
  { flush: "post" },
);
onBeforeUnmount(() => stop?.());
</script>

<template>
  <div v-if="open" ref="el" popover="auto" role="dialog" :aria-label="label" class="glim-popover"><slot /></div>
</template>
