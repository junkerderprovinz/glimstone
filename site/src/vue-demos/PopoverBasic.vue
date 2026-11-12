<script setup lang="ts">
import { ref } from "vue";
import { Button, Popover, TextField } from "@glimstone/vue";

const anchor = ref<HTMLElement | null>(null);
const open = ref(false);
</script>

<template>
  <span ref="anchor" style="display: inline-flex">
    <Button label="Filter" label-key="filter" :aria-expanded="open" @click="open = !open" />
  </span>
  <Popover :open="open" :anchor="anchor" label="Filter the list" @close="open = false">
    <div style="display: grid; gap: 12px">
      <TextField label="Name contains" width="medium" />
      <Button label="Apply" :label-key="null" tone="accent" @click="open = false" />
    </div>
  </Popover>
</template>
