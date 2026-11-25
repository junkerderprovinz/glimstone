import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Rule 14 as the stylesheet draws it, outside the contrast step and Windows'
// contrast themes, which give every field an edge on purpose.
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

/** The fill the last rule with exactly this selector sets. */
function fill(selector: string): string | undefined {
  const hits = rules.filter((r) => r.selector.split(/,\s*/).includes(selector)).map((r) => declared(r.body, 'background(?:-color)?'));
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

test('a select trigger and a combobox take a text field\'s fill and its focus step', () => {
  assert.equal(fill('.glim-select-trigger'), fill('.glim-input'));
  assert.equal(fill('.glim-combobox-control'), fill('.glim-input'));
  assert.equal(fill('.glim-select-trigger:focus-visible'), fill('.glim-input:focus'));
  assert.equal(fill('.glim-combobox-control:focus-within'), fill('.glim-input:focus'));
  assert.notEqual(fill('.glim-select-trigger:focus-visible'), fill('.glim-select-trigger'));
});

test('in a well or a sub-card a focused picker steps up from the fields\' ground there', () => {
  const inside = rules.filter((r) => /^:is\(\.glim-well, \.glim-subcard\)/.test(r.selector) && /focus/.test(r.selector) && PICKERS.some((p) => r.selector.includes(p)));
  assert.ok(inside.length > 0, 'no focus rule for a picker in a well');
  for (const r of inside) assert.equal(declared(r.body, 'background(?:-color)?'), fill('.glim-well .glim-input:focus'), r.selector);
});
