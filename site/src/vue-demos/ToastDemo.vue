<script setup lang="ts">
import { onUnmounted, ref, shallowRef } from "vue";
import { addToast, pauseToast, removeToast, resumeToast, type ToastEntry, type ToastSeverity } from "@glimstone/core";
import { Button, ToastViewport } from "@glimstone/vue";

const MESSAGES: Record<ToastSeverity, string> = {
  success: "Settings saved.",
  warn: "The target is almost full.",
  fail: "Could not reach the target.",
};

const toasts = shallowRef<ToastEntry[]>([]);
const putBack = ref(0);
let next = 0;
const tick = setInterval(() => {
  const now = Date.now();
  toasts.value = toasts.value.filter((t) => t.expiresAt === null || t.expiresAt > now);
}, 250);
onUnmounted(() => clearInterval(tick));

const show = (severity: ToastSeverity) =>
  (toasts.value = addToast(toasts.value, { id: String(next++), message: MESSAGES[severity], severity }, Date.now()));
const undoable = () =>
  (toasts.value = addToast(
    toasts.value,
    {
      id: String(next++),
      message: "1,204 files moved to the trash",
      severity: "success",
      action: { label: "Put them back", onClick: () => putBack.value++ },
    },
    Date.now(),
  ));
const longPath = () =>
  (toasts.value = addToast(
    toasts.value,
    {
      id: String(next++),
      message: "2 files restored to /mnt/user/documents/projects/twenty-twenty-six/reports",
      severity: "success",
      action: { label: "Open", onClick: () => {} },
    },
    Date.now(),
  ));
const dismiss = (id: string) => (toasts.value = removeToast(toasts.value, id));
const pause = (id: string) => (toasts.value = pauseToast(toasts.value, id, Date.now()));
const resume = (id: string) => (toasts.value = resumeToast(toasts.value, id, Date.now()));
</script>

<template>
  <Button label="Success" label-key="success" tone="ok" @click="show('success')" />
  <Button label="Warning" label-key="warning" tone="warn" @click="show('warn')" />
  <Button label="Failure" label-key="close" tone="danger" @click="show('fail')" />
  <Button label="With an action" :label-key="null" @click="undoable" />
  <Button label="A long path" :label-key="null" @click="longPath" />
  <output>Put back {{ putBack }}</output>
  <ToastViewport
    :toasts="toasts"
    dismiss-label="Dismiss"
    @dismiss="dismiss"
    @mouse-enter="pause"
    @mouse-leave="resume"
    @focus="pause"
    @blur="resume"
  />
</template>
