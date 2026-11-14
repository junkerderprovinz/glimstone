import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TIMER_TEXT } from '../src/timer.ts';

test('the spoken time names each unit that is not zero', () => {
  assert.equal(TIMER_TEXT.spoken(1, 4, 30), '1 hour, 4 minutes, 30 seconds');
  assert.equal(TIMER_TEXT.spoken(0, 0, 1), '1 second');
  assert.equal(TIMER_TEXT.spoken(2, 0, 0), '2 hours, 0 seconds');
});
