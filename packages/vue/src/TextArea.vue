<script setup lang="ts">
import { computed, shallowRef } from "vue";
import { textFieldClass, type FieldWidth } from "@glimstone/core";
import { useFieldName } from "./fieldName";

// A few lines of text, bound with v-model, in the look of a TextField and
// dragged taller from its corner. Other attributes go to the <textarea>.
const props = defineProps<{
  /** The accessible name. Inside a FieldRow the row gives it. */
  label?: string;
  /** Sets the text in monospace. */
  mono?: boolean;
  width?: FieldWidth;
}>();
const value = defineModel<string>({ default: "" });
const name = useFieldName(() => props.label);
const classes = computed(() => textFieldClass({ width: props.width, mono: props.mono, area: true }));
const input = shallowRef<HTMLTextAreaElement | null>(null);
defineExpose({ input });
</script>

<template>
  <textarea data-glim="TextArea" ref="input" v-model="value" :aria-label="name" :class="classes" />
</template>
