<script lang="ts" module>
  import type { ChartSeries } from "@glimstone/core";

  export interface ChartLegendProps {
    series: readonly ChartSeries[];
  }
</script>

<script lang="ts">
  import { seriesColor } from "@glimstone/core";

  let { series }: ChartLegendProps = $props();
</script>

<ul data-glim="ChartLegend" class="glim-chart-legend">
  {#each series as s, i (s.key)}
    <li><span class="glim-chart-swatch" style="background: {seriesColor(s, i)}"></span>{s.label}</li>
  {/each}
</ul>
