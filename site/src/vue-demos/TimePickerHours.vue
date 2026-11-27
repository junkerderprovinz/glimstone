<script setup lang="ts">
import { ref } from "vue";
import { FieldRow, TimePicker, TimeRangePicker } from "@glimstone/vue";

const start = ref<string | null>("02:30");
const quiet = ref<[string | null, string | null]>(["22:00", "07:00"]);
</script>

<template>
  <div style="display: grid; gap: 8px; width: 100%; max-width: 420px">
    <FieldRow label="Backup starts at">
      <TimePicker v-model="start" :minute-step="15" />
    </FieldRow>
    <FieldRow label="Quiet hours">
      <TimeRangePicker v-model="quiet" />
    </FieldRow>
    <span class="glim-num" data-hook="start">{{ start ? `Runs daily at ${start}` : "No start time" }}</span>
    <span class="glim-num" data-hook="quiet">{{ quiet[0] && quiet[1] ? `Quiet from ${quiet[0]} to ${quiet[1]}` : "No quiet hours" }}</span>
  </div>
</template>
