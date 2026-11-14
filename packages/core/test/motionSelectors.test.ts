import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// A page without data-motion moves like subtle. A selector that excludes subtle
// therefore has to require the attribute too, or it catches that page as if it
// were a livelier level.
const files = ['../tokens.css', '../../../docs/design-language.md'];

test('a selector that leaves out subtle also leaves out a page without data-motion', () => {
  const found: string[] = [];
  for (const file of files) {
    const text = readFileSync(new URL(file, import.meta.url), 'utf8');
    for (const m of text.matchAll(/[^\s,{}`]*:not\([^)]*data-motion=["']subtle["'][^)]*\)[^\s,{}`]*/g)) {
      if (!/\[data-motion\]/.test(m[0])) found.push(`${file}: ${m[0]}`);
    }
  }
  assert.deepEqual(found, []);
});
