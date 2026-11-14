<script lang="ts">
  import { Toggle } from "@glimstone/svelte";

  let quiet = $state(true);
  let sound = $state(false);
</script>

<div style="display: grid; gap: 16px">
  <Toggle id="quiet-notifications" data-hook="quiet" class="demo-toggle" label="Quiet notifications" bind:checked={quiet} />
  <Toggle label="Play a sound" bind:checked={sound} disabled={!quiet} />
</div>
