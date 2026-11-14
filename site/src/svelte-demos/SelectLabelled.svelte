<script lang="ts">
  import { Button } from "@glimstone/svelte";
  import { Select } from "@glimstone/svelte/Select";

  const PLACES = [
    "/mnt/user/backups",
    "/mnt/user/backups/appdata/weekly/containers",
    "/mnt/disks/offsite-archive/vault/snapshots/2026",
  ].map((p) => ({ value: p, label: p }));

  // A settings row whose name is a <label> of its own, outside the select.
  let place = $state<string | null>(PLACES[1]!.value);
  let trigger = $state<HTMLButtonElement | null>(null);
</script>

<div style="display: grid; gap: 12px; width: 320px">
  <div style="display: flex; align-items: center; gap: 12px">
    <label for="backup-destination-svelte" style="flex: none; width: 88px">Destination</label>
    <Select id="backup-destination-svelte" bind:ref={trigger} label="Destination" hideLabel wrap options={PLACES} bind:value={place} />
  </div>
  <Button label="Choose the destination" labelKey={null} onClick={() => trigger?.focus()} />
</div>
