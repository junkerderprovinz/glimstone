<script setup lang="ts">
import { ref } from "vue";
import { ColorPicker } from "@glimstone/vue";

const applied = ref("#fcc419");
const live = ref(applied.value);
</script>

<template>
  <div style="display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap">
    <ColorPicker v-model="applied" @input="live = $event" />
    <p style="margin: 0">
      Live <code>{{ live }}</code>
      <br />
      Applied <code>{{ applied }}</code>
    </p>
  </div>
</template>
