<script lang="ts">
  import { BusyRing, Button } from "@glimstone/svelte";

  let waiting = $state(0);
</script>

<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px">
  <BusyRing size="small" delay={0} />
  <BusyRing label="Loading backups" delay={0} />
  <BusyRing size="large" delay={0} />
  <Button label="Saving" labelKey="save" tone="accent" busy />
  <Button label="Wait" labelKey={null} onClick={() => waiting++} />
  <!-- Each press draws a new ring, so its wait starts again. -->
  {#if waiting > 0}
    {#key waiting}<BusyRing label="Waiting" />{/key}
  {/if}
</div>
