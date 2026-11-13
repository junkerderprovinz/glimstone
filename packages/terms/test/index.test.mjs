import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { checkLocales, glossary } from '../index.mjs';

const app = fileURLToPath(new URL('fixtures/app', import.meta.url));

test('checks an app directory against the glossary in one call', () => {
  const found = checkLocales([app]);
  assert.deepEqual(found.map((v) => `${v.lang} ${v.key} ${v.term} ${v.kind}`), [
    'de nav.relay relay forbidden',
    'fr backup.run backup missing',
  ]);
});

test('takes the ignore list and the terms as options', () => {
  assert.deepEqual(checkLocales([app], { ignore: ['de:nav.relay'], terms: ['relay'] }), []);
});

test('hands out the glossary itself', () => {
  assert.equal(glossary.terms.relay.de.singular, 'Relay');
  assert.equal(glossary.terms.backup.de.singular, 'Sicherung');
  assert.deepEqual(glossary.terms.permission.de, { singular: 'Berechtigung', plural: 'Berechtigungen', gender: 'f', stems: ['berechtigung'] });
});
