<script setup lang="ts">
import { ref } from "vue";
import { oledRefusal } from "@glimstone/core";
import { FieldRow, Selector, Toggle } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const THEMES = [
  { id: "dark", label: "Dark", glyph: glyph("IconMoon") },
  { id: "light", label: "Light", glyph: glyph("IconSun") },
  { id: "system", label: "System", glyph: glyph("IconThemeSystem") },
];

const theme = ref("light");
const oled = ref(true);
</script>

<template>
  <div style="display: grid; gap: 12px; width: 100%; max-width: 420px">
    <Selector v-model="theme" label="Design" :items="THEMES" activation="manual" equal-width />
    <FieldRow label="OLED" hint="True black for OLED and AMOLED screens, whenever the dark look is showing.">
      <Toggle v-model="oled" :refused="oledRefusal(theme)" />
    </FieldRow>
  </div>
</template>
