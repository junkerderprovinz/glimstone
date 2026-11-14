<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { AccordionItem, HeadingLevel } from "@glimstone/core";

  export type { AccordionItem, HeadingLevel } from "@glimstone/core";

  export interface AccordionProps<T extends AccordionItem> {
    items: readonly T[];
    /** The values of the open items, bound with `bind:value`. Left out, it keeps its own state. */
    value?: string[];
    onChange?: (value: string[]) => void;
    /** Several items open at once; otherwise opening one closes the other. */
    multiple?: boolean;
    headingLevel?: HeadingLevel;
    /** Draws the text under an item's row. */
    content: Snippet<[T]>;
  }
</script>

<script lang="ts" generics="T extends AccordionItem">
  import * as accordion from "@zag-js/accordion";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { pageDir } from "@glimstone/core";
  import { IconExpand } from "./glyphs.js";

  // A list of rows that each open their own text, for reading matter such as the
  // questions of a help page. Rule 26 keeps it off settings pages. Each row is a
  // heading with a button in it, so a screen reader can walk the questions.
  let { items, value = $bindable(), onChange, multiple = false, headingLevel = 3, content }: AccordionProps<T> = $props();

  const id = $props.id();
  const service = useMachine(accordion.machine, () => ({
    id,
    dir: pageDir(),
    value: value ?? [],
    multiple,
    collapsible: true,
    onValueChange: (d: { value: string[] }) => {
      value = d.value;
      onChange?.(d.value);
    },
  }));
  const api = $derived(accordion.connect(service, normalizeProps));
</script>

<div data-glim="Accordion" {...api.getRootProps()} class="glim-accordion">
  {#each items as item (item.value)}
    <div {...api.getItemProps(item)} class="glim-accordion-item">
      <svelte:element this={`h${headingLevel}`} class="glim-disclosure-heading">
        <button {...api.getItemTriggerProps(item)} class="glim-disclosure-trigger">
          <span class="glim-disclosure-label">{item.title}</span>
          <span {...api.getItemIndicatorProps(item)} class="glim-disclosure-indicator">{@render IconExpand()}</span>
        </button>
      </svelte:element>
      <div {...api.getItemContentProps(item)} class="glim-disclosure-content">
        <div class="glim-disclosure-body">{@render content(item)}</div>
      </div>
    </div>
  {/each}
</div>
