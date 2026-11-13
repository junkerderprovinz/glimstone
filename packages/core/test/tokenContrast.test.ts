import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { accentInks, contrastRatio, MIN_TEXT_CONTRAST } from '../src/contrast.ts';
import { ACCENTS, hueVars, RAINBOW } from '../src/appearance.ts';

// What tokens.css promises, read from tokens.css itself, so a changed value is
// measured rather than trusted.
const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');

/** The custom properties declared in the first block that opens with `head`. */
function block(head: string): Record<string, string> {
  const start = css.indexOf(head + ' {');
  assert.ok(start >= 0, `no block ${head}`);
  const body = css.slice(start + head.length + 2, css.indexOf('}', start));
  const props: Record<string, string> = {};
  for (const m of body.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) props[m[1]!] = m[2]!.trim();
  return props;
}

const dark = block(':root,\n[data-theme="dark"]');
const oled = { ...dark, ...block('[data-theme="dark"][data-oled]') };
const lightMedia = block('  :root:not([data-theme="dark"])');
const lightChosen = block('[data-theme="light"]');

const THEMES = { dark, OLED: oled, 'light (system)': lightMedia, 'light (chosen)': lightChosen };

// A ring stands on the ground around a control: the page, the rail, a card, a
// well, or a row's hover fill when the ring is drawn inside the row.
const RING_GROUNDS = ['--carbon-bg', '--carbon-sidebar', '--carbon-surface', '--carbon-surface2', '--carbon-hover'];
// A field is filled with surface2 on a card and with surface3 in a well or a
// sub-card.
const FIELD_GROUNDS = ['--carbon-surface', '--carbon-surface2', '--carbon-surface3'];

const MIN_GRAPHIC_CONTRAST = 3;

type Rgba = [number, number, number, number];

function parse(colour: string): Rgba {
  if (/^#[0-9a-f]{6}$/i.test(colour)) {
    const n = parseInt(colour.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  const m = colour.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  assert.ok(m, `cannot read ${colour}`);
  return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
}

const hex = (c: Rgba) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/** A colour as it lands on an opaque ground, translucent ones blended over it. */
function over(colour: Rgba, ground: string): string {
  const g = parse(ground);
  const a = colour[3];
  return hex([0, 1, 2].map((i) => colour[i]! * a + g[i]! * (1 - a)) as unknown as Rgba);
}

/** `amount` of `a` mixed with `b`, the way color-mix() in srgb mixes. */
function mix(a: Rgba, amount: number, b: Rgba): Rgba {
  const alpha = a[3] * amount + b[3] * (1 - amount);
  if (alpha === 0) return [0, 0, 0, 0];
  const ch = (i: number) => (a[i]! * a[3] * amount + b[i]! * b[3] * (1 - amount)) / alpha;
  return [ch(0), ch(1), ch(2), alpha];
}

const NAMED: Record<string, Rgba> = { black: [0, 0, 0, 1], white: [255, 255, 255, 1], transparent: [0, 0, 0, 0] };

/**
 * Resolves a token value the way the browser would on the root, for the subset
 * of CSS the colour tokens use: hex, rgba(), var() with a fallback, and a
 * two-colour color-mix() in srgb.
 */
function resolve(value: string, scope: Record<string, string>): Rgba {
  const v = value.trim();
  if (NAMED[v]) return NAMED[v];
  const ref = v.match(/^var\((--[\w-]+)\s*(?:,\s*([\s\S]+))?\)$/);
  if (ref) {
    const own = scope[ref[1]!];
    if (own !== undefined) return resolve(own, scope);
    assert.ok(ref[2], `${ref[1]} is undefined and has no fallback`);
    return resolve(ref[2], scope);
  }
  const m = v.match(/^color-mix\(in srgb,\s*([\s\S]+?)\s+(var\(--[\w-]+\)|[\d.]+%),\s*([\s\S]+)\)$/);
  if (m) {
    const share = parseFloat(m[2]!.startsWith('var(') ? scope[m[2]!.slice(4, -1)]! : m[2]!) / 100;
    return mix(resolve(m[1]!, scope), share, resolve(m[3]!, scope));
  }
  return parse(v);
}

/** The theme as it stands after applyAccent(hex) wrote its overrides on the root. */
function withAccent(theme: Record<string, string>, accent: string): Record<string, string> {
  const { light, dark: darkInk } = accentInks(accent);
  return {
    ...theme,
    '--accent': accent,
    ...(light ? { '--accent-ink-light': light } : {}),
    ...(darkInk ? { '--accent-ink-dark': darkInk } : {}),
  };
}

const CUSTOM_ACCENTS = ['#FFFF00', '#0000FF', '#777777', '#FAFAFA', '#050505'];
const ALL_ACCENTS = [...ACCENTS.map((a) => [a.name, a.hex] as const), ...CUSTOM_ACCENTS.map((h) => [`custom ${h}`, h] as const)];

for (const [themeName, theme] of Object.entries(THEMES)) {
  for (const [accentName, accent] of ALL_ACCENTS) {
    test(`the focus ring for ${accentName} reaches 3:1 on every ground of ${themeName}`, () => {
      const scope = withAccent(theme, accent);
      const ring = resolve('var(--focus-ring)', scope);
      for (const g of RING_GROUNDS) {
        const ground = hex(resolve(`var(${g})`, scope));
        const r = contrastRatio(over(ring, ground), ground);
        assert.ok(r >= MIN_GRAPHIC_CONTRAST, `${g} ${ground}: ${r.toFixed(2)}:1`);
      }
      assert.equal(ring[3], 1, 'the ring is opaque');
    });
  }

  test(`a rainbow position's focus ring reaches 3:1 on every ground of ${themeName}`, () => {
    RAINBOW.forEach((hue, i) => {
      const scope = { ...theme, [`--rb-${i}`]: hue };
      const ring = resolve(hueVars(i)['--item-hue-ring']!, scope);
      for (const g of RING_GROUNDS) {
        const ground = hex(resolve(`var(${g})`, scope));
        const r = contrastRatio(over(ring, ground), ground);
        assert.ok(r >= MIN_GRAPHIC_CONTRAST, `position ${i} on ${g} ${ground}: ${r.toFixed(2)}:1`);
      }
      assert.equal(ring[3], 1, `position ${i} is opaque`);
    });
  });

  test(`placeholder text reaches 4.5:1 on every field fill of ${themeName}`, () => {
    const ink = resolve('var(--field-placeholder)', theme);
    for (const g of FIELD_GROUNDS) {
      const ground = hex(resolve(`var(${g})`, theme));
      const r = contrastRatio(over(ink, ground), ground);
      assert.ok(r >= MIN_TEXT_CONTRAST, `${g} ${ground}: ${r.toFixed(2)}:1`);
    }
  });
}

test('every placeholder colour in the stylesheet is the placeholder token', () => {
  const colours = [...css.matchAll(/::placeholder[^{]*\{([^}]*)\}/g)].flatMap((m) => [...m[1]!.matchAll(/(?<![\w-])color:\s*([^;]+);/g)]);
  assert.ok(colours.length > 0);
  for (const [decl, value] of colours) assert.equal(value, 'var(--field-placeholder)', decl);
});
