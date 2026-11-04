<script setup lang="ts">
import { IconCheck } from "./glyphs";

// The checkbox, bound with v-model, for the one place a box stands instead of
// a switch: "Don't show again" under a notice (rule 39), and a column of
// choices that are applied together, such as which columns a list shows.
// Every setting is a Toggle.
withDefaults(
  defineProps<{
    /** Always the accessible name; shown beside the box unless hideLabel. */
    label: string;
    /** For a grid whose row and column headings already say it, such as permissions. */
    hideLabel?: boolean;
    disabled?: boolean;
  }>(),
  { hideLabel: false, disabled: false },
);
const checked = defineModel<boolean>({ required: true });
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="checked"
    :aria-label="hideLabel ? label : undefined"
    :disabled="disabled"
    class="glim-checkbox"
    @click="checked = !checked"
  >
    <span class="glim-checkbox-box" aria-hidden="true"><IconCheck /></span>
    <span v-if="!hideLabel">{{ label }}</span>
  </button>
</template>
