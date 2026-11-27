<script setup lang="ts" generic="V extends string | number = string, M extends SelectMode = 'one'">
import { computed, onScopeDispose, shallowRef, watch } from "vue";
import {
  countSelector,
  mediaMatches,
  slideTabPanel,
  tabSlideDir,
  roveSelector,
  rovedIndex,
  selectorAxis,
  selectorFlex,
  selectorView,
  subscribeMedia,
  toggleSelection,
  watchSelectorFit,
  warnDeprecated,
  watchSelectorThumb,
  WIDE_QUERY,
  type LabelMode,
  type SelectMode,
  type SelectorActivation,
  type SelectorLayout,
  type SelectorOrientation,
  type SelectorSize,
  type SelectorVariant,
} from "@glimstone/core";
import { useLabelMode } from "./engines";
import { useFieldName } from "./fieldName";
import Select from "./Select.vue";
import SelectorSegment from "./SelectorSegment.vue";
import type { SelectorItem } from "./selectorItem";

// The one horizontal selector and its vertical form, bound with v-model: the
// chosen id, or the list of chosen ids for select="many". Roles, classes,
// layout and keys come from selector.ts in the core. A caption such as
// "Sort by:" belongs in a <span> outside it, never a <label> around it. A
// strip of one whose labels do not fit its row shows the one dropdown in their
// place, inside the track, so the track keeps the box it measures.
const props = withDefaults(
  defineProps<{
    items: SelectorItem<V>[];
    /** The accessible name of the strip, such as "Sort" or "Settings pages". Inside a FieldRow the row gives it. */
    label?: string;
    /** The chosen id, or the list of chosen ids for select="many". */
    modelValue: M extends "many" ? V[] : V | null;
    select?: M;
    /** `vertical` is the column of tiles beside a settings area's pages. */
    orientation?: SelectorOrientation;
    /** The label mode of this strip alone, in place of the app's setting, for a
     *  strip that has to speak in glyphs, words or both whatever the rest does. */
    labels?: LabelMode;

    size?: SelectorSize;
    variant?: SelectorVariant;
    /** "manual" moves the focus and chooses on Space, Enter or a click, for a strip that saves a setting. */
    activation?: SelectorActivation;
    /** Pin every segment to the widest one's measured width while they fit the row; the page-level picker. */
    equalWidth?: boolean;
    /** Hug the segments, for a strip that shares a toolbar row, as it does inside a FieldRow. */
    inline?: boolean;
    /** Share the row evenly without a pinned width, for page tabs. Every strip keeps to one row, a strip of one
     *  turning into a dropdown where its labels do not fit and not every segment has a glyph. */
    fit?: boolean;
    /** @deprecated Has no effect, since every strip keeps to one row. Removed in 6.0.0. */
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
    orientation: "horizontal",
    size: "md",
    variant: "well",
    activation: "auto",
    equalWidth: false,
    inline: false,
    fit: false,
    // Undefined, or Vue would read a strip that never passes it as one passing false.
    pairsOnPhone: undefined,
    buttonHeight: false,
    hue: true,
    disabled: false,
  },
);
/** `press` on every press and every arrow key that chooses, before the choice changes, also one on the segment already chosen. */
const emit = defineEmits<{ "update:modelValue": [value: M extends "many" ? V[] : V]; press: [id: V] }>();
const model = computed(() => props.modelValue as V | null | V[]);

function useMedia(query: string) {
  const on = shallowRef(mediaMatches(query));
  onScopeDispose(subscribeMedia(query, () => (on.value = mediaMatches(query))));
  return on;
}

if (props.pairsOnPhone !== undefined) warnDeprecated("Selector pairsOnPhone");
const name = useFieldName(() => props.label);
const inline = computed(() => props.inline || (props.label === undefined && name.value !== undefined));
const mode = useLabelMode(selectorAxis(props.size, props.orientation));
const wide = useMedia(WIDE_QUERY);
const strip = computed(() =>
  selectorView({
    mode: props.labels ?? mode.value,
    select: props.select === "many" ? "many" : "one",
    activation: props.activation,
    orientation: props.orientation,
    size: props.size,
    variant: props.variant,
    equalWidth: props.equalWidth,
    inline: inline.value,
    fit: props.fit,
    hue: props.hue,
    hueOffset: props.hueOffset,
    wide: wide.value,
    items: props.items.map((it) => ({ hasGlyph: !!it.glyph, iconOnly: !!it.iconOnly })),
  }),
);

const track = shallowRef<HTMLElement | null>(null);
const layout = shallowRef<SelectorLayout | null>(null);
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
  () =>
    [
      props.orientation,
      strip.value.pinWidth,
      props.fit,
      strip.value.canSqueeze,
      strip.value.canList,
      inline.value,
      itemsKey.value,
      disabledKey.value,
      props.size,
      strip.value.mode,
    ].join("|"),
  (el) => {
    if (props.orientation === "vertical") {
      layout.value = null;
      return;
    }
    const { pinWidth, canSqueeze, canList } = strip.value;
    return watchSelectorFit(el, { pinWidth, fit: props.fit, canSqueeze, canList }, (l) => (layout.value = l));
  },
);

// One value glides: a thumb under the segments carries the fill from the old
// choice to the new one. Toggles in a `many` strip each keep their own.
const gliding = computed(() => props.orientation !== "vertical" && props.select !== "many");
measured(
  () => gliding.value,
  (el) => (gliding.value ? watchSelectorThumb(el) : undefined),
);

// A tab strip moves its panel in from the side of the tab it came from.
watch(
  () => (props.select === "many" ? -1 : props.items.findIndex((it) => it.id === props.modelValue)),
  (to, from) => {
    const dir = tabSlideDir(from, to);
    if (dir && props.panelId && strip.value.kind === "tab") slideTabPanel(document.getElementById(props.panelId), dir);
  },
  { flush: "post" },
);

const flex = computed(() => selectorFlex({ layout: layout.value, inline: inline.value, fit: props.fit }));
const listed = computed(() => layout.value?.fit === "list");
const options = computed(() =>
  props.items.map((it, i) => ({ value: String(it.id), label: it.label, glyph: it.glyph, disabled: disabledFlags.value[i] })),
);
const listValue = computed(() => (model.value === null ? null : String(model.value)));
const many = computed(() => props.select === "many");
const isOn = (id: V) => (many.value ? ((model.value as V[] | null) ?? []).includes(id) : model.value === id);
const disabledFlags = computed(() => props.items.map((it) => props.disabled || !!it.disabled));
const roved = computed(() => rovedIndex(disabledFlags.value, props.items.findIndex((it) => isOn(it.id))));

function choose(id: V) {
  emit("press", id);
  const next = many.value ? toggleSelection((model.value as V[] | null) ?? [], id, props.items.map((it) => it.id)) : id;
  if (next !== model.value) emit("update:modelValue", next as M extends "many" ? V[] : V);
}

function chooseFromList(next: string | null) {
  const item = props.items.find((it) => String(it.id) === next);
  if (item) choose(item.id);
}

function onKeydown(e: KeyboardEvent) {
  if (listed.value) return;
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
    data-glim="Selector"
    :role="listed ? undefined : strip.role"
    :aria-label="listed ? undefined : name"
    :aria-orientation="listed || strip.role === 'group' ? undefined : orientation"
    :class="[strip.className, { 'glim-sel--listed': listed }]"
    :style="flex.track"
    @keydown="onKeydown"
  >
    <span v-if="gliding" class="glim-sel-thumb" aria-hidden="true" />
    <SelectorSegment
      v-for="(item, i) in items"
      :key="item.id"
      :item="item"
      :index="i"
      :strip="strip"
      :on="isOn(item.id)"
      :disabled="disabledFlags[i]!"
      :roved="i === roved"
      :listed="listed"
      :share="orientation === 'vertical' ? {} : flex.segment"
      :squeezed="layout?.fit === 'squeezed'"
      :cut="!!layout?.cut[i]"
      :orientation="orientation"
      :size="size"
      :variant="variant"
      :equal-width="equalWidth"
      :button-height="buttonHeight"
      :hue="hue"
      :hue-offset="hueOffset"
      :panel-id="panelId"
      @select="choose(item.id)"
    />
    <div v-if="listed" class="glim-sel-list">
      <Select
        :model-value="listValue"
        :label="name ?? ''"
        hide-label
        wrap
        width="fill"
        :size="size === 'sm' ? 'row' : 'field'"
        :options="options"
        :disabled="disabledFlags.every(Boolean)"
        @update:model-value="chooseFromList"
      />
    </div>
  </div>
</template>
