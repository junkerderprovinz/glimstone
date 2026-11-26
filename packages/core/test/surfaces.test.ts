import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { splitQuestion } from '../src/dialog.ts';

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
    const m = r.body.match(new RegExp(`(?<![\\w-])${property}\\s*:\\s*([^;]+);`));
    if (m) found = m[1]!.trim();
  }
  return found;
}

test('a card action stands centred on the top edge at the end, on the card fill', () => {
  assert.equal(declared('.glim-panel-action', 'position'), 'absolute');
  assert.equal(declared('.glim-panel-action', 'top'), '0');
  assert.equal(declared('.glim-panel-action', 'inset-inline-end'), 'var(--space-8)');
  assert.equal(declared('.glim-panel-action', 'translate'), '0 -50%');
  assert.equal(declared('.glim-panel-action', 'background-color'), 'var(--carbon-surface)');
});

test('the notch comes in three steps: a window, a card and a sub-card', () => {
  assert.equal(declared('.glim-badge--heading', '--badge-h'), '22px');
  assert.equal(declared(':is(.glim-window-title, .glim-modal-title) .glim-badge--heading', '--badge-h'), '28px');
  assert.equal(declared(':is(.glim-window-title, .glim-modal-title) .glim-badge--heading', 'font-size'), 'var(--text-subline)');
  assert.equal(declared('.glim-subcard .glim-panel-heading .glim-badge--heading', '--badge-h'), '18px');
  assert.equal(declared('.glim-subcard .glim-panel-heading .glim-badge--heading', '--badge-px'), 'var(--space-4)');
});

test('windows come in four widths', () => {
  assert.equal(declared('.glim-modal-card.glim-window--small', 'max-width'), '25rem');
  assert.equal(declared('.glim-window', 'max-width'), '35rem');
  assert.equal(declared('.glim-window--large', 'max-width'), '45rem');
  assert.equal(declared('.glim-window--wide', 'max-width'), '60rem');
});

test('a window holds its content 24px in from its sides, 20px on a phone', () => {
  assert.match(css, /\.glim-modal-body \{[^}]*padding-inline: var\(--space-10\);/);
  assert.match(css, /@media \(max-width: 640px\) \{\s*\.glim-modal-body \{ padding-inline: var\(--space-9\); \}/);
});

test('a confirmation leads with its question in the text colour and keeps the rest quiet', () => {
  assert.equal(declared('.glim-modal-question', 'color'), 'var(--carbon-text)');
  assert.equal(declared('.glim-modal-question', 'font-size'), 'var(--text-title)');
  assert.equal(declared('.glim-modal-question', 'font-weight'), 'var(--font-weight-strong)');
  assert.equal(declared('.glim-modal-question + .glim-modal-text', 'color'), 'var(--carbon-text-muted)');
  assert.equal(declared('.glim-modal-question + .glim-modal-text', 'font-size'), 'var(--text-body)');
});

test('a message splits after the question that ends its first sentence', () => {
  assert.deepEqual(splitQuestion('Delete 3 snapshots? They cannot be brought back.'), { question: 'Delete 3 snapshots?', detail: 'They cannot be brought back.' });
  assert.deepEqual(splitQuestion('Remove the target.'), { question: 'Remove the target.', detail: '' });
  assert.deepEqual(splitQuestion('¿Borrar? No se puede deshacer.'), { question: '¿Borrar?', detail: 'No se puede deshacer.' });
  assert.deepEqual(splitQuestion('Is "a?b" right'), { question: 'Is "a?b" right', detail: '' });
});

test('a menu bar word is a quiet 30px row, and the open one stands on the menu surface', () => {
  assert.equal(declared('.glim-menubar-item', 'height'), '1.875rem');
  assert.equal(declared('.glim-menubar-item', 'font-size'), 'var(--text-body)');
  assert.equal(declared('.glim-menubar-item', 'padding-inline'), 'var(--space-5)');
  assert.equal(declared('.glim-menubar-item:hover:not([aria-expanded="true"])', 'background-color'), 'var(--hover)');
  assert.equal(declared('.glim-menubar-item[aria-expanded="true"]', 'background-color'), 'var(--surface-overlay)');
  assert.equal(declared('.glim-menubar-item[aria-expanded="true"]', 'box-shadow'), 'var(--elevation-control)');
});

