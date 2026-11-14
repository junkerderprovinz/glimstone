import { createEffect, createSignal, createUniqueId, onCleanup, Show, type JSX } from "solid-js";
import { anchorName, openPopover } from "@glimstone/core";

// A small panel beside the control that opened it, such as a filter. It lives
// in the top layer through the popover attribute, so no card or scroll box
// clips it, and it renders where it stands rather than in a portal. Escape and
// a press beside it close it, and focus goes back to the trigger.

export interface PopoverProps {
  /** Whether it shows. */
  open: boolean;
  /** The control it stands beside. */
  anchor: HTMLElement | null;
  /** Its accessible name. */
  label: string;
  /** Called when the browser closes it; the caller sets `open` back. */
  onClose: () => void;
  children: JSX.Element;
  class?: string;
}

export function Popover(props: PopoverProps) {
  const [panel, setPanel] = createSignal<HTMLDivElement>();
  const id = createUniqueId();
  createEffect(() => {
    const el = panel();
    if (!props.open || !props.anchor || !el) return;
    onCleanup(openPopover(el, props.anchor, anchorName(id), () => props.onClose()));
  });
  return (
    <Show when={props.open}>
      <div
        data-glim="Popover"
        ref={setPanel}
        popover="auto"
        role="dialog"
        aria-label={props.label}
        class={props.class ? `glim-popover ${props.class}` : "glim-popover"}
      >
        {props.children}
      </div>
    </Show>
  );
}
