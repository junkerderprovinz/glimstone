import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DOWNLOAD_PROVIDERS } from '../src/downloadProviders.ts';
import { DOWNLOAD_MARKS } from '../src/downloadMarks.ts';
import { contrastRatio } from '../src/contrast.ts';
import { catalogPicker } from '../src/catalog.ts';

const entries = DOWNLOAD_PROVIDERS.entries;
const glyphs = new Set((JSON.parse(readFileSync(new URL('../glyphs.json', import.meta.url), 'utf8')) as { name: string }[]).map((g) => g.name));

test('debrid services come first, then the file hosters', () => {
  assert.deepEqual(DOWNLOAD_PROVIDERS.groups, ['debrid', 'hoster']);
});

test('every id is unique and safe to store, a hoster by the domain its logins are filed under', () => {
  const ids = entries.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const e of entries) {
    if (e.group === 'hoster') assert.match(e.id, /^[a-z0-9-]+(\.[a-z0-9-]+)+$/, e.id);
    else assert.match(e.id, /^[a-z0-9]+$/, e.id);
  }
});

test('every provider stands in a group the catalog knows', () => {
  for (const e of entries) assert.ok(DOWNLOAD_PROVIDERS.groups.includes(e.group), `${e.id}: ${e.group}`);
});

test('every group has providers', () => {
  for (const g of DOWNLOAD_PROVIDERS.groups) assert.ok(entries.some((e) => e.group === g), g);
});

test('a provider wears a mark from the set or names a glyph, never both and never neither', () => {
  const marks = new Set(Object.values(DOWNLOAD_MARKS));
  for (const e of entries) {
    assert.ok(!!e.mark !== !!e.glyph, e.id);
    if (e.mark) assert.ok(marks.has(e.mark), e.id);
    if (e.glyph) assert.ok(glyphs.has(e.glyph), `${e.id}: ${e.glyph}`);
  }
});

test('every mark in the set is worn by a provider', () => {
  const worn = new Set(entries.map((e) => e.mark));
  for (const [id, mark] of Object.entries(DOWNLOAD_MARKS)) assert.ok(worn.has(mark), id);
});

test('every mark has its tile colour and an ink that reaches 2:1 on it', () => {
  for (const e of entries) {
    if (!e.mark) continue;
    assert.match(e.mark.tile ?? '', /^#[0-9a-f]{6}$/, e.id);
    assert.match(e.mark.ink ?? '', /^#[0-9a-f]{6}$/, e.id);
    assert.ok(contrastRatio(e.mark.ink!, e.mark.tile!) >= 2, e.id);
  }
});

test('every provider is a brand, so no name is the app to translate', () => {
  assert.deepEqual(entries.filter((e) => e.word).map((e) => e.id), []);
});

test('the search words add something the name and id do not already say', () => {
  for (const e of entries) {
    for (const term of e.terms ?? []) {
      assert.notEqual(term.toLowerCase(), e.id, e.id);
      assert.ok(!e.name.toLowerCase().includes(term.toLowerCase()), `${e.id}: ${term}`);
    }
  }
});

test("a hoster's other domains are words its tile is found by, not tiles of their own", () => {
  const ids = new Set<string>(entries.map((e) => e.id));
  for (const [id, alias] of [['rapidgator.net', 'rg.to'], ['keep2share.cc', 'k2s.cc'], ['ddownload.com', 'ddl.to']] as const) {
    assert.ok(entries.find((e) => e.id === id)?.terms?.includes(alias), alias);
    assert.ok(!ids.has(alias), alias);
  }
});

test('the whole catalog makes a picker with every group in order', () => {
  const titles = { debrid: 'Debrid services', hoster: 'File hosters' };
  const { items, groups } = catalogPicker(DOWNLOAD_PROVIDERS, { ids: entries.map((e) => e.id), titles, glyph: (e) => e.glyph, lang: 'en' });
  assert.equal(items.length, entries.length);
  assert.deepEqual(groups.map((g) => g.title), ['Debrid services', 'File hosters']);
});
