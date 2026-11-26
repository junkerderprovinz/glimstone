import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** Every declaration of `property` in a rule whose selector list holds exactly `selector`. */
function declared(selector: string, property: string): string[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, list]) => list!.split(',').map((s) => s.trim()).includes(selector))
    .flatMap(([, , body]) => [...body!.matchAll(new RegExp(`(?<![\w-])${property}\s*:\s*([^;]+);`, 'g'))].map((m) => m[1]!.trim()));
}

test('a tile at rest stands on a quiet wash with a light edge, in a well as on a card', () => {
  assert.deepEqual(declared('.glim-sel-tile', 'background-color'), ['var(--tile-rest)']);
  assert.deepEqual(declared('.glim-sel-tile', 'box-shadow'), ['var(--elevation-tile)']);
  assert.deepEqual(declared(':is(.glim-subcard, .glim-well) .glim-sel-tile:not(.glim-active)', 'background-color'), []);
});

test('a scrollbar is a faint thumb on no track, in every scroller', () => {
  assert.deepEqual(declared('*', 'scrollbar-color'), ['var(--scrollbar-thumb) transparent']);
  assert.deepEqual(declared('*::-webkit-scrollbar-thumb', 'background'), ['var(--scrollbar-thumb)']);
});

test('selected text takes a wash of the accent and keeps its own colour', () => {
  assert.deepEqual(declared('::selection', 'background-color'), ['var(--selection)']);
  assert.deepEqual(declared('::selection', 'color'), ['inherit']);
});

/** The custom properties of the first block whose selector is exactly `selector`. */
function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  assert.ok(start >= 0, `no block ${selector}`);
  const body = css.slice(start + selector.length + 2, css.indexOf('}', start));
  return Object.fromEntries([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]));
}

test('the corners are a step softer, and only round makes the pressable things pills', () => {
  const soft = block(':root,\n:root[data-shape="soft"]');
  assert.deepEqual([soft['--radius-card'], soft['--radius-control'], soft['--radius-pill']], ['0.875rem', '0.5rem', '0.5rem']);
  const round = block(':root[data-shape="round"]');
  assert.deepEqual([round['--radius-card'], round['--radius-control'], round['--radius-pill']], ['1.5rem', '1rem', '9999px']);
  for (const shape of ['soft', 'square', 'leaf']) assert.notEqual(block(shape === 'soft' ? ':root,\n:root[data-shape="soft"]' : `:root[data-shape="${shape}"]`)['--radius-pill'], '9999px', shape);
});

test('a sub-card and a well sit inside the card on a concentric corner', () => {
  assert.match(css, /--radius-nested: max\(0px, calc\(var\(--radius-card\) - var\(--space-3\)\)\);/);
  for (const surface of ['.glim-subcard', '.glim-well']) assert.ok(declared(surface, 'border-radius').includes('var(--radius-nested)'), surface);
});

test('where the browser draws squircles, the soft corners take one', () => {
  const at = css.indexOf('@supports (corner-shape: superellipse(1.6))');
  assert.ok(at >= 0, 'no squircle');
  const body = css.slice(at, css.indexOf('}', at));
  assert.match(body, /:root:not\(\[data-shape="round"\]\) :is\([^)]*\.glim-card[^)]*\.glim-btn[^)]*\)/);
  assert.match(body, /corner-shape: superellipse\(1\.6\)/);
});

const FLOATING = [
  '.glim-menu', '.glim-popover', '.glim-select-content', '.glim-listbox', '.glim-bubble', '.glim-toast-card', '.glim-modal-card',
  '.glim-hovercard', '.glim-date-panel', '.glim-picker-popover', '.glim-picker-panel--float', '.glim-fpanel',
];

test('whatever floats over the page stands on a surface step of its own', () => {
  for (const layer of FLOATING) {
    const fills = [...declared(layer, 'background-color'), ...declared(layer, 'background')];
    assert.ok(fills.includes('var(--surface-overlay)'), `${layer}: ${fills.join(', ')}`);
    assert.ok(!fills.includes('var(--stone-surface)'), layer);
  }
  assert.match(css, /\.glim-bubble::before \{[^}]*border-color: transparent transparent var\(--surface-overlay\) transparent;/);
});

test('the scrim behind a window is lighter and blurs the page a little more', () => {
  assert.match(css, /--glim-scrim: light-dark\(rgba\(0, 0, 0, 0\.42\), rgba\(0, 0, 0, 0\.5\)\);/);
  assert.match(css, /--glim-scrim-blur: 8px;/);
});

test('the card carries the lift, and its notch lies flat on it', () => {
  assert.deepEqual(declared('.glim-panel', 'box-shadow'), ['var(--elevation-raised)']);
  assert.deepEqual(declared('.glim-panel--nested', 'box-shadow'), ['none']);
  assert.deepEqual(declared('.glim-badge--notch', 'box-shadow'), ['var(--elevation-notch)']);
});
