<script setup lang="ts">
import { onUnmounted, ref, shallowRef } from "vue";
import { addToast, pauseToast, removeToast, resumeToast, type ToastEntry } from "@glimstone/core";
import { Card, IconButton, ListRow, Pill, ToastViewport, useConfirm } from "@glimstone/vue";
import { glyph, Glyph } from "../../vue/glyph";

const SNAPSHOTS = ["14 October", "21 October", "28 October"];

// Deleting asks first, and the toast that reports it can take it back.
const { confirm, ConfirmHost } = useConfirm({ title: "Delete snapshot", cancel: "Cancel", confirm: "Delete" });
const snapshots = ref(SNAPSHOTS);
const toasts = shallowRef<ToastEntry[]>([]);
let next = 0;

const tick = setInterval(() => (toasts.value = toasts.value.filter((t) => t.expiresAt === null || t.expiresAt > Date.now())), 250);
onUnmounted(() => clearInterval(tick));

async function remove(day: string) {
  if (!(await confirm(`Delete the snapshot from ${day}? The archive on the target stays.`, { confirmLabelKey: "delete" }))) return;
  snapshots.value = snapshots.value.filter((d) => d !== day);
  const toast = {
    id: String(next++),
    message: `Snapshot from ${day} deleted`,
    severity: "success" as const,
    action: { label: "Undo", onClick: () => (snapshots.value = SNAPSHOTS.filter((d) => d === day || snapshots.value.includes(d))) },
  };
  toasts.value = addToast(toasts.value, toast, Date.now());
}
const trash = glyph("IconTrash");
</script>

<template>
  <div style="width: 100%; max-width: 560px; padding-top: 12px">
    <Card title="Snapshots">
      <div style="display: grid; gap: 2px">
        <ListRow v-for="day in snapshots" :key="day" :name="day">
          <template #tile><Glyph name="IconArchive" /></template>
          <template #badges><Pill tone="ok">Settled</Pill></template>
          <template #actions>
            <IconButton :tip="`Delete the snapshot from ${day}`" :glyph="trash" @click="remove(day)" />
          </template>
        </ListRow>
      </div>
    </Card>
    <ConfirmHost />
    <ToastViewport
      :toasts="toasts"
      dismiss-label="Dismiss"
      @dismiss="(id: string) => (toasts = removeToast(toasts, id))"
      @enter="(id: string) => (toasts = pauseToast(toasts, id, Date.now()))"
      @leave="(id: string) => (toasts = resumeToast(toasts, id, Date.now()))"
      @focusin="(id: string) => (toasts = pauseToast(toasts, id, Date.now()))"
      @focusout="(id: string) => (toasts = resumeToast(toasts, id, Date.now()))"
    />
  </div>
</template>
