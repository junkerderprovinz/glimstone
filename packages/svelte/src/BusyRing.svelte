<script lang="ts" module>
  import type { BusyRingSize } from "@glimstone/core";

  export type { BusyRingSize } from "@glimstone/core";

  export interface BusyRingProps {
    /** `small` fits a button's glyph slot, `large` a card that waits. */
    size?: BusyRingSize;
    /** What is being waited for. With it the ring is a status that says so, without
     *  it the ring is hidden from assistive technology and its surroundings speak. */
    label?: string;
    /** Milliseconds before it shows; 0 shows it at once. */
    delay?: number;
    class?: string;
  }
</script>

<script lang="ts">
  import { busyRingView } from "@glimstone/core";
  import { css } from "./style.js";

  // The ring that turns while the app works on something: two arcs turning
  // against each other. It shows only after BUSY_DELAY, so a quick answer never
  // flashes it.
  let { size, label, delay, class: className }: BusyRingProps = $props();
  const view = $derived(busyRingView({ size, delay }));
</script>

<span
  data-glim="BusyRing"
  role={label ? "status" : undefined}
  aria-hidden={label ? undefined : true}
  class={className ? `${view.className} ${className}` : view.className}
  style={css(view.style)}
>
  <span class="glim-busy-ring-arc"><span class="glim-busy-ring-tail"></span></span>
  <span class="glim-busy-ring-arc glim-busy-ring-arc--inner"><span class="glim-busy-ring-tail"></span></span>
  {#if label}<span class="glim-sr-only">{label}</span>{/if}
</span>
