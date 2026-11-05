<script setup lang="ts">
import { ref } from "vue";
import { Selector } from "@glimstone/vue";

const THEMES = [
  { id: "system", label: "Donaudampfschifffahrtsgesellschaft" },
  { id: "light", label: "Always the light theme" },
  { id: "dark", label: "Always the dark theme" },
  { id: "bright", label: "Bright with a high contrast" },
  { id: "custom", label: "Your own colours" },
];

const a = ref("light");
const b = ref("light");
</script>

<template>
  <div style="display: grid; gap: 16px; width: 100%; max-width: 560px">
    <div data-pairs="plain">
      <Selector v-model="a" label="Theme" :items="THEMES" activation="manual" pairs-on-phone />
    </div>
    <div data-pairs="tight">
      <Selector v-model="b" label="Theme, inline" :items="THEMES" activation="manual" size="sm" inline button-height pairs-on-phone />
    </div>
  </div>
</template>
