import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDay } from '../src/datePicker.ts';

test('a day reads in the language of the page', () => {
  assert.equal(formatDay('2026-11-14', 'en-GB'), '14 Nov 2026');
  assert.equal(formatDay('2026-11-14', 'de'), '14.11.2026');
});

test('a day stays the same day whatever the time zone of the machine', () => {
  assert.equal(formatDay('2026-01-01', 'en-GB'), '1 Jan 2026');
  assert.equal(formatDay('2026-12-31', 'en-GB'), '31 Dec 2026');
});
