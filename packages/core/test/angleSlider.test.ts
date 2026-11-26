import { test } from 'node:test';
import assert from 'node:assert/strict';
import { angleKeyTarget } from '../src/angleSlider.ts';

test('Home turns the dial to 0', () => {
  assert.equal(angleKeyTarget('Home', 15), 0);
  assert.equal(angleKeyTarget('Home', 1), 0);
});

test('End turns the dial to the last step short of a full turn', () => {
  assert.equal(angleKeyTarget('End', 15), 345);
  assert.equal(angleKeyTarget('End', 1), 359);
  assert.equal(angleKeyTarget('End', 7), 357);
  assert.equal(angleKeyTarget('End', 90), 270);
});

test('every other key is left to the dial', () => {
  assert.equal(angleKeyTarget('ArrowRight', 15), undefined);
  assert.equal(angleKeyTarget('PageUp', 15), undefined);
});
