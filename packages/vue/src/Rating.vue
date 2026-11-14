<script setup lang="ts">
import { computed, useId } from "vue";
import * as ratingGroup from "@zag-js/rating-group";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { RATING_TEXT, pageDir, type RatingText } from "@glimstone/core";
import { useFieldName } from "./fieldName";
import { IconStar } from "./glyphs";

// A value given in stars, bound with v-model, such as how well a release
// worked. The stars up to the value are filled with the accent, the rest stand
// on the third surface. It is a radio group: the arrows move the value, and a
// pointer over a star shows what a press would give. Inside a FieldRow the row
// names it.
const props = withDefaults(
  defineProps<{
    label?: string;
    count?: number;
    /** Takes half stars, from the pointer and from the arrows. */
    allowHalf?: boolean;
    /** Shows the value and takes no input, such as an average. */
    readOnly?: boolean;
    disabled?: boolean;
    text?: Partial<RatingText>;
  }>(),
  { count: 5, allowHalf: false, readOnly: false, disabled: false },
);
const value = defineModel<number>({ required: true });

const name = useFieldName(() => props.label);
const words = computed(() => ({ ...RATING_TEXT, ...props.text }));
const id = useId();
const service = useMachine(
  ratingGroup.machine,
  computed(() => ({
    id,
    dir: pageDir(),
    value: value.value,
    count: props.count,
    allowHalf: props.allowHalf,
    readOnly: props.readOnly,
    disabled: props.disabled,
    onValueChange: (d: { value: number }) => (value.value = d.value),
    translations: { ratingValueText: (index: number) => words.value.star(index, props.count) },
  })),
);
const api = computed(() => ratingGroup.connect(service, normalizeProps));
</script>

<template>
  <div data-glim="Rating" v-bind="api.getRootProps()" class="glim-rating">
    <label v-bind="api.getLabelProps()" :class="label === undefined ? 'glim-sr-only' : 'glim-field-label'">{{ name }}</label>
    <div v-bind="api.getControlProps()" class="glim-rating-control">
      <span v-for="index in api.items" :key="index" v-bind="api.getItemProps({ index })" class="glim-rating-star">
        <IconStar />
        <span class="glim-rating-fill" aria-hidden="true"><IconStar /></span>
      </span>
    </div>
    <input v-bind="api.getHiddenInputProps()" />
  </div>
</template>
