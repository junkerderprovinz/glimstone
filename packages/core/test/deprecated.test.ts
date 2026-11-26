import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { badgeClassName } from '../src/badge.ts';
import { DEPRECATED, deprecatedReads, deprecationNote, warnDeprecated, warnDeprecatedClasses, warnDeprecatedStyles } from '../src/deprecated.ts';

function warnings(run: () => void): string[] {
  const seen: string[] = [];
  const warn = console.warn;
  console.warn = (message: string) => seen.push(message);
  try {
    run();
  } finally {
    console.warn = warn;
  }
  return seen;
}

test('a deprecated name warns once per page with its replacement and the release that removes it', () => {
  const seen = warnings(() => {
    warnDeprecated('DropdownListbox');
    warnDeprecated('DropdownListbox');
  });
  assert.equal(seen.length, 1);
  assert.match(seen[0]!, /DropdownListbox is deprecated since GlimStone 3\.6\.0 and goes in 5\.0\.0\. Use Select/);
});

test('every deprecated name goes in a major release after the one that deprecated it', () => {
  for (const [name, { since, removal }] of Object.entries(DEPRECATED)) {
    assert.match(removal, /^\d+\.0\.0$/, name);
    assert.ok(Number(removal.split('.')[0]) > Number(since.split('.')[0]), name);
  }
});

test('a badge given the old shape warns, one given a form does not', () => {
  assert.deepEqual(warnings(() => badgeClassName({ form: 'circle' })), []);
  assert.match(warnings(() => badgeClassName({ shape: 'circle' }))[0] ?? '', /Badge shape is deprecated/);
});

test('a deprecated component warns in every framework package', () => {
  const files = { react: 'tsx', solid: 'tsx', vue: 'vue', svelte: 'svelte' };
  for (const name of ['AboutCard', 'DropdownListbox']) {
    for (const [pkg, ext] of Object.entries(files)) {
      const source = readFileSync(new URL(`../../${pkg}/src/${name}.${ext}`, import.meta.url), 'utf8');
      assert.ok(source.includes(`warnDeprecated("${name}")`), `${pkg} ${name}`);
    }
  }
});

test('pairsOnPhone says it has no effect and warns from the selector of every framework package', () => {
  assert.equal(DEPRECATED['Selector pairsOnPhone']?.removal, '6.0.0');
  assert.match(deprecationNote('Selector pairsOnPhone'), /has no effect/);
  const files = { react: 'tsx', solid: 'tsx', vue: 'vue', svelte: 'svelte' };
  for (const [pkg, ext] of Object.entries(files)) {
    const source = readFileSync(new URL(`../../${pkg}/src/Selector.${ext}`, import.meta.url), 'utf8');
    assert.match(source, /if \((?:props\.)?pairsOnPhone !== undefined\) warnDeprecated\("Selector pairsOnPhone"\)/, pkg);
    assert.match(source, /@deprecated[^*]*no effect/, pkg);
  }
});

const rule = (declarations: string) => ({ cssText: '', style: { cssText: declarations } });

test('a stylesheet that reads an old token warns once per name with its replacement and the release that removes it', () => {
  const sheets = [
    { cssRules: [rule('background: var(--carbon-surface); border-color: var(--carbon-surface);')] },
    { cssRules: [{ cssText: '', cssRules: [rule('color: var(--color-carbon-border, red);'), { cssText: '', cssRules: [rule('background-color: var(--status-ok-hover);')] }] }] },
  ];
  const seen = warnings(() => {
    warnDeprecatedStyles(sheets);
    warnDeprecatedStyles(sheets);
  });
  assert.equal(seen.length, 3);
  assert.match(seen[0]!, /^--carbon-surface is deprecated since GlimStone 5\.0\.0 and goes in 6\.0\.0\. Use `--stone-surface`/);
  assert.match(seen[1]!, /^--color-carbon-border is deprecated .* Use `--color-stone-border`/);
  assert.match(seen[2]!, /^--status-ok-hover is deprecated .* `--status-ok-wash`/);
});

test('declaring an old token, as the alias block does, is not a use', () => {
  const sheets = [{ cssRules: [rule('--carbon-text: var(--stone-text); --color-carbon-text: var(--stone-text); --color-statusFailHover: var(--status-fail-hover);')] }];
  assert.deepEqual(warnings(() => warnDeprecatedStyles(sheets)), []);
});

test('a sheet the page may not read is skipped and the rest are still read', () => {
  const foreign = {
    get cssRules(): never {
      throw new Error('SecurityError');
    },
  };
  const seen = warnings(() => warnDeprecatedStyles([foreign, { cssRules: [rule('color: var(--carbon-text-muted);')] }]));
  assert.equal(seen.length, 1);
  assert.match(seen[0]!, /^--carbon-text-muted is deprecated/);
});

test('an element with a deprecated class warns with what replaces it', () => {
  const root = { querySelector: (selector: string) => (selector === '.glim-avatar--hued' ? {} : null) };
  const seen = warnings(() => warnDeprecatedClasses(root));
  assert.equal(seen.length, 1);
  assert.match(seen[0]!, /^\.glim-avatar--hued is deprecated .* `glim-avatar--toned`/);
});

test('the stylesheets and components GlimStone ships read none of its deprecated tokens', () => {
  const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
  const shipped = ['core/tokens.css', 'core/tailwind-theme.css', ...readdirSync(new URL('../vanilla/', import.meta.url)).filter((f) => f.endsWith('.css')).map((f) => `core/vanilla/${f}`)];
  for (const pkg of ['core', 'react', 'vue', 'solid', 'svelte']) {
    for (const f of readdirSync(new URL(`../../${pkg}/src/`, import.meta.url))) if (/\.(tsx?|vue|svelte)$/.test(f)) shipped.push(`${pkg}/src/${f}`);
  }
  const reads = shipped.flatMap((path) => {
    const text = read(path).replace(/\/\*[\s\S]*?\*\//g, '');
    return [...text.matchAll(/([^{};]*)\{([^{}]*)\}/g)].flatMap((m) => deprecatedReads(m[2]!).map((name) => `${path}: ${name}`));
  });
  assert.deepEqual(reads, []);
});
