import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { IDENTITY_MARKS } from '../src/identityMarks.ts';
import { contrastRatio } from '../src/contrast.ts';

const folder = new URL('../identity-marks/', import.meta.url);
const readme = readFileSync(new URL('README.md', folder), 'utf8');
const marks = Object.entries(IDENTITY_MARKS);
// The drawing at rest and, where the mark has one, the drawing on the lit tile.
const drawings = marks.flatMap(([id, mark]) => [[id, mark.svg] as const, ...(mark.hover ? [[id, mark.hover] as const] : [])]);

test('every drawing is a whole svg with a viewBox, ready for BrandMark', () => {
  for (const [id, svg] of drawings) {
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="[-\d. ]+"/, id);
    assert.match(svg, /<\/svg>$/, id);
  }
});

test('the markup carries nothing that runs, so it can go into the page as it is', () => {
  for (const [id, svg] of drawings) assert.doesNotMatch(svg, /<script|<foreignObject|\son\w+=|javascript:/i, id);
});

test("every id inside a drawing carries the mark's own prefix, so two drawings on one page never share one", () => {
  const seen = new Set<string>();
  for (const [id, svg] of drawings) {
    for (const [, inner] of svg.matchAll(/\sid="([^"]+)"/g)) {
      assert.ok(inner!.startsWith(`glim-${id}-`), `${id}: ${inner}`);
      assert.ok(!seen.has(inner!), inner);
      seen.add(inner!);
    }
    for (const [, ref] of svg.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ref!.startsWith(`glim-${id}-`), `${id}: ${ref}`);
  }
});

test('a lit tile can turn every painted part into its ink or its cut-out', () => {
  for (const [id, svg] of drawings) {
    const drawn = svg.replace(/<(mask|clipPath)\b.*?<\/\1>/gs, '');
    const paints = [...drawn.matchAll(/(?:fill|stroke)[=:]"?([^";]+)/g)].map((m) => m[1]!.trim());
    for (const paint of paints) {
      if (paint === 'none' || paint.startsWith('url(')) continue;
      assert.match(paint, /^var\(--mark-(ink|cut), /, `${id}: ${paint}`);
    }
  }
});

test('the drawing for the lit tile paints in one colour, with its cut-outs in the tile', () => {
  for (const [id, mark] of marks) {
    if (!mark.hover) continue;
    const colours = new Set([...mark.hover.matchAll(/var\(--mark-ink, ([^)]+)\)/g)].map((m) => m[1]));
    assert.equal(colours.size, 1, `${id}: ${[...colours].join(', ')}`);
    assert.doesNotMatch(mark.hover, /url\(#/, id);
  }
});

test('the ink on a lit tile is white wherever white reaches 2:1, near-black below that', () => {
  for (const [id, mark] of marks) {
    const white = contrastRatio('#ffffff', mark.tile!);
    assert.equal(mark.ink, white >= 2 ? '#ffffff' : '#161616', id);
  }
});

test('a colour that changes with the theme reaches 3:1 on the dark tile', () => {
  for (const [id, svg] of drawings) {
    for (const [, , dark] of svg.matchAll(/light-dark\((#[0-9a-fA-F]{6}), (#[0-9a-fA-F]{6})\)/g)) {
      assert.ok(contrastRatio(dark!, '#393939') >= 3, `${id}: ${dark}`);
    }
  }
});

test('the README records where every mark comes from, and every licence it names lies beside it', () => {
  for (const [id] of marks) assert.match(readme, new RegExp('`' + id + '(\\.svg)?`'), id);
  const files = readdirSync(folder);
  for (const [, licence] of readme.matchAll(/`(LICENSE-[\w-]+\.txt)`/g)) assert.ok(files.includes(licence!), licence);
  for (const svg of files.filter((f) => f.endsWith('.svg'))) assert.ok(svg.replace(/(-hover)?\.svg$/, '') in IDENTITY_MARKS, svg);
});

test('a black or grey mark turns white in the dark theme, since grey carries no brand colour to stay close to', () => {
  const grey = (hex: string) => /^#(?:([0-9a-f]{2})\1\1|([0-9a-f])\2\2)$/i.test(hex);
  for (const [id, svg] of drawings) {
    // A logo with a brand colour beside its greys deepens a pale grey for the
    // light theme and keeps that grey on the dark one, where it already reads.
    if (![...svg.matchAll(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g)].every((m) => grey(m[0]))) continue;
    for (const [, light, dark] of svg.matchAll(/light-dark\((#[0-9a-f]{3}|#[0-9a-f]{6}), (#[0-9a-f]{6})\)/g)) {
      if (dark !== light) assert.equal(dark, '#ffffff', `${id}: ${light}`);
    }
  }
});

test('every mark at rest keeps a part that stands out from its tile, on the dark theme and on the light one', () => {
  const grounds = { dark: ['#393939', 3], light: ['#e8e8e8', 1.35] } as const;
  const full = (hex: string) => (hex.length === 4 ? '#' + [...hex.slice(1)].map((c) => c + c).join('') : hex);
  for (const [id, mark] of marks) {
    const drawn = mark.svg.replace(/<(mask|clipPath)\b.*?<\/\1>/gs, '');
    for (const [theme, [ground, floor]] of Object.entries(grounds)) {
      const resolved = drawn.replace(/light-dark\(([^,]+), ([^)]+)\)/g, (_, light, dark) => (theme === 'dark' ? dark : light));
      const colours = [...resolved.matchAll(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g)].map((m) => full(m[0]));
      const best = Math.max(...colours.map((c) => contrastRatio(c, ground)));
      assert.ok(best >= floor, `${id} on ${theme}: ${best.toFixed(2)}`);
    }
  }
});
