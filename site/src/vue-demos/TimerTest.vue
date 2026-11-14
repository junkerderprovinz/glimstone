<script setup lang="ts">
import { ref } from "vue";
import { Timer } from "@glimstone/vue/Timer";

const done = ref(false);
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <Timer countdown :start-ms="3_000" @complete="done = true" />
    <span>{{ done ? "Time is up" : "Three seconds for the test" }}</span>
  </div>
</template>
