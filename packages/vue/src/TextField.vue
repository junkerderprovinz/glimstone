<script setup lang="ts">
import { computed, shallowRef, useAttrs, useId } from "vue";
import { fieldErrorView, textFieldClass, type FieldWidth } from "@glimstone/core";
import FieldError from "./FieldError.vue";
import { useFieldName } from "./fieldName";

// One line of text, bound with v-model: borderless and filled, focus a step up
// the ramp (rule 14). Other attributes go to the <input>.
defineOptions({ inheritAttrs: false });
const props = defineProps<{
  /** The accessible name. Inside a FieldRow the row gives it. */
  label?: string;
  /** Sets a path or a token in monospace. */
  mono?: boolean;
  width?: FieldWidth;
  /** Why the value cannot stand, as a line under the field until it is fixed. */
  error?: string;
}>();
const value = defineModel<string>({ default: "" });
const name = useFieldName(() => props.label);
const classes = computed(() => textFieldClass({ width: props.width, mono: props.mono }));
const attrs = useAttrs();
const own = useId();
const err = computed(() => fieldErrorView(props.error, (attrs.id as string | undefined) ?? own, attrs["aria-describedby"] as string | undefined));
const input = shallowRef<HTMLInputElement | null>(null);
defineExpose({ input });
</script>

<template>
  <input
    data-glim="TextField"
    v-bind="$attrs"
    ref="input"
    v-model="value"
    type="text"
    :aria-label="name"
    :aria-invalid="err.invalid"
    :aria-describedby="err.describedBy"
    :class="classes"
  />
  <FieldError v-if="err.errorId" :id="err.errorId">{{ error }}</FieldError>
</template>
