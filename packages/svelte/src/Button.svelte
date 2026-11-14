<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { ButtonSize, ButtonTone, ButtonVariant, WidthStage } from "@glimstone/core";

  export type { ButtonSize, ButtonTone, ButtonVariant } from "@glimstone/core";

  export interface ButtonProps extends Omit<HTMLButtonAttributes, "children" | "class" | "disabled" | "onclick" | "title" | "type" | "autofocus"> {
    /** The button's words, present in every mode: visible, or hidden but
     *  announced and shown as the tooltip. Keep it stable, since a label that
     *  changes while the button works would resize it; put changing state in
     *  `title`. */
    label: string;
    /** The translation key behind `label`, or `null` when the label is data such
     *  as a path. It picks the glyph by meaning (glyphFor), so the same verb
     *  wears the same symbol everywhere; an explicit `glyph` wins. */
    labelKey: string | null;
    /** Optional icon, overriding whatever `labelKey` would have chosen. */
    glyph?: Snippet;
    onClick?: () => void;
    tone?: ButtonTone;
    /** "chip" inside a pill, "icon" for a row action; see ButtonVariant. */
    variant?: ButtonVariant;
    disabled?: boolean;
    /** Makes it a link with the button's look. A disabled one stays a disabled button. */
    href?: string;
    /** What stands before the glyph, such as a count. */
    before?: Snippet;
    /** What stands after the words, such as a key cap. */
    after?: Snippet;
    type?: "button" | "submit";
    /** Extra explanation, and the place for anything that changes: the running
     *  state, or why the button is unavailable. It shows in the hover and focus
     *  bubble, joined with the label where the label is hidden, and still
     *  reaches a disabled button. */
    title?: string;
    /** This button's own rainbow position, for a colour different from its card's. */
    hueIndex?: number;
    /** The underlying element, bound with `bind:ref`, so a dialog can move focus to it. */
    ref?: HTMLElement | null;
    /** Shows the busy ring in place of the glyph, at once. Separate from `disabled`. */
    busy?: boolean;
    /** For a dialog that opens with focus on one of its buttons. */
    autofocus?: boolean;
    /** Forces a width stage, for two buttons in different components that should
     *  match: pass `groupStage([labelA, labelB])` to both. */
    stage?: WidthStage;
    /** Its glyph alone in a square in every label mode, where the words have no
     *  room. The label stays the name and the bubble. */
    compact?: boolean;
    /** Turns compact while the window is narrower than this many pixels. */
    compactBelow?: number;
    size?: ButtonSize;
    /** Keeps the label visible in every mode, for a label that is content rather than a verb. */
    keepLabel?: boolean;
    class?: string;
  }
</script>

<script lang="ts">
  import { buttonView, mediaMatches, narrowerThan, subscribeMedia, takePageHue } from "@glimstone/core";
  import { useLabelMode } from "./engines.svelte.js";
  import { glyphFor, IconClose } from "./glyphs.js";
  import { css } from "./style.js";
  import { useTipBubble } from "./bubble.svelte.js";
  import BusyRing from "./BusyRing.svelte";
  import TipBubble from "./TipBubble.svelte";
  import TipWrap from "./TipWrap.svelte";

  // The one clickable control; what it shows and how wide it is come from
  // buttonView() in the core. The other props of a <button> go to the element.
  let {
    label,
    labelKey,
    glyph,
    onClick,
    tone = "neutral",
    variant = "default",
    disabled = false,
    type = "button",
    class: className = "",
    title,
    hueIndex,
    busy = false,
    autofocus = false,
    stage,
    keepLabel = false,
    compact = false,
    compactBelow,
    size,
    href,
    before,
    after,
    ref = $bindable(null),
    ...rest
  }: ButtonProps = $props();

  const mode = useLabelMode("buttons");
  let narrow = $state(false);
  $effect.pre(() => {
    if (compactBelow === undefined) return void (narrow = false);
    const query = narrowerThan(compactBelow);
    narrow = mediaMatches(query);
    return subscribeMedia(query, () => (narrow = mediaMatches(query)));
  });
  // A chip always closes, so it has a glyph even when no call site passes one.
  const resolved = $derived(glyph ?? (labelKey ? glyphFor(labelKey) : undefined) ?? (variant === "chip" ? IconClose : undefined));
  const view = $derived(
    buttonView({
      mode: mode.current,
      label,
      hasGlyph: !!resolved || busy,
      tone,
      variant,
      disabled,
      keepLabel,
      compact: compact || narrow,
      size,
      title,
      hueIndex,
      stage,
    }),
  );
  const link = $derived(!!href && !disabled);
  const bubble = useTipBubble(() => view.tip, () => disabled);

  $effect.pre(() => {
    bubble.trigger = ref;
  });

  function enter(e: MouseEvent) {
    if (view.pageHue) takePageHue(e.currentTarget as HTMLElement);
    bubble.show();
  }
  function focus(e: FocusEvent) {
    if (view.pageHue) takePageHue(e.currentTarget as HTMLElement);
    bubble.showOnFocus();
  }
</script>

<TipWrap on={disabled && !!view.tip} show={bubble.show} hide={bubble.hide}>
  <!-- svelte-ignore a11y_no_static_element_interactions, a11y_autofocus -->
  <svelte:element
    this={link ? "a" : "button"}
    data-glim="Button"
    {...rest}
    bind:this={ref}
    href={link ? href : undefined}
    type={link ? undefined : type}
    disabled={link ? undefined : disabled}
    autofocus={link ? undefined : autofocus}
    aria-busy={busy || undefined}
    aria-describedby={bubble.describedBy}
    style={css(view.style)}
    class={`${view.className} ${className}`.trim()}
    onclick={() => onClick?.()}
    onmouseenter={enter}
    onmouseleave={bubble.hide}
    onfocus={focus}
    onblur={bubble.hide}
  >
    {@render before?.()}
    {#if view.showGlyph}
      <span class="glim-btn-glyph">
        {#if busy}<BusyRing size="small" delay={0} />{:else}{@render resolved?.()}{/if}
      </span>
    {/if}
    <span class={view.labelClass}>{label}</span>
    {@render after?.()}
  </svelte:element>
</TipWrap>
<TipBubble state={bubble} />
