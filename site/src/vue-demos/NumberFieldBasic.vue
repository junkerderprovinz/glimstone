<script setup lang="ts">
import { ref } from "vue";
import { NumberField } from "@glimstone/vue";

const keep = ref<number | null>(7);
</script>

<template>
  <div style="display: grid; gap: 12px; width: 100%; max-width: 360px">
    <label class="row">
      <span>Snapshots to keep</span>
      <NumberField v-model="keep" :min="1" :max="30" />
    </label>
    <p style="margin: 0; color: var(--carbon-text-sub); font-size: 13px">Keeps {{ keep ?? "" }} snapshots.</p>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  max-width: 360px;
}
</style>
