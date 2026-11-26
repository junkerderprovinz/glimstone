import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RAINBOW } from '../src/appearance.ts';
import { rainbowSwatches } from '../src/colorPicker.ts';

test('the ready colours are the rainbow palette in its order, as hex', () => {
  assert.deepEqual(rainbowSwatches(), RAINBOW.map((c) => c.toLowerCase()));
});
