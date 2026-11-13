<script setup lang="ts">
import { watch } from "vue";
import { announce, liveRegionAttrs, toastPoliteness, type ToastAction, type ToastSeverity } from "@glimstone/core";
import ToastCard from "./ToastCard.vue";

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
  mouseEnter: [id: string];
  mouseLeave: [id: string];
  focus: [id: string];
  blur: [id: string];
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
</script>

<template>
  <div class="glim-sr-only" v-bind="liveRegionAttrs('polite')" />
  <div class="glim-sr-only" v-bind="liveRegionAttrs('assertive')" />
  <div data-glim="ToastViewport" class="glim-toast-stack" v-bind="$attrs">
    <ToastCard
      v-for="t in toasts"
      :id="t.id"
      :key="t.id"
      :message="t.message"
      :severity="t.severity"
      :action="t.action"
      :dismiss-label="dismissLabel"
      @dismiss="emit('dismiss', $event)"
      @mouse-enter="emit('mouseEnter', $event)"
      @mouse-leave="emit('mouseLeave', $event)"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
  </div>
</template>
