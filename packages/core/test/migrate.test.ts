import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEPRECATED } from '../src/deprecated.ts';
import { TRANSFORMS } from '../migrate.mjs';

const migrate = fileURLToPath(new URL('../migrate.mjs', import.meta.url));
const fixtures = fileURLToPath(new URL('./fixtures/migrate/', import.meta.url));

function app() {
  const root = mkdtempSync(join(tmpdir(), 'gs-migrate-'));
  cpSync(join(fixtures, 'before'), join(root, 'src'), { recursive: true });
  return root;
}

function run(root: string, ...flags: string[]) {
  const r = spawnSync(process.execPath, [migrate, ...flags, join(root, 'src')], { encoding: 'utf8' });
  return { status: r.status, out: r.stdout + r.stderr };
}

for (const file of ['Status.tsx', 'Status.vue', 'Toasts.vue', 'theme.dart', 'app.css']) {
  test(`${file} is rewritten to the current names`, () => {
    const root = app();
    assert.equal(run(root).status, 0);
    assert.equal(readFileSync(join(root, 'src', file), 'utf8'), readFileSync(join(fixtures, 'after', file), 'utf8'));
  });
}

test('a rewritten app is left alone on a second run', () => {
  const root = app();
  run(root);
  assert.doesNotMatch(run(root).out, /rewrote/);
});

test('what cannot be rewritten is reported with file and line', () => {
  const r = run(app());
  assert.match(r.out, /Status\.tsx:17: Badge shape set from an expression/);
  assert.match(r.out, /Status\.vue:9: Badge shape set from an expression/);
  assert.match(r.out, /Status\.tsx:1: DropdownListbox .*Select/);
  assert.match(r.out, /theme\.dart:11: inkMix goes in 5\.0\.0/);
  assert.match(r.out, /app\.css:10: --ink-mix goes in 5\.0\.0/);
});

test('--check changes nothing and fails while there is something to do', () => {
  const root = app();
  const r = run(root, '--check');
  assert.equal(r.status, 1);
  assert.equal(readFileSync(join(root, 'src', 'Status.vue'), 'utf8'), readFileSync(join(fixtures, 'before', 'Status.vue'), 'utf8'));
});

test('every deprecated name has a transform, so no breaking change ships without one', () => {
  const covered = new Set(TRANSFORMS.map((t: { name: string }) => t.name));
  assert.deepEqual(Object.keys(DEPRECATED).filter((name) => !covered.has(name)), []);
});
