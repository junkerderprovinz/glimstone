<script setup lang="ts">
import { ref } from "vue";
import { Card, Toggle } from "@glimstone/vue";

const nightly = ref(true);
</script>

<template>
  <div style="width: 100%; max-width: 420px; padding-top: 12px">
    <Card>
      <template #title>Schedule <span data-dot aria-hidden="true">●</span></template>
      <Toggle v-model="nightly" label="Run every night" />
    </Card>
  </div>
</template>
