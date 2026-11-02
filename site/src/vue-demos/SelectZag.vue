<script setup lang="ts">
import { ref } from "vue";
import { Select } from "@glimstone/vue/Select";

const ZONES = ["Europe/Vienna", "Europe/Berlin", "America/New_York", "Asia/Tokyo", "UTC"].map((z) => ({ value: z, label: z }));
const zone = ref<string | null>("Europe/Vienna");
</script>

<template>
  <div style="width: 260px">
    <Select v-model="zone" label="Time zone" :options="ZONES" />
  </div>
</template>
