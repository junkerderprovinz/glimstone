import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NOTIFY_PROVIDERS } from '../src/notifyProviders.ts';
import { SERVICE_MARKS } from '../src/serviceMarks.ts';
import { contrastRatio } from '../src/contrast.ts';
import { catalogPicker } from '../src/catalog.ts';

const entries = NOTIFY_PROVIDERS.entries;
const glyphs = new Set((JSON.parse(readFileSync(new URL('../glyphs.json', import.meta.url), 'utf8')) as { name: string }[]).map((g) => g.name));

test('services come first, then email and webhooks', () => {
  assert.deepEqual(NOTIFY_PROVIDERS.groups, ['service', 'standard']);
});

test('every id is unique, lower case and safe to store', () => {
  const ids = entries.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z0-9]+$/, id);
});

test('every provider stands in a group the catalog knows', () => {
  for (const e of entries) assert.ok(NOTIFY_PROVIDERS.groups.includes(e.group), `${e.id}: ${e.group}`);
});

test('every group has providers', () => {
  for (const g of NOTIFY_PROVIDERS.groups) assert.ok(entries.some((e) => e.group === g), g);
});

test('a provider wears a mark from the set or names a glyph, never both and never neither', () => {
  const marks = new Set(Object.values(SERVICE_MARKS));
  for (const e of entries) {
    assert.ok(!!e.mark !== !!e.glyph, e.id);
    if (e.mark) assert.ok(marks.has(e.mark), e.id);
    if (e.glyph) assert.ok(glyphs.has(e.glyph), `${e.id}: ${e.glyph}`);
  }
});

test('every mark in the set is worn by a provider', () => {
  const worn = new Set(entries.map((e) => e.mark));
  for (const [id, mark] of Object.entries(SERVICE_MARKS)) assert.ok(worn.has(mark), id);
});

test('every mark has its tile colour and an ink that reaches 2:1 on it', () => {
  for (const e of entries) {
    if (!e.mark) continue;
    assert.match(e.mark.tile ?? '', /^#[0-9a-f]{6}$/, e.id);
    assert.match(e.mark.ink ?? '', /^#[0-9a-f]{6}$/, e.id);
    assert.ok(contrastRatio(e.mark.ink!, e.mark.tile!) >= 2, e.id);
  }
});

test('email and the webhook are words the app translates, and every service is a brand', () => {
  const words = entries.filter((e) => e.word).map((e) => e.id).sort();
  assert.deepEqual(words, ['smtp', 'webhook']);
});

test('the search words add something the name and id do not already say', () => {
  for (const e of entries) {
    for (const term of e.terms ?? []) {
      assert.notEqual(term.toLowerCase(), e.id, e.id);
      assert.ok(!e.name.toLowerCase().includes(term.toLowerCase()), `${e.id}: ${term}`);
    }
  }
});

test('a service reached only through Shoutrrr is a word its tile is found by, not a tile of its own', () => {
  const ids = new Set<string>(entries.map((e) => e.id));
  const shoutrrr = entries.find((e) => e.id === 'shoutrrr');
  for (const name of ['Telegram', 'Pushover', 'Teams']) {
    assert.ok(shoutrrr?.terms?.includes(name), name);
    assert.ok(!ids.has(name.toLowerCase()), name);
  }
});

test('the whole catalog makes a picker with every group in order', () => {
  const titles = { service: 'Services', standard: 'Email and webhooks' };
  const { items, groups } = catalogPicker(NOTIFY_PROVIDERS, { ids: entries.map((e) => e.id), titles, glyph: (e) => e.glyph, lang: 'en' });
  assert.equal(items.length, entries.length);
  assert.deepEqual(groups.map((g) => g.title), ['Services', 'Email and webhooks']);
});
