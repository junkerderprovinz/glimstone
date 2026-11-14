<script setup lang="ts">
import { computed, useId } from "vue";
import * as tagsInput from "@zag-js/tags-input";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { TAGS_INPUT_TEXT, pageDir, type TagsInputText } from "@glimstone/core";
import { useFieldName } from "./fieldName";
import { IconClose } from "./glyphs";

// A field that turns what is typed into tags, bound with v-model, such as the
// labels of a backup or the addresses a notice goes to. Enter or a comma adds
// a tag, and the tags stand in the field as pills, each with its own remove
// mark. Inside a FieldRow the row names it.
const props = withDefaults(
  defineProps<{
    label?: string;
    placeholder?: string;
    /** How many tags it takes at most. */
    max?: number;
    /** Takes the same tag twice. */
    allowDuplicates?: boolean;
    disabled?: boolean;
    text?: Partial<TagsInputText>;
  }>(),
  { allowDuplicates: false, disabled: false },
);
const value = defineModel<string[]>({ required: true });

const name = useFieldName(() => props.label);
const words = computed(() => ({ ...TAGS_INPUT_TEXT, ...props.text }));
const id = useId();
const service = useMachine(
  tagsInput.machine,
  computed(() => ({
    id,
    dir: pageDir(),
    value: value.value,
    max: props.max,
    allowDuplicates: props.allowDuplicates,
    disabled: props.disabled,
    placeholder: props.placeholder,
    editable: false,
    blurBehavior: "add" as const,
    addOnPaste: true,
    onValueChange: (d: { value: string[] }) => (value.value = d.value),
    translations: {
      deleteTagTriggerLabel: words.value.remove,
      tagAdded: words.value.added,
      tagSelected: words.value.selected,
      tagDeleted: words.value.removed,
    },
  })),
);
const api = computed(() => tagsInput.connect(service, normalizeProps));
</script>

<template>
  <div data-glim="TagsInput" v-bind="api.getRootProps()" class="glim-tags">
    <label v-bind="api.getLabelProps()" :class="label === undefined ? 'glim-sr-only' : 'glim-field-label'">{{ name }}</label>
    <div v-bind="api.getControlProps()" class="glim-tags-control">
      <span v-for="(tag, index) in api.value" :key="`${tag}-${index}`" v-bind="api.getItemProps({ index, value: tag })" class="glim-tag-item">
        <span v-bind="api.getItemPreviewProps({ index, value: tag })" class="glim-tag">
          <span v-bind="api.getItemTextProps({ index, value: tag })" class="glim-tag-text">{{ tag }}</span>
          <button v-bind="api.getItemDeleteTriggerProps({ index, value: tag })" class="glim-tag-remove"><IconClose /></button>
        </span>
        <input v-bind="api.getItemInputProps({ index, value: tag })" class="glim-tag-edit" />
      </span>
      <input v-bind="api.getInputProps()" class="glim-tags-input" />
    </div>
    <input v-bind="api.getHiddenInputProps()" />
  </div>
</template>
