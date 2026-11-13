<script setup lang="ts" generic="T extends string">
import { computed, shallowRef, useId, watch } from "vue";
import * as select from "@zag-js/select";
import { normalizeProps, useMachine } from "@zag-js/vue";
import {
  closeOnPageMove,
  endOption,
  flattenRuns,
  pageDir,
  SELECT_POSITIONING,
  selectRootClass,
  selectRowParts,
  type SelectRows,
  type SelectWidth,
  portalTarget,
} from "@glimstone/core";
import { IconCheck, IconExpand } from "./glyphs";
import SelectFace from "./SelectFace.vue";
import { usePortalHue, useTriggerMotion, type SelectGroup, type SelectOption } from "./selectParts";
import { useTipBubble } from "./tipBubble";
import TipBubble from "./TipBubble.vue";
import { TipWrap } from "./TipWrap";

// A list without submenus: Zag's select machine, a listbox.
const props = defineProps<{
  label: string;
  hideLabel?: boolean;
  groups: SelectGroup<T>[];
  value: T | null;
  placeholder?: string;
  width: SelectWidth;
  rows: SelectRows;
  triggerClass: string;
  id?: string;
  triggerAttrs?: Record<string, string>;
  listId?: string;
  disabled?: boolean;
  busy?: boolean;
  tip?: string;
  shake?: number;
}>();
const emit = defineEmits<{ change: [value: T] }>();

const uid = useId();
const all = computed(() => flattenRuns(props.groups));
const glyphs = computed(() => all.value.some((o) => o.glyph));
const parts = computed(() => selectRowParts(props.rows, glyphs.value));
const collection = computed(() =>
  select.collection({
    items: all.value,
    itemToValue: (o: SelectOption<T>) => o.value,
    itemToString: (o: SelectOption<T>) => o.label,
    isItemDisabled: (o: SelectOption<T>) => !!o.disabled,
  }),
);
const service = useMachine(
  select.machine,
  computed(() => ({
    id: uid,
    ids: { trigger: props.id, content: props.listId },
    dir: pageDir(),
    collection: collection.value,
    value: props.value === null ? [] : [props.value],
    disabled: props.disabled,
    readOnly: props.busy,
    onValueChange: (d: { value: string[] }) => {
      const next = d.value[0];
      if (next !== undefined && next !== props.value) emit("change", next as T);
    },
    positioning: SELECT_POSITIONING,
  })),
);
const api = computed(() => select.connect(service, normalizeProps));

const trigger = shallowRef<HTMLElement | null>(null);
const bubble = useTipBubble(() => props.tip, () => !!props.disabled);
useTriggerMotion(trigger, {
  all: () => all.value,
  value: () => props.value,
  inert: () => !!(props.disabled || props.busy),
  onChange: (v) => emit("change", v),
  shakeCount: () => props.shake ?? 0,
});
watch(
  () => api.value.open,
  (open, _, onCleanup) => {
    if (open) onCleanup(closeOnPageMove(() => api.value.setOpen(false)));
  },
);
const hue = usePortalHue(() => api.value.open, trigger);

function keydown(e: KeyboardEvent) {
  const to = api.value.open ? undefined : endOption(all.value, e.key);
  if (to === undefined) return (api.value.getTriggerProps() as { onKeydown?: (e: KeyboardEvent) => void }).onKeydown?.(e);
  e.preventDefault();
  api.value.setOpen(true);
  api.value.setHighlightValue(to);
}

function attach(el: unknown) {
  trigger.value = el as HTMLElement | null;
  bubble.trigger.value = trigger.value;
}
defineExpose({ trigger });
</script>

<template>
  <div v-bind="api.getRootProps()" :class="selectRootClass(width)">
    <label v-bind="api.getLabelProps()" :class="hideLabel ? 'glim-sr-only' : 'glim-field-label'">{{ label }}</label>
    <div v-bind="api.getControlProps()">
      <TipWrap :on="!!disabled && !!tip" :show="bubble.show" :hide="bubble.hide">
        <button
          v-bind="{ ...triggerAttrs, ...api.getTriggerProps(), onKeydown: keydown }"
          :ref="attach"
          :aria-busy="busy || undefined"
          :aria-describedby="bubble.describedBy.value"
          :class="triggerClass"
          @mouseenter="bubble.show"
          @mouseleave="bubble.hide"
          @focus="bubble.showOnFocus"
          @blur="bubble.hide"
        >
          <SelectFace :all="all" :value="value" :placeholder="placeholder" :width="width" :glyphs="glyphs" />
          <span v-bind="api.getIndicatorProps()" class="glim-select-indicator"><IconExpand /></span>
        </button>
      </TipWrap>
    </div>
    <TipBubble :state="bubble" />
    <Teleport :to="portalTarget()">
      <div
        v-bind="api.getPositionerProps()"
        :style="hue.style.value"
        :class="['glim-select-positioner', hue.className.value]"
      >
        <div v-bind="api.getContentProps()" :class="parts.content">
          <template v-for="(g, gi) in groups" :key="gi">
            <div
              v-if="g.entries.length > 0"
              v-bind="g.heading ? api.getItemGroupProps({ id: `${uid}-g${gi}` }) : {}"
              class="glim-select-group"
            >
              <div v-if="g.heading" v-bind="api.getItemGroupLabelProps({ htmlFor: `${uid}-g${gi}` })" :class="parts.heading">
                {{ g.heading }}
              </div>
              <div
                v-for="item in g.entries as SelectOption<T>[]"
                :key="item.value"
                v-bind="api.getItemProps({ item })"
                :class="parts.item"
              >
                <span v-if="parts.glyph" :class="parts.glyph"><component :is="item.glyph" v-if="item.glyph" /></span>
                <span v-bind="api.getItemTextProps({ item })" :class="parts.label">{{ item.label }}</span>
                <span v-bind="api.getItemIndicatorProps({ item })" :class="parts.check"><IconCheck /></span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
    <select v-bind="api.getHiddenSelectProps()" />
  </div>
</template>
