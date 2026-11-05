<script setup lang="ts">
import { ref } from "vue";
import { IconButton } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const pressed = ref(0);
</script>

<template>
  <div style="display: grid; gap: 8px; justify-items: start">
    <div style="display: flex; gap: 2px">
      <IconButton tip="Copy the path" :glyph="glyph('IconCopy')" data-hook="copy" @click="pressed++" />
      <span class="glim-icon-btn-gap" />
      <IconButton tip="Delete" :glyph="glyph('IconTrash')" disabled @click="pressed++" />
    </div>
    <output>Pressed {{ pressed }}</output>
  </div>
</template>
