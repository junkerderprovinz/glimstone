import { createEffect, createMemo, createSignal, For, mergeProps, Show, type JSX } from "solid-js";
import { focusTreeRow, treeRows, treeStep, type TreeNode as CoreTreeNode } from "@glimstone/core";
import { IconExpand } from "./glyphs.tsx";

// A hierarchy to walk through, loaded as it opens. The rows and the keys come
// from tree.ts in the core.

export type TreeNode = CoreTreeNode<JSX.Element>;

export interface TreeProps {
  /** The tree's accessible name. */
  label: string;
  /** Asked once for the children of a row, and for the top with null. A list that fails is asked for again on the next opening. */
  load: (id: string | null) => readonly TreeNode[] | Promise<readonly TreeNode[]>;
  /** The chosen row's id. */
  value: string | null;
  onChange: (id: string) => void;
  /** Called on a double click or Enter on a row, for a picker that takes it at once. */
  onActivate?: (id: string) => void;
  /** The open rows' ids, for a caller that holds them. */
  open?: string[];
  onOpenChange?: (open: string[]) => void;
  /** The rows open from the start, for a tree that holds them itself. */
  defaultOpen?: string[];
}

export function Tree(props: TreeProps) {
  const merged = mergeProps({ defaultOpen: [] }, props);
  const [ownOpen, setOwnOpen] = createSignal<string[]>(merged.defaultOpen);
  const opened = (): string[] => merged.open ?? ownOpen();
  const [children, setChildren] = createSignal<ReadonlyMap<string | null, readonly TreeNode[]>>(new Map());
  const asked = new Set<string | null>();
  let tree!: HTMLDivElement;

  createEffect(() => {
    for (const id of [null, ...opened()]) {
      if (asked.has(id)) continue;
      asked.add(id);
      Promise.resolve(merged.load(id)).then(
        (nodes) => setChildren((known) => new Map(known).set(id, nodes)),
        () => asked.delete(id),
      );
    }
  });

  const rows = createMemo(() => treeRows(children(), opened()));
  const stop = () => Math.max(rows().findIndex((r) => r.node.id === merged.value), 0);

  function toggle(id: string) {
    const now = opened();
    const next = now.includes(id) ? now.filter((o) => o !== id) : [...now, id];
    setOwnOpen(next);
    merged.onOpenChange?.(next);
  }

  function keys(e: KeyboardEvent, at: number) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const id = rows()[at]!.node.id;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      merged.onChange(id);
      if (e.key === "Enter") merged.onActivate?.(id);
      return;
    }
    const step = treeStep(rows(), at, e.key, getComputedStyle(tree).direction === "rtl");
    if (!step) return;
    e.preventDefault();
    if ("focus" in step) {
      merged.onChange(step.focus);
      focusTreeRow(tree, step.focus);
    } else toggle("open" in step ? step.open : step.close);
  }

  // Keyed by the node, which the loaded lists keep, so a row keeps its element
  // and its focus while the rows around it change.
  return (
    <div data-glim="Tree" ref={tree} role="tree" aria-label={merged.label} class="glim-tree">
      <For each={rows().map((r) => r.node)}>
        {(node, i) => {
          const r = () => rows()[i()]!;
          return (
            <div
              {...node.attrs}
              role="treeitem"
              aria-level={r().level}
              aria-posinset={r().position}
              aria-setsize={r().siblings}
              aria-expanded={node.hasChildren ? r().open : undefined}
              aria-selected={node.id === merged.value}
              tabindex={i() === stop() ? 0 : -1}
              data-tree-id={node.id}
              class="glim-tree-row"
              style={{ "--tree-level": String(r().level - 1) }}
              onClick={() => merged.onChange(node.id)}
              onDblClick={() => merged.onActivate?.(node.id)}
              onKeyDown={(e) => keys(e, i())}
            >
              <span
                class="glim-tree-toggle"
                aria-hidden="true"
                onClick={(e) => {
                  e.stopPropagation();
                  if (node.hasChildren) toggle(node.id);
                }}
                onDblClick={(e) => e.stopPropagation()}
              >
                <Show when={node.hasChildren}>
                  <IconExpand />
                </Show>
              </span>
              <Show when={node.glyph}>
                <span class="glim-tree-glyph" aria-hidden="true">
                  {(r().open && node.openGlyph) || node.glyph}
                </span>
              </Show>
              <span class="glim-tree-label">{node.label}</span>
            </div>
          );
        }}
      </For>
    </div>
  );
}
