<script setup lang="ts">
import { ref } from "vue";
import type { SelectGroup, SelectOption } from "@glimstone/vue";
import { Select } from "@glimstone/vue/Select";
import { glyph } from "../vue/glyph";

const format = ref<string | null>("opus");
const target = ref<string | null>("local");

const FORMATS: SelectGroup[] = [
  { entries: [{ value: "best", label: "Auto" }] },
  {
    entries: [
      { value: "opus", label: "Opus" },
      { value: "aac", label: "AAC (M4A)" },
      { value: "mp3", label: "MP3" },
    ],
  },
  {
    heading: "Convert to",
    entries: [
      { value: "flac", label: "FLAC" },
      { value: "wav", label: "WAV" },
    ],
  },
];
const TARGETS: SelectOption[] = [
  { value: "local", label: "This server", glyph: glyph("IconFolder") },
  { value: "cloud", label: "Cloud storage", glyph: glyph("IconCloud") },
  { value: "share", label: "Network share", glyph: glyph("IconFolderOpen"), disabled: true },
];
</script>

<template>
  <div style="display: grid; gap: 16px; width: 260px">
    <Select v-model="format" label="Audio format" :groups="FORMATS" />
    <Select v-model="target" label="Save to" :options="TARGETS" />
  </div>
</template>
