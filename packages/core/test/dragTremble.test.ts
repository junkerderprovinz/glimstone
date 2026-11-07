import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const CSS = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');

// A level can open several blocks; the one that declares the dial counts.
function dial(selector: string, name: string): number {
  for (let at = CSS.indexOf(`${selector} {`); at >= 0; at = CSS.indexOf(`${selector} {`, at + 1)) {
    const m = CSS.slice(at, CSS.indexOf('}', at)).match(new RegExp(`${name}:\\s*([\\d.]+)`));
    if (m) return Number(m[1]);
  }
  throw new Error(`${selector} declares no ${name}`);
}

test('the other items of a held list tremble hard enough to see at once', () => {
  for (const level of [':root', ":root[data-motion='subtle']", ":root[data-motion='storm']"]) {
    assert.ok(dial(level, '--motion-wiggle-angle') >= 1.2, `${level} turns too little`);
    assert.ok(dial(level, '--motion-wiggle-dur') <= 160, `${level} beats too slowly`);
  }
});

test('nothing trembles at motion off', () => {
  assert.equal(dial(":root[data-motion='off']", '--motion-wiggle-angle'), 0);
});

test('neighbours tremble out of step', () => {
  assert.match(CSS, /\.glim-drag-armed > :nth-child\(2n\) \{ animation-delay: calc\(var\(--motion-wiggle-dur\) \* -\.5\); \}/);
  assert.match(CSS, /\.glim-drag-armed > :nth-child\(3n\) \{ animation-delay: calc\(var\(--motion-wiggle-dur\) \* -\.33\); \}/);
});
