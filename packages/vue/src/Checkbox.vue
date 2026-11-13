<script setup lang="ts">
import { computed } from "vue";
import { IconCheck } from "./glyphs";

// The checkbox, bound with v-model, for the places a box stands instead of a
// switch (rule 39): "Don't show again" under a notice, and choices that are
// applied together, such as which columns a list shows. Every setting is a
// Toggle. It is a button for its look, and like a native checkbox only Space
// flips it.
const props = withDefaults(
  defineProps<{
    /** Always the accessible name; shown beside the box unless hideLabel. */
    label: string;
    /** For a grid whose row and column headings already say it, such as permissions. */
    hideLabel?: boolean;
    /** The box alone, without the frame and its hover ground, for a row or a cell of a dense list. Hides the label. */
    slim?: boolean;
    disabled?: boolean;
  }>(),
  { hideLabel: false, slim: false, disabled: false },
);
const bare = computed(() => props.hideLabel || props.slim);
const checked = defineModel<boolean>({ required: true });
</script>

<template>
  <button
    data-glim="Checkbox"
    type="button"
    role="checkbox"
    :aria-checked="checked"
    :aria-label="bare ? label : undefined"
    :disabled="disabled"
    :class="['glim-checkbox', { 'glim-checkbox--slim': slim }]"
    @click="checked = !checked"
    @keydown.enter.prevent
  >
    <span class="glim-checkbox-box" aria-hidden="true"><IconCheck /></span>
    <span v-if="!bare">{{ label }}</span>
  </button>
</template>
