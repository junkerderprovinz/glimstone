<script lang="ts">
  import { Pill } from "@glimstone/svelte";
</script>

<div style="display: flex; gap: 8px; flex-wrap: wrap">
  <Pill class="glim-num">4.2 GB</Pill>
  <Pill tone="state">Running</Pill>
  <Pill tone="ok">Done</Pill>
  <Pill tone="warn">Waiting</Pill>
  <Pill tone="fail">Failed</Pill>
</div>
