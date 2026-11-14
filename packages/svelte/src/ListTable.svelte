<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { ListColumn, ListTableText } from "@glimstone/core";

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
    /** Draws every cell, handed the row, the column and the value as text; without it a cell shows the value. */
    cell?: Snippet<[T, ListColumn, string]>;
    /** Enter or a double click on a row: open its object. */
    onOpen?: (row: T) => void;
    /** The picked rows, in the list's order, after every change. */
    onSelect?: (rows: T[]) => void;
  }
</script>

<script lang="ts" generics="T extends object">
  import { tick } from "svelte";
  import {
    ariaSort,
    columnValues,
    listKey,
    listView,
    MARKS,
    nextSort,
    selectByClick,
    tableCellClass,
    type ListFilters,
    type ListSelection,
    type ListSort,
  } from "@glimstone/core";
  import Checkbox from "./Checkbox.svelte";
  import MarkSvg from "./MarkSvg.svelte";
  import Popover from "./Popover.svelte";

  // The list of a list page (design-language.md, "Lists"): a click on a column
  // header sorts, the ▾ beside it filters, typing floats a search inside the list,
  // and rows are picked the way a file manager picks them. It is an APG grid with
  // row selection; the rules live in listModel.ts in the core.
  let { label, columns, rows, rowKey, search, text, cell, onOpen, onSelect }: ListTableProps<T> = $props();

  let sort = $state<ListSort | null>(null);
  let filters = $state<ListFilters>({});
  let query = $state<string | null>(null);
  let picked = $state<{ keys: string[]; anchor: string | null; focus: string | null }>({ keys: [], anchor: null, focus: null });
  let filterOpen = $state<{ key: string; at: HTMLElement } | null>(null);
  let grid: HTMLTableElement;
  let searchField = $state<HTMLInputElement | null>(null);
  const hintId = $props.id();

  const view = $derived(listView(rows, { sort, filters, query: query ?? "", search: search ?? [columns[0]!.key] }));
  const keys = $derived(view.map(rowKey));
  const selection = $derived.by((): ListSelection => {
    const at = (key: string | null) => (key === null ? -1 : keys.indexOf(key));
    return {
      selected: keys.flatMap((k, i) => (picked.keys.includes(k) ? [i] : [])),
      anchor: at(picked.anchor) < 0 ? null : at(picked.anchor),
      focus: Math.max(0, at(picked.focus)),
    };
  });

  // The focus follows the rows once they are drawn.
  async function focusRow() {
    await tick();
    grid.querySelector<HTMLElement>(`tbody tr:nth-child(${selection.focus + 1}) > td`)?.focus();
  }

  function apply(next: ListSelection) {
    picked = { keys: next.selected.map((i) => keys[i]!), anchor: next.anchor === null ? null : keys[next.anchor]!, focus: keys[next.focus] ?? null };
    focusRow();
    onSelect?.(next.selected.map((i) => view[i]!));
  }

  $effect(() => {
    searchField?.focus();
  });

  function onKey(e: KeyboardEvent) {
    const action = listKey(selection, e.key, { toggle: e.ctrlKey || e.metaKey, range: e.shiftKey }, view.length);
    if (!action || e.altKey) return;
    e.preventDefault();
    if ("open" in action) onOpen?.(view[action.open]!);
    else if ("search" in action) query = (query ?? "") + action.search;
    else apply(action.select);
  }

  function onRowClick(e: MouseEvent, i: number) {
    apply(selectByClick(selection, i, { toggle: e.ctrlKey || e.metaKey, range: e.shiftKey }));
  }

  function closeSearch() {
    query = null;
    focusRow();
  }

  const open = $derived(filterOpen && columns.find((c) => c.key === filterOpen!.key));
  const kept = (key: string) => filters[key] ?? [];
  function flip(key: string, value: string) {
    const now = filters[key] ?? [];
    filters = { ...filters, [key]: now.includes(value) ? now.filter((v) => v !== value) : [...now, value] };
  }
  const shown = (row: T, c: ListColumn) => String((row as Record<string, unknown>)[c.key] ?? "");
</script>

<div data-glim="ListTable" class="glim-list">
  {#if query !== null}
    <input
      bind:this={searchField}
      class="glim-input glim-list-search"
      type="search"
      aria-label={text.search}
      bind:value={query}
      onkeydown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          closeSearch();
        }
      }}
    />
  {/if}
  <table bind:this={grid} role="grid" aria-label={label} aria-multiselectable="true" aria-describedby={hintId} class="glim-list-table">
    <thead>
      <tr>
        {#each columns as c (c.key)}
          <th scope="col" aria-sort={ariaSort(sort, c.key)} class={c.end ? "glim-list-th glim-table-end" : "glim-list-th"}>
            <span class="glim-list-th-box">
              <button type="button" class="glim-list-sort" onclick={() => (sort = nextSort(sort, c.key))}>
                {c.label}
                {#if sort?.key === c.key}<MarkSvg mark={MARKS.expand} class={`glim-list-sort-mark glim-list-sort-mark--${sort.dir}`} />{/if}
              </button>
              {#if c.filter}
                <button
                  type="button"
                  aria-label={text.filterOf(c.label)}
                  aria-haspopup="dialog"
                  aria-expanded={filterOpen?.key === c.key}
                  aria-pressed={kept(c.key).length > 0}
                  class="glim-list-filter"
                  onclick={(e) => (filterOpen = filterOpen?.key === c.key ? null : { key: c.key, at: e.currentTarget })}
                >
                  <MarkSvg mark={MARKS.expand} />
                </button>
              {/if}
            </span>
          </th>
        {/each}
      </tr>
    </thead>
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <tbody onkeydown={onKey}>
      {#each view as row, i (rowKey(row))}
        <tr aria-selected={selection.selected.includes(i)} class="glim-list-tr" onclick={(e) => onRowClick(e, i)} ondblclick={() => onOpen?.(row)}>
          {#each columns as c, ci (c.key)}
            <td tabindex={ci === 0 ? (i === selection.focus ? 0 : -1) : undefined} class={tableCellClass(c) || undefined}>
              {#if cell}{@render cell(row, c, shown(row, c))}{:else}{shown(row, c)}{/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
  {#if view.length === 0}<p class="glim-list-empty">{text.noMatch}</p>{/if}
  <p id={hintId} class="glim-list-hint">{text.hint}</p>
  {#if open && filterOpen}
    <Popover open anchor={filterOpen.at} label={text.filterOf(open.label)} onClose={() => (filterOpen = null)}>
      <div class="glim-list-filter-values">
        {#each columnValues(rows, open.key) as v (v)}
          <Checkbox label={v} checked={kept(open.key).includes(v)} onChange={() => flip(open.key, v)} />
        {/each}
      </div>
    </Popover>
  {/if}
</div>
