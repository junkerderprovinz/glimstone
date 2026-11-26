<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from "vue";
import { chartIndexAt, chartLayout, chartTooltip, chartTooltipPlace, watchChartFrame, type ChartKind, type ChartRow, type ChartSeries } from "@glimstone/core";
import ChartLegend from "./ChartLegend.vue";

// A bar, line or area chart on the frame every chart shares; chart.ts in the
// core lays it out. The figures live in the tooltip, so the drawing itself is
// one image named by `label`.
const props = withDefaults(
  defineProps<{
    data: readonly ChartRow[];
    /** The field that names each point on the x axis, such as "day". */
    x: string;
    series: readonly ChartSeries[];
    /** What the chart shows, for a screen reader. */
    label: string;
    kind?: ChartKind;
    height?: number;
    /** How a figure reads on the axis and in the tooltip. */
    format?: (n: number) => string;
    /** The legend under the plot, shown where there is more than one series. */
    legend?: boolean;
  }>(),
  { kind: "bar", height: 200, legend: true },
);

const box = shallowRef<HTMLDivElement | null>(null);
const frame = ref({ width: 0, radius: 4 });
let stop: (() => void) | undefined;
onMounted(() => (stop = watchChartFrame(box.value!, (f) => (frame.value = f))));
onUnmounted(() => stop?.());
const hover = ref<number | null>(null);
const layout = computed(() =>
  chartLayout({ data: props.data, x: props.x, series: props.series, kind: props.kind, width: frame.value.width, height: props.height, radius: frame.value.radius, format: props.format }),
);
const tip = computed(() =>
  hover.value === null ? null : { ...chartTooltip(props.data, props.x, props.series, hover.value, props.format), ...chartTooltipPlace(layout.value, hover.value) },
);
const move = (e: PointerEvent) => (hover.value = chartIndexAt(layout.value, e.clientX - (e.currentTarget as SVGSVGElement).getBoundingClientRect().left));
</script>

<template>
  <div data-glim="Chart" class="glim-chart">
    <div ref="box" class="glim-chart-plot" :style="{ height: `${height}px` }">
      <svg v-if="frame.width > 0" :width="frame.width" :height="height" role="img" :aria-label="label" @pointermove="move" @pointerleave="hover = null">
        <g v-for="t in layout.ticks" :key="t.value">
          <line :x1="layout.plot.left" :x2="layout.plot.left + layout.plot.width" :y1="t.y" :y2="t.y" class="glim-chart-grid" />
          <text :x="layout.plot.left - 8" :y="t.y" dy="0.32em" text-anchor="end" class="glim-chart-tick">{{ t.text }}</text>
        </g>
        <template v-if="hover !== null">
          <rect v-if="kind === 'bar'" :x="layout.plot.left + layout.band * hover" :y="layout.plot.top" :width="layout.band" :height="layout.plot.height" class="glim-chart-cursor" />
          <line v-else :x1="layout.centres[hover]" :x2="layout.centres[hover]" :y1="layout.plot.top" :y2="layout.plot.top + layout.plot.height" class="glim-chart-cursor-line" />
        </template>
        <path v-for="b in layout.bars" :key="b.key" class="glim-chart-bar" :d="b.d" :fill="b.color" />
        <g v-for="l in layout.lines" :key="l.key">
          <path v-if="kind === 'area'" :d="l.area" :fill="l.color" class="glim-chart-area" />
          <polyline :points="l.points" fill="none" :stroke="l.color" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
          <circle v-if="hover !== null" :cx="l.dots[hover]!.x" :cy="l.dots[hover]!.y" r="4" :fill="l.color" class="glim-chart-dot" />
        </g>
        <text v-for="(l, i) in layout.labels" :key="i" :x="l.x" :y="height - 6" text-anchor="middle" class="glim-chart-tick">{{ l.text }}</text>
      </svg>
      <div v-if="tip" class="glim-chart-tooltip" aria-hidden="true" :style="{ left: `${tip.left}px`, top: `${tip.top}px`, translate: tip.flip ? 'calc(-100% - 12px) 0' : '12px 0' }">
        <div class="glim-chart-tooltip-title">{{ tip.title }}</div>
        <div v-for="r in tip.rows" :key="r.label" class="glim-chart-tooltip-row">
          <span class="glim-chart-swatch" :style="{ background: r.color }" />
          <span>{{ r.label }}</span>
          <span class="glim-chart-tooltip-value glim-num">{{ r.value }}</span>
        </div>
      </div>
    </div>
    <ChartLegend v-if="legend && series.length > 1" :series="series" />
  </div>
</template>
