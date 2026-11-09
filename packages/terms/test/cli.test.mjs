import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const cli = fileURLToPath(new URL('../check-terms.mjs', import.meta.url));
const fixtures = fileURLToPath(new URL('fixtures/', import.meta.url));
const run = (...args) => spawnSync(process.execPath, [cli, ...args], { cwd: fixtures, encoding: 'utf8' });

test('reports each break with file, line, language and key, and fails', () => {
  const r = run('app');
  assert.equal(r.status, 1);
  const lines = r.stdout.trim().split('\n');
  assert.ok(lines.some((l) => /^app[\\/]i18n\.ts:8\s+de\s+nav\.relay\s+relay: "relais" is not used, write "Relay"/.test(l)), r.stdout);
  assert.ok(lines.some((l) => /^app[\\/]locales[\\/]fr\.ts:5\s+fr\s+backup\.run\s+backup: the English says backup, the translation lacks "sauvegarde"/.test(l)), r.stdout);
  assert.match(r.stdout, /2 breaks of the glossary/);
});

test('passes once the ignore list covers every break', () => {
  const dir = mkdtempSync(join(tmpdir(), 'terms-'));
  const ignore = join(dir, 'ignore.json');
  writeFileSync(ignore, JSON.stringify(['de:nav.relay', 'fr:backup.*']));
  const r = run(`--ignore=${ignore}`, 'app');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /no breaks of the glossary/);
});

test('checks only the terms it is told to', () => {
  const r = run('--terms=backup', 'app');
  assert.equal(r.status, 1);
  assert.doesNotMatch(r.stdout, /nav\.relay/);
});

test('refuses a run without the English table', () => {
  const r = run('app/locales');
  assert.equal(r.status, 2);
  assert.match(r.stderr, /no English table/);
});

test('refuses a term it does not know', () => {
  const r = run('--terms=castle', 'app');
  assert.equal(r.status, 2);
  assert.match(r.stderr, /unknown term "castle"/);
});
