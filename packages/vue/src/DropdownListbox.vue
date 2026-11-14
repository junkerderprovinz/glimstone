<script setup lang="ts">
import { nextTick, onScopeDispose, shallowRef, toRef, watch } from "vue";
import { computeBubblePosition, focusByLetter, isTypeahead, portalTarget, warnDeprecated } from "@glimstone/core";
import { usePortalHue } from "./selectParts";

// The `role="listbox"` panel a button-opens-a-list picker drops open, the twin
// of React's DropdownListbox. It is portalled out of the card, because a card
// with `overflow: hidden` clips it whatever its z-index, and placed with
// computeBubblePosition, which clamps it into the viewport and flips it above
// the trigger when needed. The panel takes the trigger's width and is centred
// on it, since computeBubblePosition returns the centre.
//
// Kept for the apps that already use it; Select keeps focus on its trigger
// and adds typeahead.

/** The gap to the trigger and the least distance from the viewport's edge. */
const GAP = 4;

const props = defineProps<{
  /** Whether the panel is mounted. The caller owns the trigger; only the panel is shared. */
  open: boolean;
  /** The trigger, which anchors the panel and is exempt from the outside press,
   *  so a press on it does not close and reopen the list. */
  triggerRef: HTMLElement | null;
  /** Accessible name for the listbox, normally the label the trigger carries. */
  label: string;
  /** `aria-multiselectable`, for a checkbox multi-select list. */
  multiselectable?: boolean;
}>();
warnDeprecated("DropdownListbox");
/** An outside press, Escape, a scroll or a resize. Picking an option does not
 *  emit it: a single-select list closes itself where it is used. */
const emit = defineEmits<{ close: [] }>();

const panel = shallowRef<HTMLElement | null>(null);
const pos = shallowRef<{ left: number; top: number; width: number } | null>(null);
const hue = usePortalHue(() => props.open, toRef(props, "triggerRef"));
// Whether focus was in the list as it closed. It is read the moment `open`
// turns false, while the list still stands in the page: a browser that blurs
// a removed element reports the focus gone before the list is.
let focusWasInside = false;
watch(
  () => props.open,
  (open) => {
    if (!open) focusWasInside = !!panel.value?.contains(document.activeElement);
  },
  { flush: "sync" },
);

const options = () => [...(panel.value?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])];

function place() {
  const trigger = props.triggerRef;
  if (!trigger || !panel.value) return;
  const rect = trigger.getBoundingClientRect();
  // Option labels wrap against the width, so it is set before the height is read.
  panel.value.style.width = `${rect.width}px`;
  const viewport = {
    width: document.documentElement.clientWidth || window.innerWidth,
    height: document.documentElement.clientHeight || window.innerHeight,
  };
  const { left, top } = computeBubblePosition(rect, { width: rect.width, height: panel.value.offsetHeight }, viewport, GAP);
  pos.value = { left, top, width: rect.width };
}

// A fixed panel that has lost its trigger reads as broken, so an outside
// press, Escape, scroll or resize closes it. A scroll inside the panel, which
// scrolls a long list itself, does not.
function onPointerDown(e: MouseEvent) {
  const target = e.target as Node;
  if (panel.value?.contains(target) || props.triggerRef?.contains(target)) return;
  emit("close");
}
function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") emit("close");
}
function onScroll(e: Event) {
  if (e.target instanceof Node && panel.value?.contains(e.target)) return;
  emit("close");
}
const onResize = () => emit("close");

let stopListening = () => {};
function listen() {
  document.addEventListener("mousedown", onPointerDown);
  document.addEventListener("keydown", onKey);
  window.addEventListener("scroll", onScroll, true);
  window.addEventListener("resize", onResize);
  stopListening = () => {
    document.removeEventListener("mousedown", onPointerDown);
    document.removeEventListener("keydown", onKey);
    window.removeEventListener("scroll", onScroll, true);
    window.removeEventListener("resize", onResize);
  };
}

watch(
  () => props.open,
  async (open) => {
    stopListening();
    if (!open) {
      pos.value = null;
      // Focus goes back to the trigger only if it was in the list; a press
      // elsewhere has already put it where somebody wants it.
      if (focusWasInside) props.triggerRef?.focus();
      focusWasInside = false;
      return;
    }
    listen();
    await nextTick();
    place();
    await nextTick();
    // Only once the panel stands at its real place: focusing an option parked
    // off-screen makes the browser scroll to it, and that scroll closes the list.
    const opts = options();
    const active = opts.find((o) => o.getAttribute("aria-selected") === "true") ?? opts[0];
    active?.scrollIntoView?.({ block: "nearest" });
    active?.focus();
  },
  { immediate: true, flush: "post" },
);
onScopeDispose(() => stopListening());

// Arrows, Home, End and a typed letter move between the options so every
// listbox behaves alike. Enter and Space need nothing: the options are real
// buttons.
function onPanelKey(e: KeyboardEvent) {
  if (isTypeahead(e)) {
    if (focusByLetter(options(), e.key)) e.preventDefault();
    return;
  }
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
  const opts = options();
  if (opts.length === 0) return;
  e.preventDefault();
  const at = opts.indexOf(document.activeElement as HTMLElement);
  let next: number;
  if (e.key === "Home") next = 0;
  else if (e.key === "End") next = opts.length - 1;
  else {
    const dir = e.key === "ArrowDown" ? 1 : -1;
    next = at < 0 ? (dir === 1 ? 0 : opts.length - 1) : (at + dir + opts.length) % opts.length;
  }
  opts[next]!.scrollIntoView?.({ block: "nearest" });
  opts[next]!.focus();
}

</script>

<template>
  <Teleport v-if="open" :to="portalTarget()">
    <div
      ref="panel"
      data-glim="DropdownListbox"
      role="listbox"
      :aria-multiselectable="multiselectable ? 'true' : undefined"
      :aria-label="label"
      :class="['glim-listbox', 'glim-fade', hue.className.value || undefined]"
      :style="{
        left: `${pos?.left ?? -9999}px`,
        top: `${pos?.top ?? -9999}px`,
        width: pos ? `${pos.width}px` : undefined,
        transform: 'translateX(-50%)',
        ...hue.style.value,
      }"
      @keydown="onPanelKey"
    >
      <slot />
    </div>
  </Teleport>
</template>
