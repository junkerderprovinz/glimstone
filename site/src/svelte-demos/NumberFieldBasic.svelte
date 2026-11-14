<script lang="ts">
  import { NumberField } from "@glimstone/svelte";

  let keep = $state<number | null>(7);
</script>

<div style="display: grid; gap: 12px; width: 100%; max-width: 360px">
  <label style="display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%; max-width: 360px">
    <span>Snapshots to keep</span>
    <NumberField min={1} max={30} bind:value={keep} />
  </label>
  <p style="margin: 0; color: var(--carbon-text-sub); font-size: 13px">Keeps {keep} snapshots.</p>
</div>
