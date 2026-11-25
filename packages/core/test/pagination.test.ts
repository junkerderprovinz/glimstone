import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAGINATION_TEXT, paginationText, watchPaginationFit } from '../src/pagination.ts';
import { en } from '../src/componentLocales/en.ts';

const SHORT_ROW = 120;

/** A nav whose row is `row` wide in full and SHORT_ROW wide in its short form, in a box `box` wide. */
function fakeNav(row: number, box: number) {
  const attrs = new Set<string>();
  const resized: (() => void)[] = [];
  const changed: (() => void)[] = [];
  Object.assign(globalThis, {
    ResizeObserver: class {
      constructor(fn: () => void) { resized.push(fn); }
      observe() {}
      disconnect() { resized.length = 0; }
    },
    MutationObserver: class {
      constructor(fn: () => void) { changed.push(fn); }
      observe() {}
      disconnect() { changed.length = 0; }
    },
  });
  const nav = {
    ownerDocument: {},
    get clientWidth() { return box; },
    get scrollWidth() { return Math.max(box, attrs.has('data-short') ? SHORT_ROW : row); },
    hasAttribute: (name: string) => attrs.has(name),
    setAttribute: (name: string) => void attrs.add(name),
    removeAttribute: (name: string) => void attrs.delete(name),
    toggleAttribute: (name: string, on: boolean) => void (on ? attrs.add(name) : attrs.delete(name)),
  };
  return {
    nav: nav as unknown as HTMLElement,
    short: () => attrs.has('data-short'),
    resize(width: number) { box = width; resized.forEach((fn) => fn()); },
    grow(width: number) { row = width; changed.forEach((fn) => fn()); },
    watched: () => resized.length + changed.length,
  };
}

test('a row that fits its box keeps every page', () => {
  const p = fakeNav(560, 600);
  watchPaginationFit(p.nav);
  assert.equal(p.short(), false);
});

test('a row wider than its box turns short at once', () => {
  const p = fakeNav(560, 399);
  watchPaginationFit(p.nav);
  assert.equal(p.short(), true);
});

test('a short row gets its pages back once the box has room again', () => {
  const p = fakeNav(560, 399);
  watchPaginationFit(p.nav);
  p.resize(640);
  assert.equal(p.short(), false);
  p.resize(320);
  assert.equal(p.short(), true);
});

test('a row that grows past its box, as a longer page number does, turns short', () => {
  const p = fakeNav(380, 399);
  watchPaginationFit(p.nav);
  assert.equal(p.short(), false);
  p.grow(420);
  assert.equal(p.short(), true);
});

test('the teardown stops the watching', () => {
  const p = fakeNav(560, 399);
  watchPaginationFit(p.nav)();
  assert.equal(p.watched(), 0);
});

test('the short form counts the page in force and the pages in the language\'s digits', () => {
  assert.equal(PAGINATION_TEXT.status(3, 20), '3 / 20');
  assert.equal(paginationText(en.pagination, 'ar-EG').status(3, 20), '٣ / ٢٠');
});
