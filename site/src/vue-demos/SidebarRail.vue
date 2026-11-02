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
const width = computed(() => (mode.value === "glyph" ? "var(--rail-narrow)" : "14rem"));
</script>

<template>
  <nav aria-label="Main" class="rail" :style="{ width }">
    <div class="group">
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
    <div class="group">
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

<style scoped>
.rail {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  height: 300px;
  padding: 12px;
  border-radius: var(--radius-card);
  background: var(--carbon-sidebar);
}
.group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
