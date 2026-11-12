<script setup lang="ts">
import { computed, onMounted, onUnmounted, shallowRef, useId, useSlots } from "vue";
import {
  focusedAsker,
  menuIsOpen,
  returnFocus,
  stackWindow,
  windowFocusTarget,
  type WindowSize,
  portalTarget,
} from "@glimstone/core";
import Badge from "./Badge.vue";
import type { WindowAction } from "./windowParts";
import WindowFootRow from "./WindowFootRow.vue";

// The general window: a notch with the title, a body for anything and a foot
// whose actions stand at the end. It owns the teleport, its place on the
// stack, Escape, the Tab trap and the focus, so a caller mounts it with v-if
// and unmounts it on `close`. A `class` goes to the card, and a template ref
// reaches the card element as `card`. The `title` slot holds markup for the
// notch, such as a count, and the `title` alone stays the window's name.
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The notch's words, also the window's accessible name. */
    title: string;
    /** The foot's buttons, in reading order. Cancel or Close is added before
     *  them unless one of them is a way out itself. */
    actions?: WindowAction[];
    /** A quiet line at the start of the foot; the `start` slot takes markup. */
    start?: string;
    /** `normal` for a question or a form, `wide` for a list, `full` for a tool. */
    size?: WindowSize;
    /** The words of the way out the window adds. */
    text: { cancel: string; close: string };
  }>(),
  { actions: () => [], size: "normal" },
);
const emit = defineEmits<{ close: [] }>();
const slots = useSlots();

const card = shallowRef<HTMLElement | null>(null);
const titleId = useId();
// Read before the window takes the focus.
const asker = focusedAsker();
const hasStart = computed(() => props.start !== undefined || !!slots.start);

// Leaving takes the window off the stack at once, so the page is live again
// by the time the caller hands the focus back to a field in it.
let unstack: (() => void) | undefined;
function leave() {
  unstack?.();
  emit("close");
}
onMounted(() => {
  unstack = stackWindow(() => card.value, leave);
  if (card.value) windowFocusTarget(card.value)?.focus();
});
onUnmounted(() => {
  unstack?.();
  returnFocus(asker);
});

defineExpose({ card });

// A press beside an open menu only closes the menu, not the window under it.
function pressBeside() {
  if (!menuIsOpen()) leave();
}
</script>

<template>
  <Teleport :to="portalTarget()">
    <div class="glim-modal-backdrop" @mousedown.self="pressBeside">
      <div
        v-bind="$attrs"
        ref="card"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="$slots.title ? undefined : titleId"
        :aria-label="$slots.title ? title : undefined"
        :class="['glim-modal-card', 'glim-window', size !== 'normal' && `glim-window--${size}`]"
      >
        <h2 :id="titleId" class="glim-window-title">
          <Badge tone="heading" size="heading" wrap :inset-start="5"><slot name="title">{{ title }}</slot></Badge>
        </h2>
        <div class="glim-modal-body glim-window-body"><slot /></div>
        <WindowFootRow :actions="actions" :start="start" :has-start="hasStart" :text="text" @close="leave">
          <template v-if="$slots.start" #start><slot name="start" /></template>
        </WindowFootRow>
      </div>
    </div>
  </Teleport>
</template>
