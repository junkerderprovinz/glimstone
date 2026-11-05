// What a table is handed, and the classes its cells wear.

export interface TableColumn {
  /** Which field of a row the column shows. */
  key: string;
  /** The column's heading. A table with no heading at all draws no header row. */
  label?: string;
  /** Sets the column at the end, in figures that line up (rule 7). */
  end?: boolean;
  /** `muted` for a quiet column, `accent` for what changes. */
  tone?: "muted" | "accent";
}

/** The classes of a cell. */
export function tableCellClass(column: TableColumn): string {
  return [column.end && "glim-table-end glim-num", column.tone && `glim-table-${column.tone}`].filter(Boolean).join(" ");
}
