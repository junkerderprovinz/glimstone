import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { darkenTo, INK_LIGHTNESS, lightenTo, oklabOf, srgbOf } from '../src/oklab.ts';
import { contrastRatio } from '../src/contrast.ts';
import { ACCENTS, RAINBOW } from '../src/appearance.ts';

test('white and black sit at the ends of the lightness axis with no colour', () => {
  const [lw, aw, bw] = oklabOf('#FFFFFF');
  assert.ok(Math.abs(lw - 1) < 1e-4 && Math.abs(aw) < 1e-4 && Math.abs(bw) < 1e-4);
  assert.deepEqual(oklabOf('#000000').map((v) => Math.abs(v) < 1e-9), [true, true, true]);
});

test('a colour comes back from OKLab as it went in', () => {
  for (const hex of ['#FCC419', '#1D99F3', '#161616', '#E8E8E8', '#FF0000']) assert.equal(srgbOf(oklabOf(hex)), hex);
});

test('Sunflower lands where the published OKLCH tools put it', () => {
  const [l, a, b] = oklabOf('#FCC419');
  assert.ok(Math.abs(l - 0.847) < 0.001);
  assert.ok(Math.abs(Math.hypot(a, b) - 0.169) < 0.001);
  assert.ok(Math.abs(((Math.atan2(b, a) * 180) / Math.PI) - 87.1) < 0.1);
});

test('a colour outside sRGB is clipped per channel, as the browser paints it', () => {
  assert.match(srgbOf([0.7, 0.3, 0]), /^#FF[0-9A-F]{4}$/);
});

test('darkening keeps the hue and lands on the step', () => {
  for (const hex of ACCENTS.map((a) => a.hex)) {
    const [l0, a0, b0] = oklabOf(hex);
    const [l, a, b] = oklabOf(darkenTo(hex, 0.52));
    assert.ok(Math.abs(l - 0.52) < 0.005, `${hex} at ${l}`);
    assert.ok(Math.abs(Math.atan2(b, a) - Math.atan2(b0, a0)) < 0.02, `${hex} turned`);
    assert.ok(l0 > 0.52);
  }
});

test('an accent already darker than the step is its own ink on the light ramp', () => {
  assert.equal(darkenTo('#0000FF', 0.52), '#0000FF');
});

test('lightening reaches the step on the dark ramp and leaves a bright accent alone', () => {
  const [l] = oklabOf(lightenTo('#1D99F3', 0.74));
  assert.ok(Math.abs(l - 0.74) < 0.005);
  assert.equal(lightenTo('#FCC419', 0.74), '#FCC419');
});

test('every preset and rainbow ink on the light ramp lands within a point of the same contrast', () => {
  const ratios = [...ACCENTS.map((a) => a.hex), ...RAINBOW].map((h) => contrastRatio(darkenTo(h, INK_LIGHTNESS.light), '#FFFFFF'));
  assert.ok(Math.max(...ratios) - Math.min(...ratios) < 1, ratios.map((r) => r.toFixed(2)).join(' '));
});

test('the lightness steps are the ones tokens.css declares', () => {
  const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');
  const value = (name: string) => Number(css.match(new RegExp(`${name}:\\s*([\\d.]+);`))![1]);
  assert.equal(value('--ink-l-light'), INK_LIGHTNESS.light);
  assert.equal(value('--ink-l-dark'), INK_LIGHTNESS.dark);
});
