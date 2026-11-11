<script setup lang="ts">
import { computed } from "vue";
import { pillClassName, type PillTone } from "@glimstone/core";

// One value of a list row, such as a size, a date or a state; pillClassName()
// in the core says why it is not a Badge. A class such as `glim-num` falls
// through for figures that line up in a column.
const props = withDefaults(
  defineProps<{
    /** `state` lifts a word that says what the row is doing; the other three
     *  wash the pill in their state colour. */
    tone?: PillTone;
  }>(),
  { tone: "neutral" },
);
const classes = computed(() => pillClassName(props.tone));
</script>

<template>
  <span data-glim="Pill" :class="classes"><slot /></span>
</template>
