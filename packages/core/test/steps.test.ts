import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stepsKeyTarget } from '../src/steps.ts';

test('the arrows move along the row and wrap round', () => {
  assert.equal(stepsKeyTarget('ArrowRight', 0, 3, 'ltr'), 1);
  assert.equal(stepsKeyTarget('ArrowRight', 2, 3, 'ltr'), 0);
  assert.equal(stepsKeyTarget('ArrowLeft', 0, 3, 'ltr'), 2);
});

test('under a right-to-left language the arrows follow the reading direction', () => {
  assert.equal(stepsKeyTarget('ArrowLeft', 0, 3, 'rtl'), 1);
  assert.equal(stepsKeyTarget('ArrowRight', 0, 3, 'rtl'), 2);
});

test('Home and End go to the first and the last step', () => {
  assert.equal(stepsKeyTarget('Home', 2, 4, 'ltr'), 0);
  assert.equal(stepsKeyTarget('End', 0, 4, 'ltr'), 3);
});

test('any other key is left to the browser', () => {
  assert.equal(stepsKeyTarget('Enter', 1, 3, 'ltr'), null);
  assert.equal(stepsKeyTarget('ArrowDown', 1, 3, 'ltr'), null);
});
