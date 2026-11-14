<script lang="ts">
  import { Checkbox } from "@glimstone/svelte";

  let again = $state(false);
  let write = $state(true);
</script>

<div style="display: grid; gap: 8px">
  <Checkbox label="Don't show again" bind:checked={again} />
  <Checkbox label="Name, always shown" checked disabled />
  <span style="display: flex; gap: 8px; align-items: center">
    Owner writes
    <Checkbox label="The owner may write" hideLabel bind:checked={write} />
  </span>
</div>
