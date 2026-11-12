<script setup lang="ts">
import { ref } from "vue";
import { ListTable, Pill, type ListColumn } from "@glimstone/vue";

const ROWS = [
  { name: "nextcloud", kind: "Container", size: 20.4, state: "Settled" },
  { name: "immich", kind: "Container", size: 312, state: "Running" },
  { name: "vaultwarden", kind: "Container", size: 0.8, state: "Settled" },
  { name: "Windows 11", kind: "VM", size: 64, state: "Failed" },
  { name: "adguard", kind: "Container", size: 1.2, state: "Settled" },
];
type Row = (typeof ROWS)[number];

const COLUMNS: ListColumn[] = [
  { key: "name", label: "Name" },
  { key: "kind", label: "Kind", filter: true, tone: "muted" },
  { key: "size", label: "Size", end: true },
  { key: "state", label: "State", filter: true },
];
const TONE = { Settled: "ok", Running: "state", Failed: "fail" } as const;
const TEXT = { search: "Search backups", hint: "Click a heading to sort, ▾ to filter, type to search", noMatch: "No backup matches", filterOf: (c: string) => `Filter ${c}` };

const picked = ref(0);
const opened = ref("");
</script>

<template>
  <div style="display: grid; gap: 8px; width: 100%; max-width: 640px">
    <ListTable
      label="Backups"
      :columns="COLUMNS"
      :rows="ROWS"
      :row-key="(r: Row) => r.name"
      :text="TEXT"
      @select="(rows: Row[]) => (picked = rows.length)"
      @open="(row: Row) => (opened = row.name)"
    >
      <template #cell="{ row, column }">
        <template v-if="column.key === 'size'">{{ row.size }} GB</template>
        <Pill v-else-if="column.key === 'state'" :tone="TONE[row.state as keyof typeof TONE]">{{ row.state }}</Pill>
        <template v-else>{{ (row as Record<string, unknown>)[column.key] }}</template>
      </template>
    </ListTable>
    <output>{{ picked }} picked<template v-if="opened">, opened {{ opened }}</template></output>
  </div>
</template>
