import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { VPN_MARKS } from '../src/vpnMarks.ts';
import { contrastRatio } from '../src/contrast.ts';

const folder = new URL('../vpn-marks/', import.meta.url);
const readme = readFileSync(new URL('README.md', folder), 'utf8');
const marks = Object.entries(VPN_MARKS);

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

test('the ink on a lit tile is white wherever white reaches 2:1, near-black below that', () => {
  for (const [id, mark] of marks) {
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
  for (const svg of files.filter((f) => f.endsWith('.svg'))) assert.ok(svg.replace('.svg', '') in VPN_MARKS, svg);
});

test('a black or grey mark turns white in the dark theme, since grey carries no brand colour to stay close to', () => {
  for (const [id, mark] of marks) {
    for (const [, light, dark] of mark.svg.matchAll(/light-dark\((#[0-9a-f]{6}), (#[0-9a-f]{6})\)/g)) {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(light!.slice(i, i + 2), 16));
      if (r === g && g === b && dark !== light) assert.equal(dark, '#ffffff', `${id}: ${light}`);
    }
  }
});
