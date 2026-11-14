<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { WindowAction } from "./WindowFootRow.svelte";

  export interface SheetProps {
    open: boolean;
    /** The notch's words, also the sheet's accessible name. */
    title: string;
    children: Snippet;
    /** The foot's buttons, in reading order, as a Window's. */
    actions?: WindowAction[];
    /** A quiet line at the start of the foot. */
    start?: string | Snippet;
    /** The words of the way out the sheet adds. */
    text: { cancel: string; close: string };
    /** Called for every way out; the caller sets `open` back. */
    onClose: () => void;
    class?: string;
  }
</script>

<script lang="ts">
  import { openSheet } from "@glimstone/core";
  import Badge from "./Badge.svelte";
  import WindowFootRow from "./WindowFootRow.svelte";

  // A panel at the end edge, or rising from the bottom on a phone, for the
  // details of a row or a longer form beside the list. It is a <dialog> shown
  // modal: the page behind it is inert, Escape and a press on the scrim close it,
  // and focus goes back to the control that opened it. Its foot works as a
  // Window's, with Cancel or Close added, so it has no close mark in its head.
  let { open, title, children, actions = [], start, text, onClose, class: className }: SheetProps = $props();
  let dialog = $state<HTMLDialogElement | null>(null);
  const titleId = $props.id();

  $effect(() => {
    if (open && dialog) return openSheet(dialog, () => onClose());
  });
</script>

{#if open}
  <dialog data-glim="Sheet" data-glim-title={title} bind:this={dialog} aria-labelledby={titleId} class={className ? `glim-sheet ${className}` : "glim-sheet"}>
    <div class="glim-sheet-panel">
      <h2 id={titleId} class="glim-sheet-title">
        <Badge tone="heading" size="heading" wrap insetStart={5}>{title}</Badge>
      </h2>
      <div class="glim-sheet-body">{@render children()}</div>
      <WindowFootRow {actions} {start} {text} onClose={() => onClose()} />
    </div>
  </dialog>
{/if}
