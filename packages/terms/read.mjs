import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { readLocaleText } from './locales.mjs';

const SOURCES = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.arb']);
const SKIPPED = /\.(test|spec)\.|\.d\.ts$/;

/**
 * languageOf names the language of a table: its constant's name when that is
 * a language code, or else the code that ends its file name (fr.ts,
 * app_pt_BR.arb, de-AT.json), passing over a region in capitals. It answers
 * null for anything else.
 */
export function languageOf(name, file, languages) {
  if (name && name in languages) return name;
  const parts = basename(file, extname(file)).split(/[_.-]/);
  if (parts.length > 1 && /^[A-Z]{2}$/.test(parts[parts.length - 1])) parts.pop();
  const code = parts[parts.length - 1].toLowerCase();
  return code in languages ? code : null;
}

function* files(path) {
  if (!statSync(path).isDirectory()) {
    yield path;
    return;
  }
  for (const name of readdirSync(path).sort()) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const child = join(path, name);
    if (statSync(child).isDirectory()) yield* files(child);
    else if (SOURCES.has(extname(name)) && !SKIPPED.test(name)) yield child;
  }
}

/**
 * readLocales reads every locale source under the given files and
 * directories into one table per language: key to { value, file, line }.
 */
export function readLocales(paths, languages) {
  const tables = {};
  for (const path of paths) {
    for (const file of files(path)) {
      const json = ['.json', '.arb'].includes(extname(file));
      for (const table of readLocaleText(readFileSync(file, 'utf8'), { json })) {
        const lang = languageOf(table.name, file, languages);
        if (!lang) continue;
        tables[lang] ??= {};
        for (const { key, value, line } of table.entries) tables[lang][key] = { value, file, line };
      }
    }
  }
  return tables;
}
