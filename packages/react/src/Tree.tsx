import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { focusTreeRow, treeRows, treeStep, type TreeNode as CoreTreeNode } from "@glimstone/core";
import { IconExpand } from "./glyphs.tsx";

// A hierarchy to walk through, loaded as it opens. The rows and the keys come
// from tree.ts in the core.

export type TreeNode = CoreTreeNode<ReactNode>;

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

export function Tree({ label, load, value, onChange, onActivate, open, onOpenChange, defaultOpen = [] }: TreeProps) {
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const opened = open ?? ownOpen;
  const [children, setChildren] = useState<ReadonlyMap<string | null, readonly TreeNode[]>>(new Map());
  const asked = useRef(new Set<string | null>());
  const tree = useRef<HTMLDivElement>(null);

  // The ids stand in for `opened` in the deps, since a caller may rebuild the array on every render.
  const openKey = opened.join("\n");
  useEffect(() => {
    for (const id of [null, ...opened]) {
      if (asked.current.has(id)) continue;
      asked.current.add(id);
      Promise.resolve(load(id)).then(
        (nodes) => setChildren((known) => new Map(known).set(id, nodes)),
        () => asked.current.delete(id),
      );
    }
  }, [openKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = treeRows(children, opened);
  const stop = Math.max(rows.findIndex((r) => r.node.id === value), 0);

  function toggle(id: string) {
    const next = opened.includes(id) ? opened.filter((o) => o !== id) : [...opened, id];
    setOwnOpen(next);
    onOpenChange?.(next);
  }

  function keys(e: KeyboardEvent, at: number) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const id = rows[at].node.id;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange(id);
      if (e.key === "Enter") onActivate?.(id);
      return;
    }
    const step = treeStep(rows, at, e.key, getComputedStyle(tree.current!).direction === "rtl");
    if (!step) return;
    e.preventDefault();
    if ("focus" in step) {
      onChange(step.focus);
      focusTreeRow(tree.current!, step.focus);
    } else toggle("open" in step ? step.open : step.close);
  }

  return (
    <div ref={tree} role="tree" aria-label={label} className="glim-tree">
      {rows.map((r, i) => (
        <div
          {...r.node.attrs}
          key={r.node.id}
          role="treeitem"
          aria-level={r.level}
          aria-posinset={r.position}
          aria-setsize={r.siblings}
          aria-expanded={r.node.hasChildren ? r.open : undefined}
          aria-selected={r.node.id === value}
          tabIndex={i === stop ? 0 : -1}
          data-tree-id={r.node.id}
          className="glim-tree-row"
          style={{ "--tree-level": r.level - 1 } as CSSProperties}
          onClick={() => onChange(r.node.id)}
          onDoubleClick={() => onActivate?.(r.node.id)}
          onKeyDown={(e) => keys(e, i)}
        >
          <span
            className="glim-tree-toggle"
            aria-hidden="true"
            onClick={(e) => {
              e.stopPropagation();
              if (r.node.hasChildren) toggle(r.node.id);
            }}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            {r.node.hasChildren && <IconExpand />}
          </span>
          {r.node.glyph && (
            <span className="glim-tree-glyph" aria-hidden="true">
              {(r.open && r.node.openGlyph) || r.node.glyph}
            </span>
          )}
          <span className="glim-tree-label">{r.node.label}</span>
        </div>
      ))}
    </div>
  );
}
