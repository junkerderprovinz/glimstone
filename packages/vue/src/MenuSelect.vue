<script setup lang="ts" generic="T extends string">
import { computed, shallowRef, useId, watch } from "vue";
import * as menu from "@zag-js/menu";
import { normalizeProps, useMachine } from "@zag-js/vue";
import {
  closeOnPageMove,
  faceLabels,
  flattenRuns,
  homeRow,
  isSubmenu,
  pageDir,
  SELECT_POSITIONING,
  selectRootClass,
  selectRowParts,
  type SelectRows,
  type SelectWidth,
} from "@glimstone/core";
import { IconExpand } from "./glyphs";
import MenuChoice from "./MenuChoice.vue";
import MenuSubmenu from "./MenuSubmenu.vue";
import SelectFace from "./SelectFace.vue";
import { usePortalHue, useTriggerMotion, type SelectGroup, type SelectOption, type SelectSubmenu } from "./selectParts";
import { useTipBubble } from "./tipBubble";
import TipBubble from "./TipBubble.vue";
import { TipWrap } from "./TipWrap";

// A list with submenus: Zag's menu machine with radio items, since a listbox
// cannot nest.
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
  disabled?: boolean;
  busy?: boolean;
  tip?: string;
  shake?: number;
}>();
const emit = defineEmits<{ change: [value: T] }>();

const uid = useId();
const service = useMachine(
  menu.machine,
  computed(() => ({
    id: uid,
    ids: props.id ? { trigger: props.id } : undefined,
    dir: pageDir(),
    "aria-label": props.label,
    positioning: SELECT_POSITIONING,
  })),
);
const api = computed(() => menu.connect(service, normalizeProps));
const all = computed(() => flattenRuns(props.groups));
const glyphs = computed(() => all.value.some((o) => o.glyph));
const parts = computed(() => selectRowParts(props.rows, glyphs.value));
const text = computed(() => faceLabels(all.value, props.value, props.placeholder, props.width).text);
const subId = (gi: number, ei: number) => `${uid}-sub-${gi}-${ei}`;

const trigger = shallowRef<HTMLElement | null>(null);
const bubble = useTipBubble(() => props.tip, () => !!props.disabled);
useTriggerMotion(trigger, {
  all: () => all.value,
  value: () => props.value,
  inert: () => !!(props.disabled || props.busy),
  onChange: (v) => emit("change", v),
  shakeCount: () => props.shake ?? 0,
});
const hue = usePortalHue(() => api.value.open, trigger);

watch(
  () => api.value.open,
  (open, _, onCleanup) => {
    if (!open) return;
    onCleanup(closeOnPageMove(() => api.value.setOpen(false)));
    // Zag highlights on the frame after the list opens, so the home row goes
    // one frame later still.
    const home = homeRow(props.groups, props.value, subId);
    if (home === null) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => api.value.setHighlightedValue(home));
    });
    onCleanup(() => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    });
  },
);

// While busy the trigger keeps focus but nothing reaches the machine.
const triggerProps = computed(() => {
  const tp = api.value.getTriggerProps() as Record<string, unknown>;
  const hold = (name: string) => (e: Event) => {
    if (props.busy) e.preventDefault();
    else (tp[name] as ((e: Event) => void) | undefined)?.(e);
  };
  return { ...tp, onPointerdown: hold("onPointerdown"), onClick: hold("onClick"), onKeydown: hold("onKeydown") };
});

function attach(el: unknown) {
  trigger.value = el as HTMLElement | null;
  bubble.trigger.value = trigger.value;
}
defineExpose({ trigger });
</script>

<template>
  <div :class="selectRootClass(width)">
    <span v-if="!hideLabel" aria-hidden="true" class="glim-field-label">{{ label }}</span>
    <div>
      <TipWrap :on="!!disabled && !!tip" :show="bubble.show" :hide="bubble.hide">
        <button
          v-bind="triggerProps"
          :ref="attach"
          :disabled="disabled"
          :data-disabled="disabled ? '' : undefined"
          :data-readonly="busy ? '' : undefined"
          :aria-busy="busy || undefined"
          :aria-label="`${label}: ${text}`"
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
    <Teleport to="body">
      <div v-bind="api.getPositionerProps()" :style="hue.style.value" :class="['glim-select-positioner', hue.className.value]">
        <div v-bind="api.getContentProps()" :class="parts.content">
          <template v-for="(g, gi) in groups" :key="gi">
            <div v-if="g.entries.length > 0" v-bind="g.heading ? api.getItemGroupProps({ id: `g${gi}` }) : {}" class="glim-select-group">
              <div v-if="g.heading" v-bind="api.getItemGroupLabelProps({ htmlFor: `g${gi}` })" :class="parts.heading">
                {{ g.heading }}
              </div>
              <template v-for="(e, ei) in g.entries" :key="isSubmenu(e) ? `s${ei}` : e.value">
                <MenuSubmenu
                  v-if="isSubmenu(e)"
                  :parent="service"
                  :parent-api="api"
                  :trigger-id="subId(gi, ei)"
                  :entry="e as SelectSubmenu<T>"
                  :value="value"
                  :parts="parts"
                  :hue-style="hue.style.value"
                  :hue-class="hue.className.value"
                  @change="emit('change', $event)"
                />
                <MenuChoice
                  v-else
                  :api="api"
                  :option="e as SelectOption<T>"
                  :value="value"
                  :parts="parts"
                  @change="emit('change', $event)"
                />
              </template>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>
