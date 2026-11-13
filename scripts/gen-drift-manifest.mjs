// Writes the manifest check-drift.mjs compares an app's copy against: a hash
// of every shipped file per release, every glim- class GS has defined, and the
// deprecated names. Releases come from the v* tags from 3.0.0 on, the oldest
// line an app still copies from; the version in packages/core/package.json is
// hashed from the working tree, so a build before its tag ships itself.
//
// Run from anywhere: node scripts/gen-drift-manifest.mjs [out.json]
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = process.argv[2] ?? fileURLToPath(new URL('../packages/core/drift-manifest.json', import.meta.url));
const git = (...args) => execFileSync('git', ['-C', root, ...args], { maxBuffer: 1 << 28 });

// What an app copies: sources and stylesheets, not docs, tests or package files.
const SHIPPED = /^(packages\/(core|react|vue)\/(src\/.+|vanilla\/.+|[^/]+\.css|glyphs\.json)|reference\/.+\.(tsx?|vue|css|json))$/;
const key = (path) => path.replace(/^packages\//, '');
const hash = (text) => createHash('sha256').update(text.replace(/\r\n/g, '\n')).digest('hex').slice(0, 16);
const semver = (v) => v.split('.').map(Number);
const older = (a, b) => semver(a).reduce((d, n, i) => d || n - semver(b)[i], 0);

const current = JSON.parse(readFileSync(new URL('../packages/core/package.json', import.meta.url), 'utf8')).version;
const tags = git('tag', '--list', 'v*').toString().split('\n').map((t) => t.slice(1))
  .filter((v) => /^\d+\.\d+\.\d+$/.test(v) && older(v, '3.0.0') >= 0 && v !== current)
  .sort(older);
// Without the tags the manifest could not name the release an old copy matches.
if (!tags.length) throw new Error('no v* release tags in this clone; fetch them with git fetch --tags');

/** Each tag's shipped files as path to blob id. */
const trees = new Map(tags.map((v) => [v, new Map(
  git('ls-tree', '-r', `v${v}`).toString().split('\n')
    .map((line) => /^\d+ blob ([0-9a-f]+)\t(.+)$/.exec(line))
    .filter((m) => m && SHIPPED.test(m[2]))
    .map((m) => [m[2], m[1]]),
)]));

// Every blob in one git process; the tags share most of them.
const ids = [...new Set([...trees.values()].flatMap((t) => [...t.values()]))];
const blobs = new Map();
const batch = execFileSync('git', ['-C', root, 'cat-file', '--batch'], { input: ids.join('\n') + '\n', maxBuffer: 1 << 28 });
for (let at = 0; at < batch.length;) {
  const eol = batch.indexOf(10, at);
  const [id, , size] = batch.subarray(at, eol).toString().split(' ');
  blobs.set(id, batch.subarray(eol + 1, eol + 1 + Number(size)).toString('utf8'));
  at = eol + 2 + Number(size);
}

const releases = new Map([...trees].map(([v, t]) => [v, new Map([...t].map(([p, id]) => [p, blobs.get(id)]))]));
releases.set(current, new Map(
  git('ls-files', '-co', '--exclude-standard').toString().split('\n')
    .filter((p) => SHIPPED.test(p))
    .map((p) => [p, readFileSync(`${root}/${p}`, 'utf8')]),
));

const versions = {};
for (const [v, files] of releases) versions[v] = Object.fromEntries([...files].map(([p, text]) => [key(p), hash(text)]).sort());

const classes = new Set();
for (const files of releases.values()) {
  for (const [p, text] of files) {
    if (!p.endsWith('.css')) continue;
    for (const m of text.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/\.(glim-[a-zA-Z0-9_-]+)/g)) classes.add(m[1]);
  }
}

// A `@deprecated` doc comment straight above an exported declaration.
const DEPRECATED = /\/\*\*(?:(?!\*\/)[\s\S])*?@deprecated\s+((?:(?!\*\/)[\s\S])*)\*\/\s*export\s+(?:default\s+)?(?:async\s+)?(?:function|const|let|class|interface|type)\s+([A-Za-z_$][\w$]*)/g;
const deprecatedIn = (files) => new Map([...files].flatMap(([, text]) => [...text.matchAll(DEPRECATED)].map((m) => [m[2], m[1]])));
const firstRelease = (name) => [...releases].find(([, files]) => deprecatedIn(files).has(name))[0];
const deprecated = [...deprecatedIn(releases.get(current))].map(([name, note]) => ({
  name,
  since: firstRelease(name),
  note: note.split('\n').map((l) => l.replace(/^\s*\*\s?/, '')).join(' ').replace(/\s+/g, ' ').trim(),
}));

writeFileSync(out, JSON.stringify({ generated: current, versions, classes: [...classes].sort(), deprecated }) + '\n');
console.log(`drift manifest: ${releases.size} releases, ${classes.size} classes, ${deprecated.length} deprecated names`);
