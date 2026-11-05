<script setup lang="ts" generic="T extends string">
import { computed } from "vue";
import type * as menu from "@zag-js/menu";
import type { SelectRowParts } from "@glimstone/core";
import { IconCheck } from "./glyphs";
import type { SelectOption } from "./selectParts";

// One option of a list with submenus, a radio item of Zag's menu machine.
const props = defineProps<{ api: menu.Api; option: SelectOption<T>; value: T | null; parts: SelectRowParts }>();
const emit = defineEmits<{ change: [value: T] }>();

const checked = computed(() => props.option.value === props.value);
const item = computed(() => ({
  type: "radio" as const,
  value: props.option.value,
  valueText: props.option.label,
  checked: checked.value,
  disabled: props.option.disabled,
  onCheckedChange: () => {
    if (!checked.value) emit("change", props.option.value);
  },
}));
</script>

<template>
  <div v-bind="api.getOptionItemProps(item)" :class="parts.item">
    <span v-if="parts.glyph" :class="parts.glyph"><component :is="option.glyph" v-if="option.glyph" /></span>
    <span v-bind="api.getItemTextProps(item)" :class="parts.label">{{ option.label }}</span>
    <span aria-hidden="true" :data-state="checked ? 'checked' : 'unchecked'" :class="parts.check"><IconCheck /></span>
  </div>
</template>
