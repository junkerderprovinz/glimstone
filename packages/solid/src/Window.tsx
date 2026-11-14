// The general window: a notch with the title, a body for anything and a foot
// whose actions stand at the end. It owns the portal, its place on the stack,
// Escape, the Tab trap and the focus, so a caller only mounts it and unmounts
// it on onClose. The other props of a <div> go to the card.

import { children, createUniqueId, mergeProps, onCleanup, onMount, splitProps, type JSX } from "solid-js";
import { focusedAsker, menuIsOpen, returnFocus, stackWindow, windowFocusTarget, type WindowSize } from "@glimstone/core";
import { Badge } from "./Badge.tsx";
import { Lift } from "./Lift.tsx";
import { WindowFootRow, type WindowAction } from "./WindowFootRow.tsx";

export type { WindowSize } from "@glimstone/core";

export type { WindowAction } from "./WindowFootRow.tsx";

export interface WindowProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "title" | "children" | "class" | "ref"> {
  /** The notch's words, also the window's accessible name. */
  title: string;
  /** Takes the words' place in the notch with markup, such as a count. `title` alone stays the name. */
  drawn?: JSX.Element;
  children: JSX.Element;
  /** The foot's buttons, in reading order. Cancel or Close is added before
   *  them unless one of them is a way out itself. */
  actions?: WindowAction[];
  /** A quiet line at the start of the foot, such as where the work carries on. */
  start?: JSX.Element;
  /** `normal` for a question or a form, `wide` for a list, `full` for a tool. */
  size?: WindowSize;
  /** The words of the way out the window adds. */
  text: { cancel: string; close: string };
  /** Called for every way out: the foot, Escape and a press beside the window. */
  onClose: () => void;
  class?: string;
  /** The card element. */
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}

export function Window(props: WindowProps) {
  const merged = mergeProps({ actions: [], size: "normal" }, props);
  const [own, rest] = splitProps(merged, ["title", "drawn", "children", "actions", "start", "size", "text", "onClose", "class", "ref"]);
  const drawn = children(() => own.drawn);
  let card: HTMLDivElement | undefined;
  const titleId = createUniqueId();
  // Read before the window takes the focus.
  const asker = focusedAsker();

  // Leaving takes the window off the stack at once, so the page is live again
  // by the time the caller hands the focus back to a field in it.
  let unstack: (() => void) | undefined;
  const leave = () => {
    unstack?.();
    own.onClose();
  };
  onMount(() => {
    unstack = stackWindow(() => card ?? null, leave);
    if (card) windowFocusTarget(card)?.focus();
  });
  onCleanup(() => {
    unstack?.();
    returnFocus(asker);
  });

  return (
    <Lift>
      <div
        class="glim-modal-backdrop"
        // A press beside an open menu only closes the menu, not the window under it.
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !menuIsOpen()) leave();
        }}
      >
        <div
          data-glim="Window"
          data-glim-title={own.title}
          {...rest}
          ref={(el) => {
            card = el;
            if (typeof own.ref === "function") own.ref(el);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={drawn() ? undefined : titleId}
          aria-label={drawn() ? own.title : undefined}
          class={["glim-modal-card", "glim-window", own.size !== "normal" && `glim-window--${own.size}`, own.class].filter(Boolean).join(" ")}
        >
          <h2 id={titleId} class="glim-window-title">
            <Badge tone="heading" size="heading" wrap insetStart={5}>
              {drawn() ?? own.title}
            </Badge>
          </h2>
          <div class="glim-modal-body glim-window-body">{own.children}</div>
          <WindowFootRow actions={own.actions} start={own.start} text={own.text} onClose={leave} />
        </div>
      </div>
    </Lift>
  );
}
