<script setup lang="ts">
import { ref } from "vue";
import { IconButton } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const pressed = ref(0);
const pinned = ref(false);
</script>

<template>
  <div style="display: grid; gap: 8px; justify-items: start">
    <div data-row style="display: flex; gap: 2px">
      <IconButton tip="Copy the path" :glyph="glyph('IconCopy')" data-hook="copy" @click="pressed++" />
      <IconButton tip="Move up" :glyph="glyph('IconMoveUp')" absent />
      <IconButton tip="Delete" :glyph="glyph('IconTrash')" disabled @click="pressed++" />
      <IconButton tip="Pin" :glyph="glyph('IconPencil')" :pressed="pinned" @click="pinned = !pinned" />
      <IconButton tip="Open the manual" :glyph="glyph('IconBook')" href="#/guide/palette" />
    </div>
    <output>Pressed {{ pressed }}</output>
  </div>
</template>
