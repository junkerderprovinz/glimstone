<script setup lang="ts">
import { GlyphTile, Table } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const FILES = [
  { name: "holiday.mkv", size: "2.4 GB" },
  { name: "notes.txt", size: "12 KB" },
];
const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "size", label: "Size", end: true },
];
const PAIR_COLUMNS = [{ key: "from" }, { key: "to", tone: "accent" as const }];
const PAIRS = [{ from: "report-final.txt", to: "report.txt" }];
</script>

<template>
  <div style="display: grid; gap: 16px; width: 360px">
    <Table label="Largest files" :columns="COLUMNS" :rows="FILES" more="And 3 more">
      <template #cell="{ column, value }">
        <span v-if="column.key === 'name'" style="display: inline-flex; align-items: center; gap: 6px">
          <GlyphTile :glyph="glyph('IconFile')" quiet />
          {{ value }}
        </span>
        <template v-else>{{ value }}</template>
      </template>
    </Table>
    <Table label="Pairs" :columns="PAIR_COLUMNS" :rows="PAIRS" />
  </div>
</template>
