<script lang="ts">
  import { Button, Card, EmptyState, IconButton, ListRow, Pill, SkeletonRow, TextField } from "@glimstone/svelte";
  import { glyph } from "../../svelte/glyph";

  interface Backup {
    name: string;
    size: string;
    failed?: boolean;
  }

  let backups = $state.raw<Backup[]>([
    { name: "appdata", size: "2.4 GB" },
    { name: "photos", size: "212 GB" },
    { name: "documents", size: "880 MB", failed: true },
  ]);
  let filter = $state("");
  let loading = $state(true);
  let added = 0;
  const shown = $derived(backups.filter((b) => b.name.includes(filter.trim().toLowerCase())));

  $effect(() => {
    const done = setTimeout(() => (loading = false), 900);
    return () => clearTimeout(done);
  });

  function add() {
    added++;
    backups = [...backups, { name: `backup-${added}`, size: "0 B" }];
    filter = "";
  }
  const archive = glyph("IconArchive");
  const trash = glyph("IconTrash");
</script>

{#snippet clear()}
  <Button label="Clear the filter" labelKey={null} glyph={glyph("IconClose")} onClick={() => (filter = "")} />
{/snippet}

<div style="display: grid; gap: 28px; width: 100%; max-width: 640px">
  <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center">
    <TextField label="Filter" placeholder="Filter by name" width="grow" bind:value={filter} />
    <Button label="Add a backup" labelKey="add" tone="accent" size="key" onClick={add} />
  </div>
  <Card title="Backups">
    {#if loading}
      <div role="group" aria-label="Backups" aria-busy="true">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    {:else if shown.length}
      <div style="display: grid; gap: 2px">
        {#each shown as b (b.name)}
          {#snippet badges()}
            <Pill class="glim-num">{b.size}</Pill>
            {#if b.failed}<Pill tone="fail">Failed</Pill>{/if}
          {/snippet}
          {#snippet actions()}
            <IconButton tip={`Delete ${b.name}`} glyph={trash} onclick={() => (backups = backups.filter((x) => x !== b))} />
          {/snippet}
          <ListRow name={b.name} tile={archive} {badges} {actions} />
        {/each}
      </div>
    {:else if backups.length}
      <EmptyState nested glyph={glyph("IconFilter")} title="No backups match the filter" action={clear} />
    {:else}
      <EmptyState nested glyph={archive} title="No backups yet" hint="Add one, and the first run starts tonight." />
    {/if}
  </Card>
</div>
