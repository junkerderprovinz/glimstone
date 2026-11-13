import { test } from 'node:test';
import assert from 'node:assert/strict';
import { badgeClassName } from '../src/badge.ts';
import { DEPRECATED, warnDeprecated } from '../src/deprecated.ts';

function warnings(run: () => void): string[] {
  const seen: string[] = [];
  const warn = console.warn;
  console.warn = (message: string) => seen.push(message);
  try {
    run();
  } finally {
    console.warn = warn;
  }
  return seen;
}

test('a deprecated name warns once per page with its replacement and the release that removes it', () => {
  const seen = warnings(() => {
    warnDeprecated('DropdownListbox');
    warnDeprecated('DropdownListbox');
  });
  assert.equal(seen.length, 1);
  assert.match(seen[0]!, /DropdownListbox is deprecated since GlimStone 3\.6\.0 and goes in 5\.0\.0\. Use Select/);
});

test('every deprecated name goes in a major release after the one that deprecated it', () => {
  for (const [name, { since, removal }] of Object.entries(DEPRECATED)) {
    assert.match(removal, /^\d+\.0\.0$/, name);
    assert.ok(Number(removal.split('.')[0]) > Number(since.split('.')[0]), name);
  }
});

test('a badge given the old shape warns, one given a form does not', () => {
  assert.deepEqual(warnings(() => badgeClassName({ form: 'circle' })), []);
  assert.match(warnings(() => badgeClassName({ shape: 'circle' }))[0] ?? '', /Badge shape is deprecated/);
});
