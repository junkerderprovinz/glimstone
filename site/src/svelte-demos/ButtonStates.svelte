<script lang="ts">
  import { Button } from "@glimstone/svelte";

  let busy = $state(false);
  const run = () => {
    busy = true;
    setTimeout(() => (busy = false), 1800);
  };
</script>

<Button label="Back up now" labelKey="backup" tone="accent" {busy} onClick={run} title={busy ? "Backing up" : undefined} />
<Button label="Download" labelKey="download" disabled title="Nothing to download yet" />
<Button label="Edit" labelKey="edit" variant="icon" />
<Button label="Remove /mnt/user/media" labelKey={null} variant="chip" tone="subtle" />
