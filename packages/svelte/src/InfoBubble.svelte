<script lang="ts" module>
  export interface InfoBubbleProps {
    tip: string;
    onAccent?: boolean;
  }
</script>

<script lang="ts">
  import { useTipBubble } from "./bubble.svelte.js";
  import TipBubble from "./TipBubble.svelte";

  // A neutral (i) icon beside a label that reveals a short help text on hover and
  // keyboard focus. Explanations live here rather than as a permanent grey
  // paragraph under the control. The icon never takes the accent colour, which
  // means "active"; the bubble itself comes from useTipBubble.
  //
  // `onAccent` is for an icon inside a filled accent badge such as a card heading:
  // it inherits the badge's --accent-contrast ink and drops the idle opacity, which
  // has less margin on a busy fill.
  let { tip, onAccent = false }: InfoBubbleProps = $props();

  const tooltip = useTipBubble(() => tip);
</script>

<!-- Inside a <label>, a click on a span is forwarded to the label's field,
     which takes focus and closes the bubble at once. stopPropagation does not
     stop the native forwarding; preventDefault does, and the span keeps the
     focus it took on mousedown. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<span
  data-glim="InfoBubble"
  bind:this={tooltip.trigger}
  role="img"
  aria-label={tip}
  aria-describedby={tooltip.describedBy}
  tabindex={0}
  onmouseenter={tooltip.show}
  onmouseleave={tooltip.hide}
  onfocus={tooltip.showOnFocus}
  onblur={tooltip.hide}
  onclick={(e) => e.preventDefault()}
  class={onAccent ? "glim-info-icon glim-info-icon--on-accent" : "glim-info-icon"}
>
  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.3" />
    <circle cx="8" cy="4.6" r="0.9" fill="currentColor" />
    <path d="M8 7v4.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
  </svg>
</span>
<TipBubble state={tooltip} />
