import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addToast, pauseToast, resumeToast, toastPoliteness, TOAST_DURATION_MS } from '../src/toastEngine.ts';

const undo = { label: 'Undo', onClick: () => {} };

test('a toast without an action leaves after the fixed duration', () => {
  const [t] = addToast([], { id: 'a', message: 'Saved', severity: 'success' }, 1000);
  assert.equal(t!.expiresAt, 1000 + TOAST_DURATION_MS);
});

test('a toast with an action stays until it is dismissed', () => {
  const list = addToast([], { id: 'a', message: 'Moved to the trash', severity: 'success', action: undo }, 1000);
  assert.equal(list[0]!.expiresAt, null);
  const touched = resumeToast(pauseToast(list, 'a', 2000), 'a', 3000);
  assert.equal(touched[0]!.expiresAt, null);
});

test('the cap drops running toasts before one that waits for its action', () => {
  let list = addToast([], { id: 'keep', message: 'Moved', severity: 'success', action: undo }, 0, TOAST_DURATION_MS, 2);
  list = addToast(list, { id: 'old', message: 'Saved', severity: 'success' }, 1, TOAST_DURATION_MS, 2);
  list = addToast(list, { id: 'new', message: 'Saved', severity: 'success' }, 2, TOAST_DURATION_MS, 2);
  assert.deepEqual(list.map((t) => t.id), ['keep', 'new']);
});

test('only a failure interrupts, every other toast is read out politely', () => {
  assert.equal(toastPoliteness('fail'), 'assertive');
  assert.equal(toastPoliteness('warn'), 'polite');
  assert.equal(toastPoliteness('success'), 'polite');
});
