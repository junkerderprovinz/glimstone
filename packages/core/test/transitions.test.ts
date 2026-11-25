import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** A list split at its top-level commas. */
function items(list: string): string[] {
  const parts = [''];
  let depth = 0;
  for (const ch of list) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) parts.push('');
    else parts[parts.length - 1] += ch;
  }
  return parts.map((s) => s.trim());
}

/** The parts of one transition, split at the spaces outside brackets. */
function words(item: string): string[] {
  return items(item.replace(/\s+(?![^(]*\))/g, ',')).filter(Boolean);
}

const TOKEN = /^(var\(--(motion|drag)-[\w-]+(,\s*[^)]*)?\)|calc\(.*var\(--motion-[\w-]+.*\))$/;
const CURVE = /^(ease|ease-in|ease-out|ease-in-out|step-start|step-end|cubic-bezier\(.*\)|linear\(.*\)|steps\(.*\))$/;

test('every transition takes its time and its curve from the motion engine', () => {
  const misses: string[] = [];
  for (const [, value] of css.matchAll(/(?<![\w-])transition:\s*([^;]+);/g)) {
    if (value!.trim() === 'none') continue;
    for (const item of items(value!)) {
      const [, ...rest] = words(item);
      for (const w of rest) {
        if (/^[\d.]+m?s$/.test(w) || (CURVE.test(w) && !TOKEN.test(w))) misses.push(`${item}: ${w}`);
      }
    }
  }
  assert.deepEqual(misses, []);
});

/** The custom properties of the first block whose selector is exactly `selector` and that sets the spring. */
function block(selector: string): Record<string, string> {
  for (let start = css.indexOf(`${selector} {`); start >= 0; start = css.indexOf(`${selector} {`, start + 1)) {
    const body = css.slice(start + selector.length + 2, css.indexOf('}', start));
    const props = Object.fromEntries([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]));
    if ('--motion-spring' in props) return props;
  }
  assert.fail(`no block ${selector} with the spring`);
}

test('a move springs and a fade does not, at every level', () => {
  const subtle = block(':root');
  assert.match(subtle['--motion-spring']!, /^linear\(0, /);
  assert.match(subtle['--motion-ease']!, /^cubic-bezier\(/);
  assert.equal(subtle['--motion-page-ease'], 'var(--motion-spring)');
  assert.match(block(":root[data-motion='wild']")['--motion-spring']!, /^linear\(0, .*1\.1 /);
  assert.equal(block(":root[data-motion='off']")['--motion-spring'], 'linear');
  assert.ok(block(":root[data-motion='storm']")['--motion-spring']);
  for (const level of [":root[data-motion='wild']", ":root[data-motion='off']", ":root[data-motion='storm']"]) assert.ok(block(level)['--motion-ease'], level);
});
