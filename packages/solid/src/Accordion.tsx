import { createMemo, createSignal, createUniqueId, For, mergeProps, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import * as accordion from "@zag-js/accordion";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { pageDir, type AccordionItem, type HeadingLevel } from "@glimstone/core";
import { IconExpand } from "./glyphs.tsx";

export type { AccordionItem, HeadingLevel } from "@glimstone/core";

// A list of rows that each open their own text, for reading matter such as the
// questions of a help page. Rule 26 keeps it off settings pages. Each row is a
// heading with a button in it, so a screen reader can walk the questions.

export interface AccordionProps<T extends AccordionItem> {
  items: readonly T[];
  /** The values of the open items. Left out, it keeps its own state. */
  value?: string[];
  onChange?: (value: string[]) => void;
  /** Several items open at once; otherwise opening one closes the other. */
  multiple?: boolean;
  headingLevel?: HeadingLevel;
  /** Draws the text under an item's row. */
  content: (item: T) => JSX.Element;
}

export function Accordion<T extends AccordionItem>(raw: AccordionProps<T>) {
  const props = mergeProps({ multiple: false, headingLevel: 3 }, raw);
  const id = createUniqueId();
  const [own, setOwn] = createSignal<string[]>([]);
  const service = useMachine(accordion.machine, () => ({
    id,
    dir: pageDir(),
    value: props.value ?? own(),
    multiple: props.multiple,
    collapsible: true,
    onValueChange: (d: { value: string[] }) => {
      setOwn(d.value);
      props.onChange?.(d.value);
    },
  }));
  const api = createMemo(() => accordion.connect(service, normalizeProps));
  return (
    <div data-glim="Accordion" {...api().getRootProps()} class="glim-accordion">
      <For each={props.items}>
        {(item) => (
          <div {...api().getItemProps(item)} class="glim-accordion-item">
            <Dynamic component={`h${props.headingLevel}`} class="glim-disclosure-heading">
              <button {...api().getItemTriggerProps(item)} class="glim-disclosure-trigger">
                <span class="glim-disclosure-label">{item.title}</span>
                <span {...api().getItemIndicatorProps(item)} class="glim-disclosure-indicator">
                  <IconExpand />
                </span>
              </button>
            </Dynamic>
            <div {...api().getItemContentProps(item)} class="glim-disclosure-content">
              <div class="glim-disclosure-body">{props.content(item)}</div>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
