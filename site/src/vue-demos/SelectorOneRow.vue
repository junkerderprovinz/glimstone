<script setup lang="ts">
import { ref } from "vue";
import { Selector } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const SHOWN = [
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed in the last 30 days" },
];

const LOOKS = [
  { id: "light", label: "Always the light theme", glyph: glyph("IconSun") },
  { id: "dark", label: "Always the dark theme", glyph: glyph("IconMoon") },
  { id: "system", label: "Follow the system", glyph: glyph("IconThemeSystem") },
];

const THEMES = [
  { id: "system", label: "Donaudampfschifffahrtsgesellschaft" },
  { id: "light", label: "Always the light theme" },
  { id: "dark", label: "Always the dark theme" },
  { id: "bright", label: "Bright with a high contrast" },
  { id: "custom", label: "Your own colours" },
];

const shown = ref("open");
const look = ref("light");
const a = ref("light");
const b = ref("light");
</script>

<template>
  <div style="display: grid; gap: 16px; width: 100%; max-width: 560px">
    <div data-row="labels">
      <Selector v-model="shown" label="Shown" :items="SHOWN" activation="manual" equal-width />
    </div>
    <div data-row="glyphs">
      <Selector v-model="look" label="Look" :items="LOOKS" activation="manual" size="lg" equal-width />
    </div>
    <div data-row="cut">
      <Selector v-model="a" label="Theme" :items="THEMES" activation="manual" />
    </div>
    <div data-row="cut-inline">
      <Selector v-model="b" label="Theme, inline" :items="THEMES" activation="manual" size="sm" inline button-height />
    </div>
  </div>
</template>
