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

test('rows lift enough to see at every level but off, and stay put at off', () => {
  for (const level of [':root', ":root[data-motion='subtle']", ":root[data-motion='storm']"]) {
    assert.ok(dial(level, '--motion-row-tremble-lift') >= 1, `${level} lifts too little`);
    assert.ok(dial(level, '--motion-row-tremble-tilt') <= .25, `${level} swings a wide row's ends too far`);
  }
  assert.equal(dial(":root[data-motion='off']", '--motion-row-tremble-lift'), 0);
  assert.equal(dial(":root[data-motion='off']", '--motion-row-tremble-tilt'), 0);
});

test('a list of rows trembles with the row wiggle', () => {
  assert.match(CSS, /\.glim-drag-armed\.glim-drag-rows > :not\([^)]*\) \{[^}]*animation-name: glim-row-wiggle;/);
});

test('a held item stays still by any of its markers', () => {
  const held = ':not(.glim-drag-lift, [aria-grabbed="true"], [data-held="true"])';
  assert.ok(CSS.includes(`.glim-drag-armed > ${held} {`), 'tiles');
  assert.ok(CSS.includes(`.glim-drag-armed.glim-drag-rows > ${held} {`), 'rows');
});
