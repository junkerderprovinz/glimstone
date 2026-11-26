// Every name GlimStone still ships but has deprecated, the one list the
// warnings and the drift check read. A name goes in the first major release
// after it is deprecated, and not before it has been deprecated through two
// minor releases ("Deprecating and removing" in the design language).

export interface Deprecation {
  /** The release that deprecated it. */
  since: string;
  /** The major release that removes it. */
  removal: string;
  /** What to use instead, as a sentence. */
  use: string;
  /** A regular expression that finds a use in an app's source, where the name alone would not. */
  find?: string;
}

// The stone ramp's steps under the names GlimStone 4 gave them, after the
// Carbon greys the ramp started from, beside the stone name of each. The
// Tailwind and Flutter names follow from the CSS ones.
const STONE_STEPS = [
  ["bg", "ground"],
  ["sidebar", "sidebar"],
  ["surface", "surface"],
  ["surface2", "surface2"],
  ["surface3", "surface3"],
  ["hover-raised", "hover-raised"],
  ["border", "border"],
  ["text", "text"],
  ["text-sub", "text-sub"],
  ["text-muted", "text-muted"],
] as const;

// The Tailwind utilities that take a colour, which is where an old theme name
// turns up in a class list.
const UTILITY = String.raw`(?<![\w-])(?:--color|bg|text|border(?:-[xytrblse])?|outline|ring(?:-offset)?|inset-ring|divide|fill|stroke|from|via|to|shadow|inset-shadow|drop-shadow|decoration|accent|caret|placeholder)`;

const camel = (name: string) => name.replace(/-(\w)/g, (_, c: string) => c.toUpperCase());
const tailwindKey = (step: string) => (step === "bg" ? "background" : camel(step));
const dartName = (ramp: string, step: string) => ramp + camel(`-${step}`);

const SINCE = { since: "5.0.0", removal: "6.0.0" };

const stoneNames: Record<string, Deprecation> = Object.fromEntries(
  STONE_STEPS.flatMap(([carbon, stone]): [string, Deprecation][] => [
    [`--carbon-${carbon}`, { ...SINCE, use: `Use \`--stone-${stone}\`, the same colour under the stone ramp's name.`, find: String.raw`(?<![\w-])--carbon-${carbon}(?![\w-])` }],
    [
      `--color-carbon-${tailwindKey(carbon)}`,
      {
        ...SINCE,
        use: `Use \`--color-stone-${camel(stone)}\`: \`bg-stone-${camel(stone)}\` for \`bg-carbon-${tailwindKey(carbon)}\`, and so on for every utility.`,
        find: String.raw`${UTILITY}-carbon-${tailwindKey(carbon)}(?![\w-])`,
      },
    ],
    [`GlimTheme ${dartName("carbon", carbon)}`, { ...SINCE, use: `Use \`${dartName("stone", stone)}\`, the same colour under the stone ramp's name.`, find: String.raw`\b${dartName("carbon", carbon)}\b` }],
  ]),
);

// A state button is a wash under the hue's text, so its hover is the wash's.
// Swapping the solid hover alone would leave it on a solid fill.
const statusHovers: Record<string, Deprecation> = Object.fromEntries(
  ["ok", "fail", "warn"].flatMap((tone): [string, Deprecation][] => {
    const Tone = camel(`-${tone}`);
    return [
      [
        `--status-${tone}-hover`,
        { ...SINCE, use: `Move the button to the wash: \`--status-${tone}-wash\` under \`--status-${tone}-text\`, hovering to \`--status-${tone}-wash-hover\`.`, find: String.raw`(?<![\w-])--status-${tone}-hover(?![\w-])` },
      ],
      [
        `--color-status${Tone}Hover`,
        { ...SINCE, use: `Move the button to the wash: \`bg-status${Tone}Wash text-status${Tone} hover:bg-status${Tone}WashHover\`.`, find: String.raw`${UTILITY}-status${Tone}Hover\b` },
      ],
      [
        `GlimDerived status${Tone}Hover`,
        { ...SINCE, use: `Move the button to the wash: \`status${Tone}Wash\` under \`status${Tone}Text\`, hovering to \`status${Tone}WashHover\`.`, find: String.raw`(?<![\w-])status${Tone}Hover\b` },
      ],
    ];
  }),
);

export const DEPRECATED: Record<string, Deprecation> = {
  ...stoneNames,
  "--carbon-hover": {
    ...SINCE,
    use: "Use `--hover`, the one hover (rule 21). It is a step of its own rather than the same colour, so look at the control after the move.",
    find: String.raw`(?<![\w-])--carbon-hover(?![\w-])`,
  },
  "--color-carbon-hover": {
    ...SINCE,
    use: "Use `--color-hover`, the one hover (rule 21): `hover:bg-hover` for `hover:bg-carbon-hover`. It is a step of its own rather than the same colour, so look at the control after the move.",
    find: String.raw`${UTILITY}-carbon-hover(?![\w-])`,
  },
  "GlimTheme carbonHover": {
    ...SINCE,
    use: "Use `hover` on `GlimDerived`, the one hover (rule 21). It is a step of its own rather than the same colour, so look at the control after the move.",
    find: String.raw`\bcarbonHover\b`,
  },
  ...statusHovers,
  ...Object.fromEntries(
    ["statusOkBg", "statusFailBg", "statusWarnBg", "statusWarnBgSoft"].map((name): [string, Deprecation] => [
      `GlimTheme ${name} argument`,
      { ...SINCE, use: `Drop the argument. \`${name}\` is a getter on \`GlimTokens\`, worked out from the state's solid, so set the solid instead.`, find: String.raw`\b${name}\s*:` },
    ]),
  ),
  ".glim-avatar--hued": {
    ...SINCE,
    use: 'Use `glim-avatar--toned` with `--avatar-tone` set to one of `var(--chart-1)` to `var(--chart-8)`, as `avatarView()` writes it: the initials take the tone on a pale wash of it, and the accent stays for activity.',
    find: String.raw`\bglim-avatar--hued\b`,
  },
  "Badge shape": {
    since: "4.4.0",
    removal: "5.0.0",
    use: 'Use `form`. Only shape="circle" has an effect, and form="circle" draws the same badge.',
    find: String.raw`<Badge\b[^>]*?\s:?shape=`,
  },
  BadgeShape: { since: "4.4.0", removal: "5.0.0", use: "Use `BadgeForm`." },
  AboutCard: {
    since: "3.3.0",
    removal: "5.0.0",
    use: 'Use `InfoTile`, which adds the version rows\' sub-lines, the other components, "Check for updates" and the bug report.',
  },
  DropdownListbox: { since: "3.6.0", removal: "5.0.0", use: "Use Select, which keeps focus on its trigger and adds typeahead." },
  "ToastViewport enter": {
    since: "4.5.0",
    removal: "5.0.0",
    use: "Listen to `mouse-enter`, the name of React's handler.",
    find: String.raw`<ToastViewport\b[^>]*?\s(?:@|v-on:)enter=`,
  },
  "ToastViewport leave": {
    since: "4.5.0",
    removal: "5.0.0",
    use: "Listen to `mouse-leave`, the name of React's handler.",
    find: String.raw`<ToastViewport\b[^>]*?\s(?:@|v-on:)leave=`,
  },
  "ToastViewport focusin": {
    since: "4.5.0",
    removal: "5.0.0",
    use: "Listen to `focus`, the name of React's handler.",
    find: String.raw`<ToastViewport\b[^>]*?\s(?:@|v-on:)focusin=`,
  },
  "ToastViewport focusout": {
    since: "4.5.0",
    removal: "5.0.0",
    use: "Listen to `blur`, the name of React's handler.",
    find: String.raw`<ToastViewport\b[^>]*?\s(?:@|v-on:)focusout=`,
  },
  "--ink-mix": {
    since: "4.5.0",
    removal: "5.0.0",
    use: "Read `--accent-ink`, which moves the accent onto the theme's OKLab ink step. The steps themselves are `--ink-l-light` and `--ink-l-dark`.",
    find: String.raw`var\(--ink-mix\)`,
  },
  "GlimTheme inkMix": {
    since: "4.5.0",
    removal: "5.0.0",
    use: "Use `inkLightness`, the OKLab step the accent's ink moves to: 0.5 on a light theme, 0.74 on a dark one.",
    find: String.raw`\binkMix\b`,
  },
  "GlimTheme focusRing argument": {
    since: "4.5.0",
    removal: "5.0.0",
    use: "Drop the argument. `focusRing` is a getter on `GlimDerived` that returns the accent ink.",
    find: String.raw`\bfocusRing\s*:`,
  },
};

const warned = new Set<string>();

/** The sentence a deprecated name is reported with. */
export function deprecationNote(name: string): string {
  const d = DEPRECATED[name]!;
  return `${name} is deprecated since GlimStone ${d.since} and goes in ${d.removal}. ${d.use}`;
}

/** Warns on the console the first time a page uses a deprecated name. */
export function warnDeprecated(name: string): void {
  if (warned.has(name)) return;
  warned.add(name);
  console.warn(deprecationNote(name));
}
