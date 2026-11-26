<script lang="ts" module>
  import type { MeterSize } from "@glimstone/core";

  export type { MeterSize } from "@glimstone/core";

  export interface MeterProps {
    /** From 0 to 1. Without it the meter shows stripes while the level is still being read. */
    value?: number | null;
    /** The accessible name, such as the disk's. */
    label: string;
    /** `small` sits beside a row's name, `medium` is as wide as its column. */
    size?: MeterSize;
    /** From here on the fill is the fault colour. */
    threshold?: number;
    /** Slim and grey, for a footer line or a dense list. Inside a button it takes the accent when the button is reached. */
    quiet?: boolean;
    /** The level in words, such as "120 GB free of 4 TB": read out, and shown in the bubble. */
    valueText?: string;
    /** The figure beside the track, such as "1.4 / 2 TB". The percentage when left out. */
    figure?: string;
    /** Shows the figure beside the track. On by default for `medium`, off for `small` and `quiet`. */
    showValue?: boolean;
    class?: string;
  }
</script>

<script lang="ts">
  import { meterFigure, meterShowsValue, meterView } from "@glimstone/core";
  import { useTipBubble } from "./bubble.svelte.js";
  import TipBubble from "./TipBubble.svelte";

  // A level that stands, such as how full a disk is. meterView() in the core
  // decides when it turns red and how it runs without a value.
  let { value, label, size = "medium", threshold = 0.9, quiet, valueText, figure, showValue, class: className }: MeterProps = $props();
  const view = $derived(meterView(value, { size, threshold, quiet }));
  const tip = useTipBubble(() => valueText);
  const busy = $derived(view.percent === null);
  const shown = $derived(meterShowsValue(size, quiet, showValue));
</script>

{#snippet meter()}
<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
  data-glim="Meter"
  bind:this={tip.trigger}
  onmouseenter={tip.show}
  onmouseleave={tip.hide}
  onfocus={tip.showOnFocus}
  onblur={tip.hide}
  role={busy ? "progressbar" : "meter"}
  aria-label={label}
  aria-valuemin={busy ? undefined : 0}
  aria-valuemax={busy ? undefined : 100}
  aria-valuenow={view.percent ?? undefined}
  aria-valuetext={valueText}
  aria-busy={busy || undefined}
  class={className ? `${view.className} ${className}` : view.className}
>
  <span class="glim-meter-fill" style={view.width ? `width: ${view.width}` : undefined}></span>
</span>
{/snippet}

<!-- The figure repeats what the meter already says, so a screen reader hears it once. -->
{#if shown}
  <span class="glim-meter-row glim-meter-row--{size}">
    {@render meter()}
    <span class="glim-meter-value glim-num" aria-hidden="true">{meterFigure(view.percent, figure)}</span>
    <TipBubble state={tip} />
  </span>
{:else}
  {@render meter()}
  <TipBubble state={tip} />
{/if}
