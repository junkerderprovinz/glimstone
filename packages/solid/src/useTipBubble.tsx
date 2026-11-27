import { createEffect, createSignal, createUniqueId, on, onCleanup, Show, type Accessor, type JSX } from "solid-js";
import { dismissBubbleOn, placeBubble, pointerWasLast, restTimer, trackInputModality, type BubbleKind } from "@glimstone/core";
import { Lift } from "./Lift.tsx";

// The one hover and focus tooltip, as a primitive. The "(i)" of InfoBubble, a
// bare IconTipButton, a SelectorTab segment and a Button whose text the label
// engine hides are all triggers of this same bubble (design-language.md, "The
// tooltip and info bubble"). A trigger owns its element, its classes and when
// it has something to say; placing and dismissing live in the core.

export interface TipBubble {
  /** Ref callback for the trigger element the bubble is placed against. */
  ref: (el: HTMLElement | null) => void;
  /** Spread on the trigger. Focus opens the bubble too, when it came from the keyboard. */
  handlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
  /** `aria-describedby` while open, so the bubble is announced as the trigger's description. */
  describedBy: Accessor<string | undefined>;
  /** The bubble, lifted to the body so no card's `overflow: hidden` clips it.
   *  Render it beside the trigger. */
  bubble: JSX.Element;
  /** Opens a tooltip once the pointer has rested, an info bubble at once. */
  show: () => void;
  hide: () => void;
}

export interface TipBubbleOptions {
  /** `tip` names a control: small, inverted, once the pointer has rested.
   *  `info` explains: roomier, on the floating surface, at once. */
  kind?: BubbleKind;
  /** A keyboard shortcut drawn beside a tooltip's words, such as "Ctrl K". */
  shortcut?: () => string | undefined;
}

/**
 * @param tip  What the bubble says. When it is empty nothing opens or renders.
 * @param disabled  Whether the trigger is disabled; a disabled trigger sits in a
 *                  TipWrap, so flipping it swaps the element under the pointer.
 */
export function useTipBubble(tip: () => string | undefined, disabled: () => boolean = () => false, { kind = "tip", shortcut = () => undefined }: TipBubbleOptions = {}): TipBubble {
  const [open, setOpen] = createSignal(false);
  const timer = restTimer(kind);
  let trigger: HTMLElement | null = null;
  let bubble: HTMLDivElement | undefined;
  const id = createUniqueId();
  const shown = () => !!tip() && open();

  createEffect(on(disabled, () => setOpen(false), { defer: true }));
  trackInputModality();

  const show = () => {
    if (tip()) timer.rest(() => setOpen(true));
  };
  const hide = () => {
    timer.cancel();
    timer.closed(open());
    setOpen(false);
  };
  onCleanup(timer.cancel);

  // Effects run once the bubble is in the document and before the browser
  // paints, so it is measured and placed without a visible jump.
  createEffect(() => {
    if (!shown()) return;
    if (trigger && bubble) placeBubble(trigger, bubble);
    onCleanup(dismissBubbleOn(hide));
  });

  return {
    ref: (el) => {
      trigger = el;
    },
    handlers: {
      onMouseEnter: show,
      onMouseLeave: hide,
      onFocus: () => {
        if (tip() && !pointerWasLast()) setOpen(true);
      },
      onBlur: hide,
    },
    describedBy: () => (shown() ? id : undefined),
    bubble: (
      <Show when={shown()}>
        <Lift>
          <div ref={bubble} role="tooltip" id={id} class={`glim-bubble glim-fade glim-bubble--${kind}`}>
            {tip()}
            <Show when={shortcut()}>
              <kbd class="glim-bubble-key">{shortcut()}</kbd>
            </Show>
          </div>
        </Lift>
      </Show>
    ),
    show,
    hide,
  };
}
