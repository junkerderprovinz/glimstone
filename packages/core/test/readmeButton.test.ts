import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readmePartLabel, readmeUnitClass } from '../src/readmeButton.ts';

test('a part is named by its name and its second line', () => {
  assert.equal(readmePartLabel({ name: 'Windows', sub: 'x64' }, 'x64'), 'Windows x64');
});

test('a part without a second line is named by its name alone', () => {
  assert.equal(readmePartLabel({ name: 'Docs' }, undefined), 'Docs');
});

test('a segment with a label is named by the label, not by its one word', () => {
  assert.equal(readmePartLabel({ name: 'ARM', label: 'Windows ARM' }, undefined), 'Windows ARM');
});

test('a Flatpak unit lights up in the Flatpak tile', () => {
  assert.match(readmeUnitClass('flatpak', 2, false, false), /\bglim-tile-flatpak\b/);
});

test('MOS, ZimaOS and Umbrel units light up in their own tiles', () => {
  assert.match(readmeUnitClass('mos', 1, false, false), /\bglim-tile-mos\b/);
  assert.match(readmeUnitClass('zimaos', 1, false, false), /\bglim-tile-zimaos\b/);
  assert.match(readmeUnitClass('umbrel', 1, false, false), /\bglim-tile-umbrel\b/);
});
