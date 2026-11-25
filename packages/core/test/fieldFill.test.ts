import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Rule 14 as the stylesheet draws it, outside the contrast step and Windows'
// contrast themes, which give every field an edge.
const source = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

function withoutBlocks(css: string, opening: RegExp): string {
  let out = css;
  for (let m = opening.exec(out); m; m = opening.exec(out)) {
    let depth = 0;
    let end = m.index + m[0].length - 1;
    for (; end < out.length; end++) {
      if (out[end] === '{') depth++;
      else if (out[end] === '}' && --depth === 0) break;
    }
    out = out.slice(0, m.index) + out.slice(end + 1);
  }
  return out;
}

const calm = withoutBlocks(
  withoutBlocks(withoutBlocks(source, /@media \(prefers-contrast: more\)\s*\{/), /@media \(forced-colors: active\)\s*\{/),
  /:root\[data-contrast="more"\][^{]*\{/,
);

const rules = [...calm.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
  selector: selector!.trim().replace(/\s+/g, ' '),
  body: body!,
}));

const declared = (body: string, property: string) =>
  body.match(new RegExp(`(?<![\\w-])${property}\\s*:\\s*([^;]+);`))?.[1]!.trim();

/** A selector list split at its top-level commas, leaving those inside :is() and :not() alone. */
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

/** The fill the last rule with exactly this selector sets. */
function fill(selector: string): string | undefined {
  const hits = rules.filter((r) => selectors(r.selector).includes(selector)).map((r) => declared(r.body, 'background(?:-color)?'));
  return hits.filter(Boolean).at(-1);
}

const PICKERS = ['.glim-select-trigger', '.glim-combobox-control'];

test('a select trigger and a combobox draw no edge', () => {
  const edges = rules
    .filter((r) => PICKERS.some((p) => r.selector.includes(p)))
    .flatMap((r) => [declared(r.body, 'border'), declared(r.body, 'border-color')].filter((v) => v && !/^(0|none|transparent)$/.test(v)).map((v) => `${r.selector}: ${v}`));
  assert.deepEqual(edges, []);
});

test('a select trigger and a combobox draw no ring on focus', () => {
  const rings = rules
    .filter((r) => PICKERS.some((p) => r.selector.includes(p)) && /:focus/.test(r.selector))
    .flatMap((r) => [declared(r.body, 'outline')].filter((v) => v && v !== 'none').map((v) => `${r.selector}: ${v}`));
  assert.deepEqual(rings, []);
  assert.equal(declared(rules.find((r) => r.selector.includes('.glim-select-trigger:focus-visible'))!.body, 'outline'), 'none');
});

const FIELDS = ['.glim-input', ...PICKERS];
const WRONG = ':is(.glim-input, .glim-select-trigger, .glim-combobox-control)[aria-invalid="true"]';

test('a text field, a select trigger and a combobox rest, hover and focus on the field steps', () => {
  for (const field of FIELDS) assert.equal(fill(field), 'var(--field-rest)', field);
  assert.equal(fill('.glim-input:focus'), 'var(--field-focus)');
  assert.equal(fill('.glim-select-trigger:focus-visible'), 'var(--field-focus)');
  assert.equal(fill('.glim-combobox-control:focus-within'), 'var(--field-focus)');
  assert.match(calm, /:is\(\.glim-input, \.glim-select-trigger, \.glim-combobox-control\):hover:not\([^)]*\) \{\s*background-color: var\(--field-hover\);/);
});

test('a field sits a little into its surface and takes the accent ink for its caret', () => {
  for (const field of FIELDS) {
    const body = rules.filter((r) => selectors(r.selector).includes(field)).map((r) => r.body).join(';');
    assert.equal(declared(body, 'box-shadow'), 'var(--field-sink)', field);
    assert.equal(declared(body, 'caret-color'), 'var(--accent-ink)', field);
  }
});

test('in a well or a sub-card the fields take the field steps declared there, not a fill of their own', () => {
  assert.ok(rules.some((r) => r.selector === '.glim-well, .glim-subcard' && /--field-rest/.test(r.body)), 'no field steps for a well');
  const own = rules.filter((r) => /\.glim-(well|subcard)\b/.test(r.selector) && FIELDS.some((f) => r.selector.includes(f)) && declared(r.body, 'background(?:-color)?'));
  assert.deepEqual(own.map((r) => r.selector), []);
});

test('a wrong value washes the field red, a little deeper while it has the keys', () => {
  assert.equal(fill(WRONG), 'var(--field-invalid)');
  assert.equal(fill(`${WRONG}:is(:focus, :focus-within)`), 'var(--field-invalid-focus)');
});

test('a field that turns wrong shakes once, only where motion is wanted', () => {
  const at = source.indexOf(`:root:not([data-motion='off']) ${WRONG} {`);
  assert.ok(at >= 0, 'no shake');
  assert.match(source.slice(source.lastIndexOf('@media', at), at), /^@media \(prefers-reduced-motion: no-preference\)/);
  assert.match(source.slice(at, source.indexOf('}', at)), /animation: glim-shake var\(--motion-shake-dur\)/);
});
