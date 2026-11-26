<script lang="ts">
  import { Badge, Button, Card, Toggle } from "@glimstone/svelte";

  let nightly = $state(true);
</script>

<div style="width: 100%; max-width: 420px; padding-top: 12px">
  <Card title="Schedule" hint="When the backup runs on its own.">
    {#snippet action()}<Badge tone={nightly ? "ok" : "neutral"}>{nightly ? "On" : "Off"}</Badge>{/snippet}
    <div style="display: grid; gap: 16px">
      <Toggle label="Run every night" bind:checked={nightly} />
      <div style="display: flex; justify-content: flex-end">
        <Button label="Save" labelKey="save" tone="accent" />
      </div>
    </div>
  </Card>
</div>
