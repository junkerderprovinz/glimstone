import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { anchorName } from '../src/overlay.ts';

const CSS = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');

function dial(selector: string, name: string): string {
  for (let at = CSS.indexOf(`${selector} {`); at >= 0; at = CSS.indexOf(`${selector} {`, at + 1)) {
    const m = CSS.slice(at, CSS.indexOf('}', at)).match(new RegExp(`${name}:\\s*([^;]+);`));
    if (m) return m[1].trim();
  }
  throw new Error(`${selector} declares no ${name}`);
}

test('an anchor name is a dashed ident whatever the id holds', () => {
  assert.equal(anchorName(':r1:'), '--glim-anchor-r1');
  assert.equal(anchorName('v-0-3'), '--glim-anchor-v-0-3');
});

test('every motion level answers the sheet dials, and off does not slide', () => {
  for (const level of [':root', ":root[data-motion='subtle']", ":root[data-motion='off']", ":root[data-motion='storm']"]) {
    dial(level, '--motion-sheet-dur');
    dial(level, '--motion-sheet-shift');
  }
  assert.equal(dial(":root[data-motion='off']", '--motion-sheet-shift'), '0');
});
