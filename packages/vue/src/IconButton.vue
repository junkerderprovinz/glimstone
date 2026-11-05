<script setup lang="ts">
import type { Component } from "vue";
import { takePageHue } from "@glimstone/core";
import IconTipButton from "./IconTipButton.vue";

// A glyph in a square in every label mode, for a row or a dense toolbar that
// keeps its text. Everything else with one action is a Button with
// variant="icon", which follows the label mode. Attributes go to the <button>.
defineProps<{
  /** The hover and focus explanation, and the button's accessible name. */
  tip: string;
  glyph: Component;
  disabled?: boolean;
}>();

function reach(e: Event) {
  takePageHue(e.currentTarget as HTMLElement);
}
</script>

<template>
  <IconTipButton :tip="tip" :disabled="disabled" class="glim-btn-bare glim-icon-btn" @pointerenter="reach" @focusin="reach">
    <component :is="glyph" />
  </IconTipButton>
</template>
