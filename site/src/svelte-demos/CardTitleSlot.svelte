<script lang="ts">
  import { Card, Toggle } from "@glimstone/svelte";

  let nightly = $state(true);
</script>

<div style="width: 100%; max-width: 420px; padding-top: 12px">
  <Card>
    {#snippet drawn()}Schedule <span data-dot aria-hidden="true">●</span>{/snippet}
    <Toggle label="Run every night" bind:checked={nightly} />
  </Card>
</div>
