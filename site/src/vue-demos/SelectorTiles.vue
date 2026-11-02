<script setup lang="ts">
import { computed, ref } from "vue";
import { Selector } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const PAGES = [
  { id: "general", label: "General", glyph: glyph("IconTabGeneral") },
  { id: "look", label: "Look", glyph: glyph("IconTabLook") },
  { id: "storage", label: "Storage locations", glyph: glyph("IconTabStorage") },
  { id: "notifications", label: "Notifications", glyph: glyph("IconNotifications") },
  { id: "security", label: "Security", glyph: glyph("IconTabSecurity") },
  { id: "app", label: "App", glyph: glyph("IconTabApp"), dim: true },
].map((p) => ({ ...p, href: `#/settings/${p.id}` }));

const page = ref("general");
const name = computed(() => PAGES.find((p) => p.id === page.value)!.label);
</script>

<template>
  <div style="display: flex; gap: 16px; width: 100%; height: 320px">
    <Selector v-model="page" label="Settings pages" orientation="vertical" :items="PAGES" />
    <div style="flex: 1; padding: 8px 0">The {{ name }} page.</div>
  </div>
</template>
