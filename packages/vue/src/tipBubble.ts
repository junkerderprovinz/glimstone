// The one hover and focus tooltip, as a composable. The "(i)" of InfoBubble, a
// bare IconTipButton, a Select trigger and a Button whose text the label engine
// hides are all triggers of this same bubble (design-language.md, "The tooltip
// and info bubble"). The trigger owns its element and when it has something to
// say; TipBubble.vue draws the bubble, and the core places and dismisses it.

import { computed, onScopeDispose, ref, shallowRef, useId, watch, type ComputedRef, type Ref } from "vue";
import { dismissBubbleOn, placeBubble, pointerWasLast, restTimer, trackInputModality, type BubbleKind } from "@glimstone/core";

export interface TipBubble {
  /** The trigger the bubble is placed against. */
  trigger: Ref<HTMLElement | null>;
  bubble: Ref<HTMLElement | null>;
  id: string;
  text: ComputedRef<string | undefined>;
  shown: ComputedRef<boolean>;
  kind: BubbleKind;
  shortcut: ComputedRef<string | undefined>;
  /** `aria-describedby` while open, so the bubble is announced as the trigger's description. */
  describedBy: ComputedRef<string | undefined>;
  /** Opens a tooltip once the pointer has rested, an info bubble at once. */
  show: () => void;
  hide: () => void;
  /** Focus opens the bubble only when the keyboard was used last; a mouse user gets focus as a side effect. */
  showOnFocus: () => void;
}

export interface TipBubbleOptions {
  /** `tip` names a control: small, inverted, once the pointer has rested.
   *  `info` explains: roomier, on the floating surface, at once. */
  kind?: BubbleKind;
  /** A keyboard shortcut drawn beside a tooltip's words, such as "Ctrl K". */
  shortcut?: () => string | undefined;
}

export function useTipBubble(tip: () => string | undefined, disabled: () => boolean = () => false, { kind = "tip", shortcut = () => undefined }: TipBubbleOptions = {}): TipBubble {
  const open = ref(false);
  const timer = restTimer(kind);
  const trigger = shallowRef<HTMLElement | null>(null);
  const bubble = shallowRef<HTMLElement | null>(null);
  const id = useId();
  const text = computed(tip);
  const shown = computed(() => !!text.value && open.value);

  // A disabled trigger is boxed in TipWrap, so flipping `disabled` swaps the
  // element and its mouseleave never comes; the bubble closes with it.
  watch(disabled, () => (open.value = false));

  trackInputModality();
  const show = () => {
    if (text.value) timer.rest(() => (open.value = true));
  };
  const hide = () => {
    timer.cancel();
    timer.closed(open.value);
    open.value = false;
  };

  let stop: (() => void) | undefined;
  // `post` runs after the bubble is in the DOM and before the browser paints,
  // so it is measured and placed without a visible jump.
  watch(
    shown,
    (on) => {
      stop?.();
      stop = undefined;
      if (!on) return;
      if (trigger.value && bubble.value) placeBubble(trigger.value, bubble.value);
      stop = dismissBubbleOn(hide);
    },
    { flush: "post" },
  );
  onScopeDispose(() => {
    stop?.();
    timer.cancel();
  });

  return {
    trigger,
    bubble,
    id,
    text,
    shown,
    kind,
    shortcut: computed(shortcut),
    describedBy: computed(() => (shown.value ? id : undefined)),
    show,
    hide,
    showOnFocus: () => {
      if (text.value && !pointerWasLast()) open.value = true;
    },
  };
}
