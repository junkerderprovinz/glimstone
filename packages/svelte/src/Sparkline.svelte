<script lang="ts" module>
  export interface SparklineProps {
    values: readonly number[];
    /** What the line shows, for a screen reader. */
    label: string;
    color?: string;
    width?: number;
    height?: number;
  }
</script>

<script lang="ts">
  import { sparkline } from "@glimstone/core";

  // A small line of the last values, beside a figure, without axes or a tooltip.
  let { values, label, color = "var(--chart-1)", width = 96, height = 28 }: SparklineProps = $props();
  const line = $derived(sparkline(values, width, height));
</script>

<svg data-glim="Sparkline" class="glim-sparkline" {width} {height} role="img" aria-label={label}>
  <path d={line.area} fill={color} class="glim-chart-area" />
  <polyline points={line.points} fill="none" stroke={color} stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
  <circle cx={line.last[0]} cy={line.last[1]} r="2.5" fill={color} />
</svg>
