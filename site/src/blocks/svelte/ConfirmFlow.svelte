<script lang="ts">
  import { addToast, pauseToast, removeToast, resumeToast, type ToastEntry } from "@glimstone/core";
  import { Card, IconButton, ListRow, Pill, ToastViewport, useConfirm } from "@glimstone/svelte";
  import { glyph } from "../../svelte/glyph";

  const SNAPSHOTS = ["14 October", "21 October", "28 October"];

  // Deleting asks first, and the toast that reports it can take it back.
  const ask = useConfirm({ title: "Delete snapshot", cancel: "Cancel", confirm: "Delete" });
  let snapshots = $state.raw(SNAPSHOTS);
  let toasts = $state.raw<ToastEntry[]>([]);
  let next = 0;

  $effect(() => {
    const tick = setInterval(() => (toasts = toasts.filter((t) => t.expiresAt === null || t.expiresAt > Date.now())), 250);
    return () => clearInterval(tick);
  });

  async function remove(day: string) {
    if (!(await ask.confirm(`Delete the snapshot from ${day}? The archive on the target stays.`, { confirmLabelKey: "delete" }))) return;
    snapshots = snapshots.filter((d) => d !== day);
    const toast = {
      id: String(next++),
      message: `Snapshot from ${day} deleted`,
      severity: "success" as const,
      action: { label: "Undo", onClick: () => (snapshots = SNAPSHOTS.filter((d) => d === day || snapshots.includes(d))) },
    };
    toasts = addToast(toasts, toast, Date.now());
  }
  const archive = glyph("IconArchive");
  const trash = glyph("IconTrash");
</script>

{#snippet settled()}<Pill tone="ok">Settled</Pill>{/snippet}

<div style="width: 100%; max-width: 560px; padding-top: 12px">
  <Card title="Snapshots">
    <div style="display: grid; gap: 2px">
      {#each snapshots as day (day)}
        {#snippet actions()}
          <IconButton tip={`Delete the snapshot from ${day}`} glyph={trash} onclick={() => remove(day)} />
        {/snippet}
        <ListRow name={day} tile={archive} badges={settled} {actions} />
      {/each}
    </div>
  </Card>
  <ask.confirmDialog />
  <ToastViewport
    {toasts}
    dismissLabel="Dismiss"
    onDismiss={(id) => (toasts = removeToast(toasts, id))}
    onMouseEnter={(id) => (toasts = pauseToast(toasts, id, Date.now()))}
    onMouseLeave={(id) => (toasts = resumeToast(toasts, id, Date.now()))}
    onFocus={(id) => (toasts = pauseToast(toasts, id, Date.now()))}
    onBlur={(id) => (toasts = resumeToast(toasts, id, Date.now()))}
  />
</div>
