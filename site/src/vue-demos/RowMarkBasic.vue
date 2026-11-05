<script setup lang="ts">
import { ref } from "vue";
import { RowMark } from "@glimstone/vue";

const FILES = ["holiday.mkv", "notes.txt", "backup.tar"];
const picked = ref(new Set(["holiday.mkv"]));

function flip(name: string) {
  const next = new Set(picked.value);
  if (!next.delete(name)) next.add(name);
  picked.value = next;
}
</script>

<template>
  <div role="listbox" aria-multiselectable="true" aria-label="Files" style="display: grid; gap: 2px; width: 280px; font-size: 13px">
    <div v-for="name in FILES" :key="name" role="option" :aria-selected="picked.has(name)" class="demo-dense-row" @click="flip(name)">
      <RowMark :on="picked.has(name)" />
      {{ name }}
    </div>
  </div>
</template>
