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
  }>(),
  { tile: true, badge: true },
);
const view = computed(() => skeletonRowView({ delay: props.delay, tile: props.tile, badge: props.badge }));
</script>

<template>
  <div aria-hidden="true" :class="view.className" :style="view.style">
    <span v-if="view.tile" class="glim-skeleton-block glim-skeleton-tile" />
    <span class="glim-skeleton-block glim-skeleton-name" />
    <span v-if="view.badge" class="glim-skeleton-block glim-skeleton-badge" />
  </div>
</template>
