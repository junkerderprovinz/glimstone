import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogPicker, type Catalog } from '../src/catalog.ts';

// A catalog of another kind than storage, so nothing here leans on one.
type Group = 'commercial' | 'selfhosted' | 'protocol';
const tunnels: Catalog<Group> = {
  groups: ['commercial', 'selfhosted', 'protocol'],
  entries: [
    { id: 'zulu', name: 'Zulu VPN', group: 'commercial', mark: { svg: '<svg/>', tile: '#123456', ink: '#ffffff' } },
    { id: 'aero', name: 'Aero', group: 'commercial', terms: ['aeronet'] },
    { id: 'oeste', name: 'Öste', group: 'commercial' },
    { id: 'hearth', name: 'Hearth', group: 'selfhosted' },
    { id: 'wire', name: 'WireGuard', kind: 'Tunnel', group: 'protocol', glyph: 'IconNetwork' },
    { id: 'plain', name: 'Plain tunnel', group: 'protocol', glyph: 'IconLink', word: true },
  ],
};
const titles = { commercial: 'Services', selfhosted: 'Your own', protocol: 'Protocols' };
const glyph = (entry: { id: string }) => `glyph:${entry.id}`;

test('only the providers the app asks for become tiles', () => {
  const { items } = catalogPicker(tunnels, { ids: ['aero', 'wire'], titles, glyph, lang: 'en' });
  assert.deepEqual(items.map((i) => i.id), ['aero', 'wire']);
});

test('an id the catalog does not know is left for the app to add itself', () => {
  const { items } = catalogPicker(tunnels, { ids: ['aero', 'nowhere' as 'aero'], titles, glyph, lang: 'en' });
  assert.deepEqual(items.map((i) => i.id), ['aero']);
});

test("the groups keep the catalog's order whatever order the ids come in, with the app's titles", () => {
  const { groups } = catalogPicker(tunnels, { ids: ['wire', 'hearth', 'zulu'], titles, glyph, lang: 'en' });
  assert.deepEqual(groups, [
    { id: 'commercial', title: 'Services' },
    { id: 'selfhosted', title: 'Your own' },
    { id: 'protocol', title: 'Protocols' },
  ]);
});

test('a group none of whose providers is asked for is left out', () => {
  const { groups } = catalogPicker(tunnels, { ids: ['wire', 'zulu'], titles, glyph, lang: 'en' });
  assert.deepEqual(groups.map((g) => g.id), ['commercial', 'protocol']);
});

test("the tiles stand group by group, alphabetical within a group in the page's language", () => {
  const ids = ['zulu', 'wire', 'oeste', 'aero', 'plain', 'hearth'] as const;
  const order = (lang: string) => catalogPicker(tunnels, { ids, titles, glyph, lang }).items.map((i) => i.label);
  assert.deepEqual(order('de'), ['Aero', 'Öste', 'Zulu VPN', 'Hearth', 'Plain tunnel', 'WireGuard']);
  assert.deepEqual(order('sv'), ['Aero', 'Zulu VPN', 'Öste', 'Hearth', 'Plain tunnel', 'WireGuard']);
});

test("a provider wears its brand's mark, and one without the app's glyph", () => {
  const { items } = catalogPicker(tunnels, { ids: ['zulu', 'wire'], titles, glyph, lang: 'en' });
  assert.deepEqual(items[0]!.mark, { svg: '<svg/>', tile: '#123456', ink: '#ffffff' });
  assert.equal(items[1]!.mark, 'glyph:wire');
});

test('the name, its kind and the search words carry over into the tile', () => {
  const { items } = catalogPicker(tunnels, { ids: ['aero', 'wire'], titles, glyph, lang: 'en' });
  assert.deepEqual(items[0], { id: 'aero', label: 'Aero', group: 'commercial', terms: ['aeronet'], mark: 'glyph:aero' });
  assert.equal(items[1]!.sub, 'Tunnel');
});

test("the app's own words win, and the catalog's name stays findable beside a translated one", () => {
  const { items } = catalogPicker(tunnels, {
    ids: ['plain', 'hearth'],
    titles,
    glyph,
    lang: 'de',
    own: (entry) => (entry.word ? { label: 'Einfacher Tunnel', hint: 'Ohne Anbieter.' } : undefined),
  });
  assert.deepEqual(items.map((i) => i.label), ['Hearth', 'Einfacher Tunnel']);
  assert.equal(items[1]!.hint, 'Ohne Anbieter.');
  assert.deepEqual(items[1]!.terms, ['Plain tunnel']);
});
