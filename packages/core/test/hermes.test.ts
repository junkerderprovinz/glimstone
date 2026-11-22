import { test } from 'node:test';
import assert from 'node:assert/strict';

// Hermes, the engine of a React Native app, ships Intl without these
// constructors, and so do older WebViews. The whole core has to load and work
// without them.
const MISSING = ['Segmenter', 'RelativeTimeFormat', 'ListFormat', 'DisplayNames', 'PluralRules'] as const;
for (const name of MISSING) delete (Intl as unknown as Record<string, unknown>)[name];

const core = await import('../src/index.ts');

test('the whole core loads without the Intl constructors Hermes lacks', () => {
  assert.equal(typeof core.componentText, 'function');
  for (const name of MISSING) assert.equal(name in Intl, false);
});

test('initials still take the first letter of the first and last word, a combined letter whole', () => {
  assert.equal(core.initials('Ada Lovelace'), 'AL');
  assert.equal(core.initials('émile zola'), 'ÉZ');
  assert.equal(core.initials('😀 Smile'), '😀S');
});

test('rows still sort by their words, numbers in their order', () => {
  const rows = [{ name: 'item 10' }, { name: 'item 2' }, { name: 'Item 1' }];
  assert.deepEqual(
    core.sortRows(rows, { key: 'name', dir: 'asc' }).map((r) => r.name),
    ['Item 1', 'item 2', 'item 10'],
  );
});

test('a count still picks a form, and a list still reads as one', () => {
  assert.equal(core.plural('en', { one: '{count} star', other: '{count} stars' }, 1), '1 star');
  assert.equal(core.plural('en', { one: '{count} star', other: '{count} stars' }, 3), '3 stars');
  assert.equal(core.listOf('en', ['a', 'b', 'c']), 'a, b, c');
  assert.equal(core.TIMER_TEXT.spoken(1, 4, 30), '1 hour, 4 minutes, 30 seconds');
});

test('the Version card still says when it last looked, as a time of day', () => {
  const now = new Date(2026, 10, 22, 14, 30);
  const at = new Date(2026, 10, 22, 14, 5);
  const line = core.VERSION_CARD_TEXT.checked(at, now);
  assert.match(line, /^Last checked .*\d{1,2}.\d{2}/);
  assert.equal(core.updateLine({ kind: 'current', checkedAt: at }, core.VERSION_CARD_TEXT, now).line, 'Up to date');
});

test('every language builds its words and fills its sentences', () => {
  for (const lang of core.COMPONENT_LANGUAGES) {
    const t = core.componentText(lang);
    assert.ok(t.pagination.page(3, 20).length > 0, lang);
    assert.ok(t.rating.star(3, 5).length > 0, lang);
    assert.ok(t.timer.spoken(0, 2, 5).length > 0, lang);
    assert.ok(t.versionCard.checked(new Date(Date.now() - 60_000)).length > 0, lang);
  }
});
