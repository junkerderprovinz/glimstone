import type { ReactNode } from "react";
import { windowFoot } from "@glimstone/core";
import { Button } from "./Button.tsx";
import { IconCancel, IconClose } from "./glyphs.tsx";

// The foot of a Window or a Sheet: a quiet start line and the actions at the
// end, with Cancel or Close added by windowFoot() in the core.

export interface WindowAction {
  label: string;
  /** The translation key behind `label`, which picks the glyph, or `null`. */
  labelKey: string | null;
  glyph?: ReactNode;
  /** The forward action, filled with the accent and placed last. */
  primary?: boolean;
  /** This action already leaves the window, such as Done, so no Cancel or Close is added. */
  wayOut?: boolean;
  disabled?: boolean;
  /** Attributes for the action's button, such as a data hook. */
  attrs?: Record<string, string>;
  /** Runs on press. The window closes afterwards unless it returns false. */
  onClick?: () => void | false;
}

export function WindowFootRow({
  actions,
  start,
  text,
  onClose,
}: {
  actions: WindowAction[];
  start?: ReactNode;
  text: { cancel: string; close: string };
  onClose: () => void;
}) {
  const foot = windowFoot<WindowAction>(actions, start !== undefined, {
    cancel: { label: text.cancel, labelKey: "common.cancel", glyph: <IconCancel />, wayOut: true },
    close: { label: text.close, labelKey: "common.close", glyph: <IconClose />, wayOut: true },
  });
  if (foot.length === 0) return null;
  return (
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
            if (a.onClick?.() !== false) onClose();
          }}
        />
      ))}
    </div>
  );
}
