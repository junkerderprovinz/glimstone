<script setup lang="ts">
import { computed, useId } from "vue";
import * as angleSlider from "@zag-js/angle-slider";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { pageDir } from "@glimstone/core";
import { useFieldName } from "./fieldName";

// An angle set on a dial, bound with v-model, such as how far a picture turns.
// The dial is round whatever the shape setting, since a circle is its geometry
// and not a corner, and the value stands beside it in degrees, left to right
// in every language. Inside a FieldRow the row names it.
const props = withDefaults(
  defineProps<{
    label?: string;
    step?: number;
    /** The angles that carry a tick on the dial. */
    marks?: number[];
    disabled?: boolean;
  }>(),
  { step: 1, marks: () => [0, 90, 180, 270], disabled: false },
);
const value = defineModel<number>({ required: true });

const name = useFieldName(() => props.label);
const id = useId();
const service = useMachine(
  angleSlider.machine,
  computed(() => ({
    id,
    dir: pageDir(),
    value: value.value,
    step: props.step,
    disabled: props.disabled,
    onValueChange: (d: { value: number }) => (value.value = d.value),
  })),
);
const api = computed(() => angleSlider.connect(service, normalizeProps));
</script>

<template>
  <div data-glim="AngleSlider" v-bind="api.getRootProps()" class="glim-angle">
    <label v-bind="api.getLabelProps()" :class="label === undefined ? 'glim-sr-only' : 'glim-field-label'">{{ name }}</label>
    <div class="glim-angle-body">
      <div v-bind="api.getControlProps()" class="glim-angle-dial">
        <div v-bind="api.getMarkerGroupProps()" class="glim-angle-marks">
          <span v-for="mark in marks" :key="mark" v-bind="api.getMarkerProps({ value: mark })" class="glim-angle-mark" />
        </div>
        <div v-bind="api.getThumbProps()" :aria-valuetext="`${api.value}°`" class="glim-angle-thumb" />
      </div>
      <div v-bind="api.getValueTextProps()" class="glim-angle-value glim-num">{{ `${api.value}°` }}</div>
    </div>
    <input v-bind="api.getHiddenInputProps()" />
  </div>
</template>
