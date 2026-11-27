import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { listRowStatus } from '../src/listRow.ts';
import { TOAST_MARKS } from '../src/marks.ts';
import { meterFigure } from '../src/meter.ts';
import { skeletonRowView } from '../src/busy.ts';

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
  assert.equal(declared(':is(.glim-list-row-value, .glim-pill.glim-num) small', 'color'), 'var(--stone-text-muted)');
  assert.equal(declared('.glim-pill.glim-num', 'background'), 'none');
  assert.equal(declared('.glim-pill.glim-num', 'padding'), '0');
});

test('a status stands in neutral words beside a mark in the state colour', () => {
  assert.equal(declared('.glim-list-row-status', 'color'), 'var(--stone-text-sub)');
  assert.equal(declared('.glim-list-row-status[data-tone="fail"] > .glim-status-mark', 'color'), 'var(--status-fail-solid)');
  assert.equal(declared('.glim-list-row-status[data-tone="warn"] > .glim-status-mark', 'color'), 'var(--status-warn-solid)');
  assert.equal(declared('.glim-status-dot', 'background-color'), 'var(--status-ok-solid)');
});

test('a meter says its level: the app\'s words, else the percentage, nothing while it reads', () => {
  assert.equal(meterFigure(null), '');
  assert.equal(meterFigure(42, '1.4 / 2 TB'), '1.4 / 2 TB');
  assert.equal(meterFigure(42), new Intl.NumberFormat(undefined, { style: 'percent' }).format(0.42));
});

test('an avatar wears a soft wash of its tone with the initials in the same tone', () => {
  assert.equal(declared('.glim-avatar--toned', 'background-color'), 'color-mix(in oklab, var(--avatar-tone) 18%, var(--stone-surface))');
  assert.match(declared('.glim-avatar--toned', 'color'), /oklch\(from var\(--avatar-tone\)/);
});

test('every font size in the stylesheet is a step of the type scale', () => {
  const off = [...css.matchAll(/font-size:\s*([^;]+);/g)].map((m) => m[1]!.trim()).filter((v) => !/^(var\(--text-[a-z]+\)|inherit|0)$/.test(v));
  assert.deepEqual(off, []);
});

test('a card speaks in one row style: the name 14/500 and what explains it 13px under it', () => {
  assert.equal(declared('.glim-version-part', 'font-size'), 'var(--text-body)');
  assert.equal(declared('.glim-version-part', 'font-weight'), 'var(--font-weight-medium)');
  assert.equal(declared('.glim-version-app', 'font-weight'), 'var(--font-weight-medium)');
  assert.equal(declared('.glim-list-row-meta', 'font-size'), 'var(--text-subline)');
});

test('an update waiting is news, not a fault: its line stays neutral', () => {
  assert.equal(declared('.glim-version-state[data-tone="warn"] .glim-version-line', 'color'), 'var(--stone-text-sub)');
});

test('a skeleton row takes the real row\'s measures: the glyph inside the tile, bars at cap height, room for the value and the buttons', () => {
  const view = skeletonRowView({ value: true, actions: 2 });
  assert.equal(view.value, true);
  assert.equal(view.style?.['--skeleton-actions'], '2');
  assert.equal(skeletonRowView({}).value, false);
  assert.equal(declared('.glim-skeleton-tile', 'padding'), 'var(--space-3)');
  assert.equal(declared(':is(.glim-skeleton-name, .glim-skeleton-value)', 'height'), '11px');
  assert.equal(declared('.glim-skeleton-badge', 'height'), '1.25rem');
  assert.match(declared('.glim-skeleton-actions', 'width'), /var\(--skeleton-actions, 1\) \* var\(--btn-h\)/);
});

test('a disabled control has colours of its own instead of turning see-through', () => {
  const ink = 'color-mix(in oklab, var(--stone-text) 38%, transparent)';
  for (const sel of ['.glim-btn:disabled', '.glim-badge-action:disabled', '.glim-sel-seg:disabled', '.glim-menu-item:disabled', '.glim-icon-btn:disabled', '.glim-select-content--menu .glim-menu-item[data-disabled]']) {
    assert.equal(declared(sel, 'opacity'), '', sel);
    assert.equal(declared(sel, 'color'), ink, sel);
  }
  assert.equal(declared('.glim-btn:disabled', 'background-color'), 'light-dark(rgb(0 0 0 / 0.05), rgb(255 255 255 / 0.06))');
});

test('a glyph takes one of three sizes: 14 beside small text, 16 beside body text, 20 in the rail and a tile', () => {
  assert.equal(declared('.glim-info-icon', 'width'), 'var(--glyph-s)');
  assert.equal(declared('.glim-info-icon svg', 'width'), 'var(--glyph-s)');
  assert.equal(declared('.glim-list-row-tile > svg', 'width'), 'var(--glyph-m)');
  assert.equal(declared('.glim-menu-glyph', 'width'), 'var(--glyph-m)');
  assert.equal(declared('.glim-icon-btn > svg', 'width'), 'var(--glyph-m)');
  assert.equal(declared(':is(.glim-nav-row, .glim-nav-row-main) > svg', 'width'), 'var(--glyph-l)');
  assert.equal(declared('.glim-empty-glyph svg', 'width'), 'var(--glyph-l)');
  assert.equal(declared('.glim-empty-glyph', 'opacity'), '');
});

test('an (i) beside a name centres on the x-height, where the eye reads the line', () => {
  assert.equal(declared(':is(.glim-list-row-name, .glim-version-part) > .glim-info-icon', 'margin-block-end'), 'calc((1ex - var(--glyph-s)) / 2)');
});
