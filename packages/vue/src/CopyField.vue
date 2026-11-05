<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef } from "vue";
import { COPIED_MS, copyText, fieldWidthClass, type FieldWidth } from "@glimstone/core";
import Button from "./Button.vue";
import { useFieldName } from "./fieldName";
import { IconCheck, IconCopy } from "./glyphs";

// A value somebody copies rather than types, such as a token, a path or an
// address: the value in monospace and a button that copies it and says so for
// a moment. Where the browser refuses to copy, the value is selected instead,
// so Ctrl+C still works. A `class` goes to the row, which carries the width.
const props = withDefaults(
  defineProps<{
    value: string;
    /** The field's accessible name, such as "Token". Inside a FieldRow the row gives it. */
    label?: string;
    width?: FieldWidth;
    /** The button's words, before and for a moment after it copied. */
    text?: { copy: string; copied: string };
  }>(),
  { text: () => ({ copy: "Copy", copied: "Copied" }) },
);
/** `copy` after every press, with whether the value reached the clipboard. */
const emit = defineEmits<{ copy: [done: boolean] }>();

const name = useFieldName(() => props.label);
const copied = ref(false);
const field = shallowRef<HTMLInputElement | null>(null);
let timer: number | undefined;
onBeforeUnmount(() => clearTimeout(timer));

async function copy() {
  const done = await copyText(props.value);
  emit("copy", done);
  if (!done) {
    field.value?.focus();
    field.value?.select();
    return;
  }
  copied.value = true;
  clearTimeout(timer);
  timer = window.setTimeout(() => (copied.value = false), COPIED_MS);
}
</script>

<template>
  <span :class="['glim-copy', fieldWidthClass(width)]">
    <input ref="field" readonly :value="value" :aria-label="name" spellcheck="false" class="glim-input glim-input--mono" />
    <Button
      :label="copied ? text.copied : text.copy"
      :label-key="copied ? 'copied' : 'copy'"
      :glyph="copied ? IconCheck : IconCopy"
      variant="icon"
      @click="copy"
    />
    <span role="status" class="glim-sr-only">{{ copied ? text.copied : "" }}</span>
  </span>
</template>
