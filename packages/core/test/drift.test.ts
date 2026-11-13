import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const checker = fileURLToPath(new URL('../check-drift.mjs', import.meta.url));
const generator = fileURLToPath(new URL('../../../scripts/gen-drift-manifest.mjs', import.meta.url));

const hash = (text: string) => createHash('sha256').update(text.replace(/\r\n/g, '\n')).digest('hex').slice(0, 16);

const SELECTOR_430 = 'export function Selector() { return 430; }\n';
const SELECTOR_420 = 'export function Selector() { return 420; }\n';

const manifest = {
  versions: {
    '4.2.0': { 'react/src/Selector.tsx': hash(SELECTOR_420), 'core/tokens.css': hash('.glim-btn {}\n') },
    '4.3.0': { 'react/src/Selector.tsx': hash(SELECTOR_430), 'core/tokens.css': hash('.glim-btn {}\n') },
  },
  classes: ['glim-btn', 'glim-card'],
  deprecated: [{ name: 'DropdownListbox', since: '4.1.0', note: 'Use Select, which keeps focus on its trigger.' }],
};

/** An app tree of the given files, with the fixture manifest beside it. */
function app(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'gs-drift-'));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(root, 'src', path, '..'), { recursive: true });
    writeFileSync(join(root, 'src', path), text);
  }
  writeFileSync(join(root, 'manifest.json'), JSON.stringify(manifest));
  return root;
}

function check(root: string, ...flags: string[]) {
  const run = spawnSync(process.execPath, [checker, `--manifest=${join(root, 'manifest.json')}`, ...flags, join(root, 'src')], { encoding: 'utf8' });
  return { status: run.status, out: run.stdout + run.stderr };
}

const VERSION_430 = 'export const GLIMSTONE_VERSION = "4.3.0";\n';

test('a copy that matches the version the app names is not reported', () => {
  const r = check(app({ 'lib/version.ts': VERSION_430, 'components/Selector.tsx': SELECTOR_430 }));
  assert.doesNotMatch(r.out, /Selector\.tsx/);
  assert.equal(r.status, 0);
});

test('a copy that differs is reported against the version the app names', () => {
  const r = check(app({ 'lib/version.ts': VERSION_430, 'components/Selector.tsx': SELECTOR_430 + '// local fix\n' }));
  assert.match(r.out, /components[\\/]Selector\.tsx: copy differs from GS 4\.3\.0/);
});

test('a copy of an older release names the release it matches', () => {
  const r = check(app({ 'lib/version.ts': VERSION_430, 'components/Selector.tsx': SELECTOR_420 }));
  assert.match(r.out, /copy differs from GS 4\.3\.0, it matches GS 4\.2\.0/);
});

test('line endings do not count as a difference', () => {
  const r = check(app({ 'lib/version.ts': VERSION_430, 'components/Selector.tsx': SELECTOR_430.replace(/\n/g, '\r\n') }));
  assert.doesNotMatch(r.out, /Selector\.tsx/);
});

test('a version GS never released is reported', () => {
  const r = check(app({ 'lib/version.ts': 'export const GLIMSTONE_VERSION = "4.2.8";\n' }));
  assert.match(r.out, /GS 4\.2\.8 is not a released version/);
});

test('the version flag wins over the constant in the app', () => {
  const r = check(app({ 'lib/version.ts': VERSION_430, 'components/Selector.tsx': SELECTOR_420 }), '--version=4.2.0');
  assert.doesNotMatch(r.out, /Selector\.tsx/);
});

test('an app class with the reserved prefix is reported, a GS class is not', () => {
  const r = check(app({ 'lib/version.ts': VERSION_430, 'styles/app.css': '.glim-btn { color: red; }\n.glim-vault-row:hover { color: blue; }\n' }));
  assert.match(r.out, /styles[\\/]app\.css:2: app class \.glim-vault-row uses the glim- prefix that GS reserves/);
  assert.doesNotMatch(r.out, /\.glim-btn /);
});

test('a deprecated name in use is reported with what replaces it', () => {
  const r = check(app({ 'lib/version.ts': VERSION_430, 'pages/Jobs.tsx': 'import { DropdownListbox } from "../lib";\n' }));
  assert.match(r.out, /pages[\\/]Jobs\.tsx:1: DropdownListbox is deprecated since GS 4\.1\.0\. Use Select/);
});

test('a copy of the deprecated component itself is not reported as a use', () => {
  const r = check(app({ 'lib/version.ts': VERSION_430, 'lib/Selector.tsx': SELECTOR_430 + '/** @deprecated */\nexport function DropdownListbox() {}\n' }));
  assert.doesNotMatch(r.out, /DropdownListbox is deprecated/);
});

test('a stylesheet that mentions a deprecated component is not a use', () => {
  const r = check(app({ 'lib/version.ts': VERSION_430, 'styles/app.css': '/* the list of DropdownListbox */\n' }));
  assert.doesNotMatch(r.out, /DropdownListbox is deprecated/);
});

test('findings only fail the run with --strict', () => {
  const root = app({ 'lib/version.ts': VERSION_430, 'components/Selector.tsx': SELECTOR_420 });
  assert.equal(check(root).status, 0);
  assert.equal(check(root, '--strict').status, 1);
});

test('the checker never writes to the app', () => {
  const root = app({ 'lib/version.ts': VERSION_430, 'components/Selector.tsx': SELECTOR_420 });
  check(root, '--strict');
  assert.equal(readFileSync(join(root, 'src', 'components', 'Selector.tsx'), 'utf8'), SELECTOR_420);
});

test('the generated manifest hashes the working tree as the current version', () => {
  const out = join(mkdtempSync(join(tmpdir(), 'gs-manifest-')), 'manifest.json');
  const run = spawnSync(process.execPath, [generator, out], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  const built = JSON.parse(readFileSync(out, 'utf8'));
  const current = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
  const tokens = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');
  assert.equal(built.versions[current]['core/tokens.css'], hash(tokens));
  assert.ok(built.versions['4.3.0'], 'released versions come from the tags');
  assert.ok(built.classes.includes('glim-btn'));
  assert.ok(built.deprecated.some((d: { name: string }) => d.name === 'DropdownListbox'));
});
