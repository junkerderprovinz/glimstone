import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { splitQuestion } from '../src/dialog.ts';
import { restTimer, tooltipClosed, tooltipDelay, TOOLTIP_DELAY_MS, TOOLTIP_SKIP_MS } from '../src/tipBubble.ts';

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

test('a tooltip waits for the pointer to rest, and the next one comes at once', () => {
  assert.equal(TOOLTIP_DELAY_MS, 500);
  tooltipClosed(10_000);
  assert.equal(tooltipDelay(10_000 + TOOLTIP_SKIP_MS - 1), 0);
  assert.equal(tooltipDelay(10_000 + TOOLTIP_SKIP_MS + 1), TOOLTIP_DELAY_MS);
});

test('a rest timer opens a tooltip after the delay and an info bubble at once', async () => {
  tooltipClosed(-Infinity);
  const opened: string[] = [];
  const info = restTimer('info');
  info.rest(() => opened.push('info'));
  assert.deepEqual(opened, ['info']);
  const tip = restTimer('tip', 20);
  tip.rest(() => opened.push('tip'));
  assert.deepEqual(opened, ['info']);
  await new Promise((done) => setTimeout(done, 40));
  assert.deepEqual(opened, ['info', 'tip']);
  const left = restTimer('tip', 20);
  left.rest(() => opened.push('left'));
  left.cancel();
  await new Promise((done) => setTimeout(done, 40));
  assert.deepEqual(opened, ['info', 'tip']);
});

test('a tooltip is small and inverted, an info bubble roomy on the floating surface', () => {
  assert.equal(declared('.glim-bubble--tip', 'background-color'), 'var(--carbon-text)');
  assert.equal(declared('.glim-bubble--tip', 'color'), 'var(--carbon-bg)');
  assert.equal(declared('.glim-bubble--tip', 'box-shadow'), 'var(--elevation-notch)');
  assert.equal(declared('.glim-bubble--tip', 'max-width'), '15rem');
  assert.equal(declared('.glim-bubble--tip::before', 'display'), 'none');
  assert.equal(declared('.glim-bubble--info', 'max-width'), '18rem');
  assert.equal(declared('.glim-bubble--info', 'font-size'), 'var(--text-subline)');
  assert.equal(declared('.glim-bubble', 'background-color'), 'var(--surface-overlay)');
});

test('a dim selector tile keeps its words readable: only its glyph steps back, nothing turns see-through', () => {
  assert.equal(declared('.glim-sel-tile--dim', 'opacity'), '');
  assert.equal(declared('.glim-sel-tile--dim:not(.glim-active) > svg', 'color'), 'var(--carbon-text-muted)');
});

test('the fortress card falls back to the secondary text ink outside a host theme', () => {
  const card = readFileSync(new URL('../vanilla/fortress-card.css', import.meta.url), 'utf8');
  assert.match(card, /--fc-dim: var\(--alt-text-color, var\(--carbon-text-sub, #8d8d8d\)\);/);
});
