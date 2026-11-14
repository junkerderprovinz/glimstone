<script lang="ts" module>
  export interface SkeletonRowProps {
    /** Milliseconds before it shows; 0 shows it at once. */
    delay?: number;
    /** The tile at the row's start, for a list whose rows have one. */
    tile?: boolean;
    /** The badge at the row's end, for a list whose rows have one. */
    badge?: boolean;
    class?: string;
  }
</script>

<script lang="ts">
  import { skeletonRowView } from "@glimstone/core";
  import { css } from "./style.js";

  // A row that holds a ListRow's place while the list loads, so nothing jumps
  // when the rows arrive. It shows only after BUSY_DELAY. The list around it
  // carries aria-busy and says what is loading; the row itself is hidden from
  // assistive technology.
  let { delay, tile = true, badge = true, class: className }: SkeletonRowProps = $props();
  const view = $derived(skeletonRowView({ delay, tile, badge }));
</script>

<div data-glim="SkeletonRow" aria-hidden="true" class={className ? `${view.className} ${className}` : view.className} style={css(view.style)}>
  {#if view.tile}<span class="glim-skeleton-block glim-skeleton-tile"></span>{/if}
  <span class="glim-skeleton-block glim-skeleton-name"></span>
  {#if view.badge}<span class="glim-skeleton-block glim-skeleton-badge"></span>{/if}
</div>
