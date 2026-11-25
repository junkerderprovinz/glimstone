import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

const value = (name: string) => css.match(new RegExp(`${name}:\s*([^;]+);`))?.[1]!.trim();
const rule = (selector: string) => {
  const start = css.indexOf(`${selector} {`);
  assert.ok(start >= 0, `no rule ${selector}`);
  return css.slice(start + selector.length + 2, css.indexOf('}', start));
};

test('the house face is IBM Plex Sans, with Noto behind it for the scripts Plex does not draw', () => {
  const stack = value('--font-sans')!.split(/,\s*/);
  assert.deepEqual(stack.slice(0, 2), ['"IBM Plex Sans Variable"', '"IBM Plex Sans"']);
  for (const noto of ['"Noto Sans Variable"', '"Noto Sans Arabic Variable"', '"Noto Sans Hebrew Variable"', '"Noto Sans Thai Variable"']) {
    assert.ok(stack.indexOf(noto) > 1, noto);
  }
});

test('the text is set in three weights and no other', () => {
  assert.deepEqual([value('--font-weight-regular'), value('--font-weight-medium'), value('--font-weight-strong')], ['400', '500', '600']);
  const weights = new Set([...css.matchAll(/font-weight:\s*([^;]+);/g)].map((m) => m[1]!.trim()));
  for (const w of weights) assert.match(w, /^(400|500|600|inherit|var\(--font-weight-(regular|medium|strong)\))$/, w);
});

test('each size on the type scale has a tracking of its own, tighter as it grows', () => {
  const steps = ['status', 'title', 'body', 'subline', 'meta'].map((s) => parseFloat(value(`--tracking-${s}`)!));
  for (let i = 1; i < steps.length; i++) assert.ok(steps[i]! >= steps[i - 1]!, steps.join(' '));
  assert.match(rule('body'), /letter-spacing: var\(--tracking-body\);/);
  assert.match(rule(':is(h1, h2, h3, .glim-modal-title)'), /letter-spacing: var\(--tracking-status\);/);
  assert.match(rule('.glim-badge'), /letter-spacing: var\(--tracking-meta\);/);
});

test('headings balance their lines and paragraphs avoid a lone last word', () => {
  assert.match(rule(':is(h1, h2, h3, .glim-modal-title)'), /text-wrap: balance;/);
  assert.match(rule('p'), /text-wrap: pretty;/);
  assert.match(rule(':is(b, strong)'), /font-weight: var\(--font-weight-strong\);/);
});
