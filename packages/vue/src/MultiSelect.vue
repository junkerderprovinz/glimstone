<script setup lang="ts">
import {
  MULTI_SELECT_SEARCH_AFTER,
  MULTI_SELECT_TEXT,
  multiSelectMatches,
  multiSelectSearches,
  multiSelectWithout,
  pageDir,
  portalTarget,
  type MultiSelectText,
} from "@glimstone/core";
import { computed, ref, useId } from "vue";
import * as combobox from "@zag-js/combobox";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { useFieldName } from "./fieldName";
import { IconCheck, IconClose, IconExpand } from "./glyphs";
import type { SelectOption } from "./selectParts";

// A field that picks several choices from a list and keeps them as tags, bound
// with v-model, each tag with its own remove mark. It is Zag's combobox in
// multiple mode, so focus stays in the field while the arrows move through the
// list, and a pick keeps the list open for the next. A short list takes no
// typing and answers Space the way a Select does; a long one filters as
// somebody types.
const props = withDefaults(
  defineProps<{
    label?: string;
    hideLabel?: boolean;
    options: SelectOption[];
    /** Shown while nothing is picked. */
    placeholder?: string;
    /** How many choices the list shows before the field takes a search, seven unless given. */
    searchAfter?: number;
    disabled?: boolean;
    text?: Partial<MultiSelectText>;
  }>(),
  { hideLabel: false, disabled: false },
);
/** The picked values, in the order they were picked. */
const model = defineModel<string[]>({ required: true });

const name = useFieldName(() => props.label);
const words = computed(() => ({ ...MULTI_SELECT_TEXT, ...props.text }));
const searches = computed(() => multiSelectSearches(props.options.length, props.searchAfter ?? MULTI_SELECT_SEARCH_AFTER));
const query = ref("");
const shown = computed(() => (searches.value ? multiSelectMatches(props.options, query.value) : props.options));
const field = ref<HTMLInputElement | null>(null);
const id = useId();
const service = useMachine(
  combobox.machine,
  computed(() => ({
    id,
    dir: pageDir(),
    collection: combobox.collection({
      items: shown.value,
      itemToValue: (o: SelectOption) => o.value,
      itemToString: (o: SelectOption) => o.label,
      isItemDisabled: (o: SelectOption) => !!o.disabled,
    }),
    value: model.value,
    multiple: true,
    disabled: props.disabled,
    openOnClick: true,
    selectionBehavior: "clear" as const,
    positioning: { sameWidth: true, gutter: 6 },
    onOpenChange: ({ open }: { open: boolean }) => {
      if (!open) query.value = "";
    },
    onInputValueChange: ({ inputValue }: { inputValue: string }) => (query.value = inputValue),
    onValueChange: (d: { value: string[] }) => (model.value = d.value),
  })),
);
const api = computed(() => combobox.connect(service, normalizeProps));
const labelOf = (v: string) => props.options.find((o) => o.value === v)?.label ?? v;
const inputProps = computed(() => {
  const { onKeydown, ...rest } = api.value.getInputProps() as Record<string, unknown> & { onKeydown?: (e: KeyboardEvent) => void };
  return { rest, onKeydown };
});
const placeholderText = computed(() =>
  model.value.length === 0 ? props.placeholder : searches.value ? words.value.search : undefined,
);

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Backspace" && api.value.inputValue === "" && model.value.length > 0) {
    e.preventDefault();
    model.value = model.value.slice(0, -1);
    return;
  }
  if (!searches.value && e.key === " ") {
    e.preventDefault();
    if (!api.value.open) api.value.setOpen(true);
    else if (api.value.highlightedValue) api.value.selectValue(api.value.highlightedValue);
    return;
  }
  inputProps.value.onKeydown?.(e);
}

function remove(v: string) {
  model.value = multiSelectWithout(model.value, v);
  field.value?.focus();
}
</script>

<template>
  <div data-glim="MultiSelect" v-bind="api.getRootProps()" class="glim-tags">
    <label v-bind="api.getLabelProps()" :class="hideLabel || label === undefined ? 'glim-sr-only' : 'glim-field-label'">{{ name }}</label>
    <div v-bind="api.getControlProps()" :class="searches ? 'glim-tags-control' : 'glim-tags-control glim-tags-control--pick'">
      <span v-for="v in model" :key="v" class="glim-tag-item">
        <span class="glim-tag">
          <span class="glim-tag-text">{{ labelOf(v) }}</span>
          <button type="button" :disabled="disabled" :aria-label="words.remove(labelOf(v))" class="glim-tag-remove" @click="remove(v)">
            <IconClose />
          </button>
        </span>
      </span>
      <input
        v-bind="inputProps.rest"
        ref="field"
        :readonly="!searches"
        :placeholder="placeholderText"
        class="glim-tags-input"
        @keydown="onKeydown"
      />
      <button v-bind="api.getTriggerProps()" :aria-label="words.toggle" class="glim-combobox-toggle">
        <span class="glim-select-indicator" :data-state="api.open ? 'open' : 'closed'"><IconExpand /></span>
      </button>
    </div>
    <Teleport :to="portalTarget()">
      <div v-bind="api.getPositionerProps()" class="glim-select-positioner">
        <ul v-bind="api.getContentProps()" class="glim-select-content">
          <li v-if="shown.length === 0" class="glim-select-empty">{{ words.empty }}</li>
          <li v-for="item in shown" :key="item.value" v-bind="api.getItemProps({ item })" class="glim-select-item">
            <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
            <span v-bind="api.getItemIndicatorProps({ item })" class="glim-select-check"><IconCheck /></span>
          </li>
        </ul>
      </div>
    </Teleport>
  </div>
</template>
