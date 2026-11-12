<script setup lang="ts" generic="T extends object">
import { computed, nextTick, ref, useId } from "vue";
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
import Checkbox from "./Checkbox.vue";
import { MarkSvg } from "./glyphs";
import Popover from "./Popover.vue";

// The list of a list page (design-language.md, "Lists"): a click on a column
// header sorts, the ▾ beside it filters, typing floats a search inside the list,
// and rows are picked the way a file manager picks them. It is an APG grid with
// row selection; the rules live in listModel.ts in the core. The `cell` slot
// draws a cell of its own, with `row` and `column`.
const props = defineProps<{
  /** The list's accessible name. */
  label: string;
  columns: readonly ListColumn[];
  rows: readonly T[];
  /** A key that stays with a row through sorting and filtering. */
  rowKey: (row: T) => string;
  /** The columns the search looks in; the first column by default. */
  search?: readonly string[];
  text: ListTableText;
}>();
const emit = defineEmits<{ open: [row: T]; select: [rows: T[]] }>();

const sort = ref<ListSort | null>(null);
const filters = ref<ListFilters>({});
const query = ref<string | null>(null);
const picked = ref<{ keys: string[]; anchor: string | null; focus: string | null }>({ keys: [], anchor: null, focus: null });
const filterOpen = ref<{ key: string; at: HTMLElement } | null>(null);
const grid = ref<HTMLTableElement | null>(null);
const searchField = ref<HTMLInputElement | null>(null);
const hintId = useId();

const view = computed(() =>
  listView(props.rows, { sort: sort.value, filters: filters.value, query: query.value ?? "", search: props.search ?? [props.columns[0]!.key] }),
);
const keys = computed(() => view.value.map(props.rowKey));
const selection = computed<ListSelection>(() => {
  const at = (key: string | null) => (key === null ? -1 : keys.value.indexOf(key));
  return {
    selected: keys.value.flatMap((k, i) => (picked.value.keys.includes(k) ? [i] : [])),
    anchor: at(picked.value.anchor) < 0 ? null : at(picked.value.anchor),
    focus: Math.max(0, at(picked.value.focus)),
  };
});

function focusRow() {
  nextTick(() => grid.value?.querySelector<HTMLElement>(`tbody tr:nth-child(${selection.value.focus + 1}) > td`)?.focus());
}

function apply(next: ListSelection) {
  const k = keys.value;
  picked.value = { keys: next.selected.map((i) => k[i]!), anchor: next.anchor === null ? null : k[next.anchor]!, focus: k[next.focus] ?? null };
  emit("select", next.selected.map((i) => view.value[i]!));
  focusRow();
}

function onKey(e: KeyboardEvent) {
  const action = listKey(selection.value, e.key, { toggle: e.ctrlKey || e.metaKey, range: e.shiftKey }, view.value.length);
  if (!action || e.altKey) return;
  e.preventDefault();
  if ("open" in action) emit("open", view.value[action.open]!);
  else if ("search" in action) {
    query.value = (query.value ?? "") + action.search;
    nextTick(() => searchField.value?.focus());
  } else apply(action.select);
}

function onRowClick(e: MouseEvent, i: number) {
  apply(selectByClick(selection.value, i, { toggle: e.ctrlKey || e.metaKey, range: e.shiftKey }));
}

function closeSearch() {
  query.value = null;
  focusRow();
}

const open = computed(() => filterOpen.value && props.columns.find((c) => c.key === filterOpen.value!.key));
const kept = (key: string) => filters.value[key] ?? [];
function flip(key: string, value: string) {
  const now = kept(key);
  filters.value = { ...filters.value, [key]: now.includes(value) ? now.filter((v) => v !== value) : [...now, value] };
}
function toggleFilter(key: string, at: HTMLElement) {
  filterOpen.value = filterOpen.value?.key === key ? null : { key, at };
}
const value = (row: T, key: string) => String((row as Record<string, unknown>)[key] ?? "");
</script>

<template>
  <div data-glim="ListTable" class="glim-list">
    <input
      v-if="query !== null"
      ref="searchField"
      v-model="query"
      class="glim-input glim-list-search"
      type="search"
      :aria-label="text.search"
      @keydown.esc.prevent.stop="closeSearch"
    />
    <table ref="grid" role="grid" :aria-label="label" aria-multiselectable="true" :aria-describedby="hintId" class="glim-list-table">
      <thead>
        <tr>
          <th v-for="c in columns" :key="c.key" scope="col" :aria-sort="ariaSort(sort, c.key)" :class="c.end ? 'glim-list-th glim-table-end' : 'glim-list-th'">
            <span class="glim-list-th-box">
              <button type="button" class="glim-list-sort" @click="sort = nextSort(sort, c.key)">
                {{ c.label }}
                <MarkSvg v-if="sort?.key === c.key" :mark="MARKS.expand" :class="`glim-list-sort-mark glim-list-sort-mark--${sort.dir}`" />
              </button>
              <button
                v-if="c.filter"
                type="button"
                :aria-label="text.filterOf(c.label)"
                aria-haspopup="dialog"
                :aria-expanded="filterOpen?.key === c.key"
                :aria-pressed="kept(c.key).length > 0"
                class="glim-list-filter"
                @click="toggleFilter(c.key, $event.currentTarget as HTMLElement)"
              >
                <MarkSvg :mark="MARKS.expand" />
              </button>
            </span>
          </th>
        </tr>
      </thead>
      <tbody @keydown="onKey">
        <tr
          v-for="(row, i) in view"
          :key="keys[i]"
          :aria-selected="selection.selected.includes(i)"
          class="glim-list-tr"
          @click="onRowClick($event, i)"
          @dblclick="emit('open', row)"
        >
          <td v-for="(c, ci) in columns" :key="c.key" :tabindex="ci === 0 ? (i === selection.focus ? 0 : -1) : undefined" :class="tableCellClass(c) || undefined">
            <slot name="cell" :row="row" :column="c">{{ value(row, c.key) }}</slot>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="view.length === 0" class="glim-list-empty">{{ text.noMatch }}</p>
    <p :id="hintId" class="glim-list-hint">{{ text.hint }}</p>
    <Popover v-if="open" :open="true" :anchor="filterOpen!.at" :label="text.filterOf(open.label)" @close="filterOpen = null">
      <div class="glim-list-filter-values">
        <Checkbox v-for="v in columnValues(rows, open.key)" :key="v" :label="v" :model-value="kept(open.key).includes(v)" @update:model-value="flip(open.key, v)" />
      </div>
    </Popover>
  </div>
</template>
