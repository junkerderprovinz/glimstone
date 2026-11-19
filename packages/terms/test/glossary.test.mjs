import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkTables, matchesForbidden, matchesStems } from '../check.mjs';

const glossary = JSON.parse(readFileSync(new URL('../terms.json', import.meta.url), 'utf8'));
const { languages, terms } = glossary;

const SHIPPED = 'en de ar bg ca cs da el es et eu fa fi fr gl he hi hr hu id is it ja ko lt lv ms nl no pl pt ro ru sk sl sr sv th tr uk vi zh'.split(' ');
const MODES = ['start', 'inside', 'whole'];

const entries = function* () {
  for (const [id, term] of Object.entries(terms)) {
    for (const lang of SHIPPED) yield [id, lang, term[lang], term];
  }
};

test('covers the 42 languages the apps ship', () => {
  assert.deepEqual(Object.keys(languages).sort(), [...SHIPPED].sort());
  for (const [code, lang] of Object.entries(languages)) {
    assert.ok(lang.name, code);
    assert.ok(MODES.includes(lang.stems), `${code} matches by ${lang.stems}`);
  }
});

test('gives every term a definition and a word in every language', () => {
  for (const [id, term] of Object.entries(terms)) assert.ok(term.definition, id);
  for (const [id, lang, entry] of entries()) {
    assert.ok(entry, `${id} has no ${lang}`);
    assert.ok(entry.singular && entry.plural, `${id} ${lang} needs a singular and a plural`);
  }
});

test('marks the gender wherever the language has one', () => {
  for (const [id, lang, entry] of entries()) {
    const genders = languages[lang].genders;
    if (genders.length) assert.ok(genders.includes(entry.gender), `${id} ${lang}: gender ${entry.gender} is not one of ${genders}`);
    else assert.equal(entry.gender, undefined, `${id} ${lang} has no genders`);
  }
});

test('finds each word through its own stems', () => {
  for (const [id, lang, entry, term] of entries()) {
    if (!term.en.stems) {
      assert.equal(entry.stems, undefined, `${id} ${lang}`);
      continue;
    }
    assert.ok(entry.stems?.length, `${id} ${lang} has no stems`);
    const mode = entry.stemsAt ?? languages[lang].stems;
    assert.ok(MODES.includes(mode), `${id} ${lang}`);
    for (const form of [entry.singular, entry.plural]) {
      assert.ok(matchesStems(form, entry.stems, mode), `${id} ${lang}: "${form}" is not found by ${entry.stems}`);
    }
  }
});

test('forbids no variant that the word itself contains', () => {
  for (const [id, lang, entry] of entries()) {
    for (const word of entry.forbidden ?? []) {
      for (const form of [entry.singular, entry.plural]) {
        assert.equal(matchesForbidden(form, word), false, `${id} ${lang}: "${form}" holds the forbidden "${word}"`);
      }
    }
  }
});

// A term built from others, such as sign-in service, has to carry their
// words too, or the check would fault the glossary's own translation.
test('keeps the words of every term to the whole glossary', () => {
  const tables = {};
  for (const lang of SHIPPED) {
    tables[lang] = {};
    for (const [id, term] of Object.entries(terms)) {
      for (const form of ['singular', 'plural']) {
        tables[lang][`${id}.${form}`] = { value: term[lang][form], file: `${lang}.json`, line: 1 };
      }
    }
  }
  const found = checkTables(tables, { glossary });
  assert.deepEqual(found.map((v) => `${v.lang} ${v.key} ${v.term} ${v.kind}`), []);
});

test('keeps 2FA out of every language', () => {
  for (const lang of SHIPPED) {
    assert.ok(terms.twoFactor[lang].forbidden.some((word) => matchesForbidden('2FA', word)), lang);
  }
});

test('reads every English word whole, singular and plural', () => {
  for (const [id, term] of Object.entries(terms)) {
    if (!term.en.stems) continue;
    assert.ok(term.en.stems.includes(term.en.singular) && term.en.stems.includes(term.en.plural), id);
  }
});
