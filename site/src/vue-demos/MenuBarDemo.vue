<script setup lang="ts">
import { computed, ref } from "vue";
import { MenuBar, type MenuBarMenu } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const last = ref("nothing yet");
const hidden = ref(false);
const layout = ref("Details");
const run = (label: string) => () => (last.value = label);

const menus = computed<MenuBarMenu[]>(() => [
  {
    label: "File",
    items: [
      { label: "New folder", glyph: glyph("IconFolderAdd"), shortcut: "F7", onSelect: run("New folder") },
      { label: "Upload", glyph: glyph("IconUpload"), onSelect: run("Upload") },
      "-",
      { label: "Delete", glyph: glyph("IconTrash"), shortcut: "Del", onSelect: run("Delete") },
    ],
  },
  {
    label: "Edit",
    items: [
      { label: "Copy", glyph: glyph("IconCopy"), shortcut: "Ctrl+C", onSelect: run("Copy") },
      { label: "Paste", glyph: glyph("IconPaste"), shortcut: "Ctrl+V", onSelect: run("Paste") },
    ],
  },
  {
    label: "View",
    items: [
      {
        label: "Layout",
        glyph: glyph("IconTabApps"),
        sub: ["Details", "List", "Tiles"].map((l) => ({ label: l, checked: layout.value === l, radio: true, onSelect: () => (layout.value = l) })),
      },
      { label: "Show hidden files", checked: hidden.value, onSelect: () => (hidden.value = !hidden.value) },
    ],
  },
  {
    label: "Help",
    items: [
      { label: "Keyboard shortcuts", glyph: glyph("IconKeyboard"), shortcut: "F1", onSelect: run("Keyboard shortcuts") },
      { label: "About", glyph: glyph("IconInfo"), onSelect: run("About") },
    ],
  },
]);
</script>

<template>
  <div style="display: grid; gap: 12px">
    <MenuBar label="Menu" :menus="menus" />
    <span data-last>Last choice: {{ last }}. Layout {{ layout }}.</span>
  </div>
</template>
