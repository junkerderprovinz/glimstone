<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@glimstone/vue";
import { Tour } from "@glimstone/vue/Tour";

const open = ref(false);
const add = ref<HTMLElement | null>(null);
const search = ref<HTMLElement | null>(null);
const steps = [
  { id: "add", target: () => add.value, title: "Add a backup", description: "Everything starts here: pick what to back up and where it goes." },
  { id: "search", target: () => search.value, title: "Find a file", description: "Search every backup at once, by name or by folder." },
  { id: "end", title: "That is all", description: "The rest is on the Help page whenever it is needed." },
];
</script>

<template>
  <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap">
    <div ref="add" style="padding: 8px">Add</div>
    <div ref="search" style="padding: 8px">Search</div>
    <Button label="Start the tour" :label-key="null" @click="open = true" />
    <Tour v-model:open="open" :steps="steps" />
  </div>
</template>
