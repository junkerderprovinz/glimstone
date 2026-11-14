import { For, Show, type JSX } from "solid-js";
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
  cell?: (row: T, column: TableColumn) => JSX.Element;
}

export function Table<T extends object>(props: TableProps<T>) {
  const value = (row: T, column: TableColumn) => (row as Record<string, JSX.Element>)[column.key];
  return (
    <table data-glim="Table" class="glim-table" aria-label={props.label}>
      <Show when={props.columns.some((c) => c.label)}>
        <thead>
          <tr>
            <For each={props.columns}>
              {(c) => (
                <th scope="col" class={c.end ? "glim-table-end" : undefined}>
                  {c.label}
                </th>
              )}
            </For>
          </tr>
        </thead>
      </Show>
      <tbody>
        <For each={props.rows}>
          {(row) => (
            <tr>
              <For each={props.columns}>{(c) => <td class={tableCellClass(c) || undefined}>{props.cell?.(row, c) ?? value(row, c)}</td>}</For>
            </tr>
          )}
        </For>
        <Show when={props.more}>
          <tr>
            <td colspan={props.columns.length} class="glim-table-muted">
              {props.more}
            </td>
          </tr>
        </Show>
      </tbody>
    </table>
  );
}
