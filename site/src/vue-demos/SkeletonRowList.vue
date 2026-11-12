<script setup lang="ts">
import { ref } from "vue";
import { Button, SkeletonRow } from "@glimstone/vue";

const round = ref(0);
</script>

<template>
  <div style="display: grid; gap: 12px; width: 100%; max-width: 560px">
    <div :key="round" role="group" aria-label="Backups" aria-busy="true">
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </div>
    <Button label="Load again" label-key="refresh" @click="round++" />
  </div>
</template>
