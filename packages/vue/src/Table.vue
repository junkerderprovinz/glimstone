<script setup lang="ts" generic="T extends object">
import { computed } from "vue";
import { tableCellClass, type TableColumn } from "@glimstone/core";

// A short list of facts in columns, inside a card or a window. The `cell` slot
// draws a cell of its own, handed the row, the column and the value.
const props = defineProps<{
  /** The table's accessible name. */
  label: string;
  columns: readonly TableColumn[];
  rows: readonly T[];
  /** One quiet line under the last row, such as how many more there are. */
  more?: string;
}>();
const head = computed(() => props.columns.some((c) => c.label));
const valueOf = (row: T, column: TableColumn) => (row as Record<string, unknown>)[column.key];
</script>

<template>
  <table class="glim-table" :aria-label="label">
    <thead v-if="head">
      <tr>
        <th v-for="c in columns" :key="c.key" scope="col" :class="{ 'glim-table-end': c.end }">{{ c.label }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, i) in rows" :key="i">
        <td v-for="c in columns" :key="c.key" :class="tableCellClass(c)">
          <slot name="cell" :row="row" :column="c" :value="valueOf(row, c)">{{ valueOf(row, c) }}</slot>
        </td>
      </tr>
      <tr v-if="more">
        <td :colspan="columns.length" class="glim-table-muted">{{ more }}</td>
      </tr>
    </tbody>
  </table>
</template>
