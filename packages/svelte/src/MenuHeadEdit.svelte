<script lang="ts">
  import type { Snippet } from "svelte";
  import { useTipBubble } from "./bubble.svelte.js";
  import { IconPencil } from "./glyphs.js";
  import TipBubble from "./TipBubble.svelte";

  // The pencil at a menu heading's end, a row of its own named by its tip.
  let { tip, glyph, row, onPress }: { tip: string; glyph?: Snippet; row: number; onPress: () => void } = $props();
  const tooltip = useTipBubble(() => tip);
</script>

<button
  bind:this={tooltip.trigger}
  type="button"
  role="menuitem"
  tabindex="-1"
  aria-label={tip}
  aria-describedby={tooltip.describedBy}
  onmouseenter={tooltip.show}
  onmouseleave={tooltip.hide}
  onfocus={tooltip.showOnFocus}
  onblur={tooltip.hide}
  class="glim-menu-head-edit"
  data-row={row}
  onclick={onPress}
>
  {#if glyph}{@render glyph()}{:else}{@render IconPencil()}{/if}
</button>
<TipBubble state={tooltip} />
