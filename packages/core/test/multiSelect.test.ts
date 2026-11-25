import { test } from 'node:test';
import assert from 'node:assert/strict';
import { componentText } from '../src/componentTexts.ts';
import { MULTI_SELECT_TEXT, multiSelectMatches, multiSelectSearches, multiSelectWithout } from '../src/multiSelect.ts';

const LISTS = ['Photos', 'Videos', 'Raw files', 'junk'].map((l) => ({ value: l.toLowerCase(), label: l }));

test('a short list opens without a search, a long one with it', () => {
  assert.equal(multiSelectSearches(7), false);
  assert.equal(multiSelectSearches(8), true);
});

test('a caller can move the point where the search appears', () => {
  assert.equal(multiSelectSearches(3, 2), true);
  assert.equal(multiSelectSearches(20, 30), false);
});

test('the search finds a choice by any part of its name, in any case', () => {
  assert.deepEqual(multiSelectMatches(LISTS, 'O').map((o) => o.label), ['Photos', 'Videos']);
  assert.deepEqual(multiSelectMatches(LISTS, 'raw').map((o) => o.label), ['Raw files']);
});

test('an empty search keeps every choice in its order', () => {
  assert.deepEqual(multiSelectMatches(LISTS, '  '), LISTS);
});

test('removing a tag keeps the others in the order they were picked', () => {
  assert.deepEqual(multiSelectWithout(['junk', 'photos', 'videos'], 'photos'), ['junk', 'videos']);
});

test('a tag names what its remove button takes away', () => {
  assert.equal(MULTI_SELECT_TEXT.remove('Photos'), 'Remove Photos');
});

test('another language brings its own words', () => {
  const de = componentText('de').multiSelect;
  assert.notEqual(de.empty, MULTI_SELECT_TEXT.empty);
  assert.match(de.remove('Fotos'), /Fotos/);
});
