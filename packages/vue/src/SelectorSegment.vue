<script setup lang="ts">
import { computed, useId } from "vue";
import {
  segmentView,
  selectorTabId,
  type SelectorOrientation,
  type SelectorSize,
  type SelectorVariant,
  type SelectorView,
} from "@glimstone/core";
import { useTipBubble } from "./tipBubble";
import TipBubble from "./TipBubble.vue";
import { TipWrap } from "./TipWrap";
import type { SelectorItem } from "./selectorItem";

// One segment or tile of Selector, a component of its own so each holds its
// own bubble.
const props = defineProps<{
  item: SelectorItem<string | number>;
  index: number;
  strip: SelectorView;
  on: boolean;
  disabled: boolean;
  roved: boolean;
  share: Record<string, string>;
  squeezed: boolean;
  orientation: SelectorOrientation;
  size: SelectorSize;
  variant: SelectorVariant;
  equalWidth: boolean;
  buttonHeight: boolean;
  pairsOnPhone: boolean;
  hue: boolean;
  hueOffset?: number;
  panelId?: string;
}>();
const emit = defineEmits<{ select: [] }>();

const view = computed(() =>
  segmentView({
    strip: props.strip,
    orientation: props.orientation,
    size: props.size,
    variant: props.variant,
    equalWidth: props.equalWidth,
    buttonHeight: props.buttonHeight,
    pairsOnPhone: props.pairsOnPhone,
    hue: props.hue,
    hueOffset: props.hueOffset,
    index: props.index,
    label: props.item.label,
    hasGlyph: !!props.item.glyph,
    iconOnly: !!props.item.iconOnly,
    tip: props.item.tip,
    title: props.item.title,
    on: props.on,
    disabled: props.disabled,
    dim: props.item.dim,
    squeezed: props.squeezed,
  }),
);
const bubble = useTipBubble(() => view.value.tip, () => props.disabled);
// A disabled segment takes no hover or focus, so its reason is a description
// from the start rather than one that exists only while the bubble is open.
const descId = useId();
const hiddenTip = computed(() => props.disabled && !!view.value.tip);
const described = computed(() => (hiddenTip.value ? descId : bubble.describedBy.value));
const tab = computed(() => props.strip.kind === "tab");
const style = computed(() => ({ ...view.value.style, ...props.share }));

function attach(node: unknown) {
  bubble.trigger.value = node as HTMLElement | null;
}

// A plain click stays in the app; a modified one opens the address beside it,
// as a link does.
function open(e: MouseEvent) {
  if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
  e.preventDefault();
  emit("select");
}
</script>

<template>
  <template v-if="orientation === 'vertical'">
    <a
      v-bind="item.attrs"
      :ref="attach"
      :href="item.href"
      :data-sel-id="item.id"
      role="tab"
      :aria-selected="on"
      :aria-current="on ? 'page' : undefined"
      :aria-describedby="described"
      :tabindex="roved ? 0 : -1"
      :class="view.className"
      :style="style"
      @click="open"
      @mouseenter="bubble.show"
      @mouseleave="bubble.hide"
      @focus="bubble.showOnFocus"
      @blur="bubble.hide"
    >
      <component :is="item.glyph" v-if="view.showGlyph && item.glyph" />
      <span v-if="view.labelClass !== null" data-sel-label :class="view.labelClass">{{ item.label }}</span>
    </a>
  </template>
  <template v-else>
    <!-- The box takes the segment's place in the row; unwrapped, the segment
         has nothing for it to pass on. -->
    <TipWrap :on="hiddenTip" :show="bubble.show" :hide="bubble.hide" v-bind="hiddenTip ? { style: share } : {}">
      <button
        v-bind="item.attrs"
        :ref="attach"
        type="button"
        :data-sel-id="item.id"
        :id="panelId && tab ? selectorTabId(panelId, item.id) : undefined"
        :role="strip.kind === 'toggle' ? undefined : strip.kind"
        :aria-selected="tab ? on : undefined"
        :aria-controls="panelId && tab && on ? panelId : undefined"
        :aria-checked="strip.kind === 'radio' ? on : undefined"
        :aria-pressed="strip.kind === 'toggle' ? on : undefined"
        :aria-label="view.ariaLabel"
        :aria-describedby="described"
        :disabled="disabled"
        :tabindex="roved ? 0 : -1"
        :class="view.className"
        :style="style"
        @click="emit('select')"
        @mouseenter="bubble.show"
        @mouseleave="bubble.hide"
        @focus="bubble.showOnFocus"
        @blur="bubble.hide"
      >
        <component :is="item.glyph" v-if="view.showGlyph && item.glyph" />
        <span v-if="view.labelClass !== null" data-sel-label :class="view.labelClass">{{ item.label }}</span>
      </button>
    </TipWrap>
    <span v-if="hiddenTip" :id="descId" hidden>{{ view.tip }}</span>
  </template>
  <TipBubble :state="bubble" />
</template>
