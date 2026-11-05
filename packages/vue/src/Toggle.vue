<script setup lang="ts">
import { computed, type StyleValue } from "vue";
import { useFieldName } from "./fieldName";

// The shared switch, bound with v-model. The label is always the accessible
// name; `hideLabel` only drops the visible caption. No `title`: the label is
// visible beside the switch, so a tooltip would only repeat it. Attributes and
// listeners go to the switch, which is what a script asks for its state; `class`
// and `style` go to the frame, which carries the row's layout. Inside a FieldRow
// the row names the switch and draws the words.
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The accessible name, shown beside the switch. Inside a FieldRow the row gives it. */
    label?: string;
    /** Use it only when the caller draws the same text right next to the
     *  switch, never because a card title further up already says it. */
    hideLabel?: boolean;
    disabled?: boolean;
  }>(),
  { hideLabel: false, disabled: false },
);
const checked = defineModel<boolean>({ required: true });
const name = useFieldName(() => props.label);
const caption = computed(() => props.label !== undefined && !props.hideLabel);
</script>

<template>
  <span :class="['glim-toggle', $attrs.class]" :style="$attrs.style as StyleValue">
    <span v-if="caption" class="glim-toggle-label">{{ label }}</span>
    <button
      v-bind="{ ...$attrs, class: undefined, style: undefined }"
      type="button"
      role="switch"
      :aria-checked="checked"
      :aria-label="name"
      :disabled="disabled"
      class="glim-toggle-track"
      @click="checked = !checked"
    >
      <span class="glim-toggle-thumb" />
    </button>
  </span>
</template>
