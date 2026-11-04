<script setup lang="ts">
import { computed, ref, shallowRef } from "vue";
import { Button, ContextMenu, type MenuEntry } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const FILES = ["holiday.mkv", "notes.pdf", "budget.ods"];

const at = shallowRef<{ x: number; y: number; opener?: HTMLElement } | null>(null);
const last = ref("nothing yet");
const hidden = ref(false);
const sort = ref("Name");
const kind = ref(true);
const more = shallowRef<{ el: HTMLButtonElement | null } | null>(null);

const items = computed<MenuEntry[]>(() => [
  { label: "Open", glyph: glyph("IconFolderOpen"), shortcut: "Enter", onSelect: () => (last.value = "Open") },
  { label: "Rename", glyph: glyph("IconPencil"), shortcut: "F2", onSelect: () => (last.value = "Rename") },
  { label: "Paste", glyph: glyph("IconPaste"), disabled: true },
  "-",
  "-",
  {
    label: "Sort by",
    glyph: glyph("IconSort"),
    sub: ["Name", "Size", "Modified"].map((s) => ({ label: s, checked: sort.value === s, radio: true, onSelect: () => (sort.value = s) })),
  },
  {
    label: "Group",
    glyph: glyph("IconFiles"),
    sub: [{ label: "By kind", checked: kind.value, onSelect: () => (kind.value = !kind.value) }],
  },
  { label: "Show hidden files", checked: hidden.value, onSelect: () => (hidden.value = !hidden.value) },
  { label: "Select the same kind", glyph: glyph("IconSelectAll"), count: 3, onSelect: () => (last.value = "Select the same kind") },
  { label: "Red label", color: "var(--status-fail-solid)", onSelect: () => (last.value = "Red label") },
  "-",
  { head: "Bookmarks", edit: { tip: "Edit bookmarks", onSelect: () => (last.value = "Edit bookmarks") } },
  { label: "Downloads", glyph: glyph("IconFolder"), onSelect: () => (last.value = "Downloads") },
  "-",
]);

function openAt(e: MouseEvent) {
  at.value = { x: e.clientX, y: e.clientY };
}
function toggleMore() {
  const el = more.value?.el;
  if (!el) return;
  const r = el.getBoundingClientRect();
  at.value = at.value ? null : { x: r.left, y: r.bottom + 6, opener: el };
}
</script>

<template>
  <div style="display: grid; gap: 12px; width: 100%">
    <div style="display: grid; gap: 2px" aria-label="Files" role="list" @contextmenu.prevent="openAt">
      <div v-for="f in FILES" :key="f" role="listitem" class="glim-well" style="padding: 6px 10px">{{ f }}</div>
    </div>
    <div style="display: flex; gap: 12px; align-items: center">
      <Button ref="more" label="More" label-key="more" @click="toggleMore" />
      <span data-last>Last choice: {{ last }}. Sorted by {{ sort }}. Hidden files {{ hidden ? "shown" : "hidden" }}.</span>
    </div>
    <ContextMenu v-if="at" :x="at.x" :y="at.y" :items="items" label="File" :opener="at.opener" @close="at = null" />
  </div>
</template>
