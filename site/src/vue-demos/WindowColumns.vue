<script setup lang="ts">
import { computed, ref } from "vue";
import { Button, Checkbox, Window } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const COLUMNS = ["Name", "Size", "Modified", "Kind", "Owner"];
const TEXT = { cancel: "Cancel", close: "Close" };

const open = ref(false);
const about = ref(false);
const shown = ref(["Name", "Size", "Modified"]);
const query = ref("");
const found = computed(() => COLUMNS.filter((c) => c.toLowerCase().includes(query.value.toLowerCase())));
const flip = (c: string) => (shown.value = shown.value.includes(c) ? shown.value.filter((x) => x !== c) : [...shown.value, c]);
const actions = [
  {
    label: "Reset",
    labelKey: "reset",
    // The reset shows in the boxes, so the window stays for a second look.
    onClick: () => {
      shown.value = ["Name", "Size", "Modified"];
      return false as const;
    },
  },
  { label: "Apply", labelKey: null, glyph: glyph("IconApply"), primary: true },
];
</script>

<template>
  <Button label="Choose columns" label-key="settings" @click="open = true" />
  <Window
    v-if="open"
    title="Columns"
    size="wide"
    :text="TEXT"
    start="Drag a column's header to move it"
    :actions="actions"
    @close="open = false"
  >
    <input v-model="query" class="field" type="search" placeholder="Find a column" aria-label="Find a column" />
    <div style="display: flex; flex-wrap: wrap; gap: 4px">
      <Checkbox
        v-for="c in found"
        :key="c"
        :label="c"
        :model-value="shown.includes(c)"
        :disabled="c === 'Name'"
        @update:model-value="flip(c)"
      />
    </div>
    <div>
      <Button label="About columns" :label-key="null" tone="subtle" @click="about = true" />
    </div>
  </Window>
  <Window
    v-if="about"
    title="About columns"
    :text="TEXT"
    :actions="[{ label: 'Got it', labelKey: 'confirm', wayOut: true }]"
    @close="about = false"
  >
    <p style="margin: 0">Each panel keeps its own columns, and the name always stays.</p>
  </Window>
</template>
