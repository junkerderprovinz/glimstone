import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { fakeDocument } from './fakeDocument.ts';
import { applyOled, darkShowing, resolvesDark, storedOled, watchDarkShowing } from '../src/theme.ts';

let root: ReturnType<typeof fakeDocument>;
beforeEach(() => {
  root = fakeDocument();
});

test('a chosen theme wins over the system', () => {
  assert.equal(resolvesDark('dark', false), true);
  assert.equal(resolvesDark('light', true), false);
});

test('with no theme chosen the system decides', () => {
  assert.equal(resolvesDark(null, true), true);
  assert.equal(resolvesDark(null, false), false);
});

test('darkShowing reads the root and the system', () => {
  root.setSystemDark(false);
  assert.equal(darkShowing(), false);
  document.documentElement.setAttribute('data-theme', 'dark');
  assert.equal(darkShowing(), true);
});

test('the watcher hears the system and the theme attribute, and only real changes', () => {
  const seen: boolean[] = [];
  const stop = watchDarkShowing((dark) => seen.push(dark));
  root.setSystemDark(false);
  root.setSystemDark(false);
  document.documentElement.setAttribute('data-theme', 'dark');
  document.documentElement.setAttribute('data-oled', '');
  stop();
  root.setSystemDark(true);
  document.documentElement.setAttribute('data-theme', 'light');
  assert.deepEqual(seen, [false, true]);
});

test('OLED sets the attribute on and takes it away off', () => {
  applyOled(true);
  assert.equal(root.attrs.get('data-oled'), '');
  applyOled(false);
  assert.equal(root.attrs.has('data-oled'), false);
});

test('OLED is remembered on this device', () => {
  assert.equal(storedOled(), false);
  applyOled(true);
  assert.equal(storedOled(), true);
  applyOled(false);
  assert.equal(storedOled(), false);
});
