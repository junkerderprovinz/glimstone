import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

// Room kept free for a button that sits inside a field is the button's size,
// not a distance.
const SIZES = new Set(['4.25rem', '2.4rem', '14rem', '0.85rem']);

const steps = [...css.matchAll(/--space-(\d+):\s*([\d.]+)rem;/g)].map((m) => [Number(m[1]), Number(m[2]) * 16] as const);

test('the spacing steps climb, 2px apart up to 16px', () => {
  assert.equal(steps.length, 13);
  steps.forEach(([n], i) => assert.equal(n, i + 1));
  for (let i = 1; i < 8; i++) assert.equal(steps[i]![1] - steps[i - 1]![1], 2);
  for (let i = 8; i < steps.length; i++) assert.ok(steps[i]![1] > steps[i - 1]![1]);
});

test('every padding, margin and gap in rem reads a step', () => {
  const loose: string[] = [];
  for (const m of css.matchAll(/(?:^|[{;])\s*((?:padding|margin)(?:-[a-z-]+)?|gap|row-gap|column-gap)\s*:\s*([^;{}]+);/gm)) {
    for (const length of m[2]!.match(/-?[\d.]+rem/g) ?? []) {
      if (!SIZES.has(length.replace(/^-/, ''))) loose.push(`${m[1]}: ${m[2]!.trim()}`);
    }
  }
  assert.deepEqual(loose, []);
});
