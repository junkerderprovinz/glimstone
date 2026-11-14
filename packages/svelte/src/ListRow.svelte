<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export interface ListRowProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "class"> {
    name: string;
    /** More about the row, drawn as an "(i)" beside the name. */
    tip?: string | null;
    /** Sets the name in monospace, for a path. */
    mono?: boolean;
    /** The glyph at the row's start, which fills with the accent while the row is reached. */
    tile?: Snippet;
    /** What stands at the row's end at rest. */
    badges?: Snippet;
    /** The buttons that come in on hover and focus. A press on one does not open the row. */
    actions?: Snippet;
    class?: string;
  }
</script>

<script lang="ts">
  import InfoBubble from "./InfoBubble.svelte";

  // One row of a list: a glyph tile, the name, badges and buttons that come in on
  // hover and focus (rule 6). A click handler makes the whole row a way into its
  // object, by keyboard too. The other props of a <div> go to the row.
  let { name, tip, mono, tile, badges, actions, class: className, onclick, onkeydown, ...rest }: ListRowProps = $props();

  const stay = (e: MouseEvent) => e.stopPropagation();

  function keys(e: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    onkeydown?.(e);
    if (!onclick || e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    e.currentTarget.click();
  }
  const classes = $derived(["glim-list-row", onclick && "glim-list-row--opens", className].filter(Boolean).join(" "));
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<div data-glim="ListRow" role="group" aria-label={name} tabindex={onclick ? 0 : undefined} {...rest} {onclick} onkeydown={keys} class={classes}>
  {#if tile}<span class="glim-list-row-tile">{@render tile()}</span>{/if}
  <span class={mono ? "glim-list-row-name glim-list-row-name--mono" : "glim-list-row-name"}>
    <span class="glim-list-row-title">{name}</span>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    {#if tip}<span class="glim-list-row-tip" onclick={stay}><InfoBubble {tip} /></span>{/if}
  </span>
  {#if badges}<span class="glim-list-row-badges">{@render badges()}</span>{/if}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  {#if actions}<span class="glim-list-row-actions" onclick={stay}>{@render actions()}</span>{/if}
</div>
