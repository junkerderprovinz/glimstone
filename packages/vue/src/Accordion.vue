<script setup lang="ts" generic="T extends AccordionItem">
import { computed, useId } from "vue";
import * as accordion from "@zag-js/accordion";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { pageDir, type AccordionItem, type HeadingLevel } from "@glimstone/core";
import { IconExpand } from "./glyphs";

// A list of rows that each open their own text, bound with v-model to the
// values of the open items, for reading matter such as the questions of a help
// page. Rule 26 keeps it off settings pages. Each row is a heading with a
// button in it, so a screen reader can walk the questions. The `content` slot
// draws the text under an item's row.
const props = withDefaults(
  defineProps<{
    items: readonly T[];
    /** Several items open at once; otherwise opening one closes the other. */
    multiple?: boolean;
    headingLevel?: HeadingLevel;
  }>(),
  { multiple: false, headingLevel: 3 },
);
const value = defineModel<string[]>();
defineSlots<{ content(props: { item: T }): unknown }>();

const id = useId();
const service = useMachine(
  accordion.machine,
  computed(() => ({
    id,
    dir: pageDir(),
    value: value.value ?? [],
    multiple: props.multiple,
    collapsible: true,
    onValueChange: (d: { value: string[] }) => (value.value = d.value),
  })),
);
const api = computed(() => accordion.connect(service, normalizeProps));
</script>

<template>
  <div data-glim="Accordion" v-bind="api.getRootProps()" class="glim-accordion">
    <div v-for="item in items" :key="item.value" v-bind="api.getItemProps(item)" class="glim-accordion-item">
      <component :is="`h${headingLevel}`" class="glim-disclosure-heading">
        <button v-bind="api.getItemTriggerProps(item)" class="glim-disclosure-trigger">
          <span class="glim-disclosure-label">{{ item.title }}</span>
          <span v-bind="api.getItemIndicatorProps(item)" class="glim-disclosure-indicator"><IconExpand /></span>
        </button>
      </component>
      <div v-bind="api.getItemContentProps(item)" class="glim-disclosure-content">
        <div class="glim-disclosure-body"><slot name="content" :item="item" /></div>
      </div>
    </div>
  </div>
</template>
