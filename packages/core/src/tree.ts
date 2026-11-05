// The model behind Tree: which rows are on show and what a key does there. The
// frameworks hold the children and draw the rows; the glyph type is theirs.

export interface TreeNode<G = unknown> {
  /** Unique in the tree, such as a path. */
  id: string;
  label: string;
  /** Whether the row can open. Its children are asked for the first time it does. */
  hasChildren?: boolean;
  glyph?: G;
  /** Takes the glyph's place while the row is open. */
  openGlyph?: G;
  /** Attributes for the row, such as a data hook. */
  attrs?: Record<string, string>;
}

export interface TreeRow<G = unknown> {
  node: TreeNode<G>;
  /** From 1, as aria-level counts. */
  level: number;
  position: number;
  siblings: number;
  parent: string | null;
  open: boolean;
}

/** The rows on show, top to bottom. The top level's children are filed under null. */
export function treeRows<G>(children: ReadonlyMap<string | null, readonly TreeNode<G>[]>, open: readonly string[]): TreeRow<G>[] {
  const rows: TreeRow<G>[] = [];
  const walk = (parent: string | null, level: number) => {
    const nodes = children.get(parent) ?? [];
    nodes.forEach((node, i) => {
      const isOpen = !!node.hasChildren && open.includes(node.id);
      rows.push({ node, level, position: i + 1, siblings: nodes.length, parent, open: isOpen });
      if (isOpen) walk(node.id, level + 1);
    });
  };
  walk(null, 1);
  return rows;
}

export type TreeStep = { focus: string } | { open: string } | { close: string };

/**
 * What a key does on the row at `at`, or null when the tree does not answer it.
 * Right and left swap under a right-to-left page. A letter goes to the next row
 * starting with it, wrapping at the end.
 */
export function treeStep<G>(rows: readonly TreeRow<G>[], at: number, key: string, rtl = false): TreeStep | null {
  const row = rows[at];
  const focus = (target: TreeRow<G> | undefined) => (target ? { focus: target.node.id } : null);
  switch (key) {
    case "ArrowDown":
      return focus(rows[at + 1]);
    case "ArrowUp":
      return focus(rows[at - 1]);
    case "Home":
      return focus(rows[0]);
    case "End":
      return focus(rows[rows.length - 1]);
    case "ArrowRight":
    case "ArrowLeft": {
      const inward = key === (rtl ? "ArrowLeft" : "ArrowRight");
      if (inward) {
        if (!row.node.hasChildren) return null;
        return row.open ? focus(rows[at + 1]?.parent === row.node.id ? rows[at + 1] : undefined) : { open: row.node.id };
      }
      if (row.open) return { close: row.node.id };
      return row.parent === null ? null : { focus: row.parent };
    }
  }
  if (key.length !== 1 || key === " ") return null;
  const letter = key.toLowerCase();
  const after = [...rows.slice(at + 1), ...rows.slice(0, at)];
  return focus(after.find((r) => r.node.label.toLowerCase().startsWith(letter)));
}

/** Puts the focus on a row. */
export function focusTreeRow(tree: HTMLElement, id: string): void {
  tree.querySelector<HTMLElement>(`[data-tree-id="${CSS.escape(id)}"]`)?.focus();
}
