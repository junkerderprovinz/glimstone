<script setup lang="ts">
import { ref } from "vue";
import { PinInput } from "@glimstone/vue/PinInput";

const code = ref("");
const done = ref("");
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <PinInput v-model="code" label="Code from the app" @complete="done = $event" />
    <span class="glim-num">{{ done ? `Checking ${done}` : "Waiting for six digits" }}</span>
  </div>
</template>
