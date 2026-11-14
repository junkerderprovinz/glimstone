<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { TreeNode as CoreTreeNode } from "@glimstone/core";

  export type TreeNode = CoreTreeNode<Snippet>;

  export interface TreeProps {
    /** The tree's accessible name. */
    label: string;
    /** Asked once for the children of a row, and for the top with null. A list that fails is asked for again on the next opening. */
    load: (id: string | null) => readonly TreeNode[] | Promise<readonly TreeNode[]>;
    /** The chosen row's id, bound with `bind:value`. */
    value: string | null;
    onChange?: (id: string) => void;
    /** Called on a double click or Enter on a row, for a picker that takes it at once. */
    onActivate?: (id: string) => void;
    /** The open rows' ids, bound with `bind:open` by a caller that holds them. */
    open?: string[];
    onOpenChange?: (open: string[]) => void;
    /** The rows open from the start, for a tree that holds them itself. */
    defaultOpen?: string[];
  }
</script>

<script lang="ts">
  import { SvelteMap } from "svelte/reactivity";
  import { focusTreeRow, treeRows, treeStep } from "@glimstone/core";
  import { IconExpand } from "./glyphs.js";

  // A hierarchy to walk through, loaded as it opens. The rows and the keys come
  // from tree.ts in the core.
  let { label, load, value = $bindable(), onChange, onActivate, open = $bindable(), onOpenChange, defaultOpen = [] }: TreeProps = $props();

  // svelte-ignore state_referenced_locally
  let ownOpen = $state(defaultOpen);
  const opened = $derived(open ?? ownOpen);
  const children = new SvelteMap<string | null, readonly TreeNode[]>();
  const asked = new Set<string | null>();
  let tree: HTMLDivElement;

  $effect(() => {
    for (const id of [null, ...opened]) {
      if (asked.has(id)) continue;
      asked.add(id);
      Promise.resolve(load(id)).then(
        (nodes) => children.set(id, nodes),
        () => asked.delete(id),
      );
    }
  });

  const rows = $derived(treeRows(children, opened));
  const stop = $derived(Math.max(rows.findIndex((r) => r.node.id === value), 0));

  function choose(id: string) {
    value = id;
    onChange?.(id);
  }

  function toggle(id: string) {
    const next = opened.includes(id) ? opened.filter((o) => o !== id) : [...opened, id];
    ownOpen = next;
    if (open !== undefined) open = next;
    onOpenChange?.(next);
  }

  function keys(e: KeyboardEvent, at: number) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const id = rows[at]!.node.id;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      choose(id);
      if (e.key === "Enter") onActivate?.(id);
      return;
    }
    const step = treeStep(rows, at, e.key, getComputedStyle(tree).direction === "rtl");
    if (!step) return;
    e.preventDefault();
    if ("focus" in step) {
      choose(step.focus);
      focusTreeRow(tree, step.focus);
    } else toggle("open" in step ? step.open : step.close);
  }
</script>

<div data-glim="Tree" bind:this={tree} role="tree" aria-label={label} class="glim-tree">
  {#each rows as r, i (r.node.id)}
    <div
      {...r.node.attrs}
      role="treeitem"
      aria-level={r.level}
      aria-posinset={r.position}
      aria-setsize={r.siblings}
      aria-expanded={r.node.hasChildren ? r.open : undefined}
      aria-selected={r.node.id === value}
      tabindex={i === stop ? 0 : -1}
      data-tree-id={r.node.id}
      class="glim-tree-row"
      style="--tree-level: {r.level - 1}"
      onclick={() => choose(r.node.id)}
      ondblclick={() => onActivate?.(r.node.id)}
      onkeydown={(e) => keys(e, i)}
    >
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <span
        class="glim-tree-toggle"
        aria-hidden="true"
        onclick={(e) => {
          e.stopPropagation();
          if (r.node.hasChildren) toggle(r.node.id);
        }}
        ondblclick={(e) => e.stopPropagation()}
      >
        {#if r.node.hasChildren}{@render IconExpand()}{/if}
      </span>
      {#if r.node.glyph}
        <span class="glim-tree-glyph" aria-hidden="true">{@render ((r.open && r.node.openGlyph) || r.node.glyph)()}</span>
      {/if}
      <span class="glim-tree-label">{r.node.label}</span>
    </div>
  {/each}
</div>
