<script setup lang="ts">
import { ref } from "vue";
import { MultiSelect } from "@glimstone/vue/MultiSelect";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => ({ value: d.toLowerCase(), label: d }));
const days = ref<string[]>([]);
</script>

<template>
  <div style="width: 320px">
    <MultiSelect v-model="days" label="Days" :options="DAYS" placeholder="Pick days" />
  </div>
</template>
