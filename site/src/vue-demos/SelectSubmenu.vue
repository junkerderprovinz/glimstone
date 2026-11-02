<script setup lang="ts">
import { ref } from "vue";
import type { SelectGroup } from "@glimstone/vue";
import { Select } from "@glimstone/vue/Select";

const zone = (z: string) => ({ value: z, label: z.split("/").pop()!.replace("_", " ") });
const value = ref<string | null>("Europe/Vienna");
const GROUPS: SelectGroup[] = [
  { entries: [{ value: "UTC", label: "UTC" }] },
  {
    heading: "By region",
    entries: [
      { label: "Europe", options: ["Europe/Berlin", "Europe/Lisbon", "Europe/Vienna"].map(zone) },
      { label: "America", options: ["America/Chicago", "America/Los_Angeles", "America/New_York"].map(zone) },
      { label: "Asia", options: ["Asia/Kolkata", "Asia/Tokyo"].map(zone) },
    ],
  },
];
</script>

<template>
  <div style="width: 260px">
    <Select v-model="value" label="Server time zone" :groups="GROUPS" />
  </div>
</template>
