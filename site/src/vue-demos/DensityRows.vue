<script setup lang="ts">
import { DENSITIES, type Density } from "@glimstone/core";
import { ListRow, Pill, Selector, useDensity } from "@glimstone/vue";
import { Glyph } from "../vue/glyph";

const NAMES: Record<Density, string> = { compact: "Compact", normal: "Normal", airy: "Airy" };
const density = useDensity();
const items = DENSITIES.map((d) => ({ id: d, label: NAMES[d] }));
</script>

<template>
  <div style="display: grid; gap: 12px; width: 100%; max-width: 560px">
    <Selector v-model="density" label="Density" :items="items" variant="well" equal-width />
    <div style="display: grid; gap: 2px">
      <ListRow name="nightly-backup">
        <template #tile><Glyph name="IconFolder" /></template>
        <template #badges><Pill class="glim-num">2.4 GB</Pill></template>
      </ListRow>
      <ListRow name="archive-copy">
        <template #tile><Glyph name="IconCloud" /></template>
        <template #badges><Pill class="glim-num">880 MB</Pill></template>
      </ListRow>
      <ListRow name="photos">
        <template #tile><Glyph name="IconFolder" /></template>
        <template #badges><Pill class="glim-num">12 GB</Pill></template>
      </ListRow>
    </div>
  </div>
</template>
