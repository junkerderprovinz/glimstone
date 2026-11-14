<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface ScrollAreaProps {
    /** The region's accessible name. */
    label: string;
    /** How tall it grows before it scrolls, as a CSS length. */
    maxHeight: string;
    children: Snippet;
  }
</script>

<script lang="ts">
  import * as scrollArea from "@zag-js/scroll-area";
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte";
  import { pageDir } from "@glimstone/core";

  // A box that scrolls its content behind thin bars of the house's own, instead
  // of the platform's, which draw a different width and colour on every system.
  // The box is a region a keyboard can reach and scroll with the arrow keys.
  let { label, maxHeight, children }: ScrollAreaProps = $props();

  const id = $props.id();
  const service = useMachine(scrollArea.machine, () => ({ id, dir: pageDir() }));
  const api = $derived(scrollArea.connect(service, normalizeProps));
</script>

<div data-glim="ScrollArea" {...api.getRootProps()} class="glim-scroll">
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    {...mergeProps(api.getViewportProps(), { style: { "max-height": maxHeight } })}
    role="region"
    aria-label={label}
    tabindex="0"
    class="glim-scroll-viewport"
  >
    <div {...api.getContentProps()} class="glim-scroll-content">{@render children()}</div>
  </div>
  <div {...api.getScrollbarProps({ orientation: "vertical" })} class="glim-scroll-bar">
    <div {...api.getThumbProps({ orientation: "vertical" })} class="glim-scroll-thumb"></div>
  </div>
  <div {...api.getScrollbarProps({ orientation: "horizontal" })} class="glim-scroll-bar">
    <div {...api.getThumbProps({ orientation: "horizontal" })} class="glim-scroll-thumb"></div>
  </div>
  <div {...api.getCornerProps()} class="glim-scroll-corner"></div>
</div>
