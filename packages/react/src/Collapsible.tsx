import { useId, useState, type ReactNode } from "react";
import * as collapsible from "@zag-js/collapsible";
import { normalizeProps, useMachine } from "@zag-js/react";
import { pageDir } from "@glimstone/core";
import { IconExpand } from "./glyphs.tsx";

// A row that opens the text under it, for reading matter such as the answer
// under a question on a help page. A settings page keeps rule 26: what would
// hide under it goes on a sub-card or a page of its own.

export interface CollapsibleProps {
  /** The words on the row that opens it, which are also its accessible name. */
  label: string;
  /** Whether it is open. Left out, it keeps its own state from `defaultOpen`. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

export function Collapsible({ label, open, onOpenChange, defaultOpen = false, disabled = false, children }: CollapsibleProps) {
  const [own, setOwn] = useState(defaultOpen);
  const service = useMachine(collapsible.machine, {
    id: useId(),
    dir: pageDir(),
    open: open ?? own,
    disabled,
    onOpenChange: (d) => {
      setOwn(d.open);
      onOpenChange?.(d.open);
    },
  });
  const api = collapsible.connect(service, normalizeProps);
  return (
    <div data-glim="Collapsible" {...api.getRootProps()} className="glim-collapsible">
      <button {...api.getTriggerProps()} className="glim-disclosure-trigger">
        <span className="glim-disclosure-label">{label}</span>
        <span {...api.getIndicatorProps()} className="glim-disclosure-indicator">
          <IconExpand />
        </span>
      </button>
      <div {...api.getContentProps()} className="glim-disclosure-content">
        <div className="glim-disclosure-body">{children}</div>
      </div>
    </div>
  );
}
