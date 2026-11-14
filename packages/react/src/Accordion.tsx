import { useId, useState, type ReactNode } from "react";
import * as accordion from "@zag-js/accordion";
import { normalizeProps, useMachine } from "@zag-js/react";
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
  content: (item: T) => ReactNode;
}

export function Accordion<T extends AccordionItem>({ items, value, onChange, multiple = false, headingLevel = 3, content }: AccordionProps<T>) {
  const [own, setOwn] = useState<string[]>([]);
  const service = useMachine(accordion.machine, {
    id: useId(),
    dir: pageDir(),
    value: value ?? own,
    multiple,
    collapsible: true,
    onValueChange: (d) => {
      setOwn(d.value);
      onChange?.(d.value);
    },
  });
  const api = accordion.connect(service, normalizeProps);
  const Heading = `h${headingLevel}` as const;
  return (
    <div data-glim="Accordion" {...api.getRootProps()} className="glim-accordion">
      {items.map((item) => (
        <div key={item.value} {...api.getItemProps(item)} className="glim-accordion-item">
          <Heading className="glim-disclosure-heading">
            <button {...api.getItemTriggerProps(item)} className="glim-disclosure-trigger">
              <span className="glim-disclosure-label">{item.title}</span>
              <span {...api.getItemIndicatorProps(item)} className="glim-disclosure-indicator">
                <IconExpand />
              </span>
            </button>
          </Heading>
          <div {...api.getItemContentProps(item)} className="glim-disclosure-content">
            <div className="glim-disclosure-body">{content(item)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
