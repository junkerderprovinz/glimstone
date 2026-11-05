<script setup lang="ts">
import { MARKS, TOAST_MARKS, type ToastAction, type ToastSeverity } from "@glimstone/core";
import Button from "./Button.vue";
import { MarkSvg } from "./glyphs";

// The toast stack's presentational half (design-language.md, "Toasts"). It
// holds no state: the app keeps the queue with the core's toastEngine and its
// own timers. Toasts render in array order, so the newest sits nearest the
// bottom edge.
//
// Four events rather than pause and resume, because the caller resumes only
// once hover and focus have both ended (applyEngagement).
defineProps<{
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

// "alert" is assertive, so a failure interrupts the screen reader; "status" is
// polite. Each toast is a new element, which both roles announce on insertion.
const roleFor = (s: ToastSeverity) => (s === "success" ? "status" : "alert");

function act(id: string, action: ToastAction) {
  action.onClick();
  emit("dismiss", id);
}
</script>

<template>
  <div class="glim-toast-stack">
    <div
      v-for="t in toasts"
      :key="t.id"
      :role="roleFor(t.severity)"
      class="glim-toast glim-toast-card"
      @mouseenter="emit('enter', t.id)"
      @mouseleave="emit('leave', t.id)"
      @focusin="emit('focusin', t.id)"
      @focusout="emit('focusout', t.id)"
      @keydown.esc.stop="emit('dismiss', t.id)"
    >
      <MarkSvg :mark="TOAST_MARKS[t.severity]" :class="`glim-toast-glyph glim-toast-glyph--${t.severity}`" />
      <p class="glim-toast-message">{{ t.message }}</p>
      <Button v-if="t.action" class="glim-toast-action" tone="subtle" :label="t.action.label" :label-key="null" @click="act(t.id, t.action)" />
      <button type="button" :aria-label="dismissLabel" class="glim-btn-bare glim-toast-dismiss" @click="emit('dismiss', t.id)">
        <MarkSvg :mark="MARKS.dismiss" />
      </button>
    </div>
  </div>
</template>
