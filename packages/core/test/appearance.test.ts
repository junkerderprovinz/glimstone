import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { fakeDocument } from './fakeDocument.ts';
import {
  applyAccent,
  cacheAppearance,
  resolveAccent,
  setSystemAccent,
  subscribeSystemAccent,
  systemAccent,
  SYSTEM_ACCENT,
} from '../src/appearance.ts';

let root: ReturnType<typeof fakeDocument>;
beforeEach(() => {
  root = fakeDocument();
  setSystemAccent(undefined);
  applyAccent(undefined);
});

test('a hex accent resolves to itself', () => {
  assert.equal(resolveAccent('#1D99F3', '#FF0000'), '#1D99F3');
});

test('the system mode resolves to the colour the source gave', () => {
  assert.equal(resolveAccent(SYSTEM_ACCENT, '#0078D4'), '#0078D4');
});

test('the system mode with no source falls back to the default accent', () => {
  assert.equal(resolveAccent(SYSTEM_ACCENT, undefined), undefined);
});

test('an empty or broken accent falls back to the default accent', () => {
  assert.equal(resolveAccent('', '#0078D4'), undefined);
  assert.equal(resolveAccent('blue', '#0078D4'), undefined);
});

test('the system mode paints whatever the source reports, and follows it', () => {
  applyAccent(SYSTEM_ACCENT);
  assert.equal(root.style.get('--accent'), undefined);
  setSystemAccent('#0078D4');
  assert.equal(root.style.get('--accent'), '#0078D4');
  setSystemAccent('#E81123');
  assert.equal(root.style.get('--accent'), '#E81123');
  setSystemAccent(undefined);
  assert.equal(root.style.get('--accent'), undefined);
});

test('a system colour does not touch a picked accent', () => {
  applyAccent('#6FDC8C');
  setSystemAccent('#0078D4');
  assert.equal(root.style.get('--accent'), '#6FDC8C');
});

test('the source is told to listeners, so a picker can show or hide the wand', () => {
  const seen: (string | undefined)[] = [];
  const stop = subscribeSystemAccent(() => seen.push(systemAccent()));
  setSystemAccent('#0078D4');
  setSystemAccent('nonsense');
  stop();
  setSystemAccent('#E81123');
  assert.deepEqual(seen, ['#0078D4', undefined]);
});

test('a pale yellow reads from the ink step of the stylesheet and gets no ink of its own', () => {
  applyAccent('#FFFF00');
  assert.equal(root.style.get('--accent-ink-light'), undefined);
  assert.equal(root.style.get('--accent-ink-dark'), undefined);
  applyAccent('#FCC419');
  assert.equal(root.style.get('--accent-ink-light'), undefined);
  applyAccent(undefined);
  assert.equal(root.style.get('--accent-contrast'), undefined);
});

test('the cache keeps the system mode, never the colour it resolved to', () => {
  setSystemAccent('#0078D4');
  applyAccent(SYSTEM_ACCENT);
  cacheAppearance('soft', SYSTEM_ACCENT);
  assert.equal(JSON.parse(root.storage.get('glim-appearance')!).accent, SYSTEM_ACCENT);
});

test('the last system colour on this device paints the first frame after a reload', async () => {
  setSystemAccent('#0078D4');
  cacheAppearance('soft', SYSTEM_ACCENT);
  root = fakeDocument(root.storage);
  // A fresh copy of the module, as a reload gets, with nothing fed yet.
  const fresh: typeof import('../src/appearance.ts') = await import('../src/appearance.ts?reload');
  fresh.applyCachedAppearance();
  assert.equal(root.style.get('--accent'), '#0078D4');
  assert.equal(fresh.systemAccent(), '#0078D4');
});
