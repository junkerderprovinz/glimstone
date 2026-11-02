<script setup lang="ts">
import { ref } from "vue";
import { Select } from "@glimstone/vue/Select";

const QUALITY = ["Auto", "1080p", "720p", "480p"].map((q) => ({ value: q, label: q }));
const SCOPE = [
  { value: "all", label: "Everywhere" },
  { value: "names", label: "Names" },
  { value: "hosts", label: "Hosts" },
];
const quality = ref<string | null>("1080p");
const scope = ref<string | null>("all");
</script>

<template>
  <div style="display: grid; gap: 16px; width: 360px">
    <!-- A list row: the name, then a picker that has no label of its own. -->
    <div data-size="row" style="display: flex; align-items: center; gap: 12px">
      <span style="flex: 1; min-width: 0">Concert recording.mkv</span>
      <Select v-model="quality" label="Quality" hide-label tip="Quality" size="row" :options="QUALITY" />
    </div>
    <!-- A search field with its scope inside it, at its end. -->
    <div data-size="inset" class="field" style="display: flex; align-items: center; gap: 8px; padding-inline-end: 4px">
      <input
        aria-label="Search"
        placeholder="Search"
        style="flex: 1; min-width: 0; border: 0; background: transparent; color: inherit; font: inherit; outline: none"
      />
      <Select v-model="scope" label="Search in" hide-label size="inset" :options="SCOPE" />
    </div>
  </div>
</template>
