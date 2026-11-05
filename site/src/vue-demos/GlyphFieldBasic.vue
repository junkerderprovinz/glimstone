<script setup lang="ts">
import { ref } from "vue";
import { FieldRow, GlyphField, IconButton } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const query = ref("");
const cleared = ref(0);
const path = ref("/mnt/user");
function clear() {
  query.value = "";
  cleared.value++;
}
</script>

<template>
  <div style="display: grid; gap: 8px; width: 360px">
    <GlyphField v-model="query" label="Filter" :glyph="glyph('IconSearch')" placeholder="Filter this folder" class="demo-filter" data-hook="filter">
      <template #after><IconButton tip="Clear" :glyph="glyph('IconClose')" @click="clear" /></template>
    </GlyphField>
    <FieldRow label="From the row">
      <GlyphField v-model="path" :glyph="glyph('IconFolder')" mono width="medium" />
    </FieldRow>
    <output>Cleared {{ cleared }}</output>
  </div>
</template>
