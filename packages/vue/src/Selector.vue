<script setup lang="ts" generic="V extends string | number = string">
import { computed, onScopeDispose, ref, shallowRef, watch } from "vue";
import {
  countSelector,
  DESKTOP_QUERY,
  mediaMatches,
  roveSelector,
  rovedIndex,
  selectorAxis,
  selectorFlex,
  selectorView,
  subscribeMedia,
  toggleSelection,
  watchSelectorFit,
  watchSelectorRows,
  WIDE_QUERY,
  type SelectMode,
  type SelectorActivation,
  type SelectorFit,
  type SelectorOrientation,
  type SelectorRows,
  type SelectorSize,
  type SelectorVariant,
} from "@glimstone/core";
import { useLabelMode } from "./engines";
import SelectorSegment from "./SelectorSegment.vue";
import type { SelectorItem } from "./selectorItem";

// The one horizontal selector and its vertical form, bound with v-model: the
// chosen id, or the list of chosen ids for select="many". Roles, classes,
// layout and keys come from selector.ts in the core. A caption such as
// "Sort by:" belongs in a <span> outside it, never a <label> around it.
const props = withDefaults(
  defineProps<{
    items: SelectorItem<V>[];
    /** The accessible name of the strip, such as "Sort" or "Settings pages". */
    label: string;
    select?: SelectMode;
    /** `vertical` is the column of tiles beside a settings area's pages. */
    orientation?: SelectorOrientation;
    size?: SelectorSize;
    variant?: SelectorVariant;
    /** "manual" moves the focus and chooses on Space, Enter or a click, for a strip that saves a setting. */
    activation?: SelectorActivation;
    /** Pin every segment to the widest one's measured width; the page-level picker. */
    equalWidth?: boolean;
    /** Hug the segments, for a strip that shares a toolbar row. */
    inline?: boolean;
    /** Keep every segment on one row, for page tabs. */
    fit?: boolean;
    /** Below 600px, two segments to a row with labels that wrap. */
    pairsOnPhone?: boolean;
    /** The button height for every segment, for a strip beside a Button. */
    buttonHeight?: boolean;
    /** Take a colour under rainbow. */
    hue?: boolean;
    /** Makes the strip a tab strip for colour, each segment keeping its own position from here. */
    hueOffset?: number;
    disabled?: boolean;
    /** The id of the panel a tab strip switches. */
    panelId?: string;
  }>(),
  {
    select: "one",
    orientation: "horizontal",
    size: "md",
    variant: "well",
    activation: "auto",
    equalWidth: false,
    inline: false,
    fit: false,
    pairsOnPhone: false,
    buttonHeight: false,
    hue: true,
    disabled: false,
  },
);
const model = defineModel<V | null | V[]>({ required: true });
/** Every press, before the choice changes, also one on the segment already chosen. */
const emit = defineEmits<{ press: [id: V] }>();

function useMedia(query: string) {
  const on = shallowRef(mediaMatches(query));
  onScopeDispose(subscribeMedia(query, () => (on.value = mediaMatches(query))));
  return on;
}

const mode = useLabelMode(selectorAxis(props.size, props.orientation));
const desktop = useMedia(DESKTOP_QUERY);
const wide = useMedia(WIDE_QUERY);
const strip = computed(() =>
  selectorView({
    mode: mode.value,
    select: props.select,
    activation: props.activation,
    orientation: props.orientation,
    size: props.size,
    variant: props.variant,
    equalWidth: props.equalWidth,
    inline: props.inline,
    fit: props.fit,
    pairsOnPhone: props.pairsOnPhone,
    hue: props.hue,
    hueOffset: props.hueOffset,
    desktop: desktop.value,
    wide: wide.value,
    items: props.items.map((it) => ({ hasGlyph: !!it.glyph, iconOnly: !!it.iconOnly })),
  }),
);

const track = shallowRef<HTMLElement | null>(null);
const rows = shallowRef<SelectorRows | null>(null);
const fitMode = ref<SelectorFit>("even");
const itemsKey = computed(() => props.items.map((it) => it.label).join("\n"));
const disabledKey = computed(() => props.items.map((it) => (props.disabled || it.disabled ? "1" : "0")).join(""));

// Each watch starts once the track is in the DOM and again when what it
// measures changes; `post` runs it after the segments have rendered.
function measured(source: () => unknown, start: (el: HTMLElement) => (() => void) | undefined) {
  watch(
    [track, source],
    (_, __, onCleanup) => {
      if (!track.value) return;
      const stop = start(track.value);
      if (stop) onCleanup(stop);
    },
    { flush: "post" },
  );
}
measured(
  () => strip.value.counted,
  (el) => (strip.value.counted ? countSelector(el) : undefined),
);
measured(
  () => [strip.value.pinWidth, props.equalWidth, props.inline, itemsKey.value, disabledKey.value, props.size, strip.value.mode].join("|"),
  (el) => {
    if (!strip.value.pinWidth) {
      rows.value = null;
      return;
    }
    return watchSelectorRows(el, { inline: props.inline, equalWidth: props.equalWidth }, (r) => (rows.value = r));
  },
);
measured(
  () => [strip.value.canSqueeze, itemsKey.value, disabledKey.value, props.size].join("|"),
  (el) => {
    if (!strip.value.canSqueeze) {
      fitMode.value = "even";
      return;
    }
    return watchSelectorFit(el, (f) => (fitMode.value = f));
  },
);

const layout = computed(() =>
  selectorFlex({
    rows: rows.value,
    pinWidth: strip.value.pinWidth,
    inline: props.inline,
    fit: props.fit,
    fitMode: fitMode.value,
    pairsOnPhone: props.pairsOnPhone,
  }),
);
const many = computed(() => props.select === "many");
const isOn = (id: V) => (many.value ? ((model.value as V[] | null) ?? []).includes(id) : model.value === id);
const disabledFlags = computed(() => props.items.map((it) => props.disabled || !!it.disabled));
const roved = computed(() => rovedIndex(disabledFlags.value, props.items.findIndex((it) => isOn(it.id))));

function choose(id: V) {
  emit("press", id);
  model.value = many.value
    ? toggleSelection((model.value as V[] | null) ?? [], id, props.items.map((it) => it.id))
    : id;
}

function onKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  // A tile is a link, and Space does not follow a link on its own.
  if (props.orientation === "vertical" && e.key === " " && target.dataset.selId) {
    e.preventDefault();
    target.click();
    return;
  }
  const node = roveSelector(track.value!, e.key, props.orientation);
  if (!node) return;
  e.preventDefault();
  const item = props.items.find((it) => String(it.id) === node.dataset.selId);
  if (strip.value.autoSelect && item) choose(item.id);
}
</script>

<template>
  <!-- The style is always an object, never undefined: without one Vue drops
       the attribute, and with it the colour countSelector set on the track. -->
  <div
    ref="track"
    :role="strip.role"
    :aria-label="label"
    :aria-orientation="strip.role === 'group' ? undefined : orientation"
    :class="strip.className"
    :style="layout.track"
    @keydown="onKeydown"
  >
    <SelectorSegment
      v-for="(item, i) in items"
      :key="item.id"
      :item="item"
      :index="i"
      :strip="strip"
      :on="isOn(item.id)"
      :disabled="disabledFlags[i]"
      :roved="i === roved"
      :share="orientation === 'vertical' ? {} : layout.segment"
      :squeezed="strip.canSqueeze && fitMode === 'squeezed'"
      :orientation="orientation"
      :size="size"
      :variant="variant"
      :equal-width="equalWidth"
      :button-height="buttonHeight"
      :pairs-on-phone="pairsOnPhone"
      :hue="hue"
      :hue-offset="hueOffset"
      :panel-id="panelId"
      @select="choose(item.id)"
    />
  </div>
</template>
