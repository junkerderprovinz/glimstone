import type { ReactNode } from "react";
import { tableCellClass, type TableColumn } from "@glimstone/core";

export type { TableColumn } from "@glimstone/core";

// A short list of facts in columns, inside a card or a window.

export interface TableProps<T extends object> {
  /** The table's accessible name. */
  label: string;
  columns: readonly TableColumn[];
  rows: readonly T[];
  /** One quiet line under the last row, such as how many more there are. */
  more?: string;
  /** Draws a cell of its own. Nothing returned shows the value. */
  cell?: (row: T, column: TableColumn) => ReactNode;
}

export function Table<T extends object>({ label, columns, rows, more, cell }: TableProps<T>) {
  const value = (row: T, column: TableColumn) => (row as Record<string, ReactNode>)[column.key];
  return (
    <table data-glim="Table" className="glim-table" aria-label={label}>
      {columns.some((c) => c.label) && (
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={c.end ? "glim-table-end" : undefined}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((c) => (
              <td key={c.key} className={tableCellClass(c) || undefined}>
                {cell?.(row, c) ?? value(row, c)}
              </td>
            ))}
          </tr>
        ))}
        {more && (
          <tr>
            <td colSpan={columns.length} className="glim-table-muted">
              {more}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
