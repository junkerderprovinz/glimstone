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

const PAIRS_ON_PHONE = /\s+:?(?:pairsOnPhone|pairs-on-phone)(?:=(?:"[^"]*"|'[^']*'|\{[^}]*\}))?(?=[\s/>])/g;

/** pairsOnPhone has no effect, so it goes with whatever value it was given. */
function dropPairsOnPhone(text) {
  let out = '';
  let at = 0;
  for (const { start, end } of tags(text, 'Selector')) {
    out += text.slice(at, start) + text.slice(start, end).replace(PAIRS_ON_PHONE, '');
    at = end;
  }
  return out + text.slice(at);
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

// A literal inkMix below 1 asked for the light ramp's ink, 1 for the dark one.
const INK_LIGHTNESS = { light: '0.5', dark: '0.74' };

function dartInkMix(text) {
  return text.replace(/\binkMix(\s*:\s*)(\d+(?:\.\d+)?)(?=\s*[,)])/g, (_, colon, v) => `inkLightness${colon}${Number(v) < 1 ? INK_LIGHTNESS.light : INK_LIGHTNESS.dark}`);
}

/**
 * A GlimTheme argument that went, with its value: focusRing is the accent ink,
 * a getter on GlimDerived, and the state backgrounds are worked out from the
 * solids by GlimTokens.
 */
function dartDropArgument(name) {
  const argument = new RegExp(String.raw`\n?[ \t]*\b${name}\s*:\s*(?:[^,()\n]|\([^()]*\))+,`, 'g');
  return (text) => text.replace(argument, '');
}

function firstMatch(pattern, note) {
  return (text) => [...text.matchAll(pattern)].slice(0, 1).map((m) => ({ index: m.index, note }));
}

function firstUse(name, note) {
  return (text) => [...text.matchAll(new RegExp(`\\b${name}\\b`, 'g'))].slice(0, 1).map((m) => ({ index: m.index, note }));
}

function everyMatch(pattern, note) {
  return (text) => [...text.matchAll(pattern)].map((m) => ({ index: m.index, note }));
}

const replacing = (pattern, to) => (text) => text.replace(pattern, to);

const SCRIPTS = /\.(tsx?|jsx?|mjs|vue|svelte)$/;
const STYLES = /\.(css|scss|vue|svelte|html|tsx?|jsx?)$/;
const DART = /\.dart$/;

// The stone ramp under the carbon- names GlimStone 4 gave it, beside each
// step's stone name. The Tailwind and Flutter names follow from these.
const STONE = [
  ['bg', 'ground'],
  ['sidebar', 'sidebar'],
  ['surface', 'surface'],
  ['surface2', 'surface2'],
  ['surface3', 'surface3'],
  ['hover-raised', 'hover-raised'],
  ['border', 'border'],
  ['text', 'text'],
  ['text-sub', 'text-sub'],
  ['text-muted', 'text-muted'],
];

// A Tailwind utility that takes a colour, after any variant, or the theme name
// itself.
const UTILITY = String.raw`(?<![\w-])(--color|bg|text|border(?:-[xytrblse])?|outline|ring(?:-offset)?|inset-ring|divide|fill|stroke|from|via|to|shadow|inset-shadow|drop-shadow|decoration|accent|caret|placeholder)`;

const camel = (name) => name.replace(/-(\w)/g, (_, c) => c.toUpperCase());
const tailwindKey = (step) => (step === 'bg' ? 'background' : camel(step));
const dartName = (ramp, step) => ramp + camel(`-${step}`);

const stoneNames = STONE.flatMap(([carbon, stone]) => [
  { name: `--carbon-${carbon}`, files: STYLES, rewrite: replacing(new RegExp(String.raw`(?<![\w-])--carbon-${carbon}(?![\w-])`, 'g'), `--stone-${stone}`) },
  {
    name: `--color-carbon-${tailwindKey(carbon)}`,
    files: STYLES,
    rewrite: replacing(new RegExp(String.raw`${UTILITY}-carbon-${tailwindKey(carbon)}(?![\w-])`, 'g'), `$1-stone-${camel(stone)}`),
  },
  { name: `GlimTheme ${dartName('carbon', carbon)}`, files: DART, rewrite: replacing(new RegExp(String.raw`\b${dartName('carbon', carbon)}\b`, 'g'), dartName('stone', stone)) },
]);

// --hover is a step of its own, not the grey hover under another name, so each
// control is moved and looked at by hand.
const GREY_HOVER = 'It is another colour, so look at the control after the move.';

// A state button is a wash under its hue's text. The solid hover swapped for
// the wash's alone would sit on a solid fill, so the button moves as a whole.
const statusHovers = ['ok', 'fail', 'warn'].flatMap((tone) => {
  const Tone = camel(`-${tone}`);
  const why = 'since a state button is a wash and the hover alone would sit on a solid fill.';
  return [
    {
      name: `--status-${tone}-hover`,
      files: STYLES,
      report: everyMatch(
        new RegExp(String.raw`(?<![\w-])--status-${tone}-hover(?![\w-])`, 'g'),
        `--status-${tone}-hover goes in 6.0.0: move the button to --status-${tone}-wash under --status-${tone}-text, hovering to --status-${tone}-wash-hover, ${why}`,
      ),
    },
    {
      name: `--color-status${Tone}Hover`,
      files: STYLES,
      report: everyMatch(
        new RegExp(String.raw`${UTILITY}-status${Tone}Hover\b`, 'g'),
        `status${Tone}Hover goes in 6.0.0: move the button to bg-status${Tone}Wash text-status${Tone} hover:bg-status${Tone}WashHover, ${why}`,
      ),
    },
    {
      name: `GlimDerived status${Tone}Hover`,
      files: DART,
      report: everyMatch(
        new RegExp(String.raw`(?<![\w-])status${Tone}Hover\b`, 'g'),
        `status${Tone}Hover goes in 6.0.0: move the button to status${Tone}Wash under status${Tone}Text, hovering to status${Tone}WashHover, ${why}`,
      ),
    },
  ];
});

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
  {
    name: 'GlimTheme inkMix',
    files: DART,
    rewrite: dartInkMix,
    report: firstUse('inkMix', 'inkMix goes in 5.0.0: use inkLightness, the OKLab step the ink moves to (0.5 on a light theme, 0.74 on a dark one).'),
  },
  { name: 'GlimTheme focusRing argument', files: DART, rewrite: dartDropArgument('focusRing') },
  ...stoneNames,
  {
    name: '--carbon-hover',
    files: STYLES,
    report: everyMatch(/(?<![\w-])--carbon-hover(?![\w-])/g, `--carbon-hover goes in 6.0.0: move the hover to --hover, the one hover of rule 21. ${GREY_HOVER}`),
  },
  {
    name: '--color-carbon-hover',
    files: STYLES,
    report: everyMatch(
      new RegExp(String.raw`${UTILITY}-carbon-hover(?![\w-])`, 'g'),
      `--color-carbon-hover and its utilities, such as hover:bg-carbon-hover, go in 6.0.0: use hover:bg-hover, the one hover of rule 21. ${GREY_HOVER}`,
    ),
  },
  {
    name: 'GlimTheme carbonHover',
    files: DART,
    report: everyMatch(/\bcarbonHover\b/g, `carbonHover goes in 6.0.0: use hover on GlimDerived, the one hover of rule 21. ${GREY_HOVER}`),
  },
  ...statusHovers,
  { name: 'Selector pairsOnPhone', rewrite: dropPairsOnPhone },
  ...['statusOkBg', 'statusFailBg', 'statusWarnBg', 'statusWarnBgSoft'].map((name) => ({ name: `GlimTheme ${name} argument`, files: DART, rewrite: dartDropArgument(name) })),
  {
    name: '.glim-avatar--hued',
    files: STYLES,
    report: everyMatch(
      /\bglim-avatar--hued\b/g,
      'glim-avatar--hued goes in 6.0.0: use glim-avatar--toned with --avatar-tone set to one of var(--chart-1) to var(--chart-8), as avatarView() writes it. The accent stays for activity.',
    ),
  },
];

const SKIP = new Set(['node_modules', 'dist', 'build', '.git']);
const SOURCE = /\.(tsx?|jsx?|mjs|vue|svelte|html|css|scss|dart)$/;

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
