<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface SubCardProps {
    /** The group's name, drawn as a section badge on its top edge. */
    title?: string;
    /** One line on what the group does, drawn as an "(i)" inside the badge. */
    hint?: string;
    /** What belongs to the whole group, such as a switch, at the end of the
     *  heading's row. */
    end?: Snippet;
    children: Snippet;
  }
</script>

<script lang="ts">
  import Badge from "./Badge.svelte";
  import InfoBubble from "./InfoBubble.svelte";

  // A flat, filled group inside a card or a window. It groups without a second
  // raised surface and takes the place of a fold-out, so nothing hides behind a
  // click. Fields and quiet buttons inside it step up one surface, so they do
  // not vanish into its fill.
  let { title, hint, end, children }: SubCardProps = $props();
  const titleId = $props.id();
</script>

<section
  data-glim="SubCard"
  data-glim-title={title}
  class={`glim-subcard${title ? " glim-subcard--titled" : ""}`}
  aria-labelledby={title ? titleId : undefined}
>
  <!-- The id is on the words alone, or the bubble's text would join the group's name. -->
  {#if title}
    <h3 class="glim-panel-heading">
      <Badge tone="heading" size="heading" wrap>
        <span id={titleId}>{title}</span>
        {#if hint}<InfoBubble tip={hint} onAccent />{/if}
      </Badge>
    </h3>
  {/if}
  {#if end}<div class="glim-subcard-end">{@render end()}</div>{/if}
  {@render children()}
</section>
