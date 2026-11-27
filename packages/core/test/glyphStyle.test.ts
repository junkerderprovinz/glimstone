import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { fakeDocument } from './fakeDocument.ts';
import { cacheAppearance } from '../src/appearance.ts';
import { applyGlyphs, DEFAULT_GLYPHS, GLYPH_STYLES, glyphArt } from '../src/glyphStyle.ts';

interface Line {
  name: string;
  source: string;
  svg: string;
}

const dir = new URL('../', import.meta.url);
const glyphs: { name: string; viewBox: string; svg: string }[] = JSON.parse(readFileSync(new URL('glyphs.json', dir), 'utf8'));
const lines: Line[] = JSON.parse(readFileSync(new URL('glyphs-line.json', dir), 'utf8'));
const pkg = JSON.parse(readFileSync(new URL('package.json', dir), 'utf8'));
const css = readFileSync(new URL('tokens.css', dir), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

let root: ReturnType<typeof fakeDocument>;
beforeEach(() => {
  root = fakeDocument();
});

test('the line set matches what its generator writes from Lucide', () => {
  const run = spawnSync(process.execPath, [fileURLToPath(new URL('../../../scripts/gen-line-glyphs.mjs', import.meta.url)), '--check'], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('every line glyph stands for a filled one, once, and covers most of the set', () => {
  const names = new Set(glyphs.map((g) => g.name));
  for (const l of lines) assert.ok(names.has(l.name), l.name);
  assert.equal(new Set(lines.map((l) => l.name)).size, lines.length);
  assert.ok(lines.length >= glyphs.length * 0.75, `${lines.length} of ${glyphs.length}`);
});

test('a line glyph is drawn with strokes, a filled dot at most, on Lucide\'s grid', () => {
  for (const l of lines) {
    assert.match(l.source, /^Lucide [a-z0-9-]+$/, l.name);
    assert.doesNotMatch(l.svg, /<(?!circle)\w+[^>]*fill="(?!none)/, l.name);
    assert.doesNotMatch(l.svg, /<svg|class=|style=/, l.name);
  }
});

test('a brand mark keeps its filled drawing in both styles', () => {
  for (const brand of ['IconGithub', 'IconDiscord', 'IconBitcoin']) assert.ok(!lines.some((l) => l.name === brand), brand);
});

test('the package ships the line set and Lucide\'s licence beside it', () => {
  assert.ok(pkg.files.includes('glyphs-line.json'));
  assert.ok(pkg.files.includes('LICENSE-lucide.txt'));
  assert.equal(pkg.exports['./glyphs-line.json'], './glyphs-line.json');
  assert.match(readFileSync(new URL('LICENSE-lucide.txt', dir), 'utf8'), /^ISC License/);
});

test('the glyph styles are filled and line, and filled is the default', () => {
  assert.deepEqual(GLYPH_STYLES, ['filled', 'line']);
  assert.equal(DEFAULT_GLYPHS, 'filled');
  applyGlyphs('line');
  assert.equal(root.attrs.get('data-glyphs'), 'line');
  applyGlyphs('dotted');
  assert.equal(root.attrs.get('data-glyphs'), 'filled');
});

test('the glyph style travels with the cached look, so the first frame after a reload has it', async () => {
  cacheAppearance('soft', '', undefined, undefined, undefined, 'line');
  assert.equal(JSON.parse(root.storage.get('glim-appearance')!).glyphs, 'line');
  root = fakeDocument(root.storage);
  const fresh: typeof import('../src/appearance.ts') = await import('../src/appearance.ts?glyphs');
  fresh.applyCachedAppearance();
  assert.equal(root.attrs.get('data-glyphs'), 'line');
});

test('a glyph with a line drawing carries both on one grid, the filled one scaled from its own', () => {
  const filled = glyphs.find((g) => g.name === 'IconEye')!;
  const art = glyphArt(filled, lines.find((l) => l.name === 'IconEye'));
  assert.equal(art.viewBox, '0 0 24 24');
  const [x, y, side] = filled.viewBox.split(' ').map(Number);
  const m = art.svg.match(/^<g class="glim-glyph-filled" transform="matrix\(([-\d.]+) 0 0 ([-\d.]+) ([-\d.]+) ([-\d.]+)\)">/);
  assert.ok(m, art.svg.slice(0, 80));
  const [s, , tx, ty] = m.slice(1).map(Number);
  assert.ok(Math.abs(s! - 24 / side!) < 1e-3 && Math.abs(tx! + x! * s!) < 1e-3 && Math.abs(ty! + y! * s!) < 1e-3);
  assert.ok(art.svg.includes(filled.svg));
  assert.match(art.svg, /<g class="glim-glyph-line" fill="none" stroke="currentColor"/);
  assert.equal((art.svg.match(/<svg/g) ?? []).length, 0);
  assert.deepEqual(glyphArt(filled, undefined), filled);
});

test('the stylesheet shows one of the two drawings, the line one only under data-glyphs="line"', () => {
  assert.match(css, /\.glim-glyph-line \{\s*display: none;\s*\}/);
  assert.match(css, /:root\[data-glyphs="line"\] \.glim-glyph-filled \{\s*display: none;\s*\}/);
  assert.match(css, /:root\[data-glyphs="line"\] \.glim-glyph-line \{\s*display: inline;\s*\}/);
});
