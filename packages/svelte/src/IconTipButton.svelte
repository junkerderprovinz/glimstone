<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  export interface IconTipButtonProps extends Omit<HTMLButtonAttributes, "children" | "type" | "class" | "disabled" | "style"> {
    /** The hover and focus explanation, and the button's `aria-label`. */
    tip: string;
    disabled?: boolean;
    class?: string;
    /** `aria-pressed` for a trigger that toggles rather than acts once. Omitted,
     *  no attribute is rendered. */
    ariaPressed?: boolean;
    /** `aria-expanded` for a trigger that opens a disclosure panel. Omitted, no
     *  attribute is rendered. */
    ariaExpanded?: boolean;
    /** Inline style, so a hued Badge can set its `--item-hue*` properties. */
    style?: string;
    children: Snippet;
    /** Makes it a link. A disabled one stays a disabled button. */
    href?: string;
    type?: "button" | "submit";
  }
</script>

<script lang="ts">
  import { useTipBubble } from "./bubble.svelte.js";
  import TipBubble from "./TipBubble.svelte";
  import TipWrap from "./TipWrap.svelte";

  // An icon-only <button> whose accessible name and hover or focus explanation is
  // a `.glim-bubble` tooltip rather than the native `title=` balloon. `tip` is
  // required because an icon-only button has no other way to say what it does.
  //
  // Unlike Button, this control has no label to hide: a bare glyph in a box the
  // caller sizes, with no width stage, no tone fill and no place in the label
  // mode engine. The other props of a <button> go to the button.
  let { tip, disabled, class: className, style, children, href, type = "button", ariaPressed, ariaExpanded, ...rest }: IconTipButtonProps = $props();

  const tooltip = useTipBubble(() => tip, () => !!disabled);
  const link = $derived(!!href && !disabled);
</script>

<TipWrap on={!!disabled && !!tip} show={tooltip.show} hide={tooltip.hide}>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <svelte:element
    this={link ? "a" : "button"}
    data-glim="IconTipButton"
    {...rest}
    href={link ? href : undefined}
    type={link ? undefined : type}
    disabled={link ? undefined : disabled}
    bind:this={tooltip.trigger}
    aria-label={tip}
    aria-pressed={ariaPressed}
    aria-expanded={ariaExpanded}
    aria-describedby={tooltip.describedBy}
    onmouseenter={tooltip.show}
    onmouseleave={tooltip.hide}
    onfocus={tooltip.showOnFocus}
    onblur={tooltip.hide}
    class={className}
    {style}
  >
    {@render children()}
  </svelte:element>
</TipWrap>
<TipBubble state={tooltip} />
