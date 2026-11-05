<script setup lang="ts">
import { ref, watch } from "vue";
import { Button, Window } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const TEXT = { cancel: "Cancel", close: "Close" };
const ACTIONS = [{ label: "Move all 1,204 files to the archive", labelKey: null, glyph: glyph("IconFolder"), primary: true, attrs: { "data-action": "move" } }];

const open = ref(false);
const width = ref(0);
const win = ref<InstanceType<typeof Window> | null>(null);
watch(
  win,
  (w) => {
    if (w?.card) width.value = w.card.offsetWidth;
  },
  { flush: "post" },
);
</script>

<template>
  <Button label="Move files" :label-key="null" :glyph="glyph('IconFolder')" @click="open = true" />
  <Window
    v-if="open"
    ref="win"
    title="Move files"
    :text="TEXT"
    start="1,204 files from /mnt/user/media to /mnt/user/archive, about 38 GB, and both panels stay usable while they move"
    :actions="ACTIONS"
    @close="open = false"
  >
    <p style="margin: 0">{{ width }} px wide</p>
  </Window>
</template>
