<script lang="ts">
  import { SubCard, TextField } from "@glimstone/svelte";
  import { Select } from "@glimstone/svelte/Select";

  const KEEP = [
    { value: "week", label: "One week" },
    { value: "month", label: "One month" },
  ];
  let a = $state<string | null>("week");
  let b = $state<string | null>("month");
</script>

<div style="display: grid; gap: 12px; width: 320px">
  <div data-well class="glim-well" style="display: grid; gap: 8px; padding: 12px">
    <TextField label="Name in a well" />
    <Select label="Keep in a well" hideLabel options={KEEP} bind:value={a} />
  </div>
  <SubCard title="In a sub-card">
    <div style="display: grid; gap: 8px">
      <TextField label="Name in a sub-card" />
      <Select label="Keep in a sub-card" hideLabel options={KEEP} bind:value={b} />
    </div>
  </SubCard>
</div>
