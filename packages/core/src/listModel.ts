// The model behind a ListTable, the one form every list page shares
// (design-language.md, "Lists"): sorting by a click on a column header, a
// filter per column, a search that floats in the list, and rows picked the way
// a file manager picks them. Plain functions over rows and indices, so the
// rules are tested without a DOM.

import type { TableColumn } from "./table.ts";

export interface ListColumn extends TableColumn {
  /** The column's heading; a list column always has one. */
  label: string;
  /** A ▾ in the header filters the rows by this column's values. */
  filter?: boolean;
}

/** The words a list needs from the app. */
export interface ListTableText {
  /** The floating search field's name. */
  search: string;
  /** The line under the header while the pointer is on it. */
  hint: string;
  /** What shows when filter or search leave no row. */
  noMatch: string;
  /** The name of a column's filter, such as "Filter State". */
  filterOf: (column: string) => string;
}

export type SortDir = "asc" | "desc";

export interface ListSort {
  key: string;
  dir: SortDir;
}

/** The values each filtered column keeps, by column key. An empty list keeps every row. */
export type ListFilters = Record<string, readonly string[]>;

/** A click on a column header: a new column sorts ascending, the same one turns around. */
export function nextSort(current: ListSort | null, key: string): ListSort {
  return current?.key === key && current.dir === "asc" ? { key, dir: "desc" } : { key, dir: "asc" };
}

/** The value of aria-sort for a column header. Only the sorted column carries one. */
export function ariaSort(sort: ListSort | null, key: string): "ascending" | "descending" | undefined {
  if (sort?.key !== key) return undefined;
  return sort.dir === "asc" ? "ascending" : "descending";
}

const words = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

function compare(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return words.compare(String(a ?? ""), String(b ?? ""));
}

const field = (row: object, key: string) => (row as Record<string, unknown>)[key];

/** The rows in the column's order. Ties keep the order they came in. */
export function sortRows<T extends object>(rows: readonly T[], sort: ListSort | null): readonly T[] {
  if (!sort) return rows;
  const sign = sort.dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => sign * compare(field(a, sort.key), field(b, sort.key)));
}

export function filterRows<T extends object>(rows: readonly T[], filters: ListFilters): readonly T[] {
  const active = Object.entries(filters).filter(([, keep]) => keep.length > 0);
  if (active.length === 0) return rows;
  return rows.filter((row) => active.every(([key, keep]) => keep.includes(String(field(row, key)))));
}

/** The rows that hold the query in one of the searched columns, without regard to case. */
export function searchRows<T extends object>(rows: readonly T[], query: string, keys: readonly string[]): readonly T[] {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return rows;
  return rows.filter((row) => keys.some((key) => String(field(row, key) ?? "").toLocaleLowerCase().includes(q)));
}

/** What a list shows: filtered, then searched, then sorted. */
export function listView<T extends object>(
  rows: readonly T[],
  state: { sort: ListSort | null; filters: ListFilters; query: string; search: readonly string[] },
): readonly T[] {
  return sortRows(searchRows(filterRows(rows, state.filters), state.query, state.search), state.sort);
}

/** The picked rows by their place in the view, the row a Shift range starts
 *  from, and the row that has the focus. */
export interface ListSelection {
  selected: readonly number[];
  anchor: number | null;
  focus: number;
}

/** `toggle` is Ctrl, or Cmd on a Mac; `range` is Shift. */
export interface SelectMods {
  toggle?: boolean;
  range?: boolean;
}

function span(from: number, to: number): number[] {
  const [lo, hi] = from <= to ? [from, to] : [to, from];
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
}

function flip(selected: readonly number[], at: number): number[] {
  return selected.includes(at) ? selected.filter((i) => i !== at) : [...selected, at].sort((a, b) => a - b);
}

/** A click on a row, as in a file manager. */
export function selectByClick(s: ListSelection, at: number, mods: SelectMods): ListSelection {
  if (mods.range) return { selected: span(s.anchor ?? at, at), anchor: s.anchor ?? at, focus: at };
  if (mods.toggle) return { selected: flip(s.selected, at), anchor: at, focus: at };
  return { selected: [at], anchor: at, focus: at };
}

/**
 * A key on a focused row. The arrows, Home and End move the focus and, with
 * Shift, pick the range from the anchor; Space picks or drops the focused row;
 * Ctrl+A picks all. Any other key is not the list's, and gives null.
 */
export function selectByKey(s: ListSelection, key: string, mods: SelectMods, count: number): ListSelection | null {
  if (count === 0) return null;
  const last = count - 1;
  const moveTo = (at: number): ListSelection => {
    const focus = Math.max(0, Math.min(last, at));
    return mods.range ? { selected: span(s.anchor ?? s.focus, focus), anchor: s.anchor ?? s.focus, focus } : { ...s, focus };
  };
  switch (key) {
    case "ArrowDown":
      return moveTo(s.focus + 1);
    case "ArrowUp":
      return moveTo(s.focus - 1);
    case "Home":
      return moveTo(0);
    case "End":
      return moveTo(last);
    case " ":
      return { selected: flip(s.selected, s.focus), anchor: s.focus, focus: s.focus };
    case "a":
    case "A":
      return mods.toggle ? { ...s, selected: span(0, last) } : null;
    default:
      return null;
  }
}

/** The values a column's filter offers: each value its rows hold, once, in order. */
export function columnValues<T extends object>(rows: readonly T[], key: string): string[] {
  return [...new Set(rows.map((row) => String(field(row, key))))].sort(words.compare);
}

/** What a key on a focused row asks for: open the row, start the search with a
 *  letter, or move and pick. */
export type ListKeyAction = { open: number } | { search: string } | { select: ListSelection };

/**
 * Routes a key on a focused row. Enter opens it, a letter starts the floating
 * search with that letter, Ctrl+F opens it empty, and the selection keys go to
 * selectByKey. Anything else is not the list's and gives null.
 */
export function listKey(s: ListSelection, key: string, mods: SelectMods, count: number): ListKeyAction | null {
  if (key === "Enter") return count > 0 ? { open: s.focus } : null;
  if (mods.toggle && (key === "f" || key === "F")) return { search: "" };
  if (!mods.toggle && key.length === 1 && key !== " ") return { search: key };
  const select = selectByKey(s, key, mods, count);
  return select && { select };
}
