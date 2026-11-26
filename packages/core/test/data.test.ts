import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { listRowStatus } from '../src/listRow.ts';
import { TOAST_MARKS } from '../src/marks.ts';

const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** A selector list split at its top-level commas. */
function list(selector: string): string[] {
  const parts = [''];
  let depth = 0;
  for (const ch of selector) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) parts.push('');
    else parts[parts.length - 1] += ch;
  }
  return parts.map((s) => s.trim().replace(/\s+/g, ' '));
}

const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, s, body]) => ({ selectors: list(s!), body: body! }));

/** The value the last rule naming `selector` among its selectors gives `property`. */
function declared(selector: string, property: string): string {
  let found = '';
  for (const r of rules) {
    if (!r.selectors.includes(selector)) continue;
    const m = r.body.match(new RegExp(`(?<![\w-])${property}\s*:\s*([^;]+);`));
    if (m) found = m[1]!.trim();
  }
  return found;
}

test('a settled row shows a dot, a warning or a failure the mark of its state', () => {
  assert.deepEqual(listRowStatus('ok'), { mark: undefined });
  assert.deepEqual(listRowStatus('warn'), { mark: TOAST_MARKS.warn });
  assert.deepEqual(listRowStatus('fail'), { mark: TOAST_MARKS.fail });
});

test('a row keeps its figures in a column of fixed width at its end', () => {
  assert.equal(declared('.glim-list-row-value', 'width'), 'var(--list-value-w)');
  assert.equal(declared('.glim-list-row-value', 'text-align'), 'end');
  assert.equal(declared('.glim-list-row-value', 'flex'), 'none');
  assert.match(declared('.glim-list-row-value', 'font-variant-numeric'), /tabular-nums/);
});

test('a unit stands a step smaller and quieter than its figure, without a box', () => {
  assert.equal(declared(':is(.glim-list-row-value, .glim-pill.glim-num) small', 'font-size'), 'var(--text-meta)');
  assert.equal(declared(':is(.glim-list-row-value, .glim-pill.glim-num) small', 'color'), 'var(--carbon-text-muted)');
  assert.equal(declared('.glim-pill.glim-num', 'background'), 'none');
  assert.equal(declared('.glim-pill.glim-num', 'padding'), '0');
});

test('a status stands in neutral words beside a mark in the state colour', () => {
  assert.equal(declared('.glim-list-row-status', 'color'), 'var(--carbon-text-sub)');
  assert.equal(declared('.glim-list-row-status[data-tone="fail"] > .glim-status-mark', 'color'), 'var(--status-fail-solid)');
  assert.equal(declared('.glim-list-row-status[data-tone="warn"] > .glim-status-mark', 'color'), 'var(--status-warn-solid)');
  assert.equal(declared('.glim-status-dot', 'background-color'), 'var(--status-ok-solid)');
});

