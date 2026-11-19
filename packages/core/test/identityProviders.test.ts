import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { IDENTITY_PROVIDERS } from '../src/identityProviders.ts';
import { IDENTITY_MARKS } from '../src/identityMarks.ts';
import { contrastRatio } from '../src/contrast.ts';
import { catalogPicker } from '../src/catalog.ts';

const entries = IDENTITY_PROVIDERS.entries;
const glyphs = new Set((JSON.parse(readFileSync(new URL('../glyphs.json', import.meta.url), 'utf8')) as { name: string }[]).map((g) => g.name));

test('the sign-in services stand in one group, since every one of them runs on its own server', () => {
  assert.deepEqual(IDENTITY_PROVIDERS.groups, ['selfHosted']);
});

test('the ids are the ones the server side stores, so neither end has to map them', () => {
  assert.deepEqual(entries.map((e) => e.id).sort(), ['authelia', 'authentik', 'kanidm', 'keycloak', 'pocket-id', 'zitadel']);
});

test('every id is unique, lower case and safe to store', () => {
  const ids = entries.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, id);
});

test('every service stands in a group the catalog knows', () => {
  for (const e of entries) assert.ok(IDENTITY_PROVIDERS.groups.includes(e.group), `${e.id}: ${e.group}`);
});

test('every group has services', () => {
  for (const g of IDENTITY_PROVIDERS.groups) assert.ok(entries.some((e) => e.group === g), g);
});

test('a service wears a mark from the set or names a glyph, never both and never neither', () => {
  const marks = new Set(Object.values(IDENTITY_MARKS));
  for (const e of entries) {
    assert.ok(!!e.mark !== !!e.glyph, e.id);
    if (e.mark) assert.ok(marks.has(e.mark), e.id);
    if (e.glyph) assert.ok(glyphs.has(e.glyph), `${e.id}: ${e.glyph}`);
  }
});

test('every mark in the set is worn by a service', () => {
  const worn = new Set(entries.map((e) => e.mark));
  for (const [id, mark] of Object.entries(IDENTITY_MARKS)) assert.ok(worn.has(mark), id);
});

test('every mark has its tile colour and an ink that reaches 2:1 on it', () => {
  for (const e of entries) {
    if (!e.mark) continue;
    assert.match(e.mark.tile ?? '', /^#[0-9a-f]{6}$/, e.id);
    assert.match(e.mark.ink ?? '', /^#[0-9a-f]{6}$/, e.id);
    assert.ok(contrastRatio(e.mark.ink!, e.mark.tile!) >= 2, e.id);
  }
});

test('every service is a brand, so no name is the app to translate', () => {
  assert.deepEqual(entries.filter((e) => e.word).map((e) => e.id), []);
});

test("an issuer of its own is the app's tile, not an entry of the catalog", () => {
  for (const e of entries) assert.ok(!/custom|other|generic/.test(e.id), e.id);
});

test("Keycloak's logo, whose facets swallow its brackets in one ink, brings a drawing of its own for the lit tile", () => {
  assert.ok(IDENTITY_MARKS.keycloak.hover);
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
  const titles = { selfHosted: 'Self-hosted' };
  const { items, groups } = catalogPicker(IDENTITY_PROVIDERS, { ids: entries.map((e) => e.id), titles, glyph: (e) => e.glyph, lang: 'en' });
  assert.equal(items.length, entries.length);
  assert.deepEqual(groups.map((g) => g.title), ['Self-hosted']);
});
