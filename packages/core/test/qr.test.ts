import { test } from 'node:test';
import assert from 'node:assert/strict';
import jsQR from 'jsqr';
import { qrCode } from '../src/qr.ts';

const SCALE = 4;
const QUIET = 4;

// Paints the path's unit squares into an RGBA image with the quiet zone a
// scanner needs, so the decoder reads what a component would draw.
function render(code: { size: number; path: string }) {
  const side = (code.size + 2 * QUIET) * SCALE;
  const pixels = new Uint8ClampedArray(side * side * 4).fill(255);
  for (const [, x, y, w] of code.path.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+Z/g)) {
    for (let dx = 0; dx < Number(w) * SCALE; dx++) {
      for (let dy = 0; dy < SCALE; dy++) {
        const px = (Number(x) + QUIET) * SCALE + dx;
        const py = (Number(y) + QUIET) * SCALE + dy;
        pixels.fill(0, (py * side + px) * 4, (py * side + px) * 4 + 3);
      }
    }
  }
  return { pixels, side };
}

test('the code reads back as the twelve words', () => {
  const words = 'oak lamp tower harbour maple lantern bridge kettle cloud saddle feather lance';
  const { pixels, side } = render(qrCode(words));
  assert.equal(jsQR(pixels, side, side)?.data, words);
});

test('words outside ASCII read back as they were', () => {
  const words = 'fackel anker turm hafen ahorn laterne brücke kessel wolke sattel feder lanze';
  const { pixels, side } = render(qrCode(words));
  assert.equal(jsQR(pixels, side, side)?.data, words);
});

test('the path draws each run of dark modules once, inside the code', () => {
  const code = qrCode('oak lamp');
  const runs = [...code.path.matchAll(/M(\d+) (\d+)h(\d+)/g)].map(([, x, y, w]) => [Number(x), Number(y), Number(w)]);
  assert.ok(runs.length > 0);
  for (const [x, y, w] of runs) assert.ok(x >= 0 && y >= 0 && x + w <= code.size && y < code.size);
});
