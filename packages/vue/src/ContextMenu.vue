<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from "vue";
import {
  claimMenu,
  closeMenuOutside,
  focusedAsker,
  focusFirstMenuRow,
  focusMenuRow,
  isMenuHead,
  menuMove,
  menuRowView,
  placeMenu,
  placeSubmenu,
  returnFocus,
  tidyMenu,
} from "@glimstone/core";
import MenuRows from "./MenuRows.vue";
import type { MenuEntry } from "./windowParts";

// A menu at a point: a right-click on a row, the More button of a list, or a
// menu of the bar. Mount it with v-if and unmount it on `close`. The model,
// the placing and the keys come from menu.ts in the core.
//
// A submenu opens beside its row as a second menu on the body, one level deep.
// A checkbox item leaves the menu open, so several can be ticked in a row; the
// caller flips `checked` and the row follows.
const props = withDefaults(
  defineProps<{
    /** The point the menu hangs from, in viewport pixels, such as the pointer's. */
    x: number;
    y: number;
    items: MenuEntry[];
    /** Stand the menu on the point instead, for a menu opened from a bar at the bottom. */
    above?: boolean;
    /** The menu's accessible name. */
    label?: string;
    /** The menu element's id, for a caller or a script that looks for it. */
    id?: string;
    /** The control that opened the menu. A click on it is not a click outside,
     *  and focus goes back to it; without one, focus goes back to wherever it was. */
    opener?: HTMLElement | null;
  }>(),
  { above: false, label: undefined, opener: null },
);
// `close` on every way out: a choice, Escape, Tab or a click outside. `step`
// on left or right over a row without a submenu, for a bar that moves on.
const emit = defineEmits<{ close: []; step: [direction: 1 | -1] }>();

const menu = shallowRef<HTMLElement | null>(null);
const subMenu = shallowRef<HTMLElement | null>(null);
const asker = focusedAsker();
const pos = ref({ left: props.x, top: props.y });
const sub = shallowRef<{ at: number; focus: boolean } | null>(null);
const subPos = ref<{ left: number; top: number } | null>(null);

const rows = computed(() => tidyMenu(props.items));
const host = computed(() => {
  const entry = sub.value ? rows.value[sub.value.at] : undefined;
  return entry && entry !== "-" && !isMenuHead(entry) && entry.sub ? entry : null;
});
const subRows = computed(() => (host.value?.sub ? tidyMenu(host.value.sub) : null));
const viewport = () => ({ width: innerWidth, height: innerHeight });

// Focus goes back only on a way out somebody chose; a click elsewhere keeps
// the focus it gave.
function finish(handBack: boolean) {
  emit("close");
  if (handBack) returnFocus(props.opener ?? asker);
}

function place() {
  const el = menu.value;
  if (el) pos.value = placeMenu(props.x, props.y, { width: el.offsetWidth, height: el.offsetHeight }, viewport(), props.above);
}
watch(() => [props.x, props.y, props.above], place, { flush: "post" });

let release: (() => void) | undefined;
let outside: (() => void) | undefined;
onMounted(() => {
  place();
  release = claimMenu(finish);
  outside = closeMenuOutside(
    () => [menu.value, subMenu.value, props.opener],
    () => finish(false),
  );
  if (menu.value) focusFirstMenuRow(menu.value);
});
onUnmounted(() => {
  release?.();
  outside?.();
});

watch(
  sub,
  (open) => {
    subPos.value = null;
    const row = open && menu.value?.querySelector(`[data-row="${open.at}"]`);
    const el = subMenu.value;
    if (!open || !row || !el) return;
    const rtl = getComputedStyle(menu.value!).direction === "rtl";
    subPos.value = placeSubmenu(row.getBoundingClientRect(), { width: el.offsetWidth, height: el.offsetHeight }, viewport(), rtl);
    if (open.focus) focusFirstMenuRow(el);
  },
  { flush: "post" },
);

function pick(list: MenuEntry[], at: number) {
  const entry = list[at]!;
  if (entry === "-") return;
  if (isMenuHead(entry)) {
    finish(true);
    entry.edit?.onSelect();
    return;
  }
  if (entry.sub && list === rows.value) {
    sub.value = { at, focus: true };
    return;
  }
  if (menuRowView(entry).staysOpen) {
    entry.onSelect?.();
    return;
  }
  finish(true);
  entry.onSelect?.();
}

function keys(e: KeyboardEvent, inSub: boolean) {
  if (e.key === "Tab") return finish(false);
  const panel = e.currentTarget as HTMLElement;
  const move = menuMove(e.key, getComputedStyle(panel).direction === "rtl");
  if (!move) return;
  e.preventDefault();
  if (move !== "in" && move !== "out") return focusMenuRow(panel, move);
  if (inSub) {
    if (move === "out" && sub.value) {
      menu.value?.querySelector<HTMLElement>(`[data-row="${sub.value.at}"]`)?.focus();
      sub.value = null;
    }
    return;
  }
  const at = Number((document.activeElement as HTMLElement | null)?.dataset.row);
  const entry = rows.value[at];
  if (move === "in" && entry && entry !== "-" && !isMenuHead(entry) && entry.sub && !entry.disabled) sub.value = { at, focus: true };
  else emit("step", move === "in" ? 1 : -1);
}

// The pointer opens a submenu by resting on its row and closes it on any other row.
function hover(e: MouseEvent) {
  const row = (e.target as Element).closest<HTMLElement>("[data-row]");
  if (!row) return;
  const at = Number(row.dataset.row);
  const entry = rows.value[at]!;
  const opens = entry !== "-" && !isMenuHead(entry) && !!entry.sub && !entry.disabled;
  if (opens && sub.value?.at !== at) sub.value = { at, focus: false };
  else if (!opens && sub.value) sub.value = null;
}
</script>

<template>
  <Teleport to="body">
    <div
      :id="id"
      ref="menu"
      role="menu"
      :aria-label="label"
      class="glim-menu"
      :style="{ left: `${pos.left}px`, top: `${pos.top}px` }"
      @keydown="keys($event, false)"
      @mouseover="hover"
      @contextmenu.prevent
    >
      <MenuRows :entries="rows" :open-at="sub?.at" @pick="pick(rows, $event)" />
    </div>
    <div
      v-if="subRows"
      :id="host?.subId"
      ref="subMenu"
      role="menu"
      :aria-label="host?.label"
      class="glim-menu"
      :style="{ left: `${subPos?.left ?? 0}px`, top: `${subPos?.top ?? 0}px` }"
      @keydown="keys($event, true)"
      @contextmenu.prevent
    >
      <MenuRows :entries="subRows" @pick="pick(subRows, $event)" />
    </div>
  </Teleport>
</template>
