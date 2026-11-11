<script setup lang="ts">
import { computed, shallowRef } from "vue";
import { textFieldClass, type FieldWidth } from "@glimstone/core";
import { useFieldName } from "./fieldName";

// One line of text, bound with v-model: borderless and filled, focus a step up
// the ramp (rule 14). Other attributes go to the <input>.
const props = defineProps<{
  /** The accessible name. Inside a FieldRow the row gives it. */
  label?: string;
  /** Sets a path or a token in monospace. */
  mono?: boolean;
  width?: FieldWidth;
}>();
const value = defineModel<string>({ default: "" });
const name = useFieldName(() => props.label);
const classes = computed(() => textFieldClass({ width: props.width, mono: props.mono }));
const input = shallowRef<HTMLInputElement | null>(null);
defineExpose({ input });
</script>

<template>
  <input data-glim="TextField" ref="input" v-model="value" type="text" :aria-label="name" :class="classes" />
</template>
