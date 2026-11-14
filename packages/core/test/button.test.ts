import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buttonView, type ButtonInput } from '../src/button.ts';

const button = (input: Partial<ButtonInput>): ButtonInput => ({
  label: 'Success',
  mode: 'reactive',
  hasGlyph: true,
  tone: 'ok',
  variant: 'default',
  disabled: false,
  keepLabel: false,
  ...input,
});

// A button that grew as its words opened would push its row under the pointer,
// and the row would then take the button away from the pointer that opened it.
test('a reactive button keeps the width stage of its label, so its words open inside it', () => {
  const stageOf = (mode: ButtonInput['mode']) => buttonView(button({ mode })).className.match(/glim-btn-(xs|sm|md|lg)\b/)?.[1];
  assert.equal(stageOf('reactive'), stageOf('textGlyph'));
  assert.ok(stageOf('reactive'));
});

test('a reactive chip and a compact button stay sized by their glyph', () => {
  assert.doesNotMatch(buttonView(button({ variant: 'chip' })).className, /glim-btn-(xs|sm|md|lg)\b/);
  assert.match(buttonView(button({ compact: true })).className, /glim-btn-icon\b/);
});
