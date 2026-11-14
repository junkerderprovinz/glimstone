import { createEffect, createMemo, createSignal, createUniqueId, For, on, Show, type JSX } from "solid-js";
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
  cell?: (row: T, column: ListColumn) => JSX.Element;
  /** Enter or a double click on a row: open its object. */
  onOpen?: (row: T) => void;
  /** The picked rows, in the list's order, after every change. */
  onSelect?: (rows: T[]) => void;
}

export function ListTable<T extends object>(props: ListTableProps<T>) {
  const [sort, setSort] = createSignal<ListSort | null>(null);
  const [filters, setFilters] = createSignal<ListFilters>({});
  const [query, setQuery] = createSignal<string | null>(null);
  const [picked, setPicked] = createSignal<{ keys: string[]; anchor: string | null; focus: string | null }>({ keys: [], anchor: null, focus: null });
  const [filterOpen, setFilterOpen] = createSignal<{ key: string; at: HTMLElement } | null>(null);
  const [moved, setMoved] = createSignal(0);
  let grid!: HTMLTableElement;
  let searchField: HTMLInputElement | undefined;
  const hintId = createUniqueId();

  const view = createMemo(() =>
    listView(props.rows, { sort: sort(), filters: filters(), query: query() ?? "", search: props.search ?? [props.columns[0]!.key] }),
  );
  const keys = createMemo(() => view().map(props.rowKey));
  const selection = createMemo((): ListSelection => {
    const at = (key: string | null) => (key === null ? -1 : keys().indexOf(key));
    const { keys: chosen, anchor, focus } = picked();
    return {
      selected: keys().flatMap((k, i) => (chosen.includes(k) ? [i] : [])),
      anchor: at(anchor) < 0 ? null : at(anchor),
      focus: Math.max(0, at(focus)),
    };
  });

  function apply(next: ListSelection) {
    const k = keys();
    setPicked({ keys: next.selected.map((i) => k[i]!), anchor: next.anchor === null ? null : k[next.anchor]!, focus: k[next.focus] ?? null });
    setMoved((n) => n + 1);
    props.onSelect?.(next.selected.map((i) => view()[i]!));
  }

  createEffect(
    on(
      moved,
      () => grid.querySelector<HTMLElement>(`tbody tr:nth-child(${selection().focus + 1}) > td`)?.focus(),
      { defer: true },
    ),
  );

  createEffect(
    on(
      () => query() !== null,
      (searching) => searching && searchField?.focus(),
    ),
  );

  function onKey(e: KeyboardEvent) {
    const action = listKey(selection(), e.key, { toggle: e.ctrlKey || e.metaKey, range: e.shiftKey }, view().length);
    if (!action || e.altKey) return;
    e.preventDefault();
    if ("open" in action) props.onOpen?.(view()[action.open]!);
    else if ("search" in action) setQuery((q) => (q ?? "") + action.search);
    else apply(action.select);
  }

  function onRowClick(e: MouseEvent, i: number) {
    apply(selectByClick(selection(), i, { toggle: e.ctrlKey || e.metaKey, range: e.shiftKey }));
  }

  function closeSearch() {
    setQuery(null);
    setMoved((n) => n + 1);
  }

  const open = () => {
    const f = filterOpen();
    return f && props.columns.find((c) => c.key === f.key);
  };
  const kept = (key: string) => filters()[key] ?? [];
  const flip = (key: string, value: string) =>
    setFilters((f) => {
      const now = f[key] ?? [];
      return { ...f, [key]: now.includes(value) ? now.filter((v) => v !== value) : [...now, value] };
    });

  return (
    <div data-glim="ListTable" class="glim-list">
      <Show when={query() !== null}>
        <input
          ref={searchField}
          class="glim-input glim-list-search"
          type="search"
          aria-label={props.text.search}
          value={query() ?? ""}
          onInput={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              closeSearch();
            }
          }}
        />
      </Show>
      <table ref={grid} role="grid" aria-label={props.label} aria-multiselectable="true" aria-describedby={hintId} class="glim-list-table">
        <thead>
          <tr>
            <For each={props.columns}>
              {(c) => (
                <th scope="col" aria-sort={ariaSort(sort(), c.key)} class={c.end ? "glim-list-th glim-table-end" : "glim-list-th"}>
                  <span class="glim-list-th-box">
                    <button type="button" class="glim-list-sort" onClick={() => setSort((s) => nextSort(s, c.key))}>
                      {c.label}
                      <Show when={sort()?.key === c.key}>
                        <MarkSvg mark={MARKS.expand} class={`glim-list-sort-mark glim-list-sort-mark--${sort()!.dir}`} />
                      </Show>
                    </button>
                    <Show when={c.filter}>
                      <button
                        type="button"
                        aria-label={props.text.filterOf(c.label)}
                        aria-haspopup="dialog"
                        aria-expanded={filterOpen()?.key === c.key}
                        aria-pressed={kept(c.key).length > 0}
                        class="glim-list-filter"
                        onClick={(e) => setFilterOpen(filterOpen()?.key === c.key ? null : { key: c.key, at: e.currentTarget })}
                      >
                        <MarkSvg mark={MARKS.expand} />
                      </button>
                    </Show>
                  </span>
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody onKeyDown={onKey}>
          <For each={view()}>
            {(row, i) => (
              <tr aria-selected={selection().selected.includes(i())} class="glim-list-tr" onClick={(e) => onRowClick(e, i())} onDblClick={() => props.onOpen?.(row)}>
                <For each={props.columns}>
                  {(c, ci) => (
                    <td tabindex={ci() === 0 ? (i() === selection().focus ? 0 : -1) : undefined} class={tableCellClass(c) || undefined}>
                      {props.cell?.(row, c) ?? String((row as Record<string, unknown>)[c.key] ?? "")}
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
      <Show when={view().length === 0}>
        <p class="glim-list-empty">{props.text.noMatch}</p>
      </Show>
      <p id={hintId} class="glim-list-hint">
        {props.text.hint}
      </p>
      <Show when={open()}>
        {(column) => (
          <Popover open anchor={filterOpen()!.at} label={props.text.filterOf(column().label)} onClose={() => setFilterOpen(null)}>
            <div class="glim-list-filter-values">
              <For each={columnValues(props.rows, column().key)}>
                {(v) => <Checkbox label={v} checked={kept(column().key).includes(v)} onChange={() => flip(column().key, v)} />}
              </For>
            </div>
          </Popover>
        )}
      </Show>
    </div>
  );
}
