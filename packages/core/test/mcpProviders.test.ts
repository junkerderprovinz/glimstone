import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MCP_PROVIDERS } from '../src/mcpProviders.ts';
import { MCP_MARKS } from '../src/mcpMarks.ts';
import { contrastRatio } from '../src/contrast.ts';
import { catalogPicker } from '../src/catalog.ts';

const entries = MCP_PROVIDERS.entries;
const glyphs = new Set((JSON.parse(readFileSync(new URL('../glyphs.json', import.meta.url), 'utf8')) as { name: string }[]).map((g) => g.name));

test('chat apps come first, then the coding tools, then automation', () => {
  assert.deepEqual(MCP_PROVIDERS.groups, ['chat', 'models', 'web', 'editor', 'extension', 'terminal', 'automation']);
});

test('every id is unique, lower case and safe to store', () => {
  const ids = entries.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, id);
});

test('the clients the apps already store keep their ids', () => {
  const ids = new Set<string>(entries.map((e) => e.id));
  for (const id of ['claude-code', 'claude-desktop', 'copilot-cli', 'copilot', 'codex', 'vibe', 'roo', 'lechat', 'claude', 'other']) {
    assert.ok(ids.has(id), id);
  }
});

test('every client stands in a group the catalog knows', () => {
  for (const e of entries) assert.ok(MCP_PROVIDERS.groups.includes(e.group), `${e.id}: ${e.group}`);
});

test('every group has clients', () => {
  for (const g of MCP_PROVIDERS.groups) assert.ok(entries.some((e) => e.group === g), g);
});

test('a client wears a mark from the set or names a glyph, never both and never neither', () => {
  const marks = new Set(Object.values(MCP_MARKS));
  for (const e of entries) {
    assert.ok(!!e.mark !== !!e.glyph, e.id);
    if (e.mark) assert.ok(marks.has(e.mark), e.id);
    if (e.glyph) assert.ok(glyphs.has(e.glyph), `${e.id}: ${e.glyph}`);
  }
});

test('every mark in the set is worn by a client', () => {
  const worn = new Set(entries.map((e) => e.mark));
  for (const [id, mark] of Object.entries(MCP_MARKS)) assert.ok(worn.has(mark), id);
});

test('every mark has its tile colour and an ink that reaches 2:1 on it', () => {
  for (const e of entries) {
    if (!e.mark) continue;
    assert.match(e.mark.tile ?? '', /^#[0-9a-f]{6}$/, e.id);
    assert.match(e.mark.ink ?? '', /^#[0-9a-f]{6}$/, e.id);
    assert.ok(contrastRatio(e.mark.ink!, e.mark.tile!) >= 2, e.id);
  }
});

test('only the client that takes any address is a word the app translates', () => {
  assert.deepEqual(entries.filter((e) => e.word).map((e) => e.id), ['other']);
  assert.equal(entries.find((e) => e.id === 'other')?.group, MCP_PROVIDERS.groups.at(-1));
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
  const titles = {
    chat: 'Chat apps',
    models: 'Local models',
    web: 'Web chats',
    editor: 'Editors',
    extension: 'VS Code extensions',
    terminal: 'Terminals',
    automation: 'Automation',
  };
  const { items, groups } = catalogPicker(MCP_PROVIDERS, { ids: entries.map((e) => e.id), titles, glyph: (e) => e.glyph, lang: 'en' });
  assert.equal(items.length, entries.length);
  assert.deepEqual(groups.map((g) => g.title), Object.values(titles));
});
