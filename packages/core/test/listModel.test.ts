import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ariaSort,
  filterRows,
  listView,
  nextSort,
  searchRows,
  selectByClick,
  selectByKey,
  sortRows,
  columnValues,
  listKey,
  type ListSelection,
} from '../src/listModel.ts';

const rows = [
  { name: 'nextcloud', size: 20, state: 'ok' },
  { name: 'Immich', size: 300, state: 'running' },
  { name: 'vaultwarden', size: 1, state: 'ok' },
  { name: 'adguard', size: 20, state: 'failed' },
];
const names = (list: { name: string }[]) => list.map((r) => r.name);
const none: ListSelection = { selected: [], anchor: null, focus: 0 };

test('a click on a new column sorts it ascending, the next click descending, and so on', () => {
  const asc = nextSort(null, 'name');
  assert.deepEqual(asc, { key: 'name', dir: 'asc' });
  assert.deepEqual(nextSort(asc, 'name'), { key: 'name', dir: 'desc' });
  assert.deepEqual(nextSort({ key: 'name', dir: 'desc' }, 'name'), { key: 'name', dir: 'asc' });
  assert.deepEqual(nextSort({ key: 'name', dir: 'desc' }, 'size'), { key: 'size', dir: 'asc' });
});

test('words sort as a person reads them, numbers by value, and ties keep their order', () => {
  assert.deepEqual(names(sortRows(rows, { key: 'name', dir: 'asc' })), ['adguard', 'Immich', 'nextcloud', 'vaultwarden']);
  assert.deepEqual(names(sortRows(rows, { key: 'size', dir: 'asc' })), ['vaultwarden', 'nextcloud', 'adguard', 'Immich']);
  assert.deepEqual(names(sortRows(rows, { key: 'size', dir: 'desc' })), ['Immich', 'nextcloud', 'adguard', 'vaultwarden']);
  assert.equal(sortRows(rows, null), rows);
});

test('only the sorted column says how it is sorted', () => {
  assert.equal(ariaSort({ key: 'name', dir: 'asc' }, 'name'), 'ascending');
  assert.equal(ariaSort({ key: 'name', dir: 'desc' }, 'name'), 'descending');
  assert.equal(ariaSort({ key: 'name', dir: 'asc' }, 'size'), undefined);
});

test('a filter keeps the rows whose value it holds, and an empty one keeps all', () => {
  assert.deepEqual(names(filterRows(rows, { state: ['ok'] })), ['nextcloud', 'vaultwarden']);
  assert.deepEqual(names(filterRows(rows, { state: [] })), names(rows));
});

test('search finds the words in any searched column, without regard to case', () => {
  assert.deepEqual(names(searchRows(rows, 'IM', ['name'])), ['Immich']);
  assert.deepEqual(names(searchRows(rows, '', ['name'])), names(rows));
});

test('a click selects that row alone, Ctrl adds or takes it away, Shift takes the range from the anchor', () => {
  let s = selectByClick(none, 1, {});
  assert.deepEqual(s, { selected: [1], anchor: 1, focus: 1 });
  s = selectByClick(s, 3, { toggle: true });
  assert.deepEqual(s.selected, [1, 3]);
  s = selectByClick(s, 1, { toggle: true });
  assert.deepEqual(s.selected, [3]);
  s = selectByClick({ selected: [1], anchor: 1, focus: 1 }, 3, { range: true });
  assert.deepEqual(s, { selected: [1, 2, 3], anchor: 1, focus: 3 });
});

test('the arrows move the focus, Shift with them extends from the anchor, Space toggles, Ctrl+A takes all', () => {
  let s = selectByKey({ selected: [0], anchor: 0, focus: 0 }, 'ArrowDown', {}, 4)!;
  assert.deepEqual(s, { selected: [0], anchor: 0, focus: 1 });
  s = selectByKey(s, 'ArrowDown', { range: true }, 4)!;
  assert.deepEqual(s.selected, [0, 1, 2]);
  s = selectByKey(s, ' ', {}, 4)!;
  assert.deepEqual(s.selected, [0, 1]);
  assert.equal(selectByKey(s, 'End', {}, 4)!.focus, 3);
  assert.equal(selectByKey(s, 'Home', {}, 4)!.focus, 0);
  assert.equal(selectByKey({ ...s, focus: 3 }, 'ArrowDown', {}, 4)!.focus, 3);
  assert.deepEqual(selectByKey(s, 'a', { toggle: true }, 4)!.selected, [0, 1, 2, 3]);
  assert.equal(selectByKey(s, 'x', {}, 4), null);
});

test('the view filters, searches and sorts in that order', () => {
  const view = listView(rows, { sort: { key: 'size', dir: 'desc' }, filters: { state: ['ok', 'failed'] }, query: 'a', search: ['name'] });
  assert.deepEqual(names(view), ['adguard', 'vaultwarden']);
});

test('on a focused row Enter opens it, a letter starts the search, Ctrl+F opens it empty, the rest selects', () => {
  const s: ListSelection = { selected: [], anchor: null, focus: 1 };
  assert.deepEqual(listKey(s, 'Enter', {}, 4), { open: 1 });
  assert.deepEqual(listKey(s, 'n', {}, 4), { search: 'n' });
  assert.deepEqual(listKey(s, 'f', { toggle: true }, 4), { search: '' });
  assert.deepEqual(listKey(s, 'ArrowDown', {}, 4), { select: { selected: [], anchor: null, focus: 2 } });
  assert.equal(listKey(s, 'Tab', {}, 4), null);
});

test('a column offers the values its rows hold, each once, in order', () => {
  assert.deepEqual(columnValues(rows, 'state'), ['failed', 'ok', 'running']);
});
