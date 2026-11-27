<script setup lang="ts">
import { computed, shallowRef, useAttrs, useId, watch } from "vue";
import { fieldErrorView, fitTextArea, textFieldClass, type FieldWidth } from "@glimstone/core";
import FieldErrorLine from "./FieldErrorLine.vue";
import { useFieldName } from "./fieldName";

// A few lines of text, bound with v-model, in the look of a TextField,
// growing with its text from three lines to ten. Other attributes go to the
// <textarea>.
defineOptions({ inheritAttrs: false });
const props = defineProps<{
  /** The accessible name. Inside a FieldRow the row gives it. */
  label?: string;
  /** Sets the text in monospace. */
  mono?: boolean;
  width?: FieldWidth;
  /** Why the value cannot stand, as a line under the field until it is fixed. */
  error?: string;
}>();
const value = defineModel<string>({ default: "" });
const name = useFieldName(() => props.label);
const classes = computed(() => textFieldClass({ width: props.width, mono: props.mono, area: true }));
const attrs = useAttrs();
const own = useId();
const err = computed(() => fieldErrorView(props.error, (attrs.id as string | undefined) ?? own, attrs["aria-describedby"] as string | undefined));
const input = shallowRef<HTMLTextAreaElement | null>(null);
defineExpose({ input });
watch([value, input], () => fitTextArea(input.value), { flush: "post" });
</script>

<template>
  <textarea
    data-glim="TextArea"
    v-bind="$attrs"
    ref="input"
    v-model="value"
    :aria-label="name"
    :aria-invalid="err.invalid"
    :aria-describedby="err.describedBy"
    :class="classes"
    @input="fitTextArea(input)"
  />
  <FieldErrorLine :id="err.errorId" :error="error" />
</template>
