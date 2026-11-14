import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { checkLocales, glossary } from '../../terms/index.mjs';
import type { ComponentWords } from '../src/componentWords.ts';
import { COMPONENT_LANGUAGES, componentText } from '../src/componentTexts.ts';
import { en } from '../src/componentLocales/en.ts';
import { PAGINATION_TEXT } from '../src/pagination.ts';
import { RATING_TEXT } from '../src/rating.ts';
import { TIMER_TEXT } from '../src/timer.ts';
import { FILE_UPLOAD_TEXT } from '../src/fileUpload.ts';

const dir = join(import.meta.dirname, '..', 'src', 'componentLocales');
const languages = Object.keys(glossary.languages);

async function table(lang: string): Promise<ComponentWords> {
  const mod = await import(`../src/componentLocales/${lang}.ts`);
  return mod[lang];
}

// The sentences that count, by component and key: their forms follow the
// language's plural rules instead of the English table's two.
const PLURALS: [keyof ComponentWords, string][] = [
  ['rating', 'star'],
  ['timer', 'hours'],
  ['timer', 'minutes'],
  ['timer', 'seconds'],
];
const isPlural = (component: string, key: string) => PLURALS.some(([c, k]) => c === component && k === key);
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const DASHES = [0x2013, 0x2014];

function categories(lang: string): Set<string> {
  const rules = new Intl.PluralRules(lang);
  const counts = [...Array(220).keys(), 1000, 1001, 100000, 1000000];
  return new Set(counts.map((n) => rules.select(n)));
}

// Every sentence of a table as "component.key.sub" with its text, the plural
// forms left out, since their keys differ from language to language.
function sentences(words: ComponentWords): Map<string, string> {
  const out = new Map<string, string>();
  const walk = (value: unknown, path: string[]) => {
    if (typeof value === 'string') return void out.set(path.join('.'), value);
    if (path.length === 2 && isPlural(path[0]!, path[1]!)) return void out.set(path.join('.'), 'plural');
    for (const [k, v] of Object.entries(value as object)) walk(v, [...path, k]);
  };
  walk(words, []);
  return out;
}

test('every language of the glossary has its table, and no other', () => {
  const files = readdirSync(dir).filter((f) => f.endsWith('.ts')).map((f) => f.replace('.ts', '')).sort();
  assert.deepEqual(files, [...languages].sort());
  assert.deepEqual([...COMPONENT_LANGUAGES].sort(), [...languages].sort());
});

const english = sentences(en);

for (const lang of languages) {
  test(`${lang}: every sentence of every component, with the same placeholders`, async () => {
    const own = sentences(await table(lang));
    assert.deepEqual([...own.keys()].sort(), [...english.keys()].sort());
    for (const [key, text] of english) {
      if (text === 'plural') continue;
      assert.deepEqual(placeholders(own.get(key)!), placeholders(text), `${lang}.${key}`);
    }
  });

  test(`${lang}: every plural form a count needs, each with its placeholders`, async () => {
    const t = await table(lang);
    for (const [component, key] of PLURALS) {
      const forms = (t[component] as unknown as Record<string, Record<string, string>>)[key]!;
      const wanted = placeholders((en[component] as unknown as Record<string, Record<string, string>>)[key]!.other!);
      assert.ok(forms.other !== undefined, `${lang}.${component}.${key}.other`);
      for (const c of categories(lang)) {
        assert.ok(forms[c] !== undefined, `${lang}.${component}.${key}.${c}`);
        assert.deepEqual(placeholders(forms[c]!), wanted, `${lang}.${component}.${key}.${c}`);
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

test('the English defaults are the English table', () => {
  const t = componentText('en');
  assert.equal(t.pagination.page(3, 20), PAGINATION_TEXT.page(3, 20));
  assert.equal(t.rating.star(3, 5), RATING_TEXT.star(3, 5));
  assert.equal(t.timer.spoken(1, 4, 30), TIMER_TEXT.spoken(1, 4, 30));
  assert.equal(t.fileUpload.refused('a.png', 'FILE_TOO_LARGE'), FILE_UPLOAD_TEXT.refused('a.png', 'FILE_TOO_LARGE'));
});

test('a sentence fills its values in the language, its digits too', () => {
  assert.equal(componentText('de').pagination.page(3, 20), 'Seite 3 von 20');
  assert.equal(componentText('fa').pagination.page(3, 20), 'صفحهٔ ۳ از ۲۰');
  assert.equal(componentText('pl').timer.spoken(0, 2, 5), '2 minuty i 5 sekund');
  assert.equal(componentText('ru').rating.star(3, 5), '3 из 5 звёзд');
});

test('a regional language takes its base table, and an unknown one English', () => {
  assert.equal(componentText('de-AT').steps.finish, 'Abschließen');
  assert.equal(componentText('pt-BR').steps.back, 'Voltar');
  assert.equal(componentText('xx').steps.finish, en.steps.finish);
});

test("an app's own words win over the table", () => {
  const words = { ...componentText('de').steps, finish: 'Speichern' };
  assert.equal(words.finish, 'Speichern');
  assert.equal(words.back, 'Zurück');
});
