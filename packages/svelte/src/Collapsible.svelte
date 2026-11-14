<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface CollapsibleProps {
    /** The words on the row that opens it, which are also its accessible name. */
    label: string;
    /** Whether it is open, bound with `bind:open`. Left out, it keeps its own state from `defaultOpen`. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
    disabled?: boolean;
    children: Snippet;
  }
</script>

<script lang="ts">
  import * as collapsible from "@zag-js/collapsible";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { pageDir } from "@glimstone/core";
  import { IconExpand } from "./glyphs.js";

  // A row that opens the text under it, for reading matter such as the answer
  // under a question on a help page. A settings page keeps rule 26: what would
  // hide under it goes on a sub-card or a page of its own.
  let { label, open = $bindable(), onOpenChange, defaultOpen = false, disabled = false, children }: CollapsibleProps = $props();

  const id = $props.id();
  const service = useMachine(collapsible.machine, () => ({
    id,
    dir: pageDir(),
    open: open ?? defaultOpen,
    disabled,
    onOpenChange: (d: { open: boolean }) => {
      open = d.open;
      onOpenChange?.(d.open);
    },
  }));
  const api = $derived(collapsible.connect(service, normalizeProps));
</script>

<div data-glim="Collapsible" {...api.getRootProps()} class="glim-collapsible">
  <button {...api.getTriggerProps()} class="glim-disclosure-trigger">
    <span class="glim-disclosure-label">{label}</span>
    <span {...api.getIndicatorProps()} class="glim-disclosure-indicator">{@render IconExpand()}</span>
  </button>
  <div {...api.getContentProps()} class="glim-disclosure-content">
    <div class="glim-disclosure-body">{@render children()}</div>
  </div>
</div>
