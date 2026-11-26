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

const FILES = ['Status.tsx', 'Status.vue', 'Toasts.vue', 'theme.dart', 'app.css', 'stone.css', 'panel.scss', 'Stone.tsx', 'Stone.vue', 'Menu.svelte', 'index.html', 'stone.dart', 'Picker.tsx', 'Picker.vue', 'Picker.svelte'];

for (const file of FILES) {
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

test('a grey hover is reported for the one hover rather than rewritten, since --hover is another colour', () => {
  const r = run(app());
  assert.match(r.out, /stone\.css:8: --carbon-hover goes in 6\.0\.0: .*--hover/);
  assert.match(r.out, /Stone\.tsx:9: .*hover:bg-carbon-hover.*hover:bg-hover/);
  assert.match(r.out, /stone\.dart:8: carbonHover goes in 6\.0\.0: .*\bhover\b/);
});

test('a solid state hover is reported with the wash pair to move the button to', () => {
  const r = run(app());
  assert.match(r.out, /stone\.css:21: --status-ok-hover goes in 6\.0\.0: .*--status-ok-wash under --status-ok-text.*--status-ok-wash-hover/);
  assert.match(r.out, /Stone\.tsx:8: statusFailHover goes in 6\.0\.0: .*bg-statusFailWash text-statusFail hover:bg-statusFailWashHover/);
  assert.match(r.out, /stone\.dart:10: statusFailHover goes in 6\.0\.0: .*statusFailWash under statusFailText/);
});

test('an avatar filled with the accent is reported with the toned avatar that replaced it', () => {
  assert.match(run(app()).out, /index\.html:4: glim-avatar--hued goes in 6\.0\.0: .*glim-avatar--toned.*--avatar-tone/);
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
