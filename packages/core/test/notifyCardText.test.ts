import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { checkLocales, glossary } from '../../terms/index.mjs';
import type { NotifyCardText } from '../src/notifyCard.ts';
import { NOTIFY_CARD_LANGUAGES, notifyCardText } from '../src/notifyCardTexts.ts';
import { en } from '../src/notifyLocales/en.ts';

const dir = join(import.meta.dirname, '..', 'src', 'notifyLocales');
const languages = Object.keys(glossary.languages);
const DASHES = [0x2013, 0x2014];

async function table(lang: string): Promise<NotifyCardText> {
  const mod = await import(`../src/notifyLocales/${lang}.ts`);
  return mod[lang];
}

// Every string of a table by its path, such as "fields.smtpHost".
function strings(value: unknown, at = ''): [string, string][] {
  if (typeof value === 'string') return [[at, value]];
  return Object.entries(value as object).flatMap(([k, v]) => strings(v, at ? `${at}.${k}` : k));
}

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test('every language of the glossary has its table, and no other', () => {
  const files = readdirSync(dir).filter((f) => f.endsWith('.ts')).map((f) => f.replace('.ts', '')).sort();
  assert.deepEqual(files, [...languages].sort());
  assert.deepEqual([...NOTIFY_CARD_LANGUAGES].sort(), [...languages].sort());
});

for (const lang of languages) {
  test(`${lang}: every sentence of the English table, with the same placeholders`, async () => {
    const t = new Map(strings(await table(lang)));
    const source = strings(en);
    assert.deepEqual([...t.keys()].sort(), source.map(([k]) => k).sort());
    for (const [key, value] of source) assert.deepEqual(placeholders(t.get(key)!), placeholders(value), `${lang}.${key}`);
  });

  test(`${lang}: no long dash between words, and no app's name`, async () => {
    const all = JSON.stringify(await table(lang));
    assert.ok(![...all].some((c) => DASHES.includes(c.codePointAt(0)!)));
    assert.doesNotMatch(all, /BombVault/i);
  });
}

test('the tables keep to the glossary', () => {
  assert.deepEqual(checkLocales([dir]), []);
});

test('a regional language takes its base table, and an unknown one English', () => {
  assert.equal(notifyCardText('de-AT').add, 'Kanal hinzufügen');
  assert.equal(notifyCardText('xx').add, en.add);
});
