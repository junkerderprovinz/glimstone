<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  export interface IconButtonProps extends Omit<HTMLButtonAttributes, "children" | "type" | "class" | "disabled" | "style"> {
    /** The hover and focus explanation, and the button's accessible name. */
    tip: string;
    glyph: Snippet;
    /** Makes it a link in the same square. */
    href?: string;
    /** Set for a button that stays on or off: it says so, and the accent washes it while it is on. */
    pressed?: boolean;
    /** Draws no button and keeps its square, so the others of a row stay where they are. */
    absent?: boolean;
    disabled?: boolean;
    type?: "button" | "submit";
    class?: string;
    style?: string;
  }
</script>

<script lang="ts">
  import { takePageHue } from "@glimstone/core";
  import IconTipButton from "./IconTipButton.svelte";

  // A glyph in a square in every label mode, for a row or a dense toolbar that
  // keeps its text. Everything else with one action is a Button with
  // variant="icon", which follows the label mode. The other props of a <button>
  // go to the button.
  let { tip, glyph, pressed, absent, class: className, ...rest }: IconButtonProps = $props();

  const reach = (e: Event) => takePageHue(e.currentTarget as HTMLElement);
</script>

{#if absent}
  <span data-glim="IconButton" class="glim-icon-btn-gap" aria-hidden="true"></span>
{:else}
  <IconTipButton
    data-glim="IconButton"
    {...rest}
    {tip}
    ariaPressed={pressed}
    class={`glim-btn-bare glim-icon-btn ${className ?? ""}`.trim()}
    onpointerenter={reach}
    onfocusin={reach}
  >
    {@render glyph()}
  </IconTipButton>
{/if}
