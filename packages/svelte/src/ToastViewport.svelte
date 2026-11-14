<script lang="ts" module>
  import type { ToastViewportEntry } from "@glimstone/core";

  export type { ToastViewportEntry } from "@glimstone/core";

  export interface ToastViewportProps {
    toasts: ToastViewportEntry[];
    dismissLabel: string;
    onDismiss: (id: string) => void;
    // Four separate events rather than onPause and onResume, because the caller
    // resumes only once hover and focus have both ended (applyEngagement).
    onMouseEnter: (id: string) => void;
    onMouseLeave: (id: string) => void;
    onFocus: (id: string) => void;
    onBlur: (id: string) => void;
  }
</script>

<script lang="ts">
  import { announce, liveRegionAttrs, toastPoliteness } from "@glimstone/core";
  import ToastCard from "./ToastCard.svelte";

  // The toast system's presentational half (design-language.md, "Toasts"). It
  // holds no state: the app keeps the queue with the core's toastEngine and its
  // own timers. Toasts render in array order, so the newest sits nearest the
  // bottom edge.
  //
  // A toast never blocks the page: the viewport is `pointer-events: none` and only
  // each card turns them back on, so clicks pass through the empty corner.
  //
  // The viewport holds the page's two live regions for good, and a new toast's
  // message is read out through them. A card that carried a live role itself
  // would be announced on arrival by some screen readers and not by others.
  let { toasts, dismissLabel, onDismiss, onMouseEnter, onMouseLeave, onFocus, onBlur }: ToastViewportProps = $props();

  const heard = new Set<string>();
  $effect(() => {
    const ids = new Set(toasts.map((t) => t.id));
    for (const id of heard) if (!ids.has(id)) heard.delete(id);
    for (const t of toasts) {
      if (heard.has(t.id)) continue;
      heard.add(t.id);
      announce(t.message, toastPoliteness(t.severity));
    }
  });
</script>

<div class="glim-sr-only" {...liveRegionAttrs("polite")}></div>
<div class="glim-sr-only" {...liveRegionAttrs("assertive")}></div>
<div data-glim="ToastViewport" class="glim-toast-stack">
  {#each toasts as t (t.id)}
    <ToastCard
      id={t.id}
      message={t.message}
      severity={t.severity}
      action={t.action}
      {dismissLabel}
      {onDismiss}
      {onMouseEnter}
      {onMouseLeave}
      {onFocus}
      {onBlur}
    />
  {/each}
</div>
