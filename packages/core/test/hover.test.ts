import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const css = read('tokens.css');
const tailwind = read('tailwind-theme.css');

// The innermost rules whose selector the pointer has to be over, and the
// options a list marks with data-highlighted while the pointer or the arrow keys
// rest on them.
const hovered = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(([, selector, body]) => ({ selector: selector!.trim().replace(/\s+/g, ' '), body: body! }))
  .filter(({ selector }) => /:hover|\[data-highlighted\]/.test(selector.replace(/:not\([^()]*\)/g, '')));

const declared = (body: string, property: RegExp) => [...body.matchAll(new RegExp(`(?<![\\w-])(?:${property.source})\\s*:\\s*([^;]+);`, 'g'))].map((m) => m[1]!.trim());

// The one hover ground, and the grounds that come from the accent, from a
// rainbow position, from a brand tile or from a state hue, each of which the
// hover is allowed to light. A field keeps its own neutral steps (rule 14).
const LIT = /var\(--(hover|accent[\w-]*|item-hue[\w-]*|tile|status-[\w-]+|field-hover)\)/;

// The system colours a forced-colors rule paints with.
const SYSTEM = /^(Highlight|HighlightText|ButtonFace|ButtonText|Canvas|CanvasText|LinkText|GrayText|SelectedItem)$/;

// A chip's dismiss control takes the pill's own ink, accent or neutral, so on
// an accent chip an accent wash would vanish.
const OWN_INK = new Set(['.glim-btn-chip:hover:not(:disabled)']);

test('the stylesheet has hover rules to check', () => {
  assert.ok(hovered.length > 40, String(hovered.length));
});

test('every hover in the stylesheet lights its ground with the accent', () => {
  const grey = hovered.flatMap(({ selector, body }) =>
    declared(body, /background(?:-color)?/)
      .filter((value) => value !== 'transparent' && !SYSTEM.test(value) && !LIT.test(value) && !OWN_INK.has(selector))
      .map((value) => `${selector}: ${value}`),
  );
  assert.deepEqual(grey, []);
});

test('a control without a ground of its own takes the accent ink under the pointer', () => {
  const grey = hovered
    .filter(({ body }) => declared(body, /background(?:-color)?/).length === 0)
    .flatMap(({ selector, body }) => declared(body, /color/).filter((v) => /var\(--carbon-/.test(v)).map((v) => `${selector}: ${v}`));
  assert.deepEqual(grey, []);
});

test('the Tailwind hover colour takes a rainbow position\'s hue', () => {
  const position = tailwind.match(/\[data-rainbow\] \.glim-hue \{([^}]*)\}/)?.[1] ?? '';
  assert.match(tailwind, /--color-hover: var\(--hover\);/);
  assert.match(position, /--color-hover: var\(--hover\);/);
});
