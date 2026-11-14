<script lang="ts">
  import { InfoBubble, Toggle } from "@glimstone/svelte";

  let on = $state(true);
</script>

<span style="display: inline-flex; align-items: center; gap: 8px">
  <Toggle label="Verify after each run" bind:checked={on} />
  <InfoBubble tip="Reads every file back from the target and compares it with the source. Takes about as long as the backup itself." />
</span>
