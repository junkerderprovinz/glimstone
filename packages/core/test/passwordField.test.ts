import { test } from 'node:test';
import assert from 'node:assert/strict';
import { passwordConfirmView } from '../src/passwordField.ts';

test('an empty password asks for nothing again and cannot be set', () => {
  assert.deepEqual(passwordConfirmView('', ''), { shown: false, mismatch: false, confirmed: false });
});

test('the second field stands from the first character, without a complaint while it is empty', () => {
  assert.deepEqual(passwordConfirmView('h', ''), { shown: true, mismatch: false, confirmed: false });
});

test('a repetition that differs is a mismatch and keeps the password from being set', () => {
  assert.deepEqual(passwordConfirmView('hunter22', 'hunter2'), { shown: true, mismatch: true, confirmed: false });
  assert.deepEqual(passwordConfirmView('hunter22', 'Hunter22'), { shown: true, mismatch: true, confirmed: false });
});

test('the same password twice may be set', () => {
  assert.deepEqual(passwordConfirmView('hunter22', 'hunter22'), { shown: true, mismatch: false, confirmed: true });
});

test('a repetition left over from an emptied first field hides with it', () => {
  assert.deepEqual(passwordConfirmView('', 'hunter22'), { shown: false, mismatch: false, confirmed: false });
});
