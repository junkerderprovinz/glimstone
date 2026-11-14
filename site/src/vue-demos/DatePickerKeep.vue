<script setup lang="ts">
import { ref } from "vue";
import { DatePicker } from "@glimstone/vue/DatePicker";

const day = ref<string | null>("2026-11-20");
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <DatePicker v-model="day" label="Keep until" min="2026-11-05" max="2027-03-31" locale="en-GB" />
    <span class="glim-num">{{ day ? `Kept until ${day}` : "Kept for good" }}</span>
  </div>
</template>
