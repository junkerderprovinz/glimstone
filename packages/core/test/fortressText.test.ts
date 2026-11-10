import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { checkLocales, glossary } from '../../terms/index.mjs';
import { fill, listOf, plural, type FortressText } from '../src/fortressText.ts';
import { FORTRESS_LANGUAGES, fortressText } from '../src/fortressTexts.ts';
import { en } from '../src/fortressLocales/en.ts';

const dir = join(import.meta.dirname, '..', 'src', 'fortressLocales');
const languages = Object.keys(glossary.languages);

async function table(lang: string): Promise<FortressText> {
  const mod = await import(`../src/fortressLocales/${lang}.ts`);
  return mod[lang];
}

test('placeholders are filled by name, and an unknown one stays', () => {
  assert.equal(fill('{app} on {device} {x}', { app: 'Alpha', device: 'Atlas' }), 'Alpha on Atlas {x}');
});

test('a count takes the plural form of its language', () => {
  assert.equal(plural('en', { one: '{count} app', other: '{count} apps' }, 1), '1 app');
  assert.equal(plural('en', { one: '{count} app', other: '{count} apps' }, 4), '4 apps');
  const pl = { one: '{count} aplikacja', few: '{count} aplikacje', many: '{count} aplikacji', other: '{count} aplikacji' };
  assert.equal(plural('pl', pl, 3), '3 aplikacje');
  assert.equal(plural('pl', pl, 5), '5 aplikacji');
});

test('a form the language lacks falls back to other', () => {
  assert.equal(plural('ar', { other: '{count} x' }, 2), '2 x');
});

test('a list is joined the way its language joins one', () => {
  assert.equal(listOf('en', ['Atlas', 'Pocket', 'Studio']), 'Atlas, Pocket, and Studio');
  assert.equal(listOf('de', ['Atlas', 'Pocket']), 'Atlas und Pocket');
});

test('every language of the glossary has its table, and no other', () => {
  const files = readdirSync(dir).filter((f) => f.endsWith('.ts')).map((f) => f.replace('.ts', '')).sort();
  assert.deepEqual(files, [...languages].sort());
  assert.deepEqual([...FORTRESS_LANGUAGES].sort(), [...languages].sort());
});

function shape(value: unknown): unknown {
  if (typeof value === 'string') return 'text';
  return Object.fromEntries(Object.keys(value as object).sort().map((k) => [k, shape((value as Record<string, unknown>)[k])]));
}

const PLURALS = ['othersApps', 'othersDevices', 'instanceCount'] as const;
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const DASHES = [0x2013, 0x2014];

// The integers a count can be, and so every form a language needs for them.
function categories(lang: string): Set<string> {
  const rules = new Intl.PluralRules(lang);
  const counts = [...Array(220).keys(), 1000, 1001, 100000, 1000000];
  return new Set(counts.map((n) => rules.select(n)));
}

for (const lang of languages) {
  test(`${lang}: every sentence of the English table, with the same placeholders`, async () => {
    const t = await table(lang);
    assert.ok(t, `fortressLocales/${lang}.ts exports ${lang}`);
    const flat = { ...t, ...Object.fromEntries(PLURALS.map((k) => [k, { other: '' }])) };
    const enFlat = { ...en, ...Object.fromEntries(PLURALS.map((k) => [k, { other: '' }])) };
    assert.deepEqual(shape(flat), shape(enFlat));
    for (const [key, value] of Object.entries(t)) {
      if (PLURALS.includes(key as never)) continue;
      if (typeof value === 'string') assert.deepEqual(placeholders(value), placeholders(en[key as keyof FortressText] as string), `${lang}.${key}`);
    }
  });

  test(`${lang}: every plural form a count needs, each with its count`, async () => {
    const t = await table(lang);
    for (const key of PLURALS) {
      for (const c of categories(lang)) {
        const form = (t[key] as Record<string, string>)[c];
        assert.ok(form !== undefined, `${lang}.${key}.${c}`);
        assert.ok(form.includes('{count}'), `${lang}.${key}.${c} keeps {count}`);
      }
    }
  });

  test(`${lang}: no long dash between words`, async () => {
    const all = JSON.stringify(await table(lang));
    assert.ok(![...all].some((c) => DASHES.includes(c.codePointAt(0)!)));
  });
}

test('the tables keep to the glossary', () => {
  assert.deepEqual(checkLocales([dir]), []);
});

test('a regional language takes its base table, and an unknown one English', () => {
  assert.equal(fortressText('de-AT').leave, 'Festung verlassen');
  assert.equal(fortressText('xx').leave, en.leave);
});
