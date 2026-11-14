<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";
  import type { SidebarCount } from "@glimstone/core";

  export type { SidebarCount } from "@glimstone/core";

  export interface SidebarRowProps extends Omit<HTMLAnchorAttributes, "children" | "class" | "style"> {
    /** The destination's name: shown, or hidden but still the link's name. */
    label: string;
    /** The destination's glyph. Without one the row shows its name in every mode. */
    glyph?: Snippet;
    /** Without one the row is a button. */
    href?: string;
    /** This destination is showing; the row is filled and marked as the current page. */
    active?: boolean;
    /** The row's rainbow position: its rank among the rows the rail shows, so a
     *  hidden row leaves no gap. */
    hueIndex?: number;
    /** The figure on the row, such as items that need attention. Nothing shows at zero. */
    count?: SidebarCount;
    /** A tree's row at this level, stepped in with a smaller glyph and gap. */
    depth?: number;
    /** What stands in the row before the link, such as a tree's toggle. */
    before?: Snippet;
    /** What stands in the row after the link, such as a meter or a pin. The link's
     *  press still covers the rest of the row. */
    after?: Snippet;
    class?: string;
    style?: string;
  }
</script>

<script lang="ts">
  import { sidebarRowView } from "@glimstone/core";
  import { useLabelMode } from "./engines.svelte.js";
  import { css } from "./style.js";
  import { useTipBubble } from "./bubble.svelte.js";
  import TipBubble from "./TipBubble.svelte";

  // One destination of the navigation rail; what it shows comes from
  // sidebarRowView() in the core. The other props of an <a> go to the link, so a
  // router can take the click.
  let { label, glyph, href, active = false, hueIndex, count, depth, before, after, class: className = "", style, ...rest }: SidebarRowProps = $props();

  const mode = useLabelMode("sidebar");
  const framed = $derived(!!(before || after));
  const view = $derived(
    sidebarRowView({ mode: mode.current, label, hasGlyph: !!glyph, active, hueIndex, count: count?.value, framed, depth }),
  );
  const tooltip = useTipBubble(() => view.tip);
  const viewStyle = $derived([css(view.style), style].filter(Boolean).join("; ") || undefined);
</script>

{#snippet link()}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <svelte:element
    this={href ? "a" : "button"}
    data-glim={framed ? undefined : "SidebarRow"}
    {...rest}
    {href}
    type={href ? undefined : "button"}
    bind:this={tooltip.trigger}
    aria-current={active ? "page" : undefined}
    aria-describedby={tooltip.describedBy}
    onmouseenter={tooltip.show}
    onmouseleave={tooltip.hide}
    onfocus={tooltip.showOnFocus}
    onblur={tooltip.hide}
    class={framed ? "glim-nav-row-main" : `${view.className} ${className}`.trim()}
    style={framed ? undefined : viewStyle}
  >
    {#if view.showGlyph}{@render glyph?.()}{/if}
    <span class={view.labelClass}>{label}</span>
    {#if view.countClass}
      <span class={view.countClass} aria-hidden="true">{count!.value}</span>
      <span class="glim-sr-only">{count!.label}</span>
    {/if}
  </svelte:element>
{/snippet}

{#if framed}
  <div data-glim="SidebarRow" class={`${view.className} glim-nav-row--slots ${className}`.trim()} style={viewStyle}>
    {#if before}<span class="glim-nav-row-slot">{@render before()}</span>{/if}
    {@render link()}
    {#if after}<span class="glim-nav-row-slot">{@render after()}</span>{/if}
  </div>
{:else}
  {@render link()}
{/if}
<TipBubble state={tooltip} />
