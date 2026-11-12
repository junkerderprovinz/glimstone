import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

interface Glyph {
  name: string;
  means: string;
  source: string;
  viewBox: string;
  ink: [number, number, number, number];
  svg: string;
}

const dir = new URL('../', import.meta.url);
const glyphs: Glyph[] = JSON.parse(readFileSync(new URL('glyphs.json', dir), 'utf8'));
const listed = readFileSync(new URL('glyphs.md', dir), 'utf8');
const mapped = readFileSync(new URL('glyph-map.md', dir), 'utf8');

test('every glyph has a name of its own', () => {
  assert.equal(new Set(glyphs.map((g) => g.name)).size, glyphs.length);
});

test('every glyph is a filled shape, never a stroke', () => {
  for (const g of glyphs) assert.doesNotMatch(g.svg, /stroke="currentColor"/, g.name);
});

// Rule 3 of glyphs.md: the viewBox is the measured ink, squared off and centred.
test("every viewBox is the square around the glyph's ink", () => {
  for (const g of glyphs) {
    const [x, y, w, h] = g.viewBox.split(' ').map(Number);
    const [ix, iy, iw, ih] = g.ink;
    const side = Math.max(iw, ih);
    const near = (a: number, b: number) => Math.abs(a - b) < 0.02;
    assert.ok(near(w, side) && near(h, side) && near(x, ix + iw / 2 - side / 2) && near(y, iy + ih / 2 - side / 2), g.name);
  }
});

test('a server and a laptop stand beside the phone and the browser', () => {
  for (const name of ['IconServer', 'IconLaptop']) {
    const g = glyphs.find((x) => x.name === name);
    assert.ok(g, name);
    assert.match(g.svg, /fill="currentColor"/);
    assert.ok(listed.includes(`| \`${name}\` | ${g.means} |`), `${name} in glyphs.md`);
    assert.ok(mapped.includes(`| ${g.means} | \`${name}\` |`), `${name} in glyph-map.md`);
  }
});
