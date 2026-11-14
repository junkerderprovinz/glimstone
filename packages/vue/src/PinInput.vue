<script setup lang="ts">
import { computed, useId } from "vue";
import * as pinInput from "@zag-js/pin-input";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { PIN_INPUT_TEXT, pinCells, type PinInputText } from "@glimstone/core";
import { useFieldName } from "./fieldName";

// A short code typed one character to a box, bound with v-model, such as the
// six digits of a second factor. A code is data, so the boxes run left to
// right in every language. Inside a FieldRow the row names it.
const props = withDefaults(
  defineProps<{
    label?: string;
    length?: number;
    /** What a box takes: digits by default. */
    type?: "numeric" | "alphanumeric" | "alphabetic";
    /** Draws dots instead of the characters, for a code that is a secret. */
    mask?: boolean;
    /** Offers the code the phone just received, as a one-time code. */
    otp?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    text?: Partial<PinInputText>;
  }>(),
  { length: 6, type: "numeric", mask: false, otp: false, invalid: false, disabled: false },
);
const value = defineModel<string>({ required: true });
const emit = defineEmits<{
  /** Every box holds a character. */
  complete: [value: string];
}>();

const name = useFieldName(() => props.label);
const words = computed(() => ({ ...PIN_INPUT_TEXT, ...props.text }));
const id = useId();
const service = useMachine(
  pinInput.machine,
  computed(() => ({
    id,
    dir: "ltr" as const,
    count: props.length,
    value: pinCells(value.value, props.length),
    type: props.type,
    mask: props.mask,
    otp: props.otp,
    invalid: props.invalid,
    disabled: props.disabled,
    placeholder: "",
    onValueChange: (d: { valueAsString: string }) => (value.value = d.valueAsString),
    onValueComplete: (d: { valueAsString: string }) => emit("complete", d.valueAsString),
    translations: { inputLabel: (index: number, count: number) => words.value.cell(index + 1, count) },
  })),
);
const api = computed(() => pinInput.connect(service, normalizeProps));
</script>

<template>
  <div data-glim="PinInput" v-bind="api.getRootProps()" class="glim-pin">
    <label v-bind="api.getLabelProps()" :class="label === undefined ? 'glim-sr-only' : 'glim-field-label'">{{ name }}</label>
    <div v-bind="api.getControlProps()" class="glim-pin-control">
      <input v-for="index in api.items" :key="index" v-bind="api.getInputProps({ index })" class="glim-input glim-pin-cell glim-num" />
    </div>
    <input v-bind="api.getHiddenInputProps()" />
  </div>
</template>
