<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { WindowSize } from "@glimstone/core";
  import type { WindowAction } from "./WindowFootRow.svelte";

  export type { WindowSize } from "@glimstone/core";
  export type { WindowAction } from "./WindowFootRow.svelte";

  export interface WindowProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children" | "class"> {
    /** The notch's words, also the window's accessible name. */
    title: string;
    /** Takes the words' place in the notch with markup, such as a count. `title` alone stays the name. */
    drawn?: Snippet;
    children: Snippet;
    /** The foot's buttons, in reading order. Cancel or Close is added before
     *  them unless one of them is a way out itself. */
    actions?: WindowAction[];
    /** A quiet line at the start of the foot, such as where the work carries on. */
    start?: string | Snippet;
    /** `normal` for a question or a form, `wide` for a list, `full` for a tool. */
    size?: WindowSize;
    /** The words of the way out the window adds. */
    text: { cancel: string; close: string };
    /** Called for every way out: the foot, Escape and a press beside the window. */
    onClose: () => void;
    class?: string;
    /** The card element, bound with `bind:ref`. */
    ref?: HTMLElement | null;
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { focusedAsker, menuIsOpen, returnFocus, stackWindow, windowFocusTarget } from "@glimstone/core";
  import Badge from "./Badge.svelte";
  import { lift } from "./lift.js";
  import WindowFootRow from "./WindowFootRow.svelte";

  // The general window: a notch with the title, a body for anything and a foot
  // whose actions stand at the end. It owns the portal, its place on the stack,
  // Escape, the Tab trap and the focus, so a caller only mounts it and unmounts
  // it on onClose. The other props of a <div> go to the card.
  let {
    title,
    drawn,
    children,
    actions = [],
    start,
    size = "normal",
    text,
    onClose,
    class: className,
    ref = $bindable(null),
    ...rest
  }: WindowProps = $props();

  const titleId = $props.id();
  // Read before the window takes the focus.
  const asker = focusedAsker();

  // Leaving takes the window off the stack at once, so the page is live again
  // by the time the caller hands the focus back to a field in it.
  let unstack: (() => void) | undefined;
  function leave() {
    unstack?.();
    onClose();
  }
  onMount(() => {
    unstack = stackWindow(() => ref, leave);
    if (ref) windowFocusTarget(ref)?.focus();
    return () => {
      unstack?.();
      returnFocus(asker);
    };
  });

  // A press beside an open menu only closes the menu, not the window under it.
  function pressBeside(e: MouseEvent) {
    if (e.target === e.currentTarget && !menuIsOpen()) leave();
  }
</script>

<!-- The backdrop is lifted to the body. It stands alone in a block of its own,
     so it is the only node Svelte removes for it, wherever the caller put it. -->
{#snippet backdrop()}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="glim-modal-backdrop" {@attach lift} onmousedown={pressBeside}>
    <div
      data-glim="Window"
      data-glim-title={title}
      {...rest}
      bind:this={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby={drawn ? undefined : titleId}
      aria-label={drawn ? title : undefined}
      class={["glim-modal-card", "glim-window", size !== "normal" && `glim-window--${size}`, className].filter(Boolean).join(" ")}
    >
      <h2 id={titleId} class="glim-window-title">
        <Badge tone="heading" size="heading" wrap insetStart={5}>{#if drawn}{@render drawn()}{:else}{title}{/if}</Badge>
      </h2>
      <div class="glim-modal-body glim-window-body">{@render children()}</div>
      <WindowFootRow {actions} {start} {text} onClose={leave} />
    </div>
  </div>
{/snippet}
{@render backdrop()}
