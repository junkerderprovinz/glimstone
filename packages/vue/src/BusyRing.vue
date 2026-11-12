<script setup lang="ts">
import { computed } from "vue";
import { busyRingView, type BusyRingSize } from "@glimstone/core";

// The ring that turns while the app works on something: two arcs turning
// against each other, from TowerTorch. It shows only after BUSY_DELAY, so a
// quick answer never flashes it.
const props = defineProps<{
  /** `small` fits a button's glyph slot, `large` a card that waits. */
  size?: BusyRingSize;
  /** What is being waited for. With it the ring is a status that says so, without
   *  it the ring is hidden from assistive technology and its surroundings speak. */
  label?: string;
  /** Milliseconds before it shows; 0 shows it at once. */
  delay?: number;
}>();
const view = computed(() => busyRingView({ size: props.size, delay: props.delay }));
</script>

<template>
  <span data-glim="BusyRing" :role="label ? 'status' : undefined" :aria-hidden="label ? undefined : 'true'" :class="view.className" :style="view.style">
    <span class="glim-busy-ring-arc"><span class="glim-busy-ring-tail" /></span>
    <span class="glim-busy-ring-arc glim-busy-ring-arc--inner"><span class="glim-busy-ring-tail" /></span>
    <span v-if="label" class="glim-sr-only">{{ label }}</span>
  </span>
</template>
