// Appearance is the set of looks the user owns: how rounded the interface is,
// and what colour it uses for activity — one accent, or a palette handed out
// by position. All of it is applied to the document root, so every component
// picks it up through the tokens it already reads, and nothing has to be told
// about the change.
//
// This file stays free of any UI framework on purpose: it's the piece an
// adopting app copies wholesale, and a design language shouldn't arrive with
// a framework attached. A React app wraps it in a small hook; anything else
// calls the functions directly.

export type Shape = 'round' | 'soft' | 'square';

export const SHAPES: Shape[] = ['round', 'soft', 'square'];

/**
 * The built-in accent. Empty in settings means this.
 *
 * This is every adopting app's shared default, not a colour any one of them
 * owns: apps that share a design language but open in different colours by
 * default are a family only on paper.
 */
export const DEFAULT_ACCENT = '#FCC419';

/**
 * ACCENTS are the presets offered in the picker — the same EIGHT across every
 * adopting app, in the same order, so someone who set "Blue" in one app finds
 * the same blue in the next. Every one of them opens the picker, so the list is
 * a shortcut rather than a restriction.
 *
 * It was five here for as long as one adopting app had been shipping eight,
 * which is the drift a shared list exists to prevent: two accent rows sat at
 * visibly different lengths, and three colours somebody could pick in one app
 * were simply absent in the next. The last three are taken from the rainbow
 * palette by position, so the accent row and the palette row draw on one family
 * rather than two.
 */
export const ACCENTS: { name: string; hex: string }[] = [
  { name: 'Sunflower', hex: '#FCC419' },
  { name: 'Blue', hex: '#1D99F3' },
  { name: 'Green', hex: '#6FDC8C' },
  { name: 'Red', hex: '#FF8389' },
  { name: 'Purple', hex: '#BE95FF' },
  { name: 'Orange', hex: '#FF832B' },
  { name: 'Teal', hex: '#3DDBD9' },
  { name: 'Magenta', hex: '#FF7EB6' },
];

/**
 * RAINBOW is the default palette: a full turn of the wheel, but tuned to the
 * same warm, slightly dusty register as the accent presets, so switching the
 * mode on changes how much colour there is, not which family it belongs to.
 * The length is fixed — colours are handed out by position, so a palette
 * that could grow would re-colour every existing row the moment one was
 * added.
 */
export const RAINBOW: string[] = [
  '#FF8389', // red 30
  '#FF832B', // orange 40
  '#FCC419', // sunflower — the default accent, so one row always matches it
  '#6FDC8C', // green 30
  '#3DDBD9', // teal 30
  '#1D99F3', // blue
  '#BE95FF', // purple 30
  '#FF7EB6', // magenta 30
];

export interface RainbowState {
  on: boolean;
  /** Rest neutral, colour on hover, keep the colour on the active item. */
  reactive: boolean;
  /** Offset the palette by seed, so a run does not always start on crimson. */
  rotate: boolean;
  seed: number;
  palette: string[];
}

export const RAINBOW_OFF: RainbowState = {
  on: false,
  reactive: false,
  rotate: false,
  seed: 0,
  palette: RAINBOW,
};

/** applyShape sets the attribute the radius tokens key off. */
export function applyShape(shape: Shape | string | undefined): void {
  const s = SHAPES.includes(shape as Shape) ? (shape as Shape) : 'round';
  document.documentElement.setAttribute('data-shape', s);
}

// ---------------------------------------------------------------------------
// Motion
//
// How much the interface moves. The tokens live in tokens.css, keyed off
// `data-motion` on the root, and this is the piece that writes the attribute
// plus the one gesture that reveals the level the picker does not list.
// ---------------------------------------------------------------------------

/**
 * The levels, quietest first.
 *
 * THESE FOUR STRINGS ARE FIXED. They are a wire format, not wording: they go
 * into the `data-motion` attribute, stylesheet selectors match on them, and
 * storage holds them. An app that renames one has not made a local choice - the
 * tokens keyed to the old spelling stop matching, and a value already saved
 * under the old name fails validation and falls back to DEFAULT_MOTION, which
 * from the outside looks like the setting resetting itself. What somebody READS
 * is a separate question and lives in the translation table (German: Aus,
 * Dezent, Wild, Sturm).
 *
 * `storm` is deliberately LAST and deliberately not in `MOTION_LEVELS` below.
 * It is a real level with real numbers - see the `data-motion='storm'` block in
 * tokens.css - and it is not something a picker offers.
 */
export type Motion = 'off' | 'subtle' | 'wild' | 'storm';

/** What a picker shows. The storm is not in here; see stormTap below. */
export const MOTION_LEVELS: Motion[] = ['off', 'subtle', 'wild'];

/**
 * What a STORED value may legally be, which is a different question.
 *
 * Validate against this and populate a picker from MOTION_LEVELS. Conflating
 * the two is what makes a found storm forget itself on the next reload, and an
 * axis with a hidden level is where the difference shows.
 */
export const MOTION_STORED: Motion[] = [...MOTION_LEVELS, 'storm'];

/**
 * The default is the top VISIBLE level, not the quietest.
 *
 * This axis is additive polish a user dials DOWN, not a compatibility fallback
 * they have to opt INTO - and the accessibility signal that genuinely needs a
 * default is `prefers-reduced-motion`, which the tokens already read
 * unconditionally and which wins over every value here.
 */
export const DEFAULT_MOTION: Motion = 'wild';

/** applyMotion sets the attribute the motion tokens key off. */
export function applyMotion(motion: Motion | string | undefined): void {
  // MOTION_STORED, not MOTION_LEVELS: `storm` is accepted here even though no
  // picker offers it, because somebody who found it and then reloaded the page
  // must get it back, or the gesture would have produced a setting that
  // silently forgets itself.
  const m: Motion = MOTION_STORED.includes(motion as Motion) ? (motion as Motion) : DEFAULT_MOTION;
  document.documentElement.setAttribute('data-motion', m);
}

/** How many taps on the level already chosen open the one below the floor. */
export const STORM_TAPS = 5;

/**
 * The gesture that reveals the storm, and the rule it carries.
 *
 * SET THE MOTION TO THE TOP LEVEL, THEN TAP THAT SAME OPTION FIVE MORE TIMES.
 * It is the gesture of somebody pressing a button that is already pressed
 * because they wanted more of it, which is exactly who this level is for. It
 * cannot be reached from any other level on purpose: tapping "off" five times
 * means somebody is annoyed, not curious.
 *
 * THE RULE, and it is the part worth copying rather than the numbers: AN
 * EASTER EGG THAT CHANGES BEHAVIOUR MUST BE SWITCHABLE BACK OFF, AND MUST NOT
 * QUIETLY BECOME A PERMANENT ENTRY IN A SETTINGS LIST. The first build of this
 * stored a "found it" flag, so a single gesture put a fourth option in the
 * picker for ever - which turns a secret into a setting somebody has to explain
 * to themselves months later, with no memory of how it got there. Reported as
 * exactly that (jdp, 13.09.2026: "sturm soll wieder verschwinden wenn man zb
 * sanft einstellt und die einstellungen verlässt").
 *
 * So what keeps it visible is the plain truth about the current state:
 *
 *   - It is offered while it is CHOSEN, because a picker that hid the value it
 *     is currently showing would be lying about the interface.
 *   - Otherwise it is offered only for as long as the screen stays open.
 *     Choose something else and leave, and it is gone until the gesture is made
 *     again.
 *
 * The caller owns the screen and therefore owns how long "open" means: keep
 * `found` in the settings screen's own state, never in storage.
 *
 * Returns the level to switch to, or undefined when the tap was not the fifth.
 * Counting lives in the caller for the same reason `found` does.
 */
export function stormTap(state: { taps: number }, tapped: string, current: string): Motion | undefined {
  if (tapped !== 'wild' || current !== 'wild') {
    state.taps = 0;
    return undefined;
  }
  state.taps += 1;
  if (state.taps < STORM_TAPS) return undefined;
  state.taps = 0;
  return 'storm';
}

/**
 * applyAccent overrides the accent tokens, or clears the override so the
 * theme's own gold comes back. The contrast colour is computed rather than
 * configured: a light accent with white text on it is unreadable, and asking
 * the user to pick a second colour to fix the first one is not a setting, it
 * is a trap.
 *
 * `--accent-ink` is deliberately NOT set here. It is declared in tokens.css
 * as a color-mix over --accent, so it re-resolves on its own from whatever
 * this function writes AND follows a light/dark switch that happens later.
 * Computing it here would freeze it at the theme in force when the accent was
 * picked, which is exactly the bug the second token exists to avoid.
 */
export function applyAccent(hex: string | undefined): void {
  const root = document.documentElement.style;
  if (!valid(hex)) {
    root.removeProperty('--accent');
    root.removeProperty('--accent-contrast');
    root.removeProperty('--accent-soft');
    return;
  }
  const { r, g, b } = parse(hex);
  root.setProperty('--accent', hex);
  root.setProperty('--accent-contrast', contrastOn(hex));
  root.setProperty('--accent-soft', `rgba(${r}, ${g}, ${b}, 0.14)`);
}

// ---------------------------------------------------------------------------
// Rainbow
//
// The live state is module-level because it is a property of the document,
// not of any one component: the sidebar and the download list must agree on
// which colour position three is, and they never meet in the tree. Readers
// subscribe instead of being handed a prop through six intermediate
// components.
// ---------------------------------------------------------------------------

let state: RainbowState = RAINBOW_OFF;
const listeners = new Set<() => void>();

/** rainbowState is the current snapshot. Stable identity between changes. */
export function rainbowState(): RainbowState {
  return state;
}

export function subscribeRainbow(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * applyRainbow stores the new state, mirrors it onto the document root and
 * wakes the readers. The custom properties are set even when the mode is off
 * so that a stylesheet can reference `--rb-3` without having to know; the
 * `data-rainbow` attribute is what actually turns the look on.
 */
export function applyRainbow(next: Partial<RainbowState> | undefined): void {
  const merged: RainbowState = { ...RAINBOW_OFF, ...next };
  merged.palette = usablePalette(merged.palette);
  merged.seed = Number.isFinite(merged.seed) ? Math.abs(Math.trunc(merged.seed)) % RAINBOW.length : 0;
  state = merged;

  const root = document.documentElement;
  for (let i = 0; i < RAINBOW.length; i++) {
    root.style.setProperty(`--rb-${i}`, rainbowAt(i));
  }
  if (!merged.on) root.removeAttribute('data-rainbow');
  else root.setAttribute('data-rainbow', merged.reactive ? 'reactive' : 'on');

  for (const fn of listeners) fn();
}

/**
 * rainbowAt is the colour at a position, rotation applied. It answers even
 * when the mode is off, because a settings page has to show the palette it
 * is editing.
 */
export function rainbowAt(i: number): string {
  const p = state.palette;
  const off = state.rotate ? state.seed : 0;
  const n = ((Math.trunc(i) % p.length) + p.length) % p.length;
  const color = p[(n + off) % p.length];
  if (color === undefined) {
    // Unreachable in practice: usablePalette() never lets state.palette go
    // empty, but the index is computed via modulo, which TS can't verify.
    throw new Error('rainbowAt: palette is empty');
  }
  return color;
}

/**
 * rainbowColor is what a component asks for: the colour this item should
 * use, or undefined when the mode is off and the single accent applies.
 * Returning undefined rather than the accent keeps the accent in CSS, where
 * a theme change still reaches it.
 */
export function rainbowColor(i: number): string | undefined {
  return state.on ? rainbowAt(i) : undefined;
}

/**
 * hueVars are the inline custom properties an element carrying a palette
 * position sets on itself. The matching `.glim-hue` rules in tokens.css
 * decide whether the hue is shown at rest or held back until hover, so a
 * component only has to say which colour it owns, never which mode is
 * active.
 *
 * The class and these properties always travel together: `.glim-hue` with no
 * `--item-hue` under it would resolve the accent to nothing. Hand out both
 * from one call in the adopting app's own component layer.
 */
export function hueVars(hex: string | undefined): Record<string, string> {
  if (!valid(hex)) return {};
  const { r, g, b } = parse(hex);
  return {
    '--item-hue': hex,
    '--item-hue-ink': contrastOn(hex),
    '--item-hue-soft': `rgba(${r}, ${g}, ${b}, 0.22)`,
    // The wash covers a whole row, so it sits below the soft tint - but not
    // as far below as the original 7% figure: three independent adopting-app
    // reports said the mode "does nothing" at that strength, and measuring
    // the actual rendered colour confirmed the mechanism was wiring
    // correctly (the values genuinely differed row to row) while staying
    // under the threshold a person registers as "this changed." 16% is the
    // new floor - still short of 22%'s "colour chart" territory, but no
    // longer indistinguishable from the ground colour at a glance.
    '--item-hue-wash': `rgba(${r}, ${g}, ${b}, 0.16)`,
    // A compact circular badge (an icon toggle, an undo/redo/zoom action) has
    // no neighbouring row to reinforce the colour by repetition the way a
    // list does, and reads as barely-tinted grey at the wash's own 16% once
    // shrunk to badge size (jdp, adopting app: "die ganzen icon badges sind
    // immer noch schwach eingefärbt, die sollen normal kräftig eingefärbt
    // sein"). This tier is deliberately separate from the wash above rather
    // than just raising it - a list row's own 16% is calibrated for a
    // DIFFERENT reason (rule above: dense/at-scale is exactly where subtlety
    // matters) and must stay put.
    '--item-hue-badge': `rgba(${r}, ${g}, ${b}, 0.5)`,
    // The focus ring follows the position too. A gold ring around a teal tab
    // is the one place the single accent leaks back into the plural mode, and
    // it is the most visible one, because it only ever appears on the element
    // the keyboard is standing on.
    '--item-hue-ring': `rgba(${r}, ${g}, ${b}, 0.55)`,
  };
}

/**
 * rainbowFromSettings maps a server's flat fields onto the state this module
 * keeps. The parameter is structural rather than an imported type so this
 * file can be lifted into an adopting app unchanged.
 */
export function rainbowFromSettings(s: {
  rainbow?: boolean;
  rainbowReactive?: boolean;
  rainbowRotate?: boolean;
  rainbowSeed?: number;
  rainbowPalette?: string[] | null;
}): RainbowState {
  return {
    on: !!s.rainbow,
    reactive: !!s.rainbowReactive,
    rotate: !!s.rainbowRotate,
    seed: s.rainbowSeed ?? 0,
    palette: usablePalette(s.rainbowPalette ?? undefined),
  };
}

/** A palette is taken only in full — see the matching rule on the server. */
function usablePalette(p: string[] | undefined): string[] {
  if (!p || p.length !== RAINBOW.length || !p.every(valid)) return RAINBOW;
  return p;
}

/** contrastOn is black or white, whichever is readable on the given colour. */
export function contrastOn(hex: string): string {
  if (!valid(hex)) return '#FFFFFF';
  const { r, g, b } = parse(hex);
  // Carbon's own ink, not a warm near-black: on a yellow accent a
  // brown-tinted black reads as a smudge.
  return luminance(r, g, b) > 0.55 ? '#161616' : '#FFFFFF';
}

function valid(hex: string | undefined): hex is string {
  return !!hex && /^#[0-9a-fA-F]{6}$/.test(hex);
}

function parse(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/**
 * luminance is the perceptual brightness used to decide black or white on
 * top. The sRGB channels are linearised first, because the raw values
 * overstate how bright blue is and understate green, which is exactly the
 * case that produces unreadable buttons.
 */
function luminance(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * Appearance is mirrored into localStorage purely so the first paint after a
 * reload is already right. The server (or wherever settings actually live)
 * stays the source of truth; this only avoids a flash of the default look
 * while they are being fetched. Each adopting app should use its own cache
 * key — this default is just a starting point.
 */
const CACHE = 'glim-appearance';

interface Cached {
  shape?: string;
  accent?: string;
  rainbow?: RainbowState;
}

export function cacheAppearance(shape: string, accent: string, rainbow?: RainbowState): void {
  try {
    // Built with a conditional spread, not `{ shape, accent, rainbow }`, so
    // that under exactOptionalPropertyTypes the key is omitted entirely
    // when there's no rainbow state rather than present-but-undefined.
    const payload: Cached = { shape, accent, ...(rainbow !== undefined ? { rainbow } : {}) };
    localStorage.setItem(CACHE, JSON.stringify(payload));
  } catch {
    // A browser with storage disabled simply pays one flash per load.
  }
}

/** Applied at boot, before the app renders anything. */
export function applyCachedAppearance(): void {
  try {
    const raw = localStorage.getItem(CACHE);
    if (!raw) {
      applyShape('round');
      applyRainbow(undefined);
      return;
    }
    const { shape, accent, rainbow } = JSON.parse(raw) as Cached;
    applyShape(shape);
    applyAccent(accent);
    applyRainbow(rainbow);
  } catch {
    applyShape('round');
    applyRainbow(undefined);
  }
}
