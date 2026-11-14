<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { TableColumn } from "@glimstone/core";

  export type { TableColumn } from "@glimstone/core";

  export interface TableProps<T extends object> {
    /** The table's accessible name. */
    label: string;
    columns: readonly TableColumn[];
    rows: readonly T[];
    /** One quiet line under the last row, such as how many more there are. */
    more?: string;
    /** Draws every cell, handed the row, the column and the value; without it a cell shows the value. */
    cell?: Snippet<[T, TableColumn, unknown]>;
  }
</script>

<script lang="ts" generics="T extends object">
  import { tableCellClass } from "@glimstone/core";

  // A short list of facts in columns, inside a card or a window.
  let { label, columns, rows, more, cell }: TableProps<T> = $props();

  const value = (row: T, column: TableColumn) => (row as Record<string, unknown>)[column.key];
</script>

<table data-glim="Table" class="glim-table" aria-label={label}>
  {#if columns.some((c) => c.label)}
    <thead>
      <tr>
        {#each columns as c (c.key)}<th scope="col" class={c.end ? "glim-table-end" : undefined}>{c.label}</th>{/each}
      </tr>
    </thead>
  {/if}
  <tbody>
    {#each rows as row, i (i)}
      <tr>
        {#each columns as c (c.key)}
          <td class={tableCellClass(c) || undefined}>{#if cell}{@render cell(row, c, value(row, c))}{:else}{value(row, c)}{/if}</td>
        {/each}
      </tr>
    {/each}
    {#if more}
      <tr><td colspan={columns.length} class="glim-table-muted">{more}</td></tr>
    {/if}
  </tbody>
</table>
