import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fakeDocument } from './fakeDocument.ts';
import { applyLight, DEFAULT_LIGHT, LIGHT_LEVELS, LIGHT_STORED, STONE_TAPS, stoneTap } from '../src/appearance.ts';

const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** The custom properties of the first block whose selector is exactly `selector`. */
function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  assert.ok(start >= 0, `no block ${selector}`);
  const body = css.slice(start + selector.length + 2, css.indexOf('}', start));
  return Object.fromEntries([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]));
}

let root: ReturnType<typeof fakeDocument>;
beforeEach(() => {
  root = fakeDocument();
});

test('the light levels run from off to glow, and edge is the default', () => {
  assert.deepEqual(LIGHT_LEVELS, ['off', 'edge', 'glow']);
  assert.deepEqual(LIGHT_STORED, ['off', 'edge', 'glow', 'stone']);
  assert.equal(DEFAULT_LIGHT, 'edge');
});

test('a light level goes onto the root, a found stone survives, and anything else falls back to edge', () => {
  applyLight('glow');
  assert.equal(root.attrs.get('data-light'), 'glow');
  applyLight('stone');
  assert.equal(root.attrs.get('data-light'), 'stone');
  applyLight('blinding');
  assert.equal(root.attrs.get('data-light'), 'edge');
  applyLight(undefined);
  assert.equal(root.attrs.get('data-light'), 'edge');
});

test('five more taps on a chosen glow reveal the stone, and another level resets the count', () => {
  const state = { taps: 0 };
  for (let i = 1; i < STONE_TAPS; i++) assert.equal(stoneTap(state, 'glow', 'glow'), undefined);
  assert.equal(stoneTap(state, 'edge', 'glow'), undefined);
  assert.equal(state.taps, 0);
  for (let i = 1; i < STONE_TAPS; i++) stoneTap(state, 'glow', 'glow');
  assert.equal(stoneTap(state, 'glow', 'glow'), 'stone');
  assert.equal(stoneTap(state, 'glow', 'edge'), undefined);
});

test('without a level the raised step carries the edge, and off leaves the shadow alone', () => {
  const base = block(':root,\n[data-theme]');
  assert.match(base['--elevation-raised']!, /^var\(--light-edge\), /);
  assert.match(base['--light-edge']!, /^inset 0 1px 0 0 /);
  const off = block(':root[data-light="off"],\n:root[data-light="off"] [data-theme]');
  assert.equal(off['--light-edge'], 'inset 0 0 0 0 transparent');
  assert.doesNotMatch(off['--elevation-raised']!, /light-edge/);
  assert.equal(off['--elevation-control'], 'none');
});

test('glow lights the accent fill and the switch, and stone keeps the glow', () => {
  const glow = block(':root:is([data-light="glow"], [data-light="stone"]),\n:root:is([data-light="glow"], [data-light="stone"]) [data-theme]');
  for (const name of ['--light-sheen', '--light-sheen-on', '--elevation-accent', '--light-progress']) {
    assert.ok(glow[name] && glow[name] !== 'none', name);
  }
  const base = block(':root,\n[data-theme]');
  for (const name of ['--light-sheen', '--light-sheen-on', '--elevation-accent', '--light-progress']) assert.equal(base[name], 'none', name);
});

test('the stone lays a fine grain over the page that takes no pointer', () => {
  const m = css.match(/:root\[data-light="stone"\] body::after \{([^}]*)\}/);
  assert.ok(m, 'no grain');
  assert.match(m[1]!, /pointer-events: none/);
  assert.match(m[1]!, /feTurbulence/);
  assert.match(m[1]!, /position: fixed/);
});

test('the grain\'s specks vary in lightness, so the overlay lightens some and darkens others', () => {
  const m = css.match(/:root\[data-light="stone"\] body::after \{([^}]*)\}/);
  const matrix = decodeURIComponent(m![1]!).match(/feColorMatrix values='([^']+)'/)![1]!.trim().split(/\s+/).map(Number);
  // Each colour row takes the noise's red channel, so no speck sits on the grey
  // that an overlay leaves as it is.
  for (const row of [0, 1, 2]) assert.ok(matrix[row * 5]! > 1, `row ${row}: ${matrix.slice(row * 5, row * 5 + 5).join(' ')}`);
  assert.equal(matrix[18], 0);
  assert.equal(matrix[19], 1);
});

test('the lit parts read the light tokens', () => {
  assert.match(css, /\.glim-btn--neutral \{[^}]*box-shadow: var\(--elevation-control\)/);
  assert.match(css, /\.glim-btn--accent \{[^}]*background-image: var\(--light-sheen\);[^}]*box-shadow: var\(--elevation-accent\)/);
  assert.match(css, /\.glim-toggle-track\[aria-checked="true"\] \{[^}]*background-image: var\(--light-sheen-on\)/);
});
