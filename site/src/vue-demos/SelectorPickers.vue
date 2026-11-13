<script setup lang="ts">
import { ref } from "vue";
import { Selector } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const THEMES = [
  { id: "light", label: "Light", glyph: glyph("IconSun") },
  { id: "dark", label: "Dark", glyph: glyph("IconMoon") },
  { id: "system", label: "System", glyph: glyph("IconThemeSystem") },
];

const STATES = [
  { id: "running", label: "Running" },
  { id: "stopped", label: "Stopped" },
  { id: "paused", label: "Paused" },
  { id: "failed", label: "Failed", disabled: true, title: "Nothing has failed" },
];

const caption = { fontSize: "13px", color: "var(--carbon-text-sub)" };

const theme = ref("dark");
const shown = ref(["running", "paused"]);
</script>

<template>
  <div style="display: grid; gap: 20px; width: 100%">
    <div style="display: grid; gap: 8px">
      <span :style="caption">Theme</span>
      <Selector v-model="theme" label="Theme" :items="THEMES" activation="manual" equal-width />
    </div>
    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
      <span :style="caption">Show</span>
      <Selector v-model="shown" label="Show" select="many" :items="STATES" variant="chip" inline />
    </div>
  </div>
</template>

