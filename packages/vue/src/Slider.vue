<script setup lang="ts">
import { computed, useId } from "vue";
import * as slider from "@zag-js/slider";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { useFieldName } from "./fieldName";

// A value on a range, for numbers people adjust rather than type, bound with
// v-model. The value stands beside the label in words ("30 days"), and the same
// words are what a screen reader hears, through `format`. Inside a FieldRow the
// row names it and draws the words.
const props = withDefaults(
  defineProps<{
    label?: string;
    min: number;
    max: number;
    step?: number;
    /** How the value reads, on screen and to a screen reader. */
    format: (value: number) => string;
    disabled?: boolean;
  }>(),
  { step: 1, disabled: false },
);
const model = defineModel<number>({ required: true });

const name = useFieldName(() => props.label);
const id = useId();
const service = useMachine(
  slider.machine,
  computed(() => ({
    id,
    value: [model.value],
    min: props.min,
    max: props.max,
    step: props.step,
    disabled: props.disabled,
    onValueChange: (d: { value: number[] }) => (model.value = d.value[0]!),
    getAriaValueText: (d: { value: number }) => props.format(d.value),
  })),
);
const api = computed(() => slider.connect(service, normalizeProps));
</script>

<template>
  <div data-glim="Slider" v-bind="api.getRootProps()" class="glim-slider">
    <div class="glim-slider-head">
      <label v-bind="api.getLabelProps()" :class="label === undefined ? 'glim-sr-only' : 'glim-field-label'">{{ name }}</label>
      <output v-bind="api.getValueTextProps()" class="glim-slider-value">{{ format(api.value[0]!) }}</output>
    </div>
    <div v-bind="api.getControlProps()" class="glim-slider-control">
      <div v-bind="api.getTrackProps()" class="glim-slider-track">
        <div v-bind="api.getRangeProps()" class="glim-slider-range" />
      </div>
      <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })" class="glim-slider-thumb">
        <input v-bind="api.getHiddenInputProps({ index })" />
      </div>
    </div>
  </div>
</template>
