<script setup lang="ts">
import { seriesColor, type ChartSeries } from "@glimstone/core";

defineProps<{ series: readonly ChartSeries[] }>();
</script>

<template>
  <ul data-glim="ChartLegend" class="glim-chart-legend">
    <li v-for="(s, i) in series" :key="s.key">
      <span class="glim-chart-swatch" :style="{ background: seriesColor(s, i) }" />{{ s.label }}
    </li>
  </ul>
</template>
