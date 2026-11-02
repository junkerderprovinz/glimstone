<script setup lang="ts">
import { onUnmounted, shallowRef } from "vue";
import { addToast, pauseToast, removeToast, resumeToast, type ToastEntry, type ToastSeverity } from "@glimstone/core";
import { Button, ToastViewport } from "@glimstone/vue";

const MESSAGES: Record<ToastSeverity, string> = {
  success: "Settings saved.",
  warn: "The target is almost full.",
  fail: "Could not reach the target.",
};

const toasts = shallowRef<ToastEntry[]>([]);
let next = 0;
const tick = setInterval(() => {
  const now = Date.now();
  toasts.value = toasts.value.filter((t) => t.expiresAt === null || t.expiresAt > now);
}, 250);
onUnmounted(() => clearInterval(tick));

const show = (severity: ToastSeverity) =>
  (toasts.value = addToast(toasts.value, { id: String(next++), message: MESSAGES[severity], severity }, Date.now()));
const dismiss = (id: string) => (toasts.value = removeToast(toasts.value, id));
const pause = (id: string) => (toasts.value = pauseToast(toasts.value, id, Date.now()));
const resume = (id: string) => (toasts.value = resumeToast(toasts.value, id, Date.now()));
</script>

<template>
  <Button label="Success" label-key="success" tone="ok" @click="show('success')" />
  <Button label="Warning" label-key="warning" tone="warn" @click="show('warn')" />
  <Button label="Failure" label-key="close" tone="danger" @click="show('fail')" />
  <ToastViewport
    :toasts="toasts"
    dismiss-label="Dismiss"
    @dismiss="dismiss"
    @enter="pause"
    @leave="resume"
    @focusin="pause"
    @focusout="resume"
  />
</template>
