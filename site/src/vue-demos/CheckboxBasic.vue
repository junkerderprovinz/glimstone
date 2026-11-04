<script setup lang="ts">
import { ref } from "vue";
import { Checkbox } from "@glimstone/vue";

const again = ref(false);
const write = ref(true);
</script>

<template>
  <div style="display: grid; gap: 8px">
    <Checkbox v-model="again" label="Don't show again" />
    <Checkbox :model-value="true" label="Name, always shown" disabled />
    <span style="display: flex; gap: 8px; align-items: center">
      Owner writes
      <Checkbox v-model="write" label="The owner may write" hide-label />
    </span>
  </div>
</template>
