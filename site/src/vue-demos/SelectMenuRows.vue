<script setup lang="ts">
import { ref } from "vue";
import type { SelectGroup, SelectOption } from "@glimstone/vue";
import { Select } from "@glimstone/vue/Select";
import { glyph } from "../vue/glyph";

const sort = ref<string | null>("name");
const app = ref<string | null>("text");

const SORTS: SelectOption[] = [
  { value: "name", label: "Name", glyph: glyph("IconFile") },
  { value: "size", label: "Size", glyph: glyph("IconHash") },
  { value: "kind", label: "Kind", glyph: glyph("IconCube") },
  { value: "date", label: "Modified", glyph: glyph("IconCalendar") },
];
const APPS: SelectGroup[] = [
  {
    heading: "Viewers",
    entries: [
      { value: "text", label: "Text" },
      { value: "image", label: "Image" },
    ],
  },
  {
    entries: [
      {
        label: "Other",
        options: [
          { value: "hex", label: "Hex" },
          { value: "raw", label: "Raw" },
        ],
      },
    ],
  },
];
</script>

<template>
  <div style="display: grid; gap: 16px; width: 260px">
    <Select v-model="sort" label="Sort by" rows="menu" :options="SORTS" :trigger-attrs="{ 'data-val': sort ?? '' }" list-id="demo-sort-list" />
    <Select v-model="app" label="Open with" rows="menu" :groups="APPS" :trigger-attrs="{ 'data-val': app ?? '' }" list-id="demo-open-with" />
  </div>
</template>
