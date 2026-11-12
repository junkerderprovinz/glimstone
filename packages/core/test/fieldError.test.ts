import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fieldErrorView } from '../src/fieldError.ts';

test('a field without an error says nothing about it and keeps its own description', () => {
  assert.deepEqual(fieldErrorView(undefined, 'f1', 'hint'), { invalid: undefined, describedBy: 'hint', errorId: undefined });
  assert.deepEqual(fieldErrorView('', 'f1'), { invalid: undefined, describedBy: undefined, errorId: undefined });
});

test('a field with an error is invalid and described by the error after its own description', () => {
  assert.deepEqual(fieldErrorView('Too long', 'f1'), { invalid: true, describedBy: 'f1-error', errorId: 'f1-error' });
  assert.deepEqual(fieldErrorView('Too long', 'f1', 'hint'), { invalid: true, describedBy: 'hint f1-error', errorId: 'f1-error' });
});
