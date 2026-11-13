<script setup lang="ts">
import { computed, ref } from "vue";
import { SidebarRow, useLabelMode } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const MAIN = [
  { id: "overview", label: "Overview", glyph: glyph("IconDashboard") },
  { id: "backups", label: "Backups", glyph: glyph("IconArchive"), count: { value: 3, label: "3 need attention" } },
  { id: "restore", label: "Restore", glyph: glyph("IconRestore") },
];
const FOOT = [{ id: "settings", label: "Settings", glyph: glyph("IconGear") }];

const here = ref("overview");
// The rail narrows in glyph mode only; reactive keeps its width.
const mode = useLabelMode("sidebar");
const rail = computed(() => ({
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "space-between",
  gap: "24px",
  width: mode.value === "glyph" ? "var(--rail-narrow)" : "14rem",
  height: "300px",
  padding: "12px",
  borderRadius: "var(--radius-card)",
  background: "var(--carbon-sidebar)",
}));
const group = { display: "flex", flexDirection: "column" as const, gap: "4px" };
</script>

<template>
  <nav aria-label="Main" :style="rail">
    <div :style="group">
      <SidebarRow
        v-for="(r, i) in MAIN"
        :key="r.id"
        :label="r.label"
        :glyph="r.glyph"
        :href="`#/${r.id}`"
        :active="here === r.id"
        :hue-index="i"
        :count="r.count"
        @click.prevent="here = r.id"
      />
    </div>
    <div :style="group">
      <SidebarRow
        v-for="(r, i) in FOOT"
        :key="r.id"
        :label="r.label"
        :glyph="r.glyph"
        :href="`#/${r.id}`"
        :active="here === r.id"
        :hue-index="MAIN.length + i"
        @click.prevent="here = r.id"
      />
    </div>
  </nav>
</template>

