import { createMemo, createSignal, createUniqueId, mergeProps, type JSX } from "solid-js";
import * as collapsible from "@zag-js/collapsible";
import { normalizeProps, useMachine } from "@zag-js/solid";
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
  children: JSX.Element;
}

export function Collapsible(raw: CollapsibleProps) {
  const props = mergeProps({ defaultOpen: false, disabled: false }, raw);
  const id = createUniqueId();
  const [own, setOwn] = createSignal(props.defaultOpen);
  const service = useMachine(collapsible.machine, () => ({
    id,
    dir: pageDir(),
    open: props.open ?? own(),
    disabled: props.disabled,
    onOpenChange: (d: { open: boolean }) => {
      setOwn(d.open);
      props.onOpenChange?.(d.open);
    },
  }));
  const api = createMemo(() => collapsible.connect(service, normalizeProps));
  return (
    <div data-glim="Collapsible" {...api().getRootProps()} class="glim-collapsible">
      <button {...api().getTriggerProps()} class="glim-disclosure-trigger">
        <span class="glim-disclosure-label">{props.label}</span>
        <span {...api().getIndicatorProps()} class="glim-disclosure-indicator">
          <IconExpand />
        </span>
      </button>
      <div {...api().getContentProps()} class="glim-disclosure-content">
        <div class="glim-disclosure-body">{props.children}</div>
      </div>
    </div>
  );
}
