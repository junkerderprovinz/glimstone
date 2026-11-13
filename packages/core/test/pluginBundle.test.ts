import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const script = fileURLToPath(new URL('../../../scripts/build-plugin-bundle.mjs', import.meta.url));
const out = mkdtempSync(join(tmpdir(), 'gs-plugin-'));
const run = spawnSync(process.execPath, [script, out], { encoding: 'utf8' });

test('the bundle builds', () => {
  assert.equal(run.status, 0, run.stderr);
});

test('the bundle holds what a plugin page includes, and nothing to build', () => {
  assert.deepEqual(readdirSync(out).sort(), [
    'LICENSE',
    'README.txt',
    'fortress-card.css',
    'fortress-card.js',
    'glimstone.js',
    'glimstone.mjs',
    'glyphs.json',
    'tokens.css',
  ]);
});

test('the script tag build puts the core on one global without touching the page', () => {
  const sandbox: { GlimStone?: Record<string, unknown> } = {};
  vm.runInNewContext(readFileSync(join(out, 'glimstone.js'), 'utf8'), sandbox);
  for (const name of ['wireTooltips', 'infoIcon', 'mountSelect', 'attachNumberSteppers', 'enableSelectScroll', 'applyCachedAppearance', 'GLIMSTONE_VERSION']) {
    assert.ok(sandbox.GlimStone?.[name] !== undefined, name);
  }
});

test('the scripts run in a browser, which has no process', () => {
  for (const file of ['glimstone.js', 'glimstone.mjs']) assert.doesNotMatch(readFileSync(join(out, file), 'utf8'), /process\.env/, file);
});

test('the stylesheet is the one the packages ship', () => {
  const shipped = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');
  assert.equal(readFileSync(join(out, 'tokens.css'), 'utf8'), shipped);
});

test('the readme names the release it was built from', () => {
  const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
  assert.match(readFileSync(join(out, 'README.txt'), 'utf8'), new RegExp(`GlimStone ${version.replace(/\./g, '\.')}`));
});
