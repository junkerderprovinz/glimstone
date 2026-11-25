<script lang="ts">
  import { MultiSelect } from "@glimstone/svelte/MultiSelect";

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => ({ value: d.toLowerCase(), label: d }));
  let days = $state<string[]>([]);
</script>

<div style="width: 320px">
  <MultiSelect label="Days" options={DAYS} bind:value={days} placeholder="Pick days" />
</div>
