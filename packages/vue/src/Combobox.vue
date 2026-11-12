<script setup lang="ts">
import { portalTarget } from "@glimstone/core";
import { computed, shallowRef, useId, watch } from "vue";
import * as combobox from "@zag-js/combobox";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { useFieldName } from "./fieldName";
import { IconCheck, IconExpand } from "./glyphs";
import type { SelectOption } from "./selectParts";

// A field that filters a list while somebody types, for lists too long for a
// Select: containers, time zones, languages. Focus stays in the field while
// the arrows move through the list, and a search that finds nothing says so
// instead of closing, since a list that vanishes reads as a broken field. Inside
// a FieldRow the row names it and draws the words.
const props = withDefaults(
  defineProps<{
    label?: string;
    hideLabel?: boolean;
    options: SelectOption[];
    placeholder?: string;
    /** The line the list shows when nothing matches. */
    empty: string;
    /** Accessible name of the button that opens the full list. */
    toggleLabel: string;
    disabled?: boolean;
  }>(),
  { hideLabel: false, disabled: false },
);
/** The chosen value, or "" while nothing is chosen. */
const model = defineModel<string>({ required: true });

const name = useFieldName(() => props.label);
const id = useId();
const shown = shallowRef(props.options);
watch(
  () => props.options,
  (o) => (shown.value = o),
);
const collection = computed(() =>
  combobox.collection({
    items: shown.value,
    itemToValue: (o: SelectOption) => o.value,
    itemToString: (o: SelectOption) => o.label,
    isItemDisabled: (o: SelectOption) => !!o.disabled,
  }),
);
const service = useMachine(
  combobox.machine,
  computed(() => ({
    id,
    collection: collection.value,
    value: model.value ? [model.value] : [],
    placeholder: props.placeholder,
    disabled: props.disabled,
    positioning: { sameWidth: true, gutter: 6 },
    // Typing opens the list after the filter has run, so only a close may put
    // the full list back.
    onOpenChange: ({ open }: { open: boolean }) => {
      if (!open) shown.value = props.options;
    },
    onInputValueChange: ({ inputValue }: { inputValue: string }) => {
      const q = inputValue.toLocaleLowerCase();
      shown.value = props.options.filter((o) => o.label.toLocaleLowerCase().includes(q));
    },
    onValueChange: (d: { value: string[] }) => (model.value = d.value[0] ?? ""),
  })),
);
const api = computed(() => combobox.connect(service, normalizeProps));
</script>

<template>
  <div v-bind="api.getRootProps()" class="glim-combobox">
    <label v-bind="api.getLabelProps()" :class="hideLabel || label === undefined ? 'glim-sr-only' : 'glim-field-label'">{{ name }}</label>
    <div v-bind="api.getControlProps()" class="glim-combobox-control">
      <input v-bind="api.getInputProps()" class="glim-combobox-input" />
      <button v-bind="api.getTriggerProps()" :aria-label="toggleLabel" class="glim-combobox-toggle">
        <span class="glim-select-indicator" :data-state="api.open ? 'open' : 'closed'"><IconExpand /></span>
      </button>
    </div>
    <Teleport :to="portalTarget()">
      <div v-bind="api.getPositionerProps()" class="glim-select-positioner">
        <ul v-bind="api.getContentProps()" class="glim-select-content">
          <li v-if="shown.length === 0" class="glim-select-empty">{{ empty }}</li>
          <li v-for="item in shown" :key="item.value" v-bind="api.getItemProps({ item })" class="glim-select-item">
            <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
            <span v-bind="api.getItemIndicatorProps({ item })" class="glim-select-check"><IconCheck /></span>
          </li>
        </ul>
      </div>
    </Teleport>
  </div>
</template>
