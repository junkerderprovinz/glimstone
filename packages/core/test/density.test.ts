import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fakeDocument } from './fakeDocument.ts';
import { applyDensity, cacheAppearance, DEFAULT_DENSITY, DENSITIES } from '../src/appearance.ts';

let root: ReturnType<typeof fakeDocument>;
beforeEach(() => {
  root = fakeDocument();
});

test('the densities run from compact to airy, and normal is the default', () => {
  assert.deepEqual(DENSITIES, ['compact', 'normal', 'airy']);
  assert.equal(DEFAULT_DENSITY, 'normal');
});

test('a density goes onto the root, and anything else falls back to normal', () => {
  applyDensity('compact');
  assert.equal(root.attrs.get('data-density'), 'compact');
  applyDensity('roomy');
  assert.equal(root.attrs.get('data-density'), 'normal');
  applyDensity(undefined);
  assert.equal(root.attrs.get('data-density'), 'normal');
});

test('the density travels with the cached look, so the first frame after a reload has it', async () => {
  cacheAppearance('soft', '', undefined, 'airy');
  assert.equal(JSON.parse(root.storage.get('glim-appearance')!).density, 'airy');
  root = fakeDocument(root.storage);
  const fresh: typeof import('../src/appearance.ts') = await import('../src/appearance.ts?density');
  fresh.applyCachedAppearance();
  assert.equal(root.attrs.get('data-density'), 'airy');
});

test('every density sets every row dial on the spacing scale, growing from compact to airy', () => {
  const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');
  const px = (v: string) => {
    const steps = Object.fromEntries([...css.matchAll(/--space-(\d+):\s*([\d.]+)rem;/g)].map((m) => [m[1], Number(m[2]) * 16]));
    return Function(`return ${v.replace(/var\(--space-(\d+)\)/g, (_, n: string) => String(steps[n])).replace(/calc\(/g, '(').replace(/([\d.]+)rem/g, (_, n: string) => String(Number(n) * 16))}`)() as number;
  };
  const dials = (density: string) => {
    const head = density === 'normal' ? ':root,\n:root[data-density="normal"] {' : `:root[data-density="${density}"] {`;
    const at = css.indexOf(head);
    assert.ok(at >= 0, density);
    const body = css.slice(at, css.indexOf('}', at));
    return Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]));
  };
  const [compact, normal, airy] = DENSITIES.map(dials);
  for (const dial of ['--row-h', '--row-gap', '--row-pad', '--cell-pad-block']) {
    assert.ok(px(compact![dial]!) < px(normal![dial]!) && px(normal![dial]!) < px(airy![dial]!), dial);
    for (const d of [compact, airy]) assert.match(d![dial]!, /var\(--space-\d+\)/, dial);
  }
});
