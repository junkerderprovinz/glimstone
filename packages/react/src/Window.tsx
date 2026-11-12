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
  windowFoot,
  type WindowSize,
} from "@glimstone/core";
import { Badge } from "./Badge.tsx";
import { Button } from "./Button.tsx";
import { IconCancel, IconClose } from "./glyphs.tsx";

export type { WindowSize } from "@glimstone/core";

export interface WindowAction {
  label: string;
  /** The translation key behind `label`, which picks the glyph, or `null`. */
  labelKey: string | null;
  glyph?: ReactNode;
  /** The forward action, filled with the accent and placed last. */
  primary?: boolean;
  /** This action already leaves the window, so no Cancel or Close is added. */
  wayOut?: boolean;
  disabled?: boolean;
  /** Attributes for the action's button, such as a data hook. */
  attrs?: Record<string, string>;
  /** Runs on press. The window closes afterwards unless it returns false. */
  onClick?: () => void | false;
}

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

  useLayoutEffect(() => {
    const unstack = stackWindow(
      () => card.current,
      () => close.current(),
    );
    if (card.current) windowFocusTarget(card.current)?.focus();
    return () => {
      unstack();
      returnFocus(asker);
    };
  }, [asker]);

  const foot = windowFoot<WindowAction>(actions, start !== undefined, {
    cancel: { label: text.cancel, labelKey: "common.cancel", glyph: <IconCancel />, wayOut: true },
    close: { label: text.close, labelKey: "common.close", glyph: <IconClose />, wayOut: true },
  });

  return createPortal(
    <div
      className="glim-modal-backdrop"
      // A press beside an open menu only closes the menu, not the window under it.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !menuIsOpen()) close.current();
      }}
    >
      <div
        data-glim="Window"
        data-glim-title={title}
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
        {foot.length > 0 && (
          <div className="glim-modal-foot">
            {start !== undefined && <span className="glim-window-start">{start}</span>}
            {foot.map((a, i) => (
              <Button
                {...a.attrs}
                key={i}
                label={a.label}
                labelKey={a.labelKey}
                glyph={a.glyph}
                tone={a.primary ? "accent" : "neutral"}
                disabled={a.disabled}
                onClick={() => {
                  if (a.onClick?.() !== false) close.current();
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
