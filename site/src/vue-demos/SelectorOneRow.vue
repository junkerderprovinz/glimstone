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
  { id: "system", label: "Follow the system" },
  { id: "light", label: "Always the light theme" },
  { id: "dark", label: "Always the dark theme" },
];

const JOBS = [
  { id: "running", label: "Running" },
  { id: "queued", label: "Waiting in the queue" },
  { id: "done", label: "Finished in the last 30 days" },
];

const shown = ref("open");
const look = ref("light");
const a = ref("system");
const b = ref("system");
const jobs = ref(["running"]);
</script>

<template>
  <div style="display: grid; gap: 16px; width: 100%; max-width: 560px">
    <div data-row="labels">
      <Selector v-model="shown" label="Shown" :items="SHOWN" activation="manual" equal-width />
    </div>
    <div data-row="glyphs">
      <Selector v-model="look" label="Look" :items="LOOKS" activation="manual" size="lg" equal-width />
    </div>
    <div data-row="list">
      <Selector v-model="a" label="Theme" :items="THEMES" activation="manual" />
    </div>
    <div data-row="list-inline">
      <Selector v-model="b" label="Theme, inline" :items="THEMES" activation="manual" size="sm" inline button-height />
    </div>
    <div data-row="cut">
      <Selector v-model="jobs" label="Jobs" select="many" :items="JOBS" />
    </div>
  </div>
</template>
