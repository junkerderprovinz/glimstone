import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readLocaleText } from '../locales.mjs';

const entries = (table) => Object.fromEntries(table.entries.map((e) => [e.key, e.value]));
const fixture = (name) => new URL(`fixtures/${name}`, import.meta.url);

test('reads each table of a source file under its constant name', () => {
  const tables = readLocaleText(`
export const en = {
  'nav.jobs': 'Jobs',
  "nav.relay": "Relay",
};
export type Key = keyof typeof en;
export const de: Translations = {
  'nav.jobs': 'Aufträge',
  'nav.relay': 'Relay',
};
`);
  assert.deepEqual(tables.map((t) => t.name), ['en', 'de']);
  assert.deepEqual(entries(tables[1]), { 'nav.jobs': 'Aufträge', 'nav.relay': 'Relay' });
});

test('takes a value that starts on the line after its key', () => {
  const [table] = readLocaleText(`const fr = {
  "update.afterBackupOrphans":
    "Après la sauvegarde",
};`);
  assert.deepEqual(entries(table), { 'update.afterBackupOrphans': 'Après la sauvegarde' });
});

test('decodes escapes and joins concatenated strings', () => {
  const [table] = readLocaleText(readFileSync(fixture('escapes.ts'), 'utf8'));
  assert.deepEqual(entries(table), { a: "L'instance\n", b: 'été là', c: 'sans \\ souci' });
});

test('ignores quotes inside comments', () => {
  const [table] = readLocaleText(`const de = {
  // it's the relay's card
  /* "quoted" and 'odd */
  'x': 'eins', // don't
};`);
  assert.deepEqual(entries(table), { x: 'eins' });
});

test('skips values that are not plain text', () => {
  const [table] = readLocaleText(`const de = {
  ...base,
  'a': (n) => n + ' Sicherungen',
  'b': \`\${n} Sicherungen\`,
  'c': SHARED,
  'd': 'bleibt',
};`);
  assert.deepEqual(entries(table), { d: 'bleibt' });
});

test('flattens nested objects into dotted keys', () => {
  const [table] = readLocaleText(`const en = { nav: { jobs: 'Jobs', 'relay.title': 'Relay' }, done: 'Done' };`);
  assert.deepEqual(entries(table), { 'nav.jobs': 'Jobs', 'nav.relay.title': 'Relay', done: 'Done' });
});

test('records the line each key sits on', () => {
  const [table] = readLocaleText(`const en = {\n  'a': 'A',\n\n  'b':\n    'B',\n};`);
  assert.deepEqual(table.entries.map((e) => [e.key, e.line]), [['a', 2], ['b', 4]]);
});

test('reads a JSON file and leaves out the metadata of an ARB file', () => {
  const [table] = readLocaleText(`{
  "@@locale": "fr",
  "relayTitle": "Relais",
  "@relayTitle": { "description": "Card title" },
  "nav": { "jobs": "Tâches" }
}`, { json: true });
  assert.equal(table.name, null);
  assert.deepEqual(entries(table), { relayTitle: 'Relais', 'nav.jobs': 'Tâches' });
  assert.equal(table.entries[0].line, 3);
});
