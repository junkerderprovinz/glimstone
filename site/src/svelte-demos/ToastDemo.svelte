<script lang="ts">
  import { addToast, pauseToast, removeToast, resumeToast, type ToastEntry, type ToastSeverity } from "@glimstone/core";
  import { Button, ToastViewport } from "@glimstone/svelte";

  const MESSAGES: Record<ToastSeverity, string> = {
    success: "Settings saved.",
    warn: "The target is almost full.",
    fail: "Could not reach the target.",
  };

  let toasts = $state.raw<ToastEntry[]>([]);
  let putBack = $state(0);
  let next = 0;

  $effect(() => {
    const tick = setInterval(() => {
      const now = Date.now();
      toasts = toasts.filter((t) => t.expiresAt === null || t.expiresAt > now);
    }, 250);
    return () => clearInterval(tick);
  });

  const show = (severity: ToastSeverity) => (toasts = addToast(toasts, { id: String(next++), message: MESSAGES[severity], severity }, Date.now()));
  const undoable = () =>
    (toasts = addToast(
      toasts,
      {
        id: String(next++),
        message: "1,204 files moved to the trash",
        severity: "success",
        action: { label: "Put them back", onClick: () => putBack++ },
      },
      Date.now(),
    ));
  const longPath = () =>
    (toasts = addToast(
      toasts,
      {
        id: String(next++),
        message: "2 files restored to /mnt/user/documents/projects/twenty-twenty-six/reports",
        severity: "success",
        action: { label: "Open", onClick: () => {} },
      },
      Date.now(),
    ));
  const pause = (id: string) => (toasts = pauseToast(toasts, id, Date.now()));
  const resume = (id: string) => (toasts = resumeToast(toasts, id, Date.now()));
</script>

<Button label="Success" labelKey="success" tone="ok" onClick={() => show("success")} />
<Button label="Warning" labelKey="warning" tone="warn" onClick={() => show("warn")} />
<Button label="Failure" labelKey="close" tone="danger" onClick={() => show("fail")} />
<Button label="With an action" labelKey={null} onClick={undoable} />
<Button label="A long path" labelKey={null} onClick={longPath} />
<output>Put back {putBack}</output>
<ToastViewport
  {toasts}
  dismissLabel="Dismiss"
  onDismiss={(id) => (toasts = removeToast(toasts, id))}
  onMouseEnter={pause}
  onMouseLeave={resume}
  onFocus={pause}
  onBlur={resume}
/>
