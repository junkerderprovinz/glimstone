<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { Selector, selectorTabId } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const PAGES = [
  { id: "general", label: "General", glyph: glyph("IconTabGeneral") },
  { id: "look", label: "Look", glyph: glyph("IconTabLook") },
  { id: "storage", label: "Storage", glyph: glyph("IconTabStorage") },
  { id: "notifications", label: "Notifications", glyph: glyph("IconNotifications") },
];

const page = ref("general");
const panel = useId();
const name = computed(() => PAGES.find((p) => p.id === page.value)!.label);
</script>

<template>
  <div style="display: grid; gap: 16px; width: 100%">
    <Selector
      v-model="page"
      label="Settings pages"
      :items="PAGES"
      size="lg"
      variant="chip"
      :hue-offset="0"
      :panel-id="panel"
    />
    <div :id="panel" role="tabpanel" :aria-labelledby="selectorTabId(panel, page as string)">The {{ name }} page.</div>
  </div>
</template>
