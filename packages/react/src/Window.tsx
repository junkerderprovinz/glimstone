// The general window: a notch with the title, a body for anything and a foot
// whose actions stand at the end. It owns the portal, its place on the stack,
// Escape, the Tab trap and the focus, so a caller only mounts it and unmounts
// it on onClose. The other props of a <div> go to the card.

import { useId, useImperativeHandle, useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode, type Ref } from "react";
import { createPortal } from "react-dom";
import {
  focusedAsker,
  menuIsOpen,
  returnFocus,
  stackWindow,
  windowFocusTarget,
  type WindowSize,
  portalTarget,
} from "@glimstone/core";
import { Badge } from "./Badge.tsx";
import { WindowFootRow, type WindowAction } from "./WindowFootRow.tsx";

export type { WindowSize } from "@glimstone/core";

export type { WindowAction } from "./WindowFootRow.tsx";

export interface WindowProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
  /** The notch's words, also the window's accessible name. */
  title: string;
  /** Takes the words' place in the notch with markup, such as a count. `title` alone stays the name. */
  drawn?: ReactNode;
  children: ReactNode;
  /** The foot's buttons, in reading order. Cancel or Close is added before
   *  them unless one of them is a way out itself. */
  actions?: WindowAction[];
  /** A quiet line at the start of the foot, such as where the work carries on. */
  start?: ReactNode;
  /** `normal` for a question or a form, `wide` for a list, `full` for a tool. */
  size?: WindowSize;
  /** The words of the way out the window adds. */
  text: { cancel: string; close: string };
  /** Called for every way out: the foot, Escape and a press beside the window. */
  onClose: () => void;
  className?: string;
  /** The card element. */
  ref?: Ref<HTMLDivElement>;
}

export function Window({ title, drawn, children, actions = [], start, size = "normal", text, onClose, className, ref, ...rest }: WindowProps) {
  const card = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => card.current!);
  const titleId = useId();
  // Read before the window takes the focus.
  const [asker] = useState(focusedAsker);
  const close = useRef(onClose);
  useLayoutEffect(() => {
    close.current = onClose;
  });

  // Leaving takes the window off the stack at once, so the page is live again
  // by the time the caller hands the focus back to a field in it.
  const unstack = useRef<() => void>(undefined);
  const leave = () => {
    unstack.current?.();
    close.current();
  };
  useLayoutEffect(() => {
    unstack.current = stackWindow(() => card.current, leave);
    if (card.current) windowFocusTarget(card.current)?.focus();
    return () => {
      unstack.current?.();
      returnFocus(asker);
    };
  }, [asker]);

  return createPortal(
    <div
      className="glim-modal-backdrop"
      // A press beside an open menu only closes the menu, not the window under it.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !menuIsOpen()) leave();
      }}
    >
      <div
        {...rest}
        ref={card}
        role="dialog"
        aria-modal="true"
        aria-labelledby={drawn ? undefined : titleId}
        aria-label={drawn ? title : undefined}
        className={["glim-modal-card", "glim-window", size !== "normal" && `glim-window--${size}`, className].filter(Boolean).join(" ")}
      >
        <h2 id={titleId} className="glim-window-title">
          <Badge tone="heading" size="heading" wrap insetStart={5}>
            {drawn ?? title}
          </Badge>
        </h2>
        <div className="glim-modal-body glim-window-body">{children}</div>
        <WindowFootRow actions={actions} start={start} text={text} onClose={leave} />
      </div>
    </div>,
    portalTarget(),
  );
}
