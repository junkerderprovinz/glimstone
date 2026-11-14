<script lang="ts" module>
  import type { ToastAction, ToastSeverity } from "@glimstone/core";

  export interface ToastCardProps {
    id: string;
    message: string;
    severity: ToastSeverity;
    /** A button such as Undo. A press runs it and dismisses the toast. */
    action?: ToastAction;
    /** Accessible name for the dismiss button, the same for every toast. */
    dismissLabel: string;
    onDismiss: (id: string) => void;
    onMouseEnter: (id: string) => void;
    onMouseLeave: (id: string) => void;
    onFocus: (id: string) => void;
    onBlur: (id: string) => void;
  }
</script>

<script lang="ts">
  import { MARKS, softBreaks, TOAST_MARKS } from "@glimstone/core";
  import Button from "./Button.svelte";
  import MarkSvg from "./MarkSvg.svelte";

  // One toast, without state, so a test can mount it with props. Focus is
  // heard on focusin and focusout, so tabbing onto the dismiss button pauses
  // the countdown like a hover does.
  let { id, message, severity, action, dismissLabel, onDismiss, onMouseEnter, onMouseLeave, onFocus, onBlur }: ToastCardProps = $props();

  function keys(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onDismiss(id);
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  data-glim="ToastCard"
  onmouseenter={() => onMouseEnter(id)}
  onmouseleave={() => onMouseLeave(id)}
  onfocusin={() => onFocus(id)}
  onfocusout={() => onBlur(id)}
  onkeydown={keys}
  class="glim-toast glim-toast-card"
>
  <MarkSvg mark={TOAST_MARKS[severity]} class={`glim-toast-glyph glim-toast-glyph--${severity}`} />
  <div class="glim-toast-body">
    <p class="glim-toast-message">{#each softBreaks(message) as part, i}{#if i > 0}<wbr />{/if}{part}{/each}</p>
    {#if action}
      {@const act = action}
      <Button
        class="glim-toast-action"
        tone="subtle"
        label={act.label}
        labelKey={null}
        onClick={() => {
          act.onClick();
          onDismiss(id);
        }}
      />
    {/if}
  </div>
  <button type="button" onclick={() => onDismiss(id)} aria-label={dismissLabel} class="glim-btn-bare glim-toast-dismiss">
    <MarkSvg mark={MARKS.dismiss} />
  </button>
</div>
