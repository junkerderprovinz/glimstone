<script setup lang="ts">
import { computed } from "vue";
import { sparkline } from "@glimstone/core";

// A small line of the last values, beside a figure, without axes or a tooltip.
const props = withDefaults(
  defineProps<{
    values: readonly number[];
    /** What the line shows, for a screen reader. */
    label: string;
    color?: string;
    width?: number;
    height?: number;
  }>(),
  { color: "var(--chart-1)", width: 96, height: 28 },
);
const line = computed(() => sparkline(props.values, props.width, props.height));
</script>

<template>
  <svg data-glim="Sparkline" class="glim-sparkline" :width="width" :height="height" role="img" :aria-label="label">
    <path :d="line.area" :fill="color" class="glim-chart-area" />
    <polyline :points="line.points" fill="none" :stroke="color" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
    <circle :cx="line.last[0]" :cy="line.last[1]" r="2.5" :fill="color" />
  </svg>
</template>
