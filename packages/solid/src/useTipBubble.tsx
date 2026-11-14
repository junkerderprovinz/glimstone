import { createEffect, createSignal, createUniqueId, on, onCleanup, Show, type Accessor, type JSX } from "solid-js";
import { dismissBubbleOn, placeBubble, pointerWasLast, trackInputModality } from "@glimstone/core";
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
  show: () => void;
  hide: () => void;
}

/**
 * @param tip  What the bubble says. When it is empty nothing opens or renders.
 * @param disabled  Whether the trigger is disabled; a disabled trigger sits in a
 *                  TipWrap, so flipping it swaps the element under the pointer.
 */
export function useTipBubble(tip: () => string | undefined, disabled: () => boolean = () => false): TipBubble {
  const [open, setOpen] = createSignal(false);
  let trigger: HTMLElement | null = null;
  let bubble: HTMLDivElement | undefined;
  const id = createUniqueId();
  const shown = () => !!tip() && open();

  createEffect(on(disabled, () => setOpen(false), { defer: true }));
  trackInputModality();

  const show = () => {
    if (tip()) setOpen(true);
  };
  const hide = () => setOpen(false);

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
        if (!pointerWasLast()) show();
      },
      onBlur: hide,
    },
    describedBy: () => (shown() ? id : undefined),
    bubble: (
      <Show when={shown()}>
        <Lift>
          <div ref={bubble} role="tooltip" id={id} class="glim-bubble glim-fade">
            {tip()}
          </div>
        </Lift>
      </Show>
    ),
    show,
    hide,
  };
}

/**
 * Boxes a disabled trigger with a tip in a span that still sees the pointer,
 * since a disabled <button> emits no mouse events. Otherwise the trigger
 * renders as it is.
 */
export function TipWrap(props: { on: boolean; show: () => void; hide: () => void; children: JSX.Element }) {
  const node = props.children;
  return (
    <Show when={props.on} fallback={node}>
      <span class="glim-tip-wrap" onMouseEnter={props.show} onMouseLeave={props.hide}>
        {node}
      </span>
    </Show>
  );
}
