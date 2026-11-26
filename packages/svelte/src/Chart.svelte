<script lang="ts" module>
  import type { ChartKind, ChartRow, ChartSeries } from "@glimstone/core";

  export type { ChartKind, ChartRow, ChartSeries } from "@glimstone/core";

  export interface ChartProps {
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
  }
</script>

<script lang="ts">
  import { chartIndexAt, chartLayout, chartTooltip, chartTooltipPlace, watchChartFrame } from "@glimstone/core";
  import ChartLegend from "./ChartLegend.svelte";

  // A bar, line or area chart on the frame every chart shares; chart.ts in the
  // core lays it out. The figures live in the tooltip, so the drawing itself is
  // one image named by `label`.
  let { data, x, series, label, kind = "bar", height = 200, format, legend = true }: ChartProps = $props();

  let box: HTMLDivElement;
  let frame = $state({ width: 0, radius: 4 });
  $effect(() => watchChartFrame(box, (f) => (frame = f)));
  let hover = $state<number | null>(null);
  const layout = $derived(chartLayout({ data, x, series, kind, width: frame.width, height, radius: frame.radius, format }));
  const tip = $derived(hover === null ? null : { ...chartTooltip(data, x, series, hover, format), ...chartTooltipPlace(layout, hover) });
  const move = (e: PointerEvent & { currentTarget: SVGSVGElement }) => (hover = chartIndexAt(layout, e.clientX - e.currentTarget.getBoundingClientRect().left));
</script>

<div data-glim="Chart" class="glim-chart">
  <div bind:this={box} class="glim-chart-plot" style="height: {height}px">
    {#if frame.width > 0}
      <svg width={frame.width} {height} role="img" aria-label={label} onpointermove={move} onpointerleave={() => (hover = null)}>
        {#each layout.ticks as t (t.value)}
          <g>
            <line x1={layout.plot.left} x2={layout.plot.left + layout.plot.width} y1={t.y} y2={t.y} class="glim-chart-grid" />
            <text x={layout.plot.left - 8} y={t.y} dy="0.32em" text-anchor="end" class="glim-chart-tick">{t.text}</text>
          </g>
        {/each}
        {#if hover !== null}
          {#if kind === "bar"}
            <rect x={layout.plot.left + layout.band * hover} y={layout.plot.top} width={layout.band} height={layout.plot.height} class="glim-chart-cursor" />
          {:else}
            <line x1={layout.centres[hover]} x2={layout.centres[hover]} y1={layout.plot.top} y2={layout.plot.top + layout.plot.height} class="glim-chart-cursor-line" />
          {/if}
        {/if}
        {#each layout.bars as b (b.key)}<path class="glim-chart-bar" d={b.d} fill={b.color} />{/each}
        {#each layout.lines as l (l.key)}
          <g>
            {#if kind === "area"}<path d={l.area} fill={l.color} class="glim-chart-area" />{/if}
            <polyline points={l.points} fill="none" stroke={l.color} stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
            {#if hover !== null}<circle cx={l.dots[hover]!.x} cy={l.dots[hover]!.y} r="4" fill={l.color} class="glim-chart-dot" />{/if}
          </g>
        {/each}
        {#each layout.labels as l, i (i)}
          <text x={l.x} y={height - 6} text-anchor="middle" class="glim-chart-tick">{l.text}</text>
        {/each}
      </svg>
    {/if}
    {#if tip}
      <div class="glim-chart-tooltip" aria-hidden="true" style="left: {tip.left}px; top: {tip.top}px; translate: {tip.flip ? 'calc(-100% - 12px) 0' : '12px 0'}">
        <div class="glim-chart-tooltip-title">{tip.title}</div>
        {#each tip.rows as r (r.label)}
          <div class="glim-chart-tooltip-row">
            <span class="glim-chart-swatch" style="background: {r.color}"></span>
            <span>{r.label}</span>
            <span class="glim-chart-tooltip-value glim-num">{r.value}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
  {#if legend && series.length > 1}<ChartLegend {series} />{/if}
</div>
