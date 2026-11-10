#!/usr/bin/env node
// Checks an app's translations against the GlimStone glossary.
//
// Run: node check-terms.mjs [--terms=relay,backup] [--ignore=ignore.json] <file|dir>...
// Every locale source under the paths is read: a module with one object per
// language, a JSON or an ARB file. ignore.json lists keys to leave out, as
// "key" or "lang:key", where * stands for any run of characters.
// Exits 1 when a translation breaks the glossary and 2 when the run cannot start.
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { checkTables } from './check.mjs';
import { readLocales } from './read.mjs';

const glossary = JSON.parse(readFileSync(new URL('./terms.json', import.meta.url), 'utf8'));

function stop(message) {
  console.error(message);
  process.exit(2);
}

const flags = new Map();
const paths = [];
for (const arg of process.argv.slice(2)) {
  const m = /^--(terms|ignore)=(.*)$/.exec(arg);
  if (m) flags.set(m[1], m[2]);
  else paths.push(arg);
}
if (!paths.length) stop('usage: node check-terms.mjs [--terms=ID,...] [--ignore=FILE] <file|dir>...');

const terms = flags.get('terms')?.split(',').filter(Boolean);
for (const id of terms ?? []) if (!(id in glossary.terms)) stop(`unknown term "${id}"`);
const ignore = flags.has('ignore') ? JSON.parse(readFileSync(flags.get('ignore'), 'utf8')) : [];

const tables = readLocales(paths, glossary.languages);
if (!tables.en) stop(`no English table under ${paths.join(', ')}`);

const found = checkTables(tables, { glossary, ignore, terms });
for (const v of found) {
  const entry = glossary.terms[v.term][v.lang];
  const message = v.kind === 'forbidden'
    ? `"${v.word.replace(/^\*|\*$/g, '')}" is not used, write "${entry.singular}"`
    : `the English says ${glossary.terms[v.term].en.singular}, the translation lacks "${entry.singular}"`;
  console.log(`${relative(process.cwd(), v.file)}:${v.line}  ${v.lang}  ${v.key}  ${v.term}: ${message}`);
}
const n = found.length;
console.log(n === 0 ? 'no breaks of the glossary' : `${n} break${n === 1 ? '' : 's'} of the glossary`);
process.exit(n === 0 ? 0 : 1);
