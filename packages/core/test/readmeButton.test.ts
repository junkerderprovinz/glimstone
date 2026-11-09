import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readmePartLabel } from '../src/readmeButton.ts';

test('a part is named by its name and its second line', () => {
  assert.equal(readmePartLabel({ name: 'Windows', sub: 'x64' }, 'x64'), 'Windows x64');
});

test('a part without a second line is named by its name alone', () => {
  assert.equal(readmePartLabel({ name: 'Docs' }, undefined), 'Docs');
});

test('a segment with a label is named by the label, not by its one word', () => {
  assert.equal(readmePartLabel({ name: 'ARM', label: 'Windows ARM' }, undefined), 'Windows ARM');
});
