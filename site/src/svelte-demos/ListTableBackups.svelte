<script lang="ts">
  import { ListTable, Pill, type ListColumn } from "@glimstone/svelte";

  const ROWS = [
    { name: "nextcloud", kind: "Container", size: 20.4, state: "Settled" },
    { name: "immich", kind: "Container", size: 312, state: "Running" },
    { name: "vaultwarden", kind: "Container", size: 0.8, state: "Settled" },
    { name: "Windows 11", kind: "VM", size: 64, state: "Failed" },
    { name: "adguard", kind: "Container", size: 1.2, state: "Settled" },
  ];

  const COLUMNS: ListColumn[] = [
    { key: "name", label: "Name" },
    { key: "kind", label: "Kind", filter: true, tone: "muted" },
    { key: "size", label: "Size", end: true },
    { key: "state", label: "State", filter: true },
  ];
  const TONE = { Settled: "ok", Running: "state", Failed: "fail" } as const;
  const TEXT = { search: "Search backups", hint: "Click a heading to sort, ▾ to filter, type to search", noMatch: "No backup matches", filterOf: (c: string) => `Filter ${c}` };

  let picked = $state(0);
  let opened = $state("");
</script>

{#snippet cell(row: (typeof ROWS)[number], c: ListColumn, value: string)}
  {#if c.key === "size"}{row.size} GB{:else if c.key === "state"}<Pill tone={TONE[row.state as keyof typeof TONE]}>{row.state}</Pill>{:else}{value}{/if}
{/snippet}

<div style="display: grid; gap: 8px; width: 100%; max-width: 640px">
  <ListTable
    label="Backups"
    columns={COLUMNS}
    rows={ROWS}
    rowKey={(r) => r.name}
    text={TEXT}
    {cell}
    onSelect={(rows) => (picked = rows.length)}
    onOpen={(row) => (opened = row.name)}
  />
  <output>{picked} picked{opened && `, opened ${opened}`}</output>
</div>
