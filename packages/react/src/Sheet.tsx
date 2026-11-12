import { useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { openSheet } from "@glimstone/core";
import { Badge } from "./Badge.tsx";
import { WindowFootRow, type WindowAction } from "./WindowFootRow.tsx";

// A panel at the end edge, or rising from the bottom on a phone, for the
// details of a row or a longer form beside the list. It is a <dialog> shown
// modal: the page behind it is inert, Escape and a press on the scrim close it,
// and focus goes back to the control that opened it. Its foot works as a
// Window's, with Cancel or Close added, so it has no close mark in its head.

export interface SheetProps {
  open: boolean;
  /** The notch's words, also the sheet's accessible name. */
  title: string;
  children: ReactNode;
  /** The foot's buttons, in reading order, as a Window's. */
  actions?: WindowAction[];
  /** A quiet line at the start of the foot. */
  start?: ReactNode;
  /** The words of the way out the sheet adds. */
  text: { cancel: string; close: string };
  /** Called for every way out; the caller sets `open` back. */
  onClose: () => void;
  className?: string;
}

export function Sheet({ open, title, children, actions = [], start, text, onClose, className }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const close = useRef(onClose);
  useLayoutEffect(() => {
    close.current = onClose;
  });
  useLayoutEffect(() => {
    if (!open || !ref.current) return;
    return openSheet(ref.current, () => close.current());
  }, [open]);
  if (!open) return null;
  return (
    <dialog ref={ref} aria-labelledby={titleId} className={className ? `glim-sheet ${className}` : "glim-sheet"}>
      <div className="glim-sheet-panel">
        <h2 id={titleId} className="glim-sheet-title">
          <Badge tone="heading" size="heading" wrap insetStart={5}>
            {title}
          </Badge>
        </h2>
        <div className="glim-sheet-body">{children}</div>
        <WindowFootRow actions={actions} start={start} text={text} onClose={() => close.current()} />
      </div>
    </dialog>
  );
}
