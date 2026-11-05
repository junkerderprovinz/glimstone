<script setup lang="ts">
import { computed, onMounted, onUnmounted, shallowRef, useId, useSlots } from "vue";
import {
  focusedAsker,
  menuIsOpen,
  returnFocus,
  stackWindow,
  windowFocusTarget,
  windowFoot,
  type WindowSize,
} from "@glimstone/core";
import Badge from "./Badge.vue";
import Button from "./Button.vue";
import { IconCancel, IconClose } from "./glyphs";
import type { WindowAction } from "./windowParts";

// The general window: a notch with the title, a body for anything and a foot
// whose actions stand at the end. It owns the teleport, its place on the
// stack, Escape, the Tab trap and the focus, so a caller mounts it with v-if
// and unmounts it on `close`. A `class` goes to the card, and a template ref
// reaches the card element as `card`.
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
const foot = computed(() =>
  windowFoot<WindowAction>(props.actions, hasStart.value, {
    cancel: { label: props.text.cancel, labelKey: "common.cancel", glyph: IconCancel, wayOut: true },
    close: { label: props.text.close, labelKey: "common.close", glyph: IconClose, wayOut: true },
  }),
);

let unstack: (() => void) | undefined;
onMounted(() => {
  unstack = stackWindow(
    () => card.value,
    () => emit("close"),
  );
  if (card.value) windowFocusTarget(card.value)?.focus();
});
onUnmounted(() => {
  unstack?.();
  returnFocus(asker);
});

defineExpose({ card });

function press(action: WindowAction) {
  if (action.onClick?.() !== false) emit("close");
}
// A press beside an open menu only closes the menu, not the window under it.
function pressBeside() {
  if (!menuIsOpen()) emit("close");
}
</script>

<template>
  <Teleport to="body">
    <div class="glim-modal-backdrop" @mousedown.self="pressBeside">
      <div
        v-bind="$attrs"
        ref="card"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :class="['glim-modal-card', 'glim-window', size !== 'normal' && `glim-window--${size}`]"
      >
        <h2 :id="titleId" class="glim-window-title">
          <Badge tone="heading" size="heading" wrap :inset-start="5">{{ title }}</Badge>
        </h2>
        <div class="glim-modal-body glim-window-body"><slot /></div>
        <div v-if="foot.length" class="glim-modal-foot">
          <span v-if="hasStart" class="glim-window-start"><slot name="start">{{ start }}</slot></span>
          <Button
            v-for="(a, i) in foot"
            v-bind="a.attrs"
            :key="i"
            :label="a.label"
            :label-key="a.labelKey"
            :glyph="a.glyph"
            :tone="a.primary ? 'accent' : 'neutral'"
            :disabled="a.disabled"
            @click="press(a)"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>
