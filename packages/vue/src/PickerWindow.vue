<script setup lang="ts">
import { computed, onMounted, onUpdated, ref, shallowRef, useSlots } from "vue";
import {
  fill,
  holdPickHeight,
  isTileMark,
  pageLocale,
  pickerHue,
  pickFocusTarget,
  pickMarkClass,
  pickSearchKey,
  pickSections,
  pickTileKey,
  pickTileStyle,
  type PickGroup,
  type PickerText,
} from "@glimstone/core";
import Badge from "./Badge.vue";
import BrandMark from "./BrandMark.vue";
import GlyphField from "./GlyphField.vue";
import { IconBack, IconClose, IconSearch } from "./glyphs";
import IconButton from "./IconButton.vue";
import InfoBubble from "./InfoBubble.vue";
import ReadmeButton from "./ReadmeButton.vue";
import Window from "./Window.vue";
import type { PickerItem, WindowAction } from "./windowParts";

// A big picker ("Pickers and wizards" in design-language.md): the app's choices
// as brand tiles in their groups, under a search that stands open at the top
// end and narrows all of them at once. The arrows move across the grid, and a
// click or Enter on a tile emits `pick` with its id. The caller decides what
// follows: it closes the window, or fills the default slot with the picked
// tile's form, which takes the tiles' place with Back and the form's actions
// in the foot.
const props = withDefaults(
  defineProps<{
    /** The notch's words, also the window's accessible name. */
    title: string;
    /** What the picker is for, as the (i) in its notch. */
    hint?: string;
    /** The choices, sorted by their names in the page's language. */
    items: PickerItem[];
    /** The groups the items name, in the order they stand. Without them the tiles stand in one. */
    groups?: PickGroup[];
    text: PickerText;
    /** The form's buttons, the forward one last. Cancel and Back stand before them. */
    actions?: WindowAction[];
    /** A quiet line at the start of the foot, such as the verdict of a test; the `start` slot takes markup. */
    start?: string;
    /** The id of the tile picked before, which stands marked and takes the focus when the tiles show. */
    selected?: string;
  }>(),
  { groups: () => [], actions: () => [] },
);
const emit = defineEmits<{ pick: [id: string]; back: []; close: [] }>();
const slots = useSlots();

const query = ref("");
const win = shallowRef<{ card: HTMLElement | null } | null>(null);
const field = shallowRef<{ input: HTMLInputElement | null } | null>(null);
const search = () => field.value?.input ?? null;
const hue = pickerHue();
const scroll = shallowRef<HTMLElement | null>(null);
// Slots are not reactive, so the switch between the tiles and a form is
// noticed after the render that made it.
const form = () => !!slots.default;
let showing = false;
onMounted(() => {
  showing = form();
  if (scroll.value) holdPickHeight(scroll.value);
  if (props.selected && win.value?.card) pickFocusTarget(win.value.card, scroll.value)?.focus();
});
onUpdated(() => {
  if (form() === showing) return;
  showing = form();
  if (scroll.value) holdPickHeight(scroll.value);
  if (win.value?.card) pickFocusTarget(win.value.card, scroll.value)?.focus();
});
// Back keeps the window open, so it returns false.
const back = computed<WindowAction>(() => ({
  label: props.text.back,
  labelKey: "common.back",
  glyph: IconBack,
  onClick: () => {
    emit("back");
    return false;
  },
}));
const foot = (): WindowAction[] =>
  form() ? [back.value, ...props.actions] : [{ label: props.text.close, labelKey: "common.close", glyph: IconClose, wayOut: true }];

const sections = computed(() => pickSections(props.items, props.groups, query.value, pageLocale()));
const used = (e: KeyboardEvent, handled: boolean) => {
  if (!handled) return;
  e.preventDefault();
  e.stopPropagation();
};
function clear() {
  query.value = "";
  search()?.focus();
}
const onSearchKey = (e: KeyboardEvent) => used(e, pickSearchKey(e.key, query.value, scroll.value, () => (query.value = "")));
const onTileKey = (e: KeyboardEvent) => {
  if (e.target !== e.currentTarget) used(e, pickTileKey(e.key, e.target as Element, e.currentTarget as HTMLElement, search()));
};
</script>

<template>
  <Window
    ref="win"
    data-glim="PickerWindow"
    :title="title"
    :class="['glim-pick-window', { 'glim-pick-window--form': form(), 'glim-hue': hue }]"
    :style="hue ?? undefined"
    :text="{ cancel: text.cancel, close: text.close }"
    :start="start"
    :close-on-backdrop="!form()"
    :actions="foot()"
    @close="emit('close')"
  >
    <template v-if="$slots.start" #start><slot name="start" /></template>
    <template v-if="hint" #title>{{ title }}<InfoBubble :tip="hint" on-accent /></template>
    <slot v-if="form()" />
    <template v-else>
      <GlyphField
        ref="field"
        v-model="query"
        class="glim-pick-search"
        :glyph="IconSearch"
        type="search"
        :label="text.search"
        :placeholder="text.search"
        spellcheck="false"
        autocomplete="off"
        @keydown="onSearchKey"
      >
        <template v-if="query" #after>
          <IconButton :tip="text.clear" :glyph="IconClose" @click="clear" />
        </template>
      </GlyphField>
      <div ref="scroll" class="glim-pick-scroll" @keydown="onTileKey">
        <p v-if="sections.length === 0" class="glim-pick-none">{{ fill(text.none, { query: query.trim() }) }}</p>
        <template v-else>
          <section v-for="s in sections" :key="s.id" class="glim-pick-section">
            <div v-if="s.title" class="glim-pick-eyebrow">
              <h3 class="glim-eyebrow">{{ s.title }}</h3>
              <Badge v-if="s.badge" size="small" :tone="s.badge.tone">{{ s.badge.label }}</Badge>
              <InfoBubble v-if="s.hint" :tip="s.hint" />
            </div>
            <ul class="glim-provider-pick">
              <li v-for="item in s.items" :key="item.id" :style="pickTileStyle(item.mark)">
                <ReadmeButton
                  brand="house"
                  :parts="[{ name: item.label, sub: item.sub, onClick: item.status ? undefined : () => emit('pick', item.id) }]"
                  :soon-label="item.status"
                  :current="item.id === selected"
                  :mark-class="pickMarkClass(item.mark)"
                  :hint="item.hint"
                  :tip="item.tip"
                >
                  <template v-if="item.mark" #mark>
                    <BrandMark v-if="isTileMark(item.mark)" :svg="item.mark.svg" :hover="item.mark.hover" />
                    <component :is="item.mark" v-else />
                  </template>
                </ReadmeButton>
              </li>
            </ul>
          </section>
        </template>
      </div>
    </template>
  </Window>
</template>
