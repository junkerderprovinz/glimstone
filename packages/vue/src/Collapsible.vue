<script setup lang="ts">
import { computed, useId } from "vue";
import * as collapsible from "@zag-js/collapsible";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { pageDir } from "@glimstone/core";
import { IconExpand } from "./glyphs";

// A row that opens the text under it, bound with v-model:open, for reading
// matter such as the answer under a question on a help page. A settings page
// keeps rule 26: what would hide under it goes on a sub-card or a page of its own.
const props = withDefaults(
  defineProps<{
    /** The words on the row that opens it, which are also its accessible name. */
    label: string;
    disabled?: boolean;
  }>(),
  { disabled: false },
);
const open = defineModel<boolean>("open", { default: false });

const id = useId();
const service = useMachine(
  collapsible.machine,
  computed(() => ({
    id,
    dir: pageDir(),
    open: open.value,
    disabled: props.disabled,
    onOpenChange: (d: { open: boolean }) => (open.value = d.open),
  })),
);
const api = computed(() => collapsible.connect(service, normalizeProps));
</script>

<template>
  <div data-glim="Collapsible" v-bind="api.getRootProps()" class="glim-collapsible">
    <button v-bind="api.getTriggerProps()" class="glim-disclosure-trigger">
      <span class="glim-disclosure-label">{{ label }}</span>
      <span v-bind="api.getIndicatorProps()" class="glim-disclosure-indicator"><IconExpand /></span>
    </button>
    <div v-bind="api.getContentProps()" class="glim-disclosure-content">
      <div class="glim-disclosure-body"><slot /></div>
    </div>
  </div>
</template>
