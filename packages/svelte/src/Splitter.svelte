<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { SplitterPanel, SplitterText } from "@glimstone/core";

  export type { SplitterPanel, SplitterText } from "@glimstone/core";

  export interface SplitterProps<T extends SplitterPanel> {
    panels: readonly T[];
    /** Each panel's share in percent, in the order of `panels`, bound with `bind:size`. */
    size: number[];
    onSizeChange?: (size: number[]) => void;
    orientation?: "horizontal" | "vertical";
    /** Draws a panel's content. */
    panel: Snippet<[T]>;
    text?: Partial<SplitterText>;
  }
</script>

<script lang="ts" generics="T extends SplitterPanel">
  import * as splitter from "@zag-js/splitter";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { SPLITTER_TEXT, pageDir, splitterHandleId } from "@glimstone/core";

  // Two or more panels side by side, or one above the other, with a handle
  // between each pair that drags or steps with the arrow keys. A hairline marks
  // the seam and a grip on it lights with the accent once it is reached for.
  let { panels, size = $bindable(), onSizeChange, orientation = "horizontal", panel, text }: SplitterProps<T> = $props();

  const words = $derived({ ...SPLITTER_TEXT, ...text });
  const id = $props.id();
  const service = useMachine(splitter.machine, () => ({
    id,
    dir: pageDir(),
    orientation,
    panels: panels.map(({ id, minSize, maxSize, collapsible }) => ({ id, minSize, maxSize, collapsible })),
    size,
    onResize: (d: { size: number[] }) => {
      size = d.size;
      onSizeChange?.(d.size);
    },
  }));
  const api = $derived(splitter.connect(service, normalizeProps));
  const handle = (index: number) => {
    const next = panels[index + 1];
    return next && splitterHandleId(panels[index]!, next);
  };
</script>

<div data-glim="Splitter" {...api.getRootProps()} class="glim-splitter">
  {#each panels as p, index (p.id)}
    {@const between = handle(index)}
    <div {...api.getPanelProps({ id: p.id })} class="glim-splitter-panel">{@render panel(p)}</div>
    {#if between}
      <div {...api.getResizeTriggerProps({ id: between })} aria-label={words.resize} class="glim-splitter-handle">
        <span {...api.getResizeTriggerIndicator({ id: between })} class="glim-splitter-grip"></span>
      </div>
    {/if}
  {/each}
</div>
