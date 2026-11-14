<script lang="ts">
  import { Button } from "@glimstone/svelte";
  import { FloatingPanel } from "@glimstone/svelte/FloatingPanel";

  let open = $state(false);
</script>

<div>
  <Button label="Show the transfer log" labelKey={null} onClick={() => (open = true)} />
  <FloatingPanel title="Transfer log" bind:open>
    <p style="margin: 0">04:10 Copied 2,113 files to the cellar.</p>
    <p style="margin: 0">04:14 Checked every file against its sum.</p>
  </FloatingPanel>
</div>
