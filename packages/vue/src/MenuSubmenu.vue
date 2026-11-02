<script setup lang="ts" generic="T extends string">
import { computed, onMounted, useId } from "vue";
import * as menu from "@zag-js/menu";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { pageDir, selectContentClass } from "@glimstone/core";
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
  glyphs: boolean;
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
  <div v-bind="parentApi.getTriggerItemProps(api)" class="glim-select-item">
    <span v-if="glyphs" class="glim-select-glyph"><component :is="entry.glyph" v-if="entry.glyph" /></span>
    <span class="glim-select-label">{{ entry.label }}</span>
    <span aria-hidden="true" class="glim-select-caret"><IconExpand /></span>
  </div>
  <Teleport to="body">
    <div v-bind="api.getPositionerProps()" :style="hueStyle" :class="['glim-select-positioner', hueClass]">
      <div v-bind="api.getContentProps()" :class="selectContentClass(glyphs)">
        <MenuChoice
          v-for="o in entry.options"
          :key="o.value"
          :api="api"
          :option="o"
          :value="value"
          :glyphs="glyphs"
          @change="emit('change', $event)"
        />
      </div>
    </div>
  </Teleport>
</template>
