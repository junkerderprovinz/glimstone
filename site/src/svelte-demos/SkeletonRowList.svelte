<script lang="ts">
  import { Button, SkeletonRow } from "@glimstone/svelte";

  let round = $state(0);
</script>

<div style="display: grid; gap: 12px; width: 100%; max-width: 560px">
  <!-- Each round draws the rows anew, so their wait starts again. -->
  {#key round}
    <div role="group" aria-label="Backups" aria-busy="true">
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </div>
  {/key}
  <Button label="Load again" labelKey="refresh" onClick={() => round++} />
</div>
