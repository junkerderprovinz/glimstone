<script setup lang="ts">
import { ref } from "vue";
import { Checkbox } from "@glimstone/vue";

const files = ["thumbs.db", "desktop.ini", "old-cache.tmp"];
const picked = ref(new Set(["thumbs.db"]));

function flip(name: string, on: boolean) {
  const next = new Set(picked.value);
  if (on) next.add(name);
  else next.delete(name);
  picked.value = next;
}
</script>

<template>
  <div style="display: grid; gap: 2px; width: 280px; font-size: 13px">
    <span v-for="name in files" :key="name" class="demo-dense-row">
      <Checkbox slim :label="name" :model-value="picked.has(name)" @update:model-value="(on) => flip(name, on)" />
      {{ name }}
    </span>
  </div>
</template>
