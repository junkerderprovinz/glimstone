<script setup lang="ts" generic="T extends SplitterPanel">
import { computed, useId } from "vue";
import * as splitter from "@zag-js/splitter";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { SPLITTER_TEXT, pageDir, splitterHandleId, type SplitterPanel, type SplitterText } from "@glimstone/core";

// Two or more panels side by side, or one above the other, bound with
// v-model:size to each panel's share in percent, with a handle between each
// pair that drags or steps with the arrow keys. A hairline marks the seam and
// a grip on it lights with the accent once it is reached for. The `panel`
// slot draws a panel's content.
const props = withDefaults(
  defineProps<{
    panels: readonly T[];
    orientation?: "horizontal" | "vertical";
    text?: Partial<SplitterText>;
  }>(),
  { orientation: "horizontal" },
);
const size = defineModel<number[]>("size", { required: true });
defineSlots<{ panel(props: { panel: T }): unknown }>();

const words = computed(() => ({ ...SPLITTER_TEXT, ...props.text }));
const id = useId();
const service = useMachine(
  splitter.machine,
  computed(() => ({
    id,
    dir: pageDir(),
    orientation: props.orientation,
    panels: props.panels.map(({ id, minSize, maxSize, collapsible }) => ({ id, minSize, maxSize, collapsible })),
    size: size.value,
    onResize: (d: { size: number[] }) => (size.value = d.size),
  })),
);
const api = computed(() => splitter.connect(service, normalizeProps));
const handle = (index: number) => {
  const next = props.panels[index + 1];
  return next && splitterHandleId(props.panels[index]!, next);
};
</script>

<template>
  <div data-glim="Splitter" v-bind="api.getRootProps()" class="glim-splitter">
    <template v-for="(p, index) in panels" :key="p.id">
      <div v-bind="api.getPanelProps({ id: p.id })" class="glim-splitter-panel"><slot name="panel" :panel="p" /></div>
      <div v-if="handle(index)" v-bind="api.getResizeTriggerProps({ id: handle(index)! })" :aria-label="words.resize" class="glim-splitter-handle">
        <span v-bind="api.getResizeTriggerIndicator({ id: handle(index)! })" class="glim-splitter-grip" />
      </div>
    </template>
  </div>
</template>
