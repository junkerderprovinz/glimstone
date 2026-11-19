import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { REGISTRY_PROVIDERS } from '../src/registryProviders.ts';
import { REGISTRY_MARKS } from '../src/registryMarks.ts';
import { contrastRatio } from '../src/contrast.ts';
import { catalogPicker } from '../src/catalog.ts';

const entries = REGISTRY_PROVIDERS.entries;
const glyphs = new Set((JSON.parse(readFileSync(new URL('../glyphs.json', import.meta.url), 'utf8')) as { name: string }[]).map((g) => g.name));

test('public registries come first, then the clouds, then the ones people run themselves', () => {
  assert.deepEqual(REGISTRY_PROVIDERS.groups, ['public', 'cloud', 'selfHosted']);
});

test('every id is unique, lower case and safe to store', () => {
  const ids = entries.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z0-9]+$/, id);
});

test('every registry stands in a group the catalog knows', () => {
  for (const e of entries) assert.ok(REGISTRY_PROVIDERS.groups.includes(e.group), `${e.id}: ${e.group}`);
});

test('every group has registries', () => {
  for (const g of REGISTRY_PROVIDERS.groups) assert.ok(entries.some((e) => e.group === g), g);
});

test('a registry wears a mark from the set or names a glyph, never both and never neither', () => {
  const marks = new Set(Object.values(REGISTRY_MARKS));
  for (const e of entries) {
    assert.ok(!!e.mark !== !!e.glyph, e.id);
    if (e.mark) assert.ok(marks.has(e.mark), e.id);
    if (e.glyph) assert.ok(glyphs.has(e.glyph), `${e.id}: ${e.glyph}`);
  }
});

test('every mark in the set is worn by a registry', () => {
  const worn = new Set(entries.map((e) => e.mark));
  for (const [id, mark] of Object.entries(REGISTRY_MARKS)) assert.ok(worn.has(mark), id);
});

test('every mark has its tile colour and an ink that reaches 2:1 on it', () => {
  for (const e of entries) {
    if (!e.mark) continue;
    assert.match(e.mark.tile ?? '', /^#[0-9a-f]{6}$/, e.id);
    assert.match(e.mark.ink ?? '', /^#[0-9a-f]{6}$/, e.id);
    assert.ok(contrastRatio(e.mark.ink!, e.mark.tile!) >= 2, e.id);
  }
});

test('the registry at any address is the one word the app translates, and stands in the last group', () => {
  assert.deepEqual(entries.filter((e) => e.word).map((e) => e.id), ['other']);
  assert.equal(entries.find((e) => e.id === 'other')?.group, REGISTRY_PROVIDERS.groups.at(-1));
});

test('the multicoloured logos bring a drawing in one ink for the lit tile', () => {
  for (const id of ['gitlab', 'quay', 'gitea', 'harbor'] as const) assert.ok(REGISTRY_MARKS[id].hover, id);
});

test('the search words add something the name and id do not already say', () => {
  for (const e of entries) {
    for (const term of e.terms ?? []) {
      assert.notEqual(term.toLowerCase(), e.id, e.id);
      assert.ok(!e.name.toLowerCase().includes(term.toLowerCase()), `${e.id}: ${term}`);
    }
  }
});

test('the whole catalog makes a picker with every group in order', () => {
  const titles = { public: 'Public', cloud: 'In a cloud account', selfHosted: 'Self-hosted' };
  const { items, groups } = catalogPicker(REGISTRY_PROVIDERS, { ids: entries.map((e) => e.id), titles, glyph: (e) => e.glyph, lang: 'en' });
  assert.equal(items.length, entries.length);
  assert.deepEqual(groups.map((g) => g.title), ['Public', 'In a cloud account', 'Self-hosted']);
});
