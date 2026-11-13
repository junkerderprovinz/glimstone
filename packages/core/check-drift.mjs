#!/usr/bin/env node
// Reports how an app's copy of GlimStone drifts from the release it names.
//
// A file whose name GS also ships is hashed and compared with that release's
// file: "copy differs from GS x.y.z", and the release it matches when there is
// one. A class the app defines with the glim- prefix, which GS keeps for its
// own, and a deprecated GS name still in use are reported too. The release is
// the --version flag, else the GLIMSTONE_VERSION constant found in the app.
//
// It reads and never writes. Findings fail the run only with --strict.
//
// Run: node check-drift.mjs [--version=x.y.z] [--strict] [--manifest=FILE] <dir>...
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

const flags = new Map();
const dirs = [];
for (const arg of process.argv.slice(2)) {
  const m = /^--(version|manifest|strict)(?:=(.*))?$/.exec(arg);
  if (m) flags.set(m[1], m[2] ?? true);
  else dirs.push(arg);
}
if (!dirs.length) {
  console.error('usage: node check-drift.mjs [--version=x.y.z] [--strict] [--manifest=FILE] <dir>...');
  process.exit(2);
}

const manifest = JSON.parse(readFileSync(flags.get('manifest') ?? new URL('./drift-manifest.json', import.meta.url), 'utf8'));
const hash = (text) => createHash('sha256').update(text.replace(/\r\n/g, '\n')).digest('hex').slice(0, 16);
const SKIP = new Set(['node_modules', 'dist', 'build', '.git']);
const SOURCE = /\.(tsx?|jsx?|mjs|vue|css|json)$/;

function* sources(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (!SKIP.has(name)) yield* sources(p);
    } else if (SOURCE.test(name)) yield p;
  }
}

const files = dirs.flatMap((d) => [...sources(d)]).map((path) => ({ path, text: readFileSync(path, 'utf8') }));
const shown = (path) => relative(process.cwd(), path);
const lineOf = (text, index) => text.slice(0, index).split('\n').length;
const findings = [];

let version = flags.get('version');
if (!version) {
  for (const { text } of files) {
    version = /GLIMSTONE_VERSION\s*=\s*['"](\d+\.\d+\.\d+)['"]/.exec(text)?.[1];
    if (version) break;
  }
}
const release = version && manifest.versions[version];
if (!version) findings.push('no GLIMSTONE_VERSION found; pass --version=x.y.z');
else if (!release) findings.push(`GS ${version} is not a released version`);

// Every release a hash appears in, for naming the one an outdated copy matches.
const releasesOf = new Map();
for (const [v, entries] of Object.entries(manifest.versions)) {
  for (const h of Object.values(entries)) releasesOf.set(h, [...(releasesOf.get(h) ?? []), v]);
}

if (release) {
  const byName = new Map();
  for (const [path, h] of Object.entries(release)) byName.set(basename(path), [...(byName.get(basename(path)) ?? []), h]);
  for (const { path, text } of files) {
    const expected = byName.get(basename(path));
    if (!expected) continue;
    const h = hash(text);
    if (expected.includes(h)) continue;
    const matches = releasesOf.get(h);
    findings.push(`${shown(path)}: copy differs from GS ${version}${matches ? `, it matches GS ${matches.at(-1)}` : ''}`);
  }
}

const gsClasses = new Set(manifest.classes);
for (const { path, text } of files.filter((f) => f.path.endsWith('.css'))) {
  const css = text.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  const seen = new Set();
  for (const m of css.matchAll(/\.(glim-[a-zA-Z0-9_-]+)/g)) {
    if (gsClasses.has(m[1]) || seen.has(m[1])) continue;
    seen.add(m[1]);
    findings.push(`${shown(path)}:${lineOf(css, m.index)}: app class .${m[1]} uses the glim- prefix that GS reserves`);
  }
}

// A copy of a GS file defines the deprecated names rather than using them,
// and a stylesheet only names them in comments.
const shipped = new Set(Object.values(manifest.versions).flatMap((entries) => Object.keys(entries).map((p) => basename(p))));
const users = files.filter((f) => !shipped.has(basename(f.path)) && !f.path.endsWith('.css'));
for (const { name, note, find } of manifest.deprecated) {
  const re = new RegExp(find ?? `\\b${name}\\b`);
  for (const { path, text } of users) {
    const m = re.exec(text);
    if (m) findings.push(`${shown(path)}:${lineOf(text, m.index)}: ${note}`);
  }
}

for (const f of findings) console.log(f);
console.log(findings.length ? `\n${findings.length} finding(s).` : `ok: the copy matches GS ${version}`);
process.exit(findings.length && flags.has('strict') ? 1 : 0);
