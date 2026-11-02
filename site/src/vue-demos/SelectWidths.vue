<script setup lang="ts">
import { reactive } from "vue";
import type { SelectWidth } from "@glimstone/core";
import { Select } from "@glimstone/vue/Select";

const KEEP = [
  { value: "d", label: "Days" },
  { value: "m", label: "Months" },
  { value: "x", label: "Until somebody removes them" },
];
// Each row is a settings row: the name at the start, the select at the end.
const ROWS: { width: SelectWidth; room: number }[] = [
  { width: "fill", room: 360 },
  { width: "steady", room: 360 },
  { width: "squeeze", room: 200 },
  { width: "hug", room: 360 },
];
const values = reactive<Record<string, string | null>>({ fill: "d", steady: "d", squeeze: "d", hug: "d" });
</script>

<template>
  <div style="display: grid; gap: 12px">
    <div
      v-for="r in ROWS"
      :key="r.width"
      :data-width="r.width"
      :style="{ display: 'flex', alignItems: 'center', gap: '12px', width: `${r.room}px` }"
    >
      <span style="flex: none; width: 64px; color: var(--carbon-text-sub)">{{ r.width }}</span>
      <Select v-model="values[r.width]" :label="`Keep backups, ${r.width}`" hide-label :width="r.width" :options="KEEP" />
    </div>
  </div>
</template>
