import { test } from 'node:test';
import assert from 'node:assert/strict';
import { badgeClassName } from '../src/badge.ts';

const classes = (options: Parameters<typeof badgeClassName>[0]) => badgeClassName(options).split(' ');

test('each form names its own corners', () => {
  for (const form of ['rounded', 'square', 'pill', 'circle'] as const) {
    assert.ok(classes({ form }).includes(`glim-badge--${form}`), form);
  }
});

test('a badge without a form follows the shape setting', () => {
  assert.ok(!classes({}).some((c) => /^glim-badge--(rounded|square|pill|circle)$/.test(c)));
});

test('a circle holds one glyph in a square box', () => {
  assert.ok(classes({ form: 'circle' }).includes('glim-badge--icon-only'));
});

test('the old shape circle still makes an icon-only badge and nothing more', () => {
  const old = classes({ shape: 'circle' });
  assert.ok(old.includes('glim-badge--icon-only'));
  assert.ok(!old.includes('glim-badge--circle'));
});
