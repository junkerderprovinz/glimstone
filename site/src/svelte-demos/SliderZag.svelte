<script lang="ts">
  import { Slider } from "@glimstone/svelte/Slider";

  let days = $state(30);
</script>

<div style="width: min(22rem, 100%)">
  <Slider label="Keep backups for" bind:value={days} min={1} max={365} format={(d) => (d === 1 ? "1 day" : `${d} days`)} />
</div>
