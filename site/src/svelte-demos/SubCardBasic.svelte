<script lang="ts">
  import { Button, Card, NumberField, SubCard, TextField, Toggle } from "@glimstone/svelte";

  const row = "display: flex; align-items: center; justify-content: space-between; gap: 16px";

  let days = $state<number | null>(14);
  let prune = $state(true);
</script>

<div style="width: 100%; max-width: 440px; padding-top: 12px">
  <Card title="Snapshots">
    <SubCard title="Retention" hint="Older snapshots are removed after each run.">
      {#snippet end()}<Toggle label="Prune" bind:checked={prune} />{/snippet}
      <label style={row}>
        <span>Days to keep</span>
        <NumberField min={1} max={365} bind:value={days} />
      </label>
    </SubCard>
    <SubCard>
      <TextField label="A note" placeholder="A group needs no title" />
    </SubCard>
    <SubCard title="Commands">
      <div style="{row}; justify-content: flex-end">
        <Button label="Copy command" labelKey="copy" tone="subtle" />
      </div>
    </SubCard>
  </Card>
</div>
