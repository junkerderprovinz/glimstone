<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface PopoverProps {
    /** Whether it shows. */
    open: boolean;
    /** The control it stands beside. */
    anchor: HTMLElement | null;
    /** Its accessible name. */
    label: string;
    /** Called when the browser closes it; the caller sets `open` back. */
    onClose: () => void;
    children: Snippet;
    class?: string;
  }
</script>

<script lang="ts">
  import { anchorName, openPopover } from "@glimstone/core";

  // A small panel beside the control that opened it, such as a filter. It lives
  // in the top layer through the popover attribute, so no card or scroll box
  // clips it, and it renders where it stands rather than in a portal. Escape and
  // a press beside it close it, and focus goes back to the trigger.
  let { open, anchor, label, onClose, children, class: className }: PopoverProps = $props();
  let panel = $state<HTMLElement | null>(null);
  const id = $props.id();

  $effect(() => {
    if (open && anchor && panel) return openPopover(panel, anchor, anchorName(id), () => onClose());
  });
</script>

{#if open}
  <div data-glim="Popover" bind:this={panel} popover="auto" role="dialog" aria-label={label} class={className ? `glim-popover ${className}` : "glim-popover"}>
    {@render children()}
  </div>
{/if}
