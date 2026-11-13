<script setup lang="ts">
import { MARKS, softBreaks, TOAST_MARKS, type ToastAction, type ToastSeverity } from "@glimstone/core";
import Button from "./Button.vue";
import { MarkSvg } from "./glyphs";

// One toast, without state, so a test can mount it with props. Focus is
// reported on focusin and focusout, so tabbing onto the dismiss button pauses
// the countdown like a hover does.
const props = defineProps<{
  id: string;
  message: string;
  severity: ToastSeverity;
  /** A button such as Undo. A press runs it and dismisses the toast. */
  action?: ToastAction;
  /** Accessible name for the dismiss button, the same for every toast. */
  dismissLabel: string;
}>();
const emit = defineEmits<{
  dismiss: [id: string];
  mouseEnter: [id: string];
  mouseLeave: [id: string];
  focus: [id: string];
  blur: [id: string];
}>();

function act(action: ToastAction) {
  action.onClick();
  emit("dismiss", props.id);
}
</script>

<template>
  <div
    data-glim="ToastCard"
    class="glim-toast glim-toast-card"
    @mouseenter="emit('mouseEnter', id)"
    @mouseleave="emit('mouseLeave', id)"
    @focusin="emit('focus', id)"
    @focusout="emit('blur', id)"
    @keydown.esc.stop="emit('dismiss', id)"
  >
    <MarkSvg :mark="TOAST_MARKS[severity]" :class="`glim-toast-glyph glim-toast-glyph--${severity}`" />
    <div class="glim-toast-body">
      <p class="glim-toast-message">
        <template v-for="(part, i) in softBreaks(message)" :key="i"><wbr v-if="i > 0" />{{ part }}</template>
      </p>
      <Button v-if="action" class="glim-toast-action" tone="subtle" :label="action.label" :label-key="null" @click="act(action)" />
    </div>
    <button type="button" :aria-label="dismissLabel" class="glim-btn-bare glim-toast-dismiss" @click="emit('dismiss', id)">
      <MarkSvg :mark="MARKS.dismiss" />
    </button>
  </div>
</template>
