import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { segmentFit } from '../src/segmentLayout.ts';
import { segmentView, selectorFlex, selectorView, type SelectorInput } from '../src/selector.ts';

const GAP = 4;

test('pinned segments that fit side by side keep their pinned width', () => {
  assert.deepEqual(segmentFit(620, 200, [120, 150, 180], GAP, false), { fit: 'even', cut: [false, false, false] });
});

test('a strip too narrow for its pinned widths stays on one row, sized by its labels', () => {
  assert.equal(segmentFit(360, 200, [100, 110, 120], GAP, false).fit, 'content');
});

test('a label longer than the pinned width sizes the row by labels instead of breaking', () => {
  assert.equal(segmentFit(900, 200, [90, 260, 90], GAP, false).fit, 'content');
});

test('a hugging strip whose labels fit keeps them', () => {
  assert.equal(segmentFit(400, null, [80, 90, 100], GAP, false).fit, 'content');
});

test('a strip whose labels do not fit drops them for glyphs when every segment has one', () => {
  assert.deepEqual(segmentFit(300, 200, [140, 150, 160], GAP, true), { fit: 'squeezed', cut: [false, false, false] });
});

test('a strip without glyphs for every segment shares the row evenly and cuts only the labels too long for a share', () => {
  // (300 - 2 * 4) / 3 leaves each segment 97.33px.
  assert.deepEqual(segmentFit(300, 200, [60, 150, 97], GAP, false), { fit: 'truncated', cut: [false, true, false] });
});

test('a row that fits to the pixel is not cut short by clientWidth rounding', () => {
  assert.equal(segmentFit(299, null, [100, 100, 99.6], 0, false).fit, 'content');
});

function strip(over: Partial<SelectorInput> = {}) {
  return selectorView({
    mode: 'textGlyph',
    select: 'one',
    activation: 'manual',
    orientation: 'horizontal',
    size: 'md',
    variant: 'well',
    equalWidth: false,
    inline: false,
    fit: false,
    hue: false,
    wide: true,
    items: [
      { hasGlyph: true, iconOnly: false },
      { hasGlyph: true, iconOnly: false },
    ],
    ...over,
  });
}

test('every horizontal strip with glyphs on every segment may squeeze to them', () => {
  assert.equal(strip().canSqueeze, true);
  assert.equal(strip({ equalWidth: true }).canSqueeze, true);
  assert.equal(strip({ mode: 'text' }).canSqueeze, false);
  assert.equal(strip({ items: [{ hasGlyph: true, iconOnly: false }, { hasGlyph: false, iconOnly: false }] }).canSqueeze, false);
});

test('the styles never wrap the track', () => {
  for (const fit of ['even', 'content', 'squeezed', 'truncated'] as const) {
    for (const inline of [false, true]) {
      const { segment, track } = selectorFlex({ layout: { fit, pinned: 200, hug: 0, cut: [false, false] }, inline, fit: false });
      assert.equal(segment.flexWrap, undefined);
      assert.equal(track.flexWrap, undefined);
    }
  }
});

test('pinned segments hold the pinned width only while they fit at it', () => {
  const even = selectorFlex({ layout: { fit: 'even', pinned: 200, hug: 0, cut: [] }, inline: false, fit: false });
  const content = selectorFlex({ layout: { fit: 'content', pinned: 200, hug: 0, cut: [] }, inline: false, fit: false });
  assert.equal(even.segment.minWidth, '200px');
  assert.notEqual(content.segment.minWidth, '200px');
});

test('squeezed and truncated segments share the row evenly', () => {
  for (const fit of ['squeezed', 'truncated'] as const) {
    const { segment } = selectorFlex({ layout: { fit, pinned: 200, hug: 0, cut: [] }, inline: false, fit: false });
    assert.equal(segment.flex, '1 1 0');
    assert.equal(segment.minWidth, '0');
  }
});

test('a hugging track ends where its segments do while they fit and takes its box once they do not', () => {
  const hugs = selectorFlex({ layout: { fit: 'content', pinned: 0, hug: 312, cut: [] }, inline: true, fit: false });
  const full = selectorFlex({ layout: { fit: 'truncated', pinned: 0, hug: 0, cut: [] }, inline: true, fit: false });
  const spans = selectorFlex({ layout: { fit: 'content', pinned: 0, hug: 312, cut: [] }, inline: false, fit: false });
  assert.equal(hugs.track.width, '312px');
  assert.equal(full.track.width, '100%');
  assert.equal(spans.track.width, undefined);
});

function segment(over: { cut?: boolean; squeezed?: boolean; equalWidth?: boolean } = {}) {
  return segmentView({
    strip: strip({ mode: 'text' }),
    orientation: 'horizontal',
    size: 'md',
    variant: 'well',
    equalWidth: over.equalWidth ?? true,
    buttonHeight: false,
    hue: false,
    index: 0,
    label: 'Closed in the last 30 days',
    hasGlyph: false,
    iconOnly: false,
    on: false,
    disabled: false,
    squeezed: over.squeezed ?? false,
    cut: over.cut ?? false,
  });
}

test('a label cut short keeps its full text in the tooltip', () => {
  const view = segment({ cut: true });
  assert.equal(view.tip, 'Closed in the last 30 days');
  assert.equal(view.labelClass, 'glim-sel-label');
});

test('a label that fits shows no tooltip of itself', () => {
  assert.equal(segment().tip, undefined);
});

test('a pinned label stays on one line', () => {
  assert.equal(segment().labelClass, 'glim-sel-label');
});

test('the stylesheet lets no horizontal selector wrap its track or its labels', () => {
  const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map(([, selector, body]) => ({ selector: selector.replace(/\/\*[\s\S]*?\*\//g, '').trim(), body }))
    .filter(({ selector }) => /\.glim-sel(?:--[\w-]+|-seg[\w-]*|-label[\w-]*)?(?![\w-])/.test(selector));
  assert.ok(rules.some(({ selector }) => selector === '.glim-sel'));
  for (const { selector, body } of rules) {
    assert.doesNotMatch(body, /flex-wrap:\s*wrap/, selector);
    assert.doesNotMatch(body, /white-space:\s*normal/, selector);
  }
  const track = rules.find(({ selector }) => selector === '.glim-sel')!;
  assert.match(track.body, /flex-wrap:\s*nowrap/);
  // Without it a grid or flex parent grows to hold the whole row, and the
  // strip never sees that it has run out of room.
  assert.match(track.body, /contain:\s*inline-size/);
});
