<script setup lang="ts">
import { computed, ref } from "vue";
import { Button, Popover, TextField } from "@glimstone/vue";

const button = ref<{ el: HTMLElement | null } | null>(null);
const anchor = computed(() => button.value?.el ?? null);
const open = ref(false);
</script>

<template>
  <Button ref="button" label="Filter" label-key="filter" :aria-expanded="open" @click="open = !open" />
  <Popover :open="open" :anchor="anchor" label="Filter the list" @close="open = false">
    <div style="display: grid; gap: 12px">
      <TextField label="Name contains" width="medium" />
      <Button label="Apply" :label-key="null" tone="accent" @click="open = false" />
    </div>
  </Popover>
</template>
