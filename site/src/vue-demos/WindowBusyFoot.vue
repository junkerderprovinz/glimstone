<script setup lang="ts">
import { ref } from "vue";
import { Button, Window } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const TEXT = { cancel: "Cancel", close: "Close" };
const stay = () => false as const;
const open = ref<"compare" | "unsaved" | null>(null);
const COMPARE = [
  { label: "Sync left to right", labelKey: null, glyph: glyph("IconApply"), onClick: stay },
  { label: "Sync right to left", labelKey: null, glyph: glyph("IconApply"), onClick: stay },
  { label: "Close", labelKey: "common.close", glyph: glyph("IconClose"), primary: true, wayOut: true },
];
const UNSAVED = [
  { label: "Keep", labelKey: null, glyph: glyph("IconApply"), wayOut: true },
  { label: "Save a copy", labelKey: null, glyph: glyph("IconCopy"), onClick: stay },
  { label: "Don't save", labelKey: null, glyph: glyph("IconClose"), onClick: stay },
  { label: "Save and close", labelKey: null, glyph: glyph("IconApply"), primary: true },
];
</script>

<template>
  <div style="display: flex; gap: 8px">
    <Button label="Compare" :label-key="null" @click="open = 'compare'" />
    <Button label="Unsaved" :label-key="null" @click="open = 'unsaved'" />
  </div>
  <Window v-if="open === 'compare'" title="Compare two folders" :text="TEXT" start="12 differences" :actions="COMPARE" @close="open = null">
    <p style="margin: 0">Both sides were read just now.</p>
  </Window>
  <Window v-if="open === 'unsaved'" title="Unsaved changes" :text="TEXT" :actions="UNSAVED" @close="open = null">
    <p style="margin: 0">The file has changes that are not saved.</p>
  </Window>
</template>
