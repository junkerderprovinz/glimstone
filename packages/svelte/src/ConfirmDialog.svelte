<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface ConfirmDialogProps {
    /** A generic title such as "Confirm"; the call site's own text is `message`. */
    title: string;
    /** The question or explanation, also the dialog's accessible description. */
    message: string;
    confirmLabel: string;
    /** Translation key behind `confirmLabel`, so the confirm button can pick
     *  a glyph. Optional: a caller passing a composed or data label has none. */
    confirmLabelKey?: string;
    cancelLabel: string;
    /** A control the confirming action needs an answer to, such as "also remove
     *  X?", shown under the message so the question is asked in one window.
     *  Keep it to a switch or two. */
    extra?: Snippet;
    /** Glyph for the confirm button. The action changes per call site, so no
     *  fixed key can name it; without one the button beside a glyphed Cancel
     *  looks unfinished. */
    confirmGlyph?: Snippet;
    /** Accessible name for the header close button, separate from cancelLabel so
     *  the two controls are not announced alike. Leave it out and the button is
     *  not drawn, since a corner close beside Cancel reads as a second choice. */
    closeLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    /** The dialog card's root DOM node, bound with `bind:ref`, for useConfirm's focus trap. */
    ref?: HTMLElement | null;
  }
</script>

<script lang="ts">
  import Badge from "./Badge.svelte";
  import Button from "./Button.svelte";
  import { IconCancel, IconClose } from "./glyphs.js";

  // The styled confirmation dialog that replaces window.confirm(): an anchored
  // header, a scrolling message and a footer with Cancel and Confirm. A backdrop
  // click, the header close button and Cancel all call onCancel.
  //
  // The component holds no state and never touches `document`. The companion
  // hook useConfirm owns the queue, the promise, the portal, Escape, the focus
  // trap and returning focus on close, because Escape and the trap must work
  // after focus has left this subtree.
  let {
    title,
    message,
    confirmLabel,
    confirmLabelKey,
    confirmGlyph,
    extra,
    cancelLabel,
    closeLabel,
    onConfirm,
    onCancel,
    ref = $bindable(null),
  }: ConfirmDialogProps = $props();

  // Focus lands on Cancel, the answer that changes nothing.
  let cancel = $state<HTMLElement | null>(null);
  $effect(() => cancel?.focus());
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
  class="glim-modal-backdrop"
  onclick={(e) => {
    if (e.target === e.currentTarget) onCancel();
  }}
>
  <div
    data-glim="ConfirmDialog"
    data-glim-title={title}
    bind:this={ref}
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirmdialog-title"
    aria-describedby="confirmdialog-message"
    class="glim-modal-card"
  >
    <div class="glim-modal-head">
      <!-- The title is a heading badge that straddles the card's top edge
           against the outer box, which does not scroll and so does not clip it. -->
      <h2 id="confirmdialog-title" class="glim-modal-title">
        <Badge tone="heading" size="heading" wrap>{title}</Badge>
      </h2>
      {#if closeLabel !== undefined}
        <Button label={closeLabel} labelKey="common.close" glyph={IconClose} tone="neutral" onClick={onCancel} class="glim-modal-close" />
      {/if}
    </div>

    <div class="glim-modal-body">
      <p id="confirmdialog-message" class="glim-modal-text">{message}</p>
      {#if extra !== undefined}
        <div class="glim-modal-extra">{@render extra()}</div>
      {/if}
    </div>

    <div class="glim-modal-foot">
      <Button bind:ref={cancel} label={cancelLabel} labelKey="common.cancel" glyph={IconCancel} tone="neutral" onClick={onCancel} />
      <!-- Not red: the dialog's sentence is the warning, and neither button is recommended. -->
      <Button label={confirmLabel} labelKey={confirmLabelKey ?? null} glyph={confirmGlyph} tone="neutral" onClick={onConfirm} />
    </div>
  </div>
</div>
