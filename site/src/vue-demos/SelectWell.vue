<script setup lang="ts">
import { ref } from "vue";
import { SubCard, TextField } from "@glimstone/vue";
import { Select } from "@glimstone/vue/Select";

const KEEP = [
  { value: "week", label: "One week" },
  { value: "month", label: "One month" },
];
const a = ref<string | null>("week");
const b = ref<string | null>("month");
</script>

<template>
  <div style="display: grid; gap: 12px; width: 320px">
    <div data-well class="glim-well" style="display: grid; gap: 8px; padding: 12px">
      <TextField label="Name in a well" />
      <Select v-model="a" label="Keep in a well" hide-label :options="KEEP" />
    </div>
    <SubCard title="In a sub-card">
      <div style="display: grid; gap: 8px">
        <TextField label="Name in a sub-card" />
        <Select v-model="b" label="Keep in a sub-card" hide-label :options="KEEP" />
      </div>
    </SubCard>
  </div>
</template>
