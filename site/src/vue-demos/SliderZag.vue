<script setup lang="ts">
import { ref } from "vue";
import { Slider } from "@glimstone/vue/Slider";

const days = ref(30);
const format = (d: number) => (d === 1 ? "1 day" : `${d} days`);
</script>

<template>
  <div style="width: min(22rem, 100%)">
    <Slider v-model="days" label="Keep backups for" :min="1" :max="365" :format="format" />
  </div>
</template>
