<script setup lang="ts">
import { watch } from "vue";
import { announce, liveRegionAttrs, MARKS, softBreaks, TOAST_MARKS, toastPoliteness, type ToastAction, type ToastSeverity } from "@glimstone/core";
import Button from "./Button.vue";
import { MarkSvg } from "./glyphs";

// The toast stack's presentational half (design-language.md, "Toasts"). It
// holds no state: the app keeps the queue with the core's toastEngine and its
// own timers. Toasts render in array order, so the newest sits nearest the
// bottom edge.
//
// Four events rather than pause and resume, because the caller resumes only
// once hover and focus have both ended (applyEngagement).
//
// The viewport holds the page's two live regions for good, and a new toast's
// message is read out through them. A card that carried a live role itself
// would be announced on arrival by some screen readers and not by others.
defineOptions({ inheritAttrs: false });
const props = defineProps<{
  toasts: { id: string; message: string; severity: ToastSeverity; action?: ToastAction }[];
  /** Accessible name for each dismiss button. */
  dismissLabel: string;
}>();
const emit = defineEmits<{
  dismiss: [id: string];
  enter: [id: string];
  leave: [id: string];
  focusin: [id: string];
  focusout: [id: string];
}>();

const heard = new Set<string>();
watch(
  () => props.toasts,
  (toasts) => {
    const ids = new Set(toasts.map((t) => t.id));
    for (const id of heard) if (!ids.has(id)) heard.delete(id);
    for (const t of toasts) {
      if (heard.has(t.id)) continue;
      heard.add(t.id);
      announce(t.message, toastPoliteness(t.severity));
    }
  },
  { immediate: true, deep: 1, flush: "post" },
);

function act(id: string, action: ToastAction) {
  action.onClick();
  emit("dismiss", id);
}
</script>

<template>
  <div class="glim-sr-only" v-bind="liveRegionAttrs('polite')" />
  <div class="glim-sr-only" v-bind="liveRegionAttrs('assertive')" />
  <div data-glim="ToastViewport" class="glim-toast-stack" v-bind="$attrs">
    <div
      v-for="t in toasts"
      :key="t.id"
      data-glim="ToastCard"
      class="glim-toast glim-toast-card"
      @mouseenter="emit('enter', t.id)"
      @mouseleave="emit('leave', t.id)"
      @focusin="emit('focusin', t.id)"
      @focusout="emit('focusout', t.id)"
      @keydown.esc.stop="emit('dismiss', t.id)"
    >
      <MarkSvg :mark="TOAST_MARKS[t.severity]" :class="`glim-toast-glyph glim-toast-glyph--${t.severity}`" />
      <div class="glim-toast-body">
        <p class="glim-toast-message">
          <template v-for="(part, i) in softBreaks(t.message)" :key="i"><wbr v-if="i > 0" />{{ part }}</template>
        </p>
        <Button v-if="t.action" class="glim-toast-action" tone="subtle" :label="t.action.label" :label-key="null" @click="act(t.id, t.action)" />
      </div>
      <button type="button" :aria-label="dismissLabel" class="glim-btn-bare glim-toast-dismiss" @click="emit('dismiss', t.id)">
        <MarkSvg :mark="MARKS.dismiss" />
      </button>
    </div>
  </div>
</template>
