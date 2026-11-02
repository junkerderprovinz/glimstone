<script setup lang="ts">
import { ref } from "vue";
import { Select } from "@glimstone/vue/Select";

const BACKENDS = [
  { value: "auto", label: "Automatic" },
  { value: "rd", label: "Real-Debrid" },
  { value: "ad", label: "AllDebrid" },
];

// A pick goes to the server, which takes a moment and refuses AllDebrid.
const shown = ref<string | null>(null);
const busy = ref(false);
const refused = ref(0);
const eth = ref<string | null>("eth0");

function pick(next: string | null) {
  const before = shown.value;
  shown.value = next;
  busy.value = true;
  setTimeout(() => {
    busy.value = false;
    if (next === "ad") {
      shown.value = before;
      refused.value++;
    }
  }, 900);
}
</script>

<template>
  <div style="display: grid; gap: 16px; width: 260px">
    <Select
      label="Backend"
      placeholder="Mixed"
      tip="Which service fetches the selected links"
      :options="BACKENDS"
      :model-value="shown"
      :busy="busy"
      :shake="refused"
      @update:model-value="pick"
    />
    <Select v-model="eth" label="Interface" :options="[{ value: 'eth0', label: 'eth0' }]" disabled />
  </div>
</template>
