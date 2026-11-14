import type { ComponentType } from "react";
import { accentInks, CONTROL_AXES, contrastOn, DEFAULT_ACCENT, SYSTEM_ACCENT, type SelectorSize } from "@glimstone/core";
import type { Look } from "./look";
import {
  AccentControl,
  ContrastControl,
  DensityControl,
  LabelControl,
  MotionControl,
  OledControl,
  PaletteControl,
  RainbowControl,
  ReactiveControl,
  RotateControl,
  ShapeControl,
  ThemePicker,
} from "./lookControls";

/**
 * One axis of the look: the control that sets it, what it puts on an app's
 * root element and what it starts at in an app's settings. The panel and the
 * snippet both read this list, so a new axis shows up in both at once.
 */
export interface LookAxis {
  id: string;
  /** The row's name, which names the control in it. */
  label: string;
  /** The bubble beside the row's name, which may depend on the rest of the look. */
  hint: string | ((look: Look) => string);
  /** The sub-card the row stands in. */
  group: LookGroup;
  /** A choice is a selector and takes the row's whole width under its name, so its words fit beside its glyphs. */
  kind: "choice" | "switch" | "swatches";
  /** A row that only means something under another setting is shown only then. */
  shown?: (look: Look) => boolean;
  /** The row's own rainbow position, for a set of rows that belong together. */
  hue?: number;
  Control: ComponentType<{ label?: string; size?: SelectorSize }>;
  /** Attributes for the root element; `true` is one without a value, and a name starting with `--` goes into its style. */
  root: (look: Look) => [string, string | true][];
  /** The axis's starting values in the settings store. An axis the device keeps for itself has none. */
  store?: (look: Look) => Record<string, unknown>;
}

export const LOOK_GROUPS = ["Colour", "Layout"] as const;
export type LookGroup = (typeof LOOK_GROUPS)[number];

const rainbowOn = (l: Look) => l.rainbow !== "off";

/** The colour at each rainbow position, rotation applied, as applyRainbow() sets it on the root. */
export function rainbowColours(l: Look): string[] {
  const off = l.rotate ? l.seed : 0;
  return l.palette.map((_, i) => l.palette[(i + off) % l.palette.length]);
}

const hex = (accent: string) => (accent === SYSTEM_ACCENT || accent.toUpperCase() === DEFAULT_ACCENT ? undefined : accent);

export const LOOK_AXES: LookAxis[] = [
  {
    id: "theme",
    kind: "choice",
    label: "Theme",
    hint: "System follows the device. Dark and Light stay as chosen.",
    group: "Colour",
    Control: ThemePicker,
    root: (l) => (l.theme === "system" ? [] : [["data-theme", l.theme]]),
    store: (l) => ({ theme: l.theme }),
  },
  {
    id: "oled",
    kind: "switch",
    label: "OLED",
    hint: "True black for OLED and AMOLED screens, whenever the dark look is showing.",
    group: "Colour",
    Control: OledControl,
    root: (l) => (l.oled ? [["data-oled", true]] : []),
  },
  {
    id: "accent",
    kind: "swatches",
    label: "Accent",
    hint: (l) =>
      rainbowOn(l)
        ? "The rainbow owns the colours while it is on. The accent still paints what the rainbow does not reach, and comes back when the rainbow is off."
        : "The colour of what is active or chosen. Click the chosen swatch again to pick any colour.",
    group: "Colour",
    Control: AccentControl,
    root: (l) => {
      const fill = hex(l.accent);
      if (!fill) return [];
      const n = parseInt(fill.slice(1), 16);
      const inks = accentInks(fill);
      return [
        ["--accent", fill],
        ["--accent-contrast", contrastOn(fill)],
        ["--accent-soft", `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, 0.14)`],
        ...(inks.light ? [["--accent-ink-light", inks.light] as [string, string]] : []),
        ...(inks.dark ? [["--accent-ink-dark", inks.dark] as [string, string]] : []),
      ];
    },
    store: (l) => ({ accent: l.accent }),
  },
  {
    id: "rainbow",
    kind: "switch",
    label: "Rainbow",
    hint: "Gives every card and selector a colour of its own in place of the accent.",
    group: "Colour",
    hue: 0,
    Control: RainbowControl,
    root: (l) =>
      rainbowOn(l)
        ? [
            ["data-rainbow", l.rainbow],
            ...rainbowColours(l).flatMap((c, i): [string, string][] => [
              [`--rb-${i}`, c],
              [`--rb-ink-${i}`, contrastOn(c)],
            ]),
          ]
        : [],
    store: (l) => ({
      rainbow: rainbowOn(l),
      rainbowReactive: l.rainbow === "reactive",
      ...(rainbowOn(l) ? { rainbowRotate: l.rotate, rainbowSeed: l.seed, rainbowPalette: l.palette } : {}),
    }),
  },
  {
    id: "reactive",
    kind: "switch",
    label: "Reactive",
    hint: "Keeps the rainbow grey until the pointer reaches something.",
    group: "Colour",
    shown: rainbowOn,
    hue: 1,
    Control: ReactiveControl,
    root: () => [],
  },
  {
    id: "rotate",
    kind: "switch",
    label: "Rotate",
    hint: "Starts the colours at another place in the palette, so the first card is not always the same colour.",
    group: "Colour",
    shown: rainbowOn,
    hue: 2,
    Control: RotateControl,
    root: () => [],
  },
  {
    id: "palette",
    kind: "swatches",
    label: "Palette",
    hint: "The eight colours, handed out by position. Click one to change it.",
    group: "Colour",
    shown: rainbowOn,
    Control: PaletteControl,
    root: () => [],
  },
  {
    id: "contrast",
    kind: "switch",
    label: "Contrast",
    hint: "On gives darker quiet text, an edge round fields and buttons and a thicker focus ring. Off still gives that when the device asks for it.",
    group: "Colour",
    Control: ContrastControl,
    root: (l) => (l.contrast === "more" ? [["data-contrast", "more"]] : []),
    store: (l) => ({ contrast: l.contrast }),
  },
  {
    id: "shape",
    kind: "choice",
    label: "Corners",
    hint: "One setting rounds or squares every card, field and button.",
    group: "Layout",
    Control: ShapeControl,
    root: (l) => [["data-shape", l.shape]],
    store: (l) => ({ shape: l.shape }),
  },
  {
    id: "motion",
    kind: "choice",
    label: "Motion",
    hint: "How far and how long things move. A device that asks for less motion gets less.",
    group: "Layout",
    Control: MotionControl,
    root: (l) => [["data-motion", l.motion]],
    store: (l) => ({ motion: l.motion }),
  },
  {
    id: "density",
    kind: "choice",
    label: "Density",
    hint: "How tall the rows of a list or a table stand.",
    group: "Layout",
    Control: DensityControl,
    root: (l) => [["data-density", l.density]],
    store: (l) => ({ density: l.density }),
  },
  {
    id: "labels",
    kind: "choice",
    label: "Labels",
    hint: "Words, glyphs or both on buttons, the sidebar and tabs.",
    group: "Layout",
    Control: LabelControl,
    root: (l) => CONTROL_AXES.map((axis) => [`data-labels-${axis}`, l.labels]),
    store: (l) => ({ labels: Object.fromEntries(CONTROL_AXES.map((axis) => [axis, l.labels])) }),
  },
];

/** The look as the attributes of an app's `<html>`, ready to paste. */
export function rootSnippet(look: Look): string {
  const entries = LOOK_AXES.flatMap((a) => a.root(look));
  const attrs = entries.filter(([name]) => !name.startsWith("--"));
  const style = entries.filter(([name]) => name.startsWith("--")).map(([name, value]) => `${name}: ${value}`);
  const lines = attrs.map(([name, value]) => (value === true ? name : `${name}="${value}"`));
  if (style.length) lines.push(`style="${style.join("; ")}"`);
  return `<html\n${lines.map((l) => `  ${l}`).join("\n")}\n>`;
}

/** The look as the starting values of an app's settings store. */
export function storeSnippet(look: Look): string {
  const values = Object.assign({}, ...LOOK_AXES.map((a) => a.store?.(look) ?? {}));
  const body = JSON.stringify(values, null, 2).replace(/"(\w+)":/g, "$1:");
  return `export const lookDefaults = ${body};`;
}

/** Both halves, as the panel copies them. */
export function lookSnippet(look: Look): string {
  return `${rootSnippet(look)}\n\n${storeSnippet(look)}\n`;
}
