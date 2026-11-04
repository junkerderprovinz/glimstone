<script setup lang="ts">
import { shallowRef } from "vue";
import ContextMenu from "./ContextMenu.vue";
import type { MenuBarMenu } from "./windowParts";

// The menu bar of a desktop-style app: a row of words, each opening its menu
// below it. While one is open the pointer and the arrow keys move between
// them, as in a desktop program. The app opens the first one on F10 through
// the exposed `open`, since which key does it is the app's keymap.
const props = defineProps<{
  /** The bar's accessible name, such as "Menu". */
  label: string;
  menus: MenuBarMenu[];
}>();

const buttons: (HTMLButtonElement | null)[] = [];
const open = shallowRef<{ at: number; x: number; y: number } | null>(null);
const stop = shallowRef(0);

/** Opens a menu by its index and puts the focus on its first row. */
function show(at: number) {
  const button = buttons[at];
  if (!button) return;
  button.focus();
  stop.value = at;
  const r = button.getBoundingClientRect();
  open.value = { at, x: r.left, y: r.bottom + 6 };
}
defineExpose({ open: show });

const wrap = (at: number) => (at + props.menus.length) % props.menus.length;

function toggle(at: number) {
  if (open.value?.at === at) open.value = null;
  else show(at);
}

function keys(e: KeyboardEvent, at: number) {
  const rtl = getComputedStyle(e.currentTarget as HTMLElement).direction === "rtl";
  const step = ({ ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 } as Record<string, number | undefined>)[e.key];
  if (step !== undefined) {
    e.preventDefault();
    stop.value = wrap(at + step);
    buttons[stop.value]?.focus();
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    show(at);
  }
}
</script>

<template>
  <div role="menubar" :aria-label="label" class="glim-menubar">
    <button
      v-for="(m, i) in menus"
      :key="i"
      :ref="(el) => (buttons[i] = el as HTMLButtonElement | null)"
      type="button"
      role="menuitem"
      aria-haspopup="menu"
      :aria-expanded="open?.at === i"
      :tabindex="i === stop ? 0 : -1"
      class="glim-menubar-item"
      @click="toggle(i)"
      @mouseenter="open && open.at !== i && show(i)"
      @keydown="keys($event, i)"
      @focus="stop = i"
    >
      {{ m.label }}
    </button>
    <ContextMenu
      v-if="open && menus[open.at]"
      :key="open.at"
      :x="open.x"
      :y="open.y"
      :items="menus[open.at].items"
      :label="menus[open.at].label"
      :opener="buttons[open.at]"
      @close="open = null"
      @step="(d) => open && show(wrap(open.at + d))"
    />
  </div>
</template>
