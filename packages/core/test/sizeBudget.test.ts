import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compare, packed, table } from '../../../scripts/size-budget.mjs';

test('a file within its limits passes', () => {
  const [row] = compare({ 'tokens.css': { gzip: 900, brotli: 800 } }, { 'tokens.css': { gzip: 1000, brotli: 800 } });
  assert.equal(row.problem, '');
});

test('a file past either limit fails and says which', () => {
  const [row] = compare({ 'tokens.css': { gzip: 1001, brotli: 801 } }, { 'tokens.css': { gzip: 1000, brotli: 800 } });
  assert.equal(row.problem, 'is over its gzip and brotli limit');
});

test('a file without a limit fails, so a new one is budgeted when it is added', () => {
  const [row] = compare({ 'new.js': { gzip: 1, brotli: 1 } }, {});
  assert.equal(row.problem, 'has no limit in size-budget.json');
});

test('brotli packs a stylesheet smaller than gzip', () => {
  const size = packed('.glim-card { background: var(--carbon-surface); }\n'.repeat(200));
  assert.ok(size.brotli < size.gzip);
});

test('the summary table marks the file that fails', () => {
  const rows = compare({ 'a.css': { gzip: 2048, brotli: 1024 }, 'b.js': { gzip: 10, brotli: 10 } }, { 'a.css': { gzip: 1024, brotli: 1024 }, 'b.js': { gzip: 20, brotli: 20 } });
  const out = table(rows);
  assert.match(out, /\| \*\*a\.css\*\* \| 2\.0 KiB \| 1\.0 KiB \| 1\.0 \/ 1\.0 KiB \|/);
  assert.match(out, /\| b\.js \|/);
});
