<script setup lang="ts">
import { computed, shallowRef, type Component, type StyleValue } from "vue";
import { fieldWidthClass, type FieldWidth } from "@glimstone/core";
import { useFieldName } from "./fieldName";

// A field with a glyph inside it, bound with v-model, such as a filter or a
// search. The box is the field: it steps up the ramp while the input has focus
// (rule 14), and being a <label> it hands a click on the glyph to the input. The
// `after` slot holds controls inside the box. Attributes go to the <input>;
// `class` and `style` go to the box, which carries the width.
defineOptions({ inheritAttrs: false });

const props = defineProps<{
  glyph: Component;
  /** The accessible name. Inside a FieldRow the row gives it. */
  label?: string;
  /** Sets a path or a token in monospace. */
  mono?: boolean;
  width?: FieldWidth;
}>();
const value = defineModel<string>({ default: "" });
const name = useFieldName(() => props.label);
const widthClass = computed(() => fieldWidthClass(props.width));
const input = shallowRef<HTMLInputElement | null>(null);
defineExpose({ input });
</script>

<template>
  <label data-glim="GlyphField" :class="['glim-input', 'glim-glyph-field', widthClass, { 'glim-input--mono': mono }, $attrs.class]" :style="$attrs.style as StyleValue">
    <span class="glim-glyph-field-glyph" aria-hidden="true"><component :is="glyph" /></span>
    <input
      ref="input"
      v-model="value"
      type="text"
      :aria-label="name"
      v-bind="{ ...$attrs, class: undefined, style: undefined }"
      class="glim-glyph-field-input"
    />
    <slot name="after" />
  </label>
</template>
