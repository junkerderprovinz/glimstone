<script setup lang="ts">
import { ref } from "vue";
import { Selector } from "@glimstone/vue";

const LEVELS = [
  { id: 1, label: "Fast", attrs: { "data-level": "1" } },
  { id: 5, label: "Even", attrs: { "data-level": "5" } },
  { id: 9, label: "Small", attrs: { "data-level": "9" } },
];
const level = ref(5);
const presses = ref(0);
const choose = (id: number) => (level.value = id);
</script>

<template>
  <div style="display: grid; gap: 8px; justify-items: start">
    <Selector :model-value="level" label="Compression" :items="LEVELS" activation="manual" size="sm" inline @press="presses++" @update:model-value="choose" />
    <output class="glim-num">Value {{ JSON.stringify(level) }}, pressed {{ presses }}</output>
  </div>
</template>
