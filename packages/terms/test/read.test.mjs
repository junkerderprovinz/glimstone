import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';
import { readLocales, languageOf } from '../read.mjs';

const fixtures = fileURLToPath(new URL('fixtures/', import.meta.url));
const languages = { en: {}, de: {}, fr: {}, pt: {} };

test('names a table by its constant, or else by its file', () => {
  assert.equal(languageOf('de', 'web/i18n.ts', languages), 'de');
  assert.equal(languageOf('translations', 'locales/fr.ts', languages), 'fr');
  assert.equal(languageOf(null, 'lib/l10n/app_pt_BR.arb', languages), 'pt');
  assert.equal(languageOf(null, 'messages/de-AT.json', languages), 'de');
  assert.equal(languageOf('LOADERS', 'locales/index.ts', languages), null);
});

test('reads every language a directory holds, with file and line', () => {
  const tables = readLocales([join(fixtures, 'app')], languages);
  assert.deepEqual(Object.keys(tables).sort(), ['de', 'en', 'fr']);
  const relay = tables.fr['nav.relay'];
  assert.equal(relay.value, 'Relais');
  assert.equal(relative(fixtures, relay.file).replaceAll('\\', '/'), 'app/locales/fr.ts');
  assert.equal(relay.line, 4);
  assert.equal(tables.de['backup.run'].value, 'Sicherung starten');
});

test('reads ARB files by their names', () => {
  const tables = readLocales([join(fixtures, 'arb')], languages);
  assert.deepEqual(Object.keys(tables).sort(), ['de', 'en']);
  assert.deepEqual(Object.keys(tables.en), ['relayTitle']);
});

test('leaves out test files', () => {
  const tables = readLocales([join(fixtures, 'app')], languages);
  assert.equal(Object.values(tables).some((t) => Object.values(t).some((e) => /\.test\./.test(e.file))), false);
});
