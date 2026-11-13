<script setup lang="ts">
import { ref } from "vue";
import { NumberField } from "@glimstone/vue";

const keep = ref<number | null>(7);
const row = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", width: "100%", maxWidth: "360px" };
</script>

<template>
  <div style="display: grid; gap: 12px; width: 100%; max-width: 360px">
    <label :style="row">
      <span>Snapshots to keep</span>
      <NumberField v-model="keep" :min="1" :max="30" />
    </label>
    <p style="margin: 0; color: var(--carbon-text-sub); font-size: 13px">Keeps {{ keep ?? "" }} snapshots.</p>
  </div>
</template>

