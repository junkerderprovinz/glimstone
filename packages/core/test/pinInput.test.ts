import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pinCells } from '../src/pinInput.ts';

test('a code fills the boxes from the start and leaves the rest empty', () => {
  assert.deepEqual(pinCells('12', 4), ['1', '2', '', '']);
});

test('a code longer than the boxes is cut to them', () => {
  assert.deepEqual(pinCells('1234567', 6), ['1', '2', '3', '4', '5', '6']);
});

test('a character outside the basic plane takes one box', () => {
  assert.deepEqual(pinCells('𝟙2', 3), ['𝟙', '2', '']);
});
