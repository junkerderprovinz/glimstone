import { test } from 'node:test';
import assert from 'node:assert/strict';
import { endOption } from '../src/selectModel.ts';

const all = [
  { value: 'off', label: 'Off', disabled: true },
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'year', label: 'Yearly', disabled: true },
];

test('Home and End land on the first and last option that can be chosen', () => {
  assert.equal(endOption(all, 'Home'), 'day');
  assert.equal(endOption(all, 'End'), 'week');
});

test('any other key leaves the list to the machine', () => {
  assert.equal(endOption(all, 'ArrowDown'), undefined);
  assert.equal(endOption([], 'Home'), undefined);
});
