import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BUSY_DELAY, busyRingView, skeletonRowView } from '../src/busy.ts';

const CSS = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');

function dial(selector: string, name: string): string {
  for (let at = CSS.indexOf(`${selector} {`); at >= 0; at = CSS.indexOf(`${selector} {`, at + 1)) {
    const m = CSS.slice(at, CSS.indexOf('}', at)).match(new RegExp(`${name}:\\s*([^;]+);`));
    if (m) return m[1].trim();
  }
  throw new Error(`${selector} declares no ${name}`);
}

const LEVELS = [':root', ":root[data-motion='wild']", ":root[data-motion='off']", ":root[data-motion='storm']"];

test('a ring waits the house delay before it shows', () => {
  assert.equal(BUSY_DELAY, 400);
  assert.deepEqual(busyRingView({}).style, { '--busy-delay': '400ms' });
});

test('a ring asked to show at once has no delay', () => {
  assert.deepEqual(busyRingView({ delay: 0 }).style, { '--busy-delay': '0ms' });
});

test('a ring takes the class of its size, the middle one by default', () => {
  assert.equal(busyRingView({}).className, 'glim-busy-ring');
  assert.equal(busyRingView({ size: 'small' }).className, 'glim-busy-ring glim-busy-ring--small');
  assert.equal(busyRingView({ size: 'large' }).className, 'glim-busy-ring glim-busy-ring--large');
});

test('a placeholder row waits like a ring and can leave out its tile and badge', () => {
  assert.deepEqual(skeletonRowView({}), { className: 'glim-skeleton-row', style: { '--busy-delay': '400ms' }, tile: true, badge: true });
  assert.deepEqual(skeletonRowView({ delay: 0, tile: false, badge: false }).style, { '--busy-delay': '0ms' });
  assert.equal(skeletonRowView({ tile: false }).tile, false);
});

test('every motion level answers every waiting dial', () => {
  for (const level of LEVELS) {
    for (const name of ['--motion-spin-dur', '--motion-skeleton-dur', '--motion-skeleton-glow']) dial(level, name);
  }
});

test('the ring turns slower at subtle than at wild, and storm is the fastest', () => {
  const secs = (level: string) => parseFloat(dial(level, '--motion-spin-dur'));
  assert.ok(secs(':root') > secs(":root[data-motion='wild']"));
  assert.ok(secs(":root[data-motion='storm']") < secs(":root[data-motion='wild']"));
});

test('the light on a placeholder is out at motion off', () => {
  assert.equal(dial(":root[data-motion='off']", '--motion-skeleton-glow'), '0%');
});
