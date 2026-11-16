import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { accentHovers, accentInks, contrastOn, contrastRatio, MIN_TEXT_CONTRAST } from '../src/contrast.ts';
import { ACCENTS, hueVars, RAINBOW } from '../src/appearance.ts';
import { inkCss, srgbOf, type Oklab } from '../src/oklab.ts';

// What tokens.css promises, read from tokens.css itself, so a changed value is
// measured rather than trusted.
const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');
const bare = css.replace(/\/\*[\s\S]*?\*\//g, '');

/** The custom properties of the first block that opens with `head` and declares `has`. */
function block(head: string, has: string): Record<string, string> {
  for (let start = bare.indexOf(head + ' {'); start >= 0; start = bare.indexOf(head + ' {', start + 1)) {
    const body = bare.slice(start + head.length + 2, bare.indexOf('}', start));
    const props: Record<string, string> = {};
    for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) props[m[1]!] = m[2]!.trim();
    if (has in props) return props;
  }
  assert.fail(`no block ${head} with ${has}`);
}

const props = (body: string) =>
  Object.fromEntries([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()])) as Record<string, string>;

// The contrast step's overrides, and the sheet without them for the plain look.
const MORE_BLOCK = /@media \(prefers-contrast: more\) \{\s*:root,\s*\[data-theme\] \{([^}]*)\}\s*\}/;
const more = props(bare.match(MORE_BLOCK)![1]!);
const plain = bare.replace(MORE_BLOCK, '');

// Every block declared wherever a theme is set: the palette, the hover steps and
// the elevation.
const themed = Object.assign({}, ...[...plain.matchAll(/:root,\s*\[data-theme\] \{([^}]*)\}/g)].map(([, body]) => props(body!))) as Record<string, string>;
const oledBlock = block('[data-oled]', '--carbon-bg');

// The hover tints, declared again inside a rainbow position so they take its hue.
const hoverBlock = block(':root,\n[data-theme],\n[data-rainbow] .glim-hue', '--hover');
const oledHoverBlock = block('[data-oled],\n[data-oled][data-rainbow] .glim-hue', '--hover');

// The side of every light-dark() a theme takes, kept in the scope beside the tokens.
const SCHEME = '@scheme';
const THEMES: Record<string, Record<string, string>> = {
  dark: { ...themed, ...hoverBlock, [SCHEME]: 'dark' },
  OLED: { ...themed, ...oledBlock, ...hoverBlock, ...oledHoverBlock, [SCHEME]: 'dark' },
  light: { ...themed, ...hoverBlock, [SCHEME]: 'light' },
  'dark with more contrast': { ...themed, ...hoverBlock, ...more, [SCHEME]: 'dark' },
  'OLED with more contrast': { ...themed, ...oledBlock, ...hoverBlock, ...oledHoverBlock, ...more, [SCHEME]: 'dark' },
  'light with more contrast': { ...themed, ...hoverBlock, ...more, [SCHEME]: 'light' },
};

// On the contrast step the text that carries meaning reaches AAA on the page
// and on a card.
const AAA = 7;
const MORE_TEXT = ['--carbon-text', '--carbon-text-sub', '--carbon-text-muted', '--accent-ink', '--field-placeholder'];

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
function over(colour: Rgba, ground: Rgba): string {
  const a = colour[3];
  return hex([0, 1, 2].map((i) => colour[i]! * a + ground[i]! * (1 - a)) as unknown as Rgba);
}

/** `amount` of `a` mixed with `b`, the way color-mix() in srgb mixes. */
function mix(a: Rgba, amount: number, b: Rgba): Rgba {
  const alpha = a[3] * amount + b[3] * (1 - amount);
  if (alpha === 0) return [0, 0, 0, 0];
  const ch = (i: number) => (a[i]! * a[3] * amount + b[i]! * b[3] * (1 - amount)) / alpha;
  return [ch(0), ch(1), ch(2), alpha];
}

/** The arguments of a function, split where `separator` stands outside any brackets. */
function split(args: string, separator: RegExp): string[] {
  const out: string[] = [];
  let depth = 0;
  let from = 0;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '(') depth++;
    else if (args[i] === ')') depth--;
    else if (depth === 0 && separator.test(args[i]!)) {
      if (i > from) out.push(args.slice(from, i).trim());
      from = i + 1;
    }
  }
  if (from < args.length) out.push(args.slice(from).trim());
  return out.filter(Boolean);
}

const NAMED: Record<string, Rgba> = { black: [0, 0, 0, 1], white: [255, 255, 255, 1], transparent: [0, 0, 0, 0] };

/** Works out one channel of a relative oklab(), with `l`, `a` and `b` those of the origin. */
function channel(expr: string, origin: Oklab, scope: Record<string, string>): number {
  const js = expr
    .replace(/var\((--[\w-]+)\)/g, (_, name: string) => String(Number(scope[name])))
    .replace(/calc\(/g, '(')
    .replace(/\b(min|max)\(/g, 'Math.$1(')
    .replace(/\b([lab])\b/g, (_, k: string) => String(origin['lab'.indexOf(k)]));
  assert.match(js, /^[\d.\s+\-*/(),eMathminax]+$/, `cannot work out ${expr}`);
  return Function(`return ${js}`)() as number;
}

function fromOklab(lab: Oklab, alpha = 1): Rgba {
  return [...parse(srgbOf(lab)).slice(0, 3), alpha] as Rgba;
}

/**
 * Resolves a token value the way the browser would, for the subset of CSS the
 * colour tokens use: hex, rgba(), oklch(), a relative oklab() built on another
 * colour, var() with a fallback, light-dark() and a two-colour color-mix() in
 * srgb.
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
  const ld = v.match(/^light-dark\(([\s\S]+)\)$/);
  if (ld) return resolve(split(ld[1]!, /,/)[scope[SCHEME] === 'light' ? 0 : 1]!, scope);
  const rel = v.match(/^oklab\(from\s+([\s\S]+)\)$/);
  if (rel) {
    const [origin, ...exprs] = split(rel[1]!, /\s/);
    const o = resolve(origin!, scope);
    const lab = oklabOfRgb(o);
    return fromOklab(exprs.map((e) => channel(e, lab, scope)) as Oklab, o[3]);
  }
  const lch = v.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\s*\)$/);
  if (lch) {
    const [l, c, h] = [Number(lch[1]), Number(lch[2]), (Number(lch[3]) * Math.PI) / 180];
    return fromOklab([l, c * Math.cos(h), c * Math.sin(h)], lch[4] === undefined ? 1 : Number(lch[4]));
  }
  const m = v.match(/^color-mix\(in srgb,\s*([\s\S]+)\)$/);
  if (m) {
    // Either colour may carry the share, and the other takes the rest.
    const [[a, ofA], [b, ofB]] = split(m[1]!, /,/).map((part) => {
      const s = part.match(/^([\s\S]+?)\s+(var\(--[\w-]+\)|[\d.]+%)$/);
      if (!s) return [part, undefined] as const;
      return [s[1]!, parseFloat(s[2]!.startsWith('var(') ? scope[s[2]!.slice(4, -1)]! : s[2]!) / 100] as const;
    }) as [readonly [string, number | undefined], readonly [string, number | undefined]];
    return mix(resolve(a, scope), ofA ?? (ofB === undefined ? 0.5 : 1 - ofB), resolve(b, scope));
  }
  return parse(v);
}

function oklabOfRgb(c: Rgba): Oklab {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = [lin(c[0]), lin(c[1]), lin(c[2])];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** The theme as it stands after applyAccent(hex) wrote its overrides on the root. */
function withAccent(theme: Record<string, string>, accent: string): Record<string, string> {
  const { light, dark: darkInk } = accentInks(accent);
  const hovers = accentHovers(accent);
  return {
    ...theme,
    '--accent': accent,
    '--accent-contrast': contrastOn(accent),
    '--accent-soft': `rgba(${parse(accent).slice(0, 3).join(', ')}, 0.14)`,
    ...(light ? { '--accent-ink-light': light } : {}),
    ...(darkInk ? { '--accent-ink-dark': darkInk } : {}),
    ...(hovers.light ? { '--accent-hover-light': hovers.light } : {}),
    ...(hovers.dark ? { '--accent-hover-dark': hovers.dark } : {}),
  };
}

const CUSTOM_ACCENTS = ['#FFFF00', '#0000FF', '#777777', '#FAFAFA', '#050505'];
// What the colour picker can hand in: twelve hues at low, mid and high chroma
// on four lightness steps, and a run of greys, mid-grey included.
const SWEEP = [
  ...[0.45, 0.6, 0.75, 0.9].flatMap((l) =>
    [0.02, 0.08, 0.2].flatMap((c) => Array.from({ length: 12 }, (_, i) => srgbOf([l, c * Math.cos((i * Math.PI) / 6), c * Math.sin((i * Math.PI) / 6)]))),
  ),
  ...['#222222', '#555555', '#6B6B6B', '#777777', '#7B7B7B', '#888888', '#999999', '#BBBBBB', '#DDDDDD'],
];

const ALL_ACCENTS = [...ACCENTS.map((a) => [a.name, a.hex] as const), ...CUSTOM_ACCENTS.map((h) => [`custom ${h}`, h] as const)];

// Each colour pair a rule in tokens.css sets on one element: its text colour on
// its own fill.
const RULE_PAIRS = [
  ...new Set(
    [...bare.matchAll(/\{([^{}]*)\}/g)].flatMap(([, body]) => {
      const ink = body!.match(/(?<![\w-])color:\s*var\((--[\w-]+)\)\s*;/);
      const fill = body!.match(/background(?:-color)?:\s*var\((--[\w-]+)\)\s*;/);
      return ink && fill ? [`${ink[1]} ${fill[1]}`] : [];
    }),
  ),
]
  // The tile's ink is computed for each brand in the app, not a token pair.
  .filter((p) => !p.startsWith('--tile-ink'))
  .map((p) => p.split(' ') as [string, string]);

// Text that stands on a ground rather than a fill of its own.
const GROUND_PAIRS: [string, string][] = [
  ...['--carbon-bg', '--carbon-surface', '--carbon-surface2', '--carbon-surface3'].flatMap((g) => [
    ['--carbon-text', g] as [string, string],
    ['--carbon-text-sub', g] as [string, string],
  ]),
  ['--carbon-text-muted', '--carbon-bg'],
  ['--carbon-text-muted', '--carbon-surface'],
  ['--sidebar-text', '--carbon-sidebar'],
  ['--accent-ink', '--carbon-bg'],
  ['--accent-ink', '--carbon-sidebar'],
  ['--accent-ink', '--carbon-surface'],
  ['--accent-contrast', '--accent-hover'],
  ...['info', 'ok', 'fail', 'warn', 'neutral'].flatMap((s) => [
    [`--status-${s}-text`, '--carbon-surface'] as [string, string],
    [`--status-${s}-text`, `--status-${s}-bg`] as [string, string],
  ]),
  ...FIELD_GROUNDS.map((g) => ['--field-placeholder', g] as [string, string]),
];

test('the stylesheet sets text on its own fill in more than a dozen ways', () => {
  assert.ok(RULE_PAIRS.length > 12, RULE_PAIRS.join(' '));
});

/** The ratio of `ink` on `fill`, a translucent fill laid over the card first. */
function pairRatio(ink: string, fill: string, scope: Record<string, string>): number {
  const card = resolve('var(--carbon-surface)', scope);
  const ground = parse(over(resolve(`var(${fill})`, scope), card));
  return contrastRatio(over(resolve(`var(${ink})`, scope), ground), hex(ground));
}

for (const [themeName, theme] of Object.entries(THEMES)) {
  test(`every text pair the components use reaches 4.5:1 for ${SWEEP.length} picked accents on ${themeName}`, () => {
    const misses = SWEEP.flatMap((accent) => {
      const scope = withAccent(theme, accent);
      return [...RULE_PAIRS, ...GROUND_PAIRS]
        .map(([ink, fill]) => [ink, fill, pairRatio(ink, fill, scope)] as const)
        .filter(([, , r]) => r < MIN_TEXT_CONTRAST)
        .map(([ink, fill, r]) => `${accent} ${ink} on ${fill}: ${r.toFixed(2)}:1`);
    });
    assert.deepEqual([...new Set(misses)], []);
  });

  for (const { name: accentName, hex: accent } of ACCENTS) {
    test(`every text pair the components use reaches 4.5:1 for ${accentName} on ${themeName}`, () => {
      const scope = withAccent(theme, accent);
      const misses = [...RULE_PAIRS, ...GROUND_PAIRS]
        .map(([ink, fill]) => [ink, fill, pairRatio(ink, fill, scope)] as const)
        .filter(([, , r]) => r < MIN_TEXT_CONTRAST)
        .map(([ink, fill, r]) => `${ink} on ${fill}: ${r.toFixed(2)}:1`);
      assert.deepEqual(misses, []);
    });
  }

  for (const [accentName, accent] of ALL_ACCENTS) {
    test(`the focus ring for ${accentName} reaches 3:1 on every ground of ${themeName}`, () => {
      const scope = withAccent(theme, accent);
      const ring = resolve('var(--focus-ring)', scope);
      for (const g of RING_GROUNDS) {
        const ground = resolve(`var(${g})`, scope);
        const r = contrastRatio(over(ring, ground), hex(ground));
        assert.ok(r >= MIN_GRAPHIC_CONTRAST, `${g} ${hex(ground)}: ${r.toFixed(2)}:1`);
      }
      assert.equal(ring[3], 1, 'the ring is opaque');
    });
  }

  if (themeName.endsWith('more contrast')) {
    for (const { name: accentName, hex: accent } of ACCENTS) {
      test(`the text ramp and the ink reach 7:1 on the page and a card for ${accentName} on ${themeName}`, () => {
        const scope = withAccent(theme, accent);
        const misses = MORE_TEXT.flatMap((ink) => ['--carbon-bg', '--carbon-surface'].map((g) => [ink, g, pairRatio(ink, g, scope)] as const))
          .filter(([, , r]) => r < AAA)
          .map(([ink, g, r]) => `${ink} on ${g}: ${r.toFixed(2)}:1`);
        assert.deepEqual(misses, []);
      });
    }

    test(`a border reads at 3:1 on the card and the page on ${themeName}`, () => {
      for (const g of ['--carbon-bg', '--carbon-surface']) assert.ok(pairRatio('--carbon-border', g, theme) >= MIN_GRAPHIC_CONTRAST, g);
    });
  }

  test(`a rainbow position's glyph reads at 4.5:1 and its ring at 3:1 on ${themeName}`, () => {
    RAINBOW.forEach((hue, i) => {
      const scope = { ...theme, ...hueVars(i), [`--rb-${i}`]: hue };
      const ring = resolve('var(--item-hue-ring)', scope);
      for (const g of RING_GROUNDS) {
        const ground = resolve(`var(${g})`, scope);
        const r = contrastRatio(over(ring, ground), hex(ground));
        assert.ok(r >= MIN_GRAPHIC_CONTRAST, `position ${i} on ${g} ${hex(ground)}: ${r.toFixed(2)}:1`);
      }
      assert.equal(ring[3], 1, `position ${i} is opaque`);
      const glyph = resolve('var(--item-hue-glyph)', scope);
      const card = resolve('var(--carbon-surface)', scope);
      assert.ok(contrastRatio(hex(glyph), hex(card)) >= MIN_TEXT_CONTRAST, `position ${i} glyph on the card`);
    });
  });
}

test('every preset reads at nearly the same contrast as ink on the light card', () => {
  const ratios = ACCENTS.map((a) => contrastRatio(hex(resolve('var(--accent-ink)', withAccent(THEMES.light!, a.hex))), '#ffffff'));
  assert.ok(Math.max(...ratios) - Math.min(...ratios) < 1, ratios.map((r) => r.toFixed(2)).join(' '));
});

test('every placeholder colour in the stylesheet is the placeholder token', () => {
  const colours = [...css.matchAll(/::placeholder[^{]*\{([^}]*)\}/g)].flatMap((m) => [...m[1]!.matchAll(/(?<![\w-])color:\s*([^;]+);/g)]);
  assert.ok(colours.length > 0);
  for (const [decl, value] of colours) assert.equal(value, 'var(--field-placeholder)', decl);
});

test('data-contrast="more" asks for the same step as the system setting', () => {
  assert.deepEqual(block(':root[data-contrast="more"],\n:root[data-contrast="more"] [data-theme]', '--ink-l-light'), more);
});

// Each hover tint, the neutral step whose lightness it keeps, and the ground it
// lifts an element off (rule 21).
const HOVERS = [
  { tint: '--hover', step: '--carbon-hover', ground: '--carbon-surface' },
  { tint: '--hover-filled', step: '--carbon-surface3', ground: '--carbon-surface2' },
  { tint: '--hover-raised', step: '--carbon-hover-raised', ground: '--carbon-surface3' },
] as const;

const chroma = ([, a, b]: Oklab) => Math.hypot(a, b);
const hueGap = ([, a1, b1]: Oklab, [, a2, b2]: Oklab) => {
  const d = Math.abs(Math.atan2(b1, a1) - Math.atan2(b2, a2)) * (180 / Math.PI);
  return Math.min(d, 360 - d);
};
const labOf = (token: string, scope: Record<string, string>) => oklabOfRgb(resolve(`var(${token})`, scope));

// The text a hovered row carries, on a card and on the deeper ground of a well,
// and the label of a control that already stood on surface3.
const HOVER_TEXT: [string, string][] = [
  ['--carbon-text', '--hover'],
  ['--carbon-text-sub', '--hover'],
  ['--carbon-text', '--hover-filled'],
  ['--carbon-text-sub', '--hover-filled'],
  ['--carbon-text', '--hover-raised'],
];

for (const [themeName, theme] of Object.entries(THEMES)) {
  for (const { name: accentName, hex: accent } of ACCENTS) {
    test(`every hover keeps its neutral step's lightness in ${accentName}'s hue on ${themeName}`, () => {
      const scope = withAccent(theme, accent);
      const own = oklabOfRgb(parse(accent));
      for (const { tint, step } of HOVERS) {
        const lab = labOf(tint, scope);
        assert.ok(Math.abs(lab[0] - labOf(step, scope)[0]) <= 0.01, `${tint} lightness ${lab[0].toFixed(3)}`);
        assert.ok(chroma(lab) >= 0.02, `${tint} chroma ${chroma(lab).toFixed(3)}`);
        assert.ok(hueGap(lab, own) <= 6, `${tint} hue ${hueGap(lab, own).toFixed(1)} degrees off`);
      }
    });
  }

  test(`a grey accent leaves every hover on its neutral step on ${themeName}`, () => {
    const scope = withAccent(theme, '#777777');
    for (const { tint } of HOVERS) assert.ok(chroma(labOf(tint, scope)) < 0.005, tint);
  });

  test(`no hover takes the colour of the ground it lifts from for ${SWEEP.length} picked accents on ${themeName}`, () => {
    const misses = SWEEP.flatMap((accent) => {
      const scope = withAccent(theme, accent);
      return HOVERS.map(({ tint, ground }) => [tint, ground, pairRatio(tint, ground, scope)] as const)
        .filter(([, , r]) => r < 1.08)
        .map(([tint, ground, r]) => `${accent} ${tint} on ${ground}: ${r.toFixed(2)}:1`);
    });
    assert.deepEqual(misses, []);
  });

  test(`text on a hovered row reads at 4.5:1 for ${SWEEP.length} picked accents on ${themeName}`, () => {
    const misses = SWEEP.flatMap((accent) => {
      const scope = withAccent(theme, accent);
      return HOVER_TEXT.map(([ink, fill]) => [ink, fill, pairRatio(ink, fill, scope)] as const)
        .filter(([, , r]) => r < MIN_TEXT_CONTRAST)
        .map(([ink, fill, r]) => `${accent} ${ink} on ${fill}: ${r.toFixed(2)}:1`);
    });
    assert.deepEqual(misses, []);
  });

  test(`a rainbow position's hovers take its hue on ${themeName}`, () => {
    const position = block('[data-rainbow] .glim-hue', '--accent');
    RAINBOW.forEach((hue, i) => {
      const scope = { ...theme, ...hueVars(i), [`--rb-${i}`]: hue, '--accent': position['--accent']! };
      const own = oklabOfRgb(parse(hue));
      for (const { tint } of HOVERS) assert.ok(hueGap(labOf(tint, scope), own) <= 6, `position ${i} ${tint}`);
    });
  });
}

/** The declarations of the rule whose selector is exactly `selector`. */
function rule(selector: string): Record<string, string> {
  const start = bare.indexOf(`${selector} {`);
  assert.ok(start >= 0, `no rule ${selector}`);
  const body = bare.slice(start + selector.length + 2, bare.indexOf('}', start));
  return Object.fromEntries([...body.matchAll(/([\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]));
}

// A surface-filled button under the pointer (rule 40): each tone's hover rule
// sets the tinted mix, one shared rule makes the ground of it, and the label is
// the tone's own.
const TINTED_GROUND = rule(':is(.glim-btn-neutral, .glim-btn-subtle):not(:disabled):is(:hover, :focus-visible)')['background-color']!;
const TINTED = (['neutral', 'subtle'] as const).map((tone) => ({
  tone,
  hovered: rule(`.glim-btn-${tone}:not(:disabled):is(:hover, :focus-visible)`),
  label: rule(`.glim-btn--${tone}`)['color']!,
}));

/** The scope a tinted button's hover resolves in, with `tint` as its --btn-tint. */
const tintedScope = (scope: Record<string, string>, tint: string, hovered: Record<string, string>) => ({ ...scope, '--btn-tint': tint, ...hovered });

/** Each tinted button's label on its hovered ground. */
const tintedRatios = (scope: Record<string, string>, tint: string) =>
  TINTED.map(({ tone, hovered, label }) => {
    const lit = { ...tintedScope(scope, tint, hovered), '--lit': TINTED_GROUND, '--label': label };
    return [tone, pairRatio('--label', '--lit', lit)] as const;
  });

for (const [themeName, theme] of Object.entries(THEMES)) {
  test(`a tinted button's label reads at 4.5:1 under the pointer for ${SWEEP.length} picked accents on ${themeName}`, () => {
    const misses = SWEEP.flatMap((accent) =>
      tintedRatios(withAccent(theme, accent), 'var(--accent-glyph)')
        .filter(([, r]) => r < MIN_TEXT_CONTRAST)
        .map(([tone, r]) => `${accent} ${tone}: ${r.toFixed(2)}:1`),
    );
    assert.deepEqual(misses, []);
  });

  test(`a tinted button's label reads at 4.5:1 under the pointer in every rainbow position on ${themeName}`, () => {
    const misses = RAINBOW.flatMap((hue, i) =>
      tintedRatios({ ...theme, ...hueVars(i), [`--rb-${i}`]: hue }, inkCss(`var(--rb-${i})`))
        .filter(([, r]) => r < MIN_TEXT_CONTRAST)
        .map(([tone, r]) => `position ${i} ${tone}: ${r.toFixed(2)}:1`),
    );
    assert.deepEqual(misses, []);
  });

  test(`a tinted button lights up in the accent's hue under the pointer on ${themeName}`, () => {
    for (const { name, hex: accent } of ACCENTS) {
      const own = oklabOfRgb(parse(accent));
      for (const { tone, hovered } of TINTED) {
        const lab = oklabOfRgb(resolve(TINTED_GROUND, tintedScope(withAccent(theme, accent), 'var(--accent-glyph)', hovered)));
        assert.ok(chroma(lab) >= 0.01, `${name} ${tone} chroma ${chroma(lab).toFixed(3)}`);
        assert.ok(hueGap(lab, own) <= 10, `${name} ${tone} hue ${hueGap(lab, own).toFixed(1)} degrees off`);
      }
    }
  });
}
