<script setup lang="ts" generic="T extends string">
import { computed } from "vue";
import { defaultWidth, hasSubmenu, selectTriggerClass, type SelectRows, type SelectSize, type SelectWidth } from "@glimstone/core";
import { useFieldName } from "./fieldName";
import ListSelect from "./ListSelect.vue";
import MenuSelect from "./MenuSelect.vue";
import type { SelectGroup, SelectOption } from "./selectParts";

// The one dropdown, bound with v-model. Zag carries the behaviour the contract
// asks for and the select rules in tokens.css carry the look. A list is Zag's
// select machine; a list with a submenu is its menu machine. Both render into
// <body>, so no card or scroll box can clip them.
const props = withDefaults(
  defineProps<{
    /** The field's name, always the accessible name. Inside a FieldRow the row gives it and draws the words. */
    label?: string;
    /** Draw the label off screen, for a settings row that names the field at its start. */
    hideLabel?: boolean;
    /** Every choice, in list order, for a list without groups. */
    options?: SelectOption<T>[];
    /** The list in runs, with headings and submenus. */
    groups?: SelectGroup<T>[];
    /** Shown while the value is null. */
    placeholder?: string;
    /** Defaults to `fill` for a field and to `steady` for the smaller sizes and inside a FieldRow. */
    width?: SelectWidth;
    size?: SelectSize;
    /** `menu` draws the open list with a context menu's rows, so an app with both shows one kind of menu row. */
    rows?: SelectRows;
    /** Lets a long value run onto a second line, for one whose end says as much as its start. */
    wrap?: boolean;
    /** The trigger's id, for a `<label for>` outside the select. */
    id?: string;
    /** Attributes for the trigger, such as a data hook that says the value. */
    triggerAttrs?: Record<string, string>;
    /** The open list's id. */
    listId?: string;
    disabled?: boolean;
    /** A choice is out and its answer not back yet: the trigger keeps its focus but takes no input. */
    busy?: boolean;
    /** A hover bubble, for a trigger with no label beside it whose value does not say what it picks. */
    tip?: string;
    /** The caller's failure counter. Each bump shakes the trigger once, as the value snaps back. */
    shake?: number;
  }>(),
  { hideLabel: false, size: "field", rows: "list", wrap: false, disabled: false, busy: false },
);
/** Null when there is no one value, such as over a selection whose rows disagree. */
const model = defineModel<T | null>({ required: true });

const runs = computed(() => props.groups ?? [{ entries: props.options ?? [] }]);
const name = useFieldName(() => props.label);
const fromRow = computed(() => props.label === undefined);
const shared = computed(() => ({
  label: name.value ?? "",
  hideLabel: props.hideLabel || fromRow.value,
  groups: runs.value,
  value: model.value,
  placeholder: props.placeholder,
  width: props.width ?? (fromRow.value ? "steady" : defaultWidth(props.size)),
  rows: props.rows,
  triggerClass: selectTriggerClass(props.size, props.wrap),
  id: props.id,
  triggerAttrs: props.triggerAttrs,
  listId: props.listId,
  disabled: props.disabled,
  busy: props.busy,
  tip: props.tip,
  shake: props.shake,
}));
</script>

<template>
  <MenuSelect v-if="hasSubmenu(runs)" data-glim="Select" v-bind="shared" @change="model = $event" />
  <ListSelect v-else data-glim="Select" v-bind="shared" @change="model = $event" />
</template>
