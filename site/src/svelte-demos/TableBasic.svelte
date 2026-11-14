<script lang="ts">
  import { GlyphTile, Table, type TableColumn } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  const FILES = [
    { name: "holiday.mkv", size: "2.4 GB" },
    { name: "notes.txt", size: "12 KB" },
  ];
  const COLUMNS = [
    { key: "name", label: "Name" },
    { key: "size", label: "Size", end: true },
  ];
  const file = glyph("IconFile");
</script>

{#snippet cell(row: (typeof FILES)[number], column: TableColumn, value: unknown)}
  {#if column.key === "name"}
    <span style="display: inline-flex; align-items: center; gap: 6px"><GlyphTile glyph={file} quiet />{row.name}</span>
  {:else}{value}{/if}
{/snippet}

<div style="display: grid; gap: 16px; width: 360px">
  <Table label="Largest files" columns={COLUMNS} rows={FILES} more="And 3 more" {cell} />
  <Table label="Pairs" columns={[{ key: "from" }, { key: "to", tone: "accent" }]} rows={[{ from: "report-final.txt", to: "report.txt" }]} />
</div>
