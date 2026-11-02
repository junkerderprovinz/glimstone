<script setup lang="ts">
import { ref } from "vue";
import { InfoBubble, Toggle } from "@glimstone/vue";

const on = ref(true);
</script>

<template>
  <span style="display: inline-flex; align-items: center; gap: 8px">
    <Toggle v-model="on" label="Verify after each run" />
    <InfoBubble tip="Reads every file back from the target and compares it with the source. Takes about as long as the backup itself." />
  </span>
</template>
