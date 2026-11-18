import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { STORAGE_MARKS } from '../src/storageMarks.ts';
import { contrastRatio } from '../src/contrast.ts';

const folder = new URL('../storage-marks/', import.meta.url);
const readme = readFileSync(new URL('README.md', folder), 'utf8');
const marks = Object.entries(STORAGE_MARKS);

test('every mark is a whole svg with a viewBox, ready for BrandMark', () => {
  for (const [id, mark] of marks) {
    assert.match(mark.svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="[-\d. ]+"/, id);
    assert.match(mark.svg, /<\/svg>$/, id);
  }
});

test('the markup carries nothing that runs, so it can go into the page as it is', () => {
  for (const [id, mark] of marks) {
    assert.doesNotMatch(mark.svg, /<script|<foreignObject|\son\w+=|javascript:/i, id);
  }
});

test("every id inside a mark carries the mark's own prefix, so two marks on one page never share one", () => {
  const seen = new Set<string>();
  for (const [id, mark] of marks) {
    for (const [, inner] of mark.svg.matchAll(/\sid="([^"]+)"/g)) {
      assert.ok(inner!.startsWith(`glim-${id}-`), `${id}: ${inner}`);
      assert.ok(!seen.has(inner!), inner);
      seen.add(inner!);
    }
    for (const [, ref] of mark.svg.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ref!.startsWith(`glim-${id}-`), `${id}: ${ref}`);
  }
});

test('a lit tile can turn every painted part into its ink or its cut-out', () => {
  for (const [id, mark] of marks) {
    // A mask or a clip path only says which parts show, and its white is no colour.
    const drawn = mark.svg.replace(/<(mask|clipPath)\b.*?<\/\1>/gs, '');
    const paints = [...drawn.matchAll(/(?:fill|stroke)[=:]"?([^";]+)/g)].map((m) => m[1]!.trim());
    for (const paint of paints) {
      if (paint === 'none' || paint.startsWith('url(')) continue;
      assert.match(paint, /^var\(--mark-(ink|cut), /, `${id}: ${paint}`);
    }
  }
});

// OpenCloud keeps its own pair, its lilac on its petrol.
const NAMED_INK = new Set(['opencloud']);

test('OpenCloud lights in its petrol, with its lilac for ink', () => {
  assert.equal(STORAGE_MARKS.opencloud.tile, '#20434f');
  assert.equal(STORAGE_MARKS.opencloud.ink, '#e2baff');
});

test('the ink on a lit tile is white wherever white reaches 2:1, near-black below that', () => {
  for (const [id, mark] of marks) {
    if (NAMED_INK.has(id)) continue;
    const white = contrastRatio('#ffffff', mark.tile!);
    assert.equal(mark.ink, white >= 2 ? '#ffffff' : '#161616', id);
  }
});

test('a colour that changes with the theme reaches 3:1 on the dark tile', () => {
  for (const [id, mark] of marks) {
    for (const [, , dark] of mark.svg.matchAll(/light-dark\((#[0-9a-fA-F]{6}), (#[0-9a-fA-F]{6})\)/g)) {
      assert.ok(contrastRatio(dark!, '#393939') >= 3, `${id}: ${dark}`);
    }
  }
});

test('the README records where every mark comes from, and every licence it names lies beside it', () => {
  for (const [id] of marks) assert.match(readme, new RegExp('`' + id + '(\\.svg)?`'), id);
  const files = readdirSync(folder);
  for (const [, licence] of readme.matchAll(/`(LICENSE-[\w-]+\.txt)`/g)) assert.ok(files.includes(licence!), licence);
  for (const svg of files.filter((f) => f.endsWith('.svg'))) assert.ok(svg.replace('.svg', '') in STORAGE_MARKS, svg);
});
