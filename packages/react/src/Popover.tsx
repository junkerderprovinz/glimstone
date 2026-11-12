import { useId, useLayoutEffect, useRef, type ReactNode } from "react";
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
  children: ReactNode;
  className?: string;
}

export function Popover({ open, anchor, label, onClose, children, className }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = useRef(onClose);
  useLayoutEffect(() => {
    close.current = onClose;
  });
  useLayoutEffect(() => {
    if (!open || !anchor || !ref.current) return;
    return openPopover(ref.current, anchor, anchorName(id), () => close.current());
  }, [open, anchor, id]);
  if (!open) return null;
  return (
    <div data-glim="Popover" ref={ref} popover="auto" role="dialog" aria-label={label} className={className ? `glim-popover ${className}` : "glim-popover"}>
      {children}
    </div>
  );
}
