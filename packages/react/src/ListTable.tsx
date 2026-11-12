import { useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import {
  ariaSort,
  columnValues,
  listKey,
  listView,
  MARKS,
  nextSort,
  selectByClick,
  tableCellClass,
  type ListColumn,
  type ListFilters,
  type ListSelection,
  type ListSort,
  type ListTableText,
} from "@glimstone/core";
import { Checkbox } from "./Checkbox.tsx";
import { MarkSvg } from "./glyphs.tsx";
import { Popover } from "./Popover.tsx";

// The list of a list page (design-language.md, "Lists"): a click on a column
// header sorts, the ▾ beside it filters, typing floats a search inside the list,
// and rows are picked the way a file manager picks them. It is an APG grid with
// row selection; the rules live in listModel.ts in the core.

export type { ListColumn, ListTableText } from "@glimstone/core";

export interface ListTableProps<T extends object> {
  /** The list's accessible name. */
  label: string;
  columns: readonly ListColumn[];
  rows: readonly T[];
  /** A key that stays with a row through sorting and filtering. */
  rowKey: (row: T) => string;
  /** The columns the search looks in; the first column by default. */
  search?: readonly string[];
  text: ListTableText;
  /** Draws a cell of its own. Nothing returned shows the value. */
  cell?: (row: T, column: ListColumn) => ReactNode;
  /** Enter or a double click on a row: open its object. */
  onOpen?: (row: T) => void;
  /** The picked rows, in the list's order, after every change. */
  onSelect?: (rows: T[]) => void;
}

export function ListTable<T extends object>({ label, columns, rows, rowKey, search, text, cell, onOpen, onSelect }: ListTableProps<T>) {
  const [sort, setSort] = useState<ListSort | null>(null);
  const [filters, setFilters] = useState<ListFilters>({});
  const [query, setQuery] = useState<string | null>(null);
  const [picked, setPicked] = useState<{ keys: string[]; anchor: string | null; focus: string | null }>({ keys: [], anchor: null, focus: null });
  const [filterOpen, setFilterOpen] = useState<{ key: string; at: HTMLElement } | null>(null);
  const grid = useRef<HTMLTableElement>(null);
  const searchField = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const moved = useRef(false);

  const searched = search ?? [columns[0]!.key];
  const view = useMemo(() => listView(rows, { sort, filters, query: query ?? "", search: searched }), [rows, sort, filters, query, searched.join()]);
  const keys = view.map(rowKey);
  const at = (key: string | null) => (key === null ? -1 : keys.indexOf(key));
  const selection: ListSelection = {
    selected: keys.flatMap((k, i) => (picked.keys.includes(k) ? [i] : [])),
    anchor: at(picked.anchor) < 0 ? null : at(picked.anchor),
    focus: Math.max(0, at(picked.focus)),
  };

  function apply(next: ListSelection) {
    const chosen = next.selected.map((i) => keys[i]!);
    setPicked({ keys: chosen, anchor: next.anchor === null ? null : keys[next.anchor]!, focus: keys[next.focus] ?? null });
    moved.current = true;
    onSelect?.(next.selected.map((i) => view[i]!));
  }

  useLayoutEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    grid.current?.querySelector<HTMLElement>(`tbody tr:nth-child(${selection.focus + 1}) > td`)?.focus();
  });

  useLayoutEffect(() => {
    if (query !== null) searchField.current?.focus();
  }, [query !== null]);

  function onKey(e: KeyboardEvent<HTMLTableSectionElement>) {
    const action = listKey(selection, e.key, { toggle: e.ctrlKey || e.metaKey, range: e.shiftKey }, view.length);
    if (!action || e.altKey) return;
    e.preventDefault();
    if ("open" in action) onOpen?.(view[action.open]!);
    else if ("search" in action) setQuery((q) => (q ?? "") + action.search);
    else apply(action.select);
  }

  function onRowClick(e: MouseEvent, i: number) {
    apply(selectByClick(selection, i, { toggle: e.ctrlKey || e.metaKey, range: e.shiftKey }));
  }

  function closeSearch() {
    setQuery(null);
    moved.current = true;
  }

  const open = filterOpen && columns.find((c) => c.key === filterOpen.key);
  const kept = (key: string) => filters[key] ?? [];
  const flip = (key: string, value: string) =>
    setFilters((f) => {
      const now = f[key] ?? [];
      return { ...f, [key]: now.includes(value) ? now.filter((v) => v !== value) : [...now, value] };
    });

  return (
    <div data-glim="ListTable" className="glim-list">
      {query !== null && (
        <input
          ref={searchField}
          className="glim-input glim-list-search"
          type="search"
          aria-label={text.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              closeSearch();
            }
          }}
        />
      )}
      <table ref={grid} role="grid" aria-label={label} aria-multiselectable="true" aria-describedby={hintId} className="glim-list-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" aria-sort={ariaSort(sort, c.key)} className={c.end ? "glim-list-th glim-table-end" : "glim-list-th"}>
                <span className="glim-list-th-box">
                  <button type="button" className="glim-list-sort" onClick={() => setSort((s) => nextSort(s, c.key))}>
                    {c.label}
                    {sort?.key === c.key && <MarkSvg mark={MARKS.expand} className={`glim-list-sort-mark glim-list-sort-mark--${sort.dir}`} />}
                  </button>
                  {c.filter && (
                    <button
                      type="button"
                      aria-label={text.filterOf(c.label)}
                      aria-haspopup="dialog"
                      aria-expanded={filterOpen?.key === c.key}
                      aria-pressed={kept(c.key).length > 0}
                      className="glim-list-filter"
                      onClick={(e) => setFilterOpen(filterOpen?.key === c.key ? null : { key: c.key, at: e.currentTarget })}
                    >
                      <MarkSvg mark={MARKS.expand} />
                    </button>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody onKeyDown={onKey}>
          {view.map((row, i) => (
            <tr
              key={keys[i]}
              aria-selected={selection.selected.includes(i)}
              className="glim-list-tr"
              onClick={(e) => onRowClick(e, i)}
              onDoubleClick={() => onOpen?.(row)}
            >
              {columns.map((c, ci) => (
                <td key={c.key} tabIndex={ci === 0 ? (i === selection.focus ? 0 : -1) : undefined} className={tableCellClass(c) || undefined}>
                  {cell?.(row, c) ?? String((row as Record<string, unknown>)[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {view.length === 0 && <p className="glim-list-empty">{text.noMatch}</p>}
      <p id={hintId} className="glim-list-hint">
        {text.hint}
      </p>
      {open && (
        <Popover open anchor={filterOpen.at} label={text.filterOf(open.label)} onClose={() => setFilterOpen(null)}>
          <div className="glim-list-filter-values">
            {columnValues(rows, open.key).map((v) => (
              <Checkbox key={v} label={v} checked={kept(open.key).includes(v)} onChange={() => flip(open.key, v)} />
            ))}
          </div>
        </Popover>
      )}
    </div>
  );
}
