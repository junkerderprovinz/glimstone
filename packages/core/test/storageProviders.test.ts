import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { STORAGE_PROVIDERS } from '../src/storageProviders.ts';
import { STORAGE_MARKS } from '../src/storageMarks.ts';
import { contrastRatio } from '../src/contrast.ts';
import { catalogPicker } from '../src/catalog.ts';

const entries = STORAGE_PROVIDERS.entries;
const glyphs = new Set((JSON.parse(readFileSync(new URL('../glyphs.json', import.meta.url), 'utf8')) as { name: string }[]).map((g) => g.name));

test('clouds come first, then bucket stores, then protocols, then targets built on another one', () => {
  assert.deepEqual(STORAGE_PROVIDERS.groups, ['cloud', 'storage', 'protocol', 'layered']);
});

test('every id is unique, lower case and safe to store', () => {
  const ids = entries.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z0-9]+$/, id);
});

test('every provider stands in a group the catalog knows', () => {
  for (const e of entries) assert.ok(STORAGE_PROVIDERS.groups.includes(e.group), `${e.id}: ${e.group}`);
});

test('every group has providers', () => {
  for (const g of STORAGE_PROVIDERS.groups) assert.ok(entries.some((e) => e.group === g), g);
});

test('a provider wears a mark from the set or names a glyph, never both and never neither', () => {
  const marks = new Set(Object.values(STORAGE_MARKS));
  for (const e of entries) {
    assert.ok(!!e.mark !== !!e.glyph, e.id);
    if (e.mark) assert.ok(marks.has(e.mark), e.id);
    if (e.glyph) assert.ok(glyphs.has(e.glyph), `${e.id}: ${e.glyph}`);
  }
});

test('every mark in the set is worn by a provider', () => {
  const worn = new Set(entries.map((e) => e.mark));
  for (const [id, mark] of Object.entries(STORAGE_MARKS)) assert.ok(worn.has(mark), id);
});

test('every mark has its tile colour and an ink that reaches 2:1 on it', () => {
  for (const e of entries) {
    if (!e.mark) continue;
    assert.match(e.mark.tile ?? '', /^#[0-9a-f]{6}$/, e.id);
    assert.match(e.mark.ink ?? '', /^#[0-9a-f]{6}$/, e.id);
    assert.ok(contrastRatio(e.mark.ink!, e.mark.tile!) >= 2, e.id);
  }
});

test('a name that is a word the app translates is marked as one, and a brand name is not', () => {
  const words = entries.filter((e) => e.word).map((e) => e.id).sort();
  assert.deepEqual(words, ['alias', 'archive', 'cache', 'chunker', 'combine', 'compress', 'crypt', 'hasher', 'memory', 'path', 's3', 'smb', 'union']);
});

test('a name carries no second line of its own, which goes in its kind', () => {
  for (const e of entries) assert.doesNotMatch(e.name, / \/ /, e.id);
});

// TeleBox kept the id it had as Linkbox, and its former name stays a search word.
const FORMER_NAME_IS_ID = new Set(['linkbox']);

test('the search words add something the name and id do not already say', () => {
  for (const e of entries) {
    for (const term of e.terms ?? []) {
      if (!FORMER_NAME_IS_ID.has(e.id)) assert.notEqual(term.toLowerCase(), e.id, e.id);
      assert.ok(!e.name.toLowerCase().includes(term.toLowerCase()), `${e.id}: ${term}`);
    }
  }
});

test('the whole catalog makes a picker with every group in order', () => {
  const titles = { cloud: 'Clouds', storage: 'Object storage', protocol: 'Servers and shares', layered: 'On another target' };
  const { items, groups } = catalogPicker(STORAGE_PROVIDERS, { ids: entries.map((e) => e.id), titles, glyph: (e) => e.glyph, lang: 'en' });
  assert.equal(items.length, entries.length);
  assert.deepEqual(groups.map((g) => g.title), ['Clouds', 'Object storage', 'Servers and shares', 'On another target']);
});
