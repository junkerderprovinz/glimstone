<script setup lang="ts">
import { computed } from "vue";
import { skeletonRowView } from "@glimstone/core";

// A row that holds a ListRow's place while the list loads, so nothing jumps
// when the rows arrive. It shows only after BUSY_DELAY. The list around it
// carries aria-busy and says what is loading; the row itself is hidden from
// assistive technology.
const props = withDefaults(
  defineProps<{
    /** Milliseconds before it shows; 0 shows it at once. */
    delay?: number;
    /** The tile at the row's start, for a list whose rows have one. */
    tile?: boolean;
    /** The badge at the row's end, for a list whose rows have one. */
    badge?: boolean;
    /** A bar in the value column, for a list whose rows carry a `value`. */
    value?: boolean;
    /** How many row buttons to keep room for, so the value bar stands where the real rows put their figures. */
    actions?: number;
  }>(),
  { tile: true, badge: true, value: false, actions: 0 },
);
const view = computed(() => skeletonRowView({ delay: props.delay, tile: props.tile, badge: props.badge, value: props.value, actions: props.actions }));
</script>

<template>
  <div data-glim="SkeletonRow" aria-hidden="true" :class="view.className" :style="view.style">
    <span v-if="view.tile" class="glim-skeleton-block glim-skeleton-tile" />
    <span class="glim-skeleton-block glim-skeleton-name" />
    <span v-if="view.badge" class="glim-skeleton-block glim-skeleton-badge" />
    <span v-if="view.value" class="glim-skeleton-block glim-skeleton-value" />
    <span v-if="view.actions > 0" class="glim-skeleton-actions" />
  </div>
</template>
