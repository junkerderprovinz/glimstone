<script setup lang="ts" generic="T extends string">
import { computed, onMounted, useId } from "vue";
import * as menu from "@zag-js/menu";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { pageDir, type SelectRowParts } from "@glimstone/core";
import { IconExpand } from "./glyphs";
import MenuChoice from "./MenuChoice.vue";
import type { SelectSubmenu } from "./selectParts";

// A row of a list with submenus that opens a list of its own beside it.
const props = defineProps<{
  parent: menu.Service;
  parentApi: menu.Api;
  triggerId: string;
  entry: SelectSubmenu<T>;
  value: T | null;
  parts: SelectRowParts;
  hueStyle?: Record<string, string>;
  hueClass: string;
}>();
const emit = defineEmits<{ change: [value: T] }>();

const service = useMachine(menu.machine, {
  id: useId(),
  ids: { trigger: props.triggerId },
  dir: pageDir(),
  "aria-label": props.entry.label,
});
const api = computed(() => menu.connect(service, normalizeProps));
onMounted(() => {
  props.parentApi.setChild(service);
  api.value.setParent(props.parent);
});
</script>

<template>
  <div v-bind="parentApi.getTriggerItemProps(api)" :class="parts.item">
    <span v-if="parts.glyph" :class="parts.glyph"><component :is="entry.glyph" v-if="entry.glyph" /></span>
    <span :class="parts.label">{{ entry.label }}</span>
    <span aria-hidden="true" :class="parts.caret"><IconExpand /></span>
  </div>
  <Teleport to="body">
    <div v-bind="api.getPositionerProps()" :style="hueStyle" :class="['glim-select-positioner', hueClass]">
      <div v-bind="api.getContentProps()" :class="parts.content">
        <MenuChoice
          v-for="o in entry.options"
          :key="o.value"
          :api="api"
          :option="o"
          :value="value"
          :parts="parts"
          @change="emit('change', $event)"
        />
      </div>
    </div>
  </Teleport>
</template>
