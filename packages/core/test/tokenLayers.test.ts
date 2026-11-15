import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** A selector that can land on the document element itself rather than on something inside it. */
const onRoot = (selector: string) => /^(:root|html|\[)/.test(selector) && !/[\s>+~]/.test(selector);

/** A selector list split at its top-level commas, leaving those inside :not() and :is() alone. */
function selectors(list: string): string[] {
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

/** The custom properties set on the document element, unlayered and inside a cascade layer. */
function rootDeclarations() {
  const layered = new Set<string>();
  const unlayered = new Set<string>();
  const open: string[] = [];
  let text = '';
  for (const ch of css) {
    if (ch === '{') {
      open.push(text.trim());
      text = '';
    } else if (ch === '}') {
      open.pop();
      text = '';
    } else if (ch === ';') {
      const name = /^\s*(--[\w-]+)\s*:/.exec(text)?.[1];
      const selector = open.filter((s) => !s.startsWith('@')).at(-1);
      if (name && selector && selectors(selector).some(onRoot)) {
        (open.some((s) => s.startsWith('@layer')) ? layered : unlayered).add(name);
      }
      text = '';
    } else text += ch;
  }
  return { layered, unlayered };
}

test('a custom property the root sets inside a cascade layer has no unlayered root default that outranks it', () => {
  const { layered, unlayered } = rootDeclarations();
  assert.deepEqual([...layered].filter((name) => unlayered.has(name)), []);
});
