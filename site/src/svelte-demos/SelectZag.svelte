<script lang="ts">
  import { Select } from "@glimstone/svelte/Select";

  const ZONES = ["Europe/Vienna", "Europe/Berlin", "America/New_York", "Asia/Tokyo", "UTC"].map((z) => ({ value: z, label: z }));
  let zone = $state<string | null>("Europe/Vienna");
</script>

<div style="width: 260px">
  <Select label="Time zone" options={ZONES} bind:value={zone} />
</div>
