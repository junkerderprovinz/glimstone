import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogPicker, type Catalog } from '../src/catalog.ts';
import { CAPTCHA_PROVIDERS } from '../src/captchaProviders.ts';
import { DOWNLOAD_PROVIDERS } from '../src/downloadProviders.ts';
import { IDENTITY_PROVIDERS } from '../src/identityProviders.ts';
import { MCP_PROVIDERS } from '../src/mcpProviders.ts';
import { NOTIFY_PROVIDERS } from '../src/notifyProviders.ts';
import { REGISTRY_PROVIDERS } from '../src/registryProviders.ts';
import { STORAGE_PROVIDERS } from '../src/storageProviders.ts';
import { TRANSFER_PROVIDERS } from '../src/transferProviders.ts';
import { VPN_PROVIDERS } from '../src/vpnProviders.ts';

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
    { id: 'any', name: 'Any server', group: 'protocol', glyph: 'IconLink', word: true, last: true },
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

test("a group's entry in the titles can bring a badge and a hint for its eyebrow's line", () => {
  const rated = {
    ...titles,
    commercial: { title: 'Services', badge: { label: 'Best fit', tone: 'ok' as const }, hint: 'Hosted for you.' },
  };
  const { groups } = catalogPicker(tunnels, { ids: ['wire', 'hearth', 'zulu'], titles: rated, glyph, lang: 'en' });
  assert.deepEqual(groups[0], { id: 'commercial', title: 'Services', badge: { label: 'Best fit', tone: 'ok' }, hint: 'Hosted for you.' });
  assert.deepEqual(groups[1], { id: 'selfhosted', title: 'Your own' });
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

test('the catch-all a catalog marks last comes to the app marked last, unless its own words say otherwise', () => {
  const ids = ['any', 'wire', 'plain'] as const;
  const marked = catalogPicker(tunnels, { ids, titles, glyph, lang: 'en' }).items;
  assert.deepEqual(marked.filter((i) => i.last).map((i) => i.id), ['any']);
  const own = catalogPicker(tunnels, { ids, titles, glyph, lang: 'en', own: (e) => (e.id === 'any' ? { last: false } : undefined) }).items;
  assert.equal(own.find((i) => i.id === 'any')!.last, false);
});

test('a shared catalog keeps at most one catch-all in a group, and the ones that take anything stand last', () => {
  const catalogs: Catalog[] = [CAPTCHA_PROVIDERS, DOWNLOAD_PROVIDERS, IDENTITY_PROVIDERS, MCP_PROVIDERS, NOTIFY_PROVIDERS, REGISTRY_PROVIDERS, STORAGE_PROVIDERS, TRANSFER_PROVIDERS, VPN_PROVIDERS];
  for (const catalog of catalogs) {
    for (const group of catalog.groups) {
      assert.ok(catalog.entries.filter((e) => e.group === group && e.last).length <= 1, group);
    }
  }
  const last = (catalog: Catalog) => catalog.entries.filter((e) => e.last).map((e) => e.id);
  assert.deepEqual(last(STORAGE_PROVIDERS), ['s3']);
  assert.deepEqual(last(VPN_PROVIDERS), ['custom']);
  assert.deepEqual(last(NOTIFY_PROVIDERS), ['webhook']);
  assert.deepEqual(last(MCP_PROVIDERS), ['other']);
  assert.deepEqual(last(REGISTRY_PROVIDERS), ['other']);
});
