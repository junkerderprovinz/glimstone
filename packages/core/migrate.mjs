#!/usr/bin/env node
// Rewrites an app's sources for GlimStone's breaking changes, one transform
// per deprecated name, so an app can move before the major release that
// removes it. What a program cannot rewrite, such as a value computed at run
// time or a component with a different API, is reported with file and line.
//
// It writes in place; with --check it writes nothing and fails while there is
// something to do.
//
// Run: npx glimstone-migrate [--check] <dir>...
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Each opening `<Name ...>` tag in a JSX or Vue source, with where it starts and ends. */
function* tags(text, name) {
  for (const m of text.matchAll(new RegExp(`<${name}(?=[\\s/>])`, 'g'))) {
    let depth = 0;
    let quote = '';
    for (let i = m.index + m[0].length; i < text.length; i++) {
      const c = text[i];
      if (quote) {
        if (c === quote) quote = '';
      } else if (c === '"' || c === "'" || c === '`') quote = c;
      else if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (c === '>' && depth === 0) {
        yield { start: m.index, end: i + 1 };
        break;
      }
    }
  }
}

const SHAPE = /(\s+)(:?)shape=(?:"([^"]*)"|'([^']*)'|\{\s*["']([^"']*)["']\s*\}|\{[^}]*\})/;

/** shape="circle" becomes form="circle"; the other shapes never had an effect and go. */
function badgeShape(text) {
  let out = '';
  let at = 0;
  for (const { start, end } of tags(text, 'Badge')) {
    const tag = text.slice(start, end);
    const m = SHAPE.exec(tag);
    if (!m) continue;
    const literal = m[2] ? undefined : (m[3] ?? m[4] ?? m[5]);
    if (literal === undefined) continue;
    const keep = literal === 'circle' && !/\s:?form=/.test(tag);
    const next = tag.slice(0, m.index) + (keep ? `${m[1]}form="circle"` : '') + tag.slice(m.index + m[0].length);
    out += text.slice(at, start) + next;
    at = end;
  }
  return out + text.slice(at);
}

function badgeShapeLeft(text) {
  const left = [];
  for (const { start, end } of tags(text, 'Badge')) {
    if (/\s(:shape=|shape=\{(?!\s*["'][^"']*["']\s*\}))/.test(text.slice(start, end))) {
      left.push({ index: start, note: 'Badge shape set from an expression: set form="circle" where it is "circle" and drop it otherwise.' });
    }
  }
  return left;
}

/** A Vue listener on ToastViewport for the old event name becomes one for the new name. */
function toastEvent(from, to) {
  const listener = new RegExp(`(\\s(?:@|v-on:))${from}(?=[.=\\s/>])`, 'g');
  return (text) => {
    let out = '';
    let at = 0;
    for (const { start, end } of tags(text, 'ToastViewport')) {
      out += text.slice(at, start) + text.slice(start, end).replace(listener, `$1${to}`);
      at = end;
    }
    return out + text.slice(at);
  };
}

// An app's own CSS that mixed the accent with --ink-mix gets the token that
// does it now; any other mix is reported, since the new ink is not a mix.
const INK_MIXES = [
  [/color-mix\(\s*in srgb,\s*var\(--accent\)\s+var\(--ink-mix\),\s*black\s*\)/g, 'var(--accent-ink)'],
  [/color-mix\(\s*in srgb,\s*var\(--item-hue\)\s+var\(--ink-mix\),\s*black\s*\)/g, 'var(--item-hue-glyph)'],
];

function inkMix(text) {
  return INK_MIXES.reduce((t, [from, to]) => t.replace(from, to), text);
}

function firstMatch(pattern, note) {
  return (text) => [...text.matchAll(pattern)].slice(0, 1).map((m) => ({ index: m.index, note }));
}

function firstUse(name, note) {
  return (text) => [...text.matchAll(new RegExp(`\\b${name}\\b`, 'g'))].slice(0, 1).map((m) => ({ index: m.index, note }));
}

const SCRIPTS = /\.(tsx?|jsx?|mjs|vue)$/;
const STYLES = /\.(css|scss|vue|tsx?|jsx?)$/;

export const TRANSFORMS = [
  { name: 'Badge shape', rewrite: badgeShape, report: badgeShapeLeft },
  { name: 'BadgeShape', rewrite: (text) => text.replace(/\bBadgeShape\b/g, 'BadgeForm') },
  { name: 'AboutCard', report: firstUse('AboutCard', "AboutCard goes in 5.0.0: move to InfoTile by hand, which adds the version rows' sub-lines, the other components, Check for updates and the bug report.") },
  { name: 'DropdownListbox', report: firstUse('DropdownListbox', 'DropdownListbox goes in 5.0.0: move to Select by hand, which keeps focus on its trigger.') },
  { name: 'ToastViewport enter', rewrite: toastEvent('enter', 'mouse-enter') },
  { name: 'ToastViewport leave', rewrite: toastEvent('leave', 'mouse-leave') },
  { name: 'ToastViewport focusin', rewrite: toastEvent('focusin', 'focus') },
  { name: 'ToastViewport focusout', rewrite: toastEvent('focusout', 'blur') },
  {
    name: '--ink-mix',
    files: STYLES,
    rewrite: inkMix,
    report: firstMatch(/--ink-mix\b/g, '--ink-mix goes in 5.0.0: read --accent-ink, or move the colour onto --ink-l-light and --ink-l-dark as tokens.css does for the accent.'),
  },
];

const SKIP = new Set(['node_modules', 'dist', 'build', '.git']);
const SOURCE = /\.(tsx?|jsx?|mjs|vue|css|scss)$/;

function* sources(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (!SKIP.has(name)) yield* sources(p);
    } else if (SOURCE.test(name)) yield p;
  }
}

function main(args) {
  const check = args.includes('--check');
  const dirs = args.filter((a) => !a.startsWith('--'));
  if (!dirs.length) {
    console.error('usage: npx glimstone-migrate [--check] <dir>...');
    return 2;
  }
  let todo = 0;
  for (const path of dirs.flatMap((d) => [...sources(d)])) {
    const text = readFileSync(path, 'utf8');
    const own = TRANSFORMS.filter(({ files = SCRIPTS }) => files.test(path));
    const next = own.reduce((t, { rewrite }) => (rewrite ? rewrite(t) : t), text);
    const shown = relative(process.cwd(), path);
    if (next !== text) {
      todo++;
      if (!check) writeFileSync(path, next);
      console.log(`${shown}: ${check ? 'would rewrite' : 'rewrote'}`);
    }
    const now = check ? text : next;
    for (const { report } of own) {
      for (const { index, note } of report?.(now) ?? []) {
        todo++;
        console.log(`${shown}:${now.slice(0, index).split('\n').length}: ${note}`);
      }
    }
  }
  return check && todo ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv.slice(2)));
