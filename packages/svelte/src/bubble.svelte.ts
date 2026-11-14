import { dismissBubbleOn, placeBubble, pointerWasLast, trackInputModality } from "@glimstone/core";

// The one hover and focus tooltip. The "(i)" of InfoBubble, a bare
// IconTipButton, a Select trigger and a Button whose text the label engine
// hides are all triggers of this same bubble (design-language.md, "The tooltip
// and info bubble"). The trigger owns its element and when it has something to
// say; TipBubble.svelte draws the bubble, and the core places and dismisses it.

export interface TipBubble {
  /** The trigger the bubble is placed against. */
  trigger: HTMLElement | null;
  bubble: HTMLElement | null;
  readonly id: string;
  readonly text: string | undefined;
  readonly shown: boolean;
  /** `aria-describedby` while open, so the bubble is announced as the trigger's description. */
  readonly describedBy: string | undefined;
  show: () => void;
  hide: () => void;
  /** Focus opens the bubble only when the keyboard was used last; a mouse user gets focus as a side effect. */
  showOnFocus: () => void;
}

let count = 0;

export function useTipBubble(tip: () => string | undefined, disabled: () => boolean = () => false): TipBubble {
  let open = $state(false);
  let trigger = $state<HTMLElement | null>(null);
  let bubble = $state<HTMLElement | null>(null);
  const id = `glim-tip-${++count}`;
  const text = $derived(tip());
  const shown = $derived(!!text && open);

  // A disabled trigger is boxed in TipWrap, so flipping `disabled` swaps the
  // element and its mouseleave never comes; the bubble closes with it.
  let seen = disabled();
  $effect.pre(() => {
    const now = disabled();
    if (now !== seen) open = false;
    seen = now;
  });

  trackInputModality();
  const show = () => {
    if (text) open = true;
  };
  const hide = () => {
    open = false;
  };

  // Effects run once the bubble is in the document and before the browser
  // paints, so it is measured and placed without a visible jump.
  $effect(() => {
    if (!shown) return;
    if (trigger && bubble) placeBubble(trigger, bubble);
    return dismissBubbleOn(hide);
  });

  return {
    get trigger() {
      return trigger;
    },
    set trigger(el) {
      trigger = el;
    },
    get bubble() {
      return bubble;
    },
    set bubble(el) {
      bubble = el;
    },
    id,
    get text() {
      return text;
    },
    get shown() {
      return shown;
    },
    get describedBy() {
      return shown ? id : undefined;
    },
    show,
    hide,
    showOnFocus: () => {
      if (!pointerWasLast()) show();
    },
  };
}
