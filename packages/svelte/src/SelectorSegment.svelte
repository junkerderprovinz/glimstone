<script lang="ts">
  import { segmentView, selectorTabId, type SelectorOrientation, type SelectorSize, type SelectorVariant, type SelectorView } from "@glimstone/core";
  import { useTipBubble } from "./bubble.svelte.js";
  import type { SelectorItem } from "./selectorItem.js";
  import { css } from "./style.js";
  import TipBubble from "./TipBubble.svelte";

  // One segment or tile of Selector, a component of its own so each holds its
  // own bubble.
  let {
    item,
    index,
    strip,
    on,
    disabled,
    roved,
    listed,
    share,
    squeezed,
    cut,
    orientation,
    size,
    variant,
    equalWidth,
    buttonHeight,
    hue,
    hueOffset,
    panelId,
    onSelect,
  }: {
    item: SelectorItem<string | number>;
    index: number;
    strip: SelectorView;
    on: boolean;
    disabled: boolean;
    roved: boolean;
    /** The strip shows its dropdown, and the segment is only there to be measured. */
    listed: boolean;
    share: Record<string, string> | undefined;
    squeezed: boolean;
    cut: boolean;
    orientation: SelectorOrientation;
    size: SelectorSize;
    variant: SelectorVariant;
    equalWidth: boolean;
    buttonHeight: boolean;
    hue: boolean;
    hueOffset?: number;
    panelId?: string;
    onSelect: () => void;
  } = $props();

  const view = $derived(
    segmentView({
      strip,
      orientation,
      size,
      variant,
      equalWidth,
      buttonHeight,
      hue,
      hueOffset,
      index,
      label: item.label,
      hasGlyph: !!item.glyph,
      iconOnly: !!item.iconOnly,
      tip: item.tip,
      title: item.title,
      on,
      disabled,
      dim: item.dim,
      squeezed,
      cut,
    }),
  );
  const tooltip = useTipBubble(() => view.tip, () => disabled);
  // A disabled segment takes no hover or focus, so its reason is a description
  // from the start rather than one that exists only while the bubble is open.
  const descId = $props.id();
  const hiddenTip = $derived(disabled && !!view.tip);
  const described = $derived(hiddenTip ? descId : tooltip.describedBy);
  const tab = $derived(strip.kind === "tab");
  const style = $derived(css({ ...view.style, ...share }));

  // A plain click stays in the app; a modified one opens the address beside
  // it, as a link does.
  function open(e: MouseEvent) {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onSelect();
  }
</script>

{#snippet content()}
  {#if view.showGlyph}{@render item.glyph?.()}{/if}
  {#if view.labelClass !== null}<span data-sel-label class={view.labelClass}>{item.label}</span>{/if}
{/snippet}

{#snippet button()}
  <!-- svelte-ignore a11y_role_supports_aria_props_implicit, a11y_role_has_required_aria_props -->
  <button
    {...item.attrs}
    bind:this={tooltip.trigger}
    type="button"
    data-sel-id={item.id}
    id={panelId && tab ? selectorTabId(panelId, item.id) : undefined}
    role={strip.kind === "toggle" ? undefined : strip.kind}
    aria-selected={tab ? on : undefined}
    aria-controls={panelId && tab && on ? panelId : undefined}
    aria-checked={strip.kind === "radio" ? on : undefined}
    aria-pressed={strip.kind === "toggle" ? on : undefined}
    aria-label={view.ariaLabel}
    aria-describedby={described}
    aria-hidden={listed || undefined}
    {disabled}
    tabindex={roved && !listed ? 0 : -1}
    class={view.className}
    {style}
    onclick={onSelect}
    onmouseenter={tooltip.show}
    onmouseleave={tooltip.hide}
    onfocus={tooltip.showOnFocus}
    onblur={tooltip.hide}
  >
    {@render content()}
  </button>
{/snippet}

{#if orientation === "vertical"}
  <a
    {...item.attrs}
    bind:this={tooltip.trigger}
    href={item.href}
    data-sel-id={item.id}
    role="tab"
    aria-selected={on}
    aria-current={on ? "page" : undefined}
    aria-describedby={described}
    tabindex={roved ? 0 : -1}
    class={view.className}
    {style}
    onclick={open}
    onmouseenter={tooltip.show}
    onmouseleave={tooltip.hide}
    onfocus={tooltip.showOnFocus}
    onblur={tooltip.hide}
  >
    {@render content()}
  </a>
{:else}
  {#if hiddenTip}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <span class="glim-tip-wrap" style={css(share)} onmouseenter={tooltip.show} onmouseleave={tooltip.hide}>{@render button()}</span>
  {:else}
    {@render button()}
  {/if}
  {#if hiddenTip}<span id={descId} hidden>{view.tip}</span>{/if}
{/if}
<TipBubble state={tooltip} />
