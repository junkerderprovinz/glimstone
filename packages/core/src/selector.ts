// The one horizontal selector and its second form, the column of tiles
// (docs/design-language.md, "The one horizontal selector" and "Vertical
// tiles"). Tabs, filter bars, segmented controls and pickers all render
// through one component, so they cannot drift apart.
//
// selectorView() and segmentView() decide what a framework should not repeat:
// the roles, the classes, which label shows and what the bubble says.
// watchSelectorFit() measures the segments in the DOM, roveSelector() moves the
// focus, and countSelector() gives each selector of a page its colour, so the
// React and Vue components only wire them up.

import { hueVars } from "./appearance.ts";
import { hidesLabel, labelWidth, type ControlAxis, type LabelMode } from "./controls.ts";
import { segmentFit, type SegmentFit } from "./segmentLayout.ts";

/** "one" picks a single value, "many" toggles any number of them. */
export type SelectMode = "one" | "many";

/**
 * "auto" selects as the arrow keys move, as a tab strip does. "manual" moves
 * the focus and chooses only on Space, Enter or a click, as a radio group
 * does; a strip that saves a setting takes it, since a tab strip promises a
 * panel that changes.
 */
export type SelectorActivation = "auto" | "manual";

/** `md` is the card and toolbar scale, `sm` the dense strip, `lg` the page-level tabs and pickers. */
export type SelectorSize = "sm" | "md" | "lg";

/**
 * "well" sets flush segments in a shared groove and fills only the chosen one.
 * "chip" gives every segment a quiet pill of its own, the bare strip of
 * badges.
 */
export type SelectorVariant = "chip" | "well";

/** "vertical" is the column of tiles beside a settings area's pages. */
export type SelectorOrientation = "horizontal" | "vertical";

/**
 * The narrowest a pinned segment gets, shared by every pinned strip so the
 * pickers of a page come out at one width, and the widest one long label may
 * make it. Past that the row is laid out by its labels.
 */
export const MIN_PINNED_WIDTH = 200;
export const MAX_PINNED_WIDTH = 352;

/**
 * The width every pinned segment gets: the widest label within the cap, and
 * the shared floor where the row holds that many. On a phone the floor gives
 * way to an even share of the row, rounded down, since an exact share comes
 * back a hair short of fitting.
 */
export function pinnedWidth(widest: number, count: number, room: number, gap: number): number {
  const share = Math.floor((room - gap * (count - 1)) / count);
  return Math.min(Math.max(widest, Math.min(MIN_PINNED_WIDTH, share)), MAX_PINNED_WIDTH);
}

/** The id of a tab in a strip that switches `panelId`; the panel names itself after it. */
export function selectorTabId(panelId: string, itemId: string | number): string {
  return `${panelId}-tab-${itemId}`;
}

/**
 * The label axis a selector follows. The page-level strips are tabs, the
 * smaller ones stand in form rows beside buttons, and the column of tiles
 * stands beside the rail and follows it.
 */
export function selectorAxis(size: SelectorSize, orientation: SelectorOrientation): ControlAxis {
  if (orientation === "vertical") return "sidebar";
  return size === "lg" ? "tabs" : "buttons";
}

export type SelectorNavKey = "ArrowRight" | "ArrowLeft" | "ArrowDown" | "ArrowUp" | "Home" | "End";

/**
 * The roving target for a key press. Home and End jump to the ends, the arrows
 * step and wrap around. ArrowRight moves right on screen, which under RTL is
 * one index back; Up and Down mean the same in every direction. With nothing
 * focused yet it starts at the first item, and an empty strip returns -1.
 */
export function nextFocusIndex(key: SelectorNavKey, current: number, count: number, rtl: boolean): number {
  if (count <= 0) return -1;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  if (current < 0) return 0;
  const forward = key === "ArrowDown" || key === (rtl ? "ArrowLeft" : "ArrowRight");
  return (current + (forward ? 1 : -1) + count) % count;
}

/**
 * The item that holds the strip's one tab stop: the chosen one unless it is
 * disabled, then the first enabled one, so a strip whose chosen item was
 * disabled under it stays reachable.
 */
export function rovedIndex(disabled: boolean[], activeIndex: number): number {
  if (activeIndex >= 0 && !disabled[activeIndex]) return activeIndex;
  const firstEnabled = disabled.findIndex((d) => !d);
  return firstEnabled >= 0 ? firstEnabled : 0;
}

/** The value of a "many" selector once `id` is toggled, in the items' order. */
export function toggleSelection<V>(value: readonly V[], id: V, order: readonly V[]): V[] {
  const on = !value.includes(id);
  return order.filter((x) => (x === id ? on : value.includes(x)));
}

/**
 * Moves the focus for a key press inside `track` and returns the segment it
 * landed on, or null when the key is not one the strip answers. Disabled
 * segments are skipped. The direction is read off the track, so dir="rtl"
 * works without a prop.
 */
export function roveSelector(track: HTMLElement, key: string, orientation: SelectorOrientation): HTMLElement | null {
  const keys = orientation === "vertical" ? ["ArrowDown", "ArrowUp", "Home", "End"] : ["ArrowRight", "ArrowLeft", "Home", "End"];
  if (!keys.includes(key)) return null;
  const nodes = Array.from(track.querySelectorAll<HTMLElement>("[data-sel-id]:not(:disabled)"));
  const rtl = getComputedStyle(track).direction === "rtl";
  const next = nextFocusIndex(key as SelectorNavKey, nodes.indexOf(track.ownerDocument.activeElement as HTMLElement), nodes.length, rtl);
  if (next < 0) return null;
  const node = nodes[next]!;
  node.focus();
  return node;
}

export interface SelectorInput {
  /** The current mode of the axis selectorAxis() names. */
  mode: LabelMode;
  select: SelectMode;
  activation: SelectorActivation;
  orientation: SelectorOrientation;
  size: SelectorSize;
  variant: SelectorVariant;
  equalWidth: boolean;
  inline: boolean;
  fit: boolean;
  hue: boolean;
  hueOffset?: number;
  /** Whether the window is at least WIDE_QUERY wide. */
  wide: boolean;
  items: { hasGlyph: boolean; iconOnly: boolean }[];
}

export interface SelectorView {
  role: "tablist" | "radiogroup" | "group";
  /** What each segment is: a tab, a radio or a toggle button. */
  kind: "tab" | "radio" | "toggle";
  /** Whether moving the focus also chooses. */
  autoSelect: boolean;
  /** Whether the segments are pinned to one width while they fit at it. */
  pinWidth: boolean;
  /** Whether the strip may drop its labels for glyphs to keep to its row. */
  canSqueeze: boolean;
  /** Whether the strip may turn into a dropdown where its labels do not fit;
   *  a dropdown holds one value, so a "many" strip cuts its labels instead. */
  canList: boolean;
  /** Each segment keeps a palette position of its own, as a tab does. */
  perTab: boolean;
  /** The selector takes its colour from its place on the page (countSelector). */
  counted: boolean;
  /** The mode the segments render in: the column of tiles shows glyphs alone below WIDE_QUERY. */
  mode: LabelMode;
  className: string;
}

export function selectorView(s: SelectorInput): SelectorView {
  const vertical = s.orientation === "vertical";
  const many = s.select === "many";
  const manual = vertical || s.activation === "manual";
  const well = s.variant === "well";
  const allGlyphs = s.items.every((i) => i.hasGlyph);
  // A narrow window leaves the column too little room for words beside the
  // rail, so it falls back to glyphs whatever the setting.
  const mode: LabelMode = vertical && !s.wide && s.mode !== "text" && allGlyphs ? "glyph" : s.mode;

  // The pinned width is measured from text and floored at MIN_PINNED_WIDTH,
  // which around a lone glyph is only empty pill. The `lg` tabs pin anyway, so
  // a row of page tabs stays a row of equals in glyph mode.
  const labelsOffScreen = hidesLabel(mode) && allGlyphs;
  const pinWidth = !vertical && s.equalWidth && !s.fit && !(labelsOffScreen && s.size !== "lg");

  const perTab = s.hue && (vertical || s.hueOffset !== undefined);
  const className = vertical
    ? `glim-sel-tiles${mode === "glyph" ? " glim-sel-tiles--narrow" : ""}`
    : [
        "glim-sel",
        well ? "glim-sel--well" : "glim-sel--chip",
        s.inline && !s.fit && "glim-sel--inline",
      ]
        .filter(Boolean)
        .join(" ");

  return {
    role: many ? "group" : manual ? (vertical ? "tablist" : "radiogroup") : "tablist",
    kind: many ? "toggle" : manual && !vertical ? "radio" : "tab",
    autoSelect: !many && !manual,
    pinWidth,
    canSqueeze: !vertical && mode === "textGlyph" && allGlyphs,
    canList: !vertical && !many,
    perTab,
    counted: s.hue && !perTab,
    mode,
    className,
  };
}

export interface SegmentInput {
  strip: SelectorView;
  orientation: SelectorOrientation;
  size: SelectorSize;
  variant: SelectorVariant;
  equalWidth: boolean;
  buttonHeight: boolean;
  hue: boolean;
  hueOffset?: number;
  index: number;
  label: string;
  hasGlyph: boolean;
  iconOnly: boolean;
  tip?: string;
  title?: string;
  on: boolean;
  disabled: boolean;
  /** Tiles only: a page with nothing on it yet. */
  dim?: boolean;
  /** The strip has dropped its labels for glyphs to keep to its row. */
  squeezed: boolean;
  /** The label is cut short to keep the strip to its row. */
  cut: boolean;
}

export interface SegmentView {
  className: string;
  style: Record<string, string> | undefined;
  showGlyph: boolean;
  /** The class of the label's span, or null when the segment shows its glyph
   *  alone and `ariaLabel` names it. */
  labelClass: string | null;
  ariaLabel: string | undefined;
  /** What the hover and focus bubble says, or undefined for none. */
  tip: string | undefined;
}

export function segmentView(g: SegmentInput): SegmentView {
  const mode = g.hasGlyph ? g.strip.mode : "text";
  const vertical = g.orientation === "vertical";
  const nameHidden = (g.iconOnly && mode !== "text") || hidesLabel(mode);
  // Reactive brings the words back on hover. Not for `iconOnly`: that segment
  // sits in a strip with no room for words, and a label mode must not
  // override the call site.
  const reactive = mode === "reactive" && !g.iconOnly;

  // A `tip` is the fuller version of the label, so it stands in for the label
  // instead of joining it; `title`, the reason for the segment's state, is
  // added to either. Identical parts collapse.
  const explains = g.tip ?? (nameHidden || g.squeezed || g.cut ? g.label : undefined);
  const tip = [...new Set([explains, g.title].filter(Boolean))].join(": ") || undefined;

  const style: Record<string, string> = {
    ...(g.strip.perTab ? hueVars(g.index + (g.hueOffset ?? 0)) : {}),
    ...(reactive ? { "--reactive-chars": String(labelWidth(g.label)) } : {}),
  };

  // A segment of a tab strip tints its glyph with its hue at rest. An iconOnly
  // segment is all glyph, and on an icon-only badge only the fill takes the
  // colour, so it skips the tint, as does every segment of a selector that
  // sets a value.
  const hueClass = g.hue ? (g.strip.perTab && !g.iconOnly ? "glim-hue glim-hue-icon" : "glim-hue") : "";

  if (vertical) {
    return {
      className: [
        "glim-sel-tile",
        mode === "glyph" && "glim-sel-tile--glyph",
        reactive && "glim-sel-tile--reactive glim-reactive",
        g.dim && "glim-sel-tile--dim",
        hueClass,
        g.on && "glim-active",
      ]
        .filter(Boolean)
        .join(" "),
      style: Object.keys(style).length ? style : undefined,
      showGlyph: mode !== "text",
      labelClass: reactive ? "glim-sel-tile-caption" : mode === "glyph" ? "glim-sr-only" : "glim-sel-tile-label",
      ariaLabel: undefined,
      tip: reactive && !g.disabled ? undefined : tip,
    };
  }

  const well = g.variant === "well";
  const pinnedWell = well && g.equalWidth;
  const centred = g.equalWidth;
  // A glyph segment, or any segment of a strip beside a button, takes the
  // button height, since a box sized by its text comes out shorter than the
  // controls around it. The `lg` strip has a height of its own.
  const box = pinnedWell
    ? g.buttonHeight
      ? "glim-sel-seg--btn"
      : "glim-sel-seg--pinned"
    : g.iconOnly && !centred
      ? "glim-sel-seg--square"
      : (g.hasGlyph || g.buttonHeight) && g.size !== "lg"
        ? "glim-sel-seg--btn"
        : "";

  return {
    className: [
      "glim-sel-seg",
      `glim-sel-seg--${g.size}`,
      box,
      (centred || pinnedWell) && "glim-sel-seg--center",
      reactive && "glim-reactive",
      hueClass,
      g.on && "glim-active",
    ]
      .filter(Boolean)
      .join(" "),
    style: Object.keys(style).length ? style : undefined,
    showGlyph: mode !== "text",
    // A segment without a glyph keeps its text in every mode: an empty segment
    // is unusable, an uneven strip only looks odd.
    labelClass: reactive
      ? "glim-label-reactive"
      : nameHidden
        ? null
        : g.squeezed
          ? "glim-sr-only"
          : "glim-sel-label",
    ariaLabel: nameHidden ? g.label : undefined,
    tip: reactive && !g.disabled ? undefined : tip,
  };
}

/**
 * How a strip holds its one row. `pinned` is the width its segments are
 * pinned to while they fit at it, or 0 for a strip that does not pin. `hug`
 * is how wide a hugging track is with its segments side by side, or 0 once
 * they do not fit and it takes the whole box.
 */
export interface SelectorLayout extends SegmentFit {
  pinned: number;
  hug: number;
}

const sameLayout = (a: SelectorLayout | null, b: SelectorLayout) =>
  !!a &&
  a.fit === b.fit &&
  Math.abs(a.pinned - b.pinned) < 0.5 &&
  Math.abs(a.hug - b.hug) < 0.5 &&
  a.cut.join() === b.cut.join();

const segmentsOf = (track: HTMLElement) => Array.from(track.querySelectorAll<HTMLElement>("[data-sel-id]"));

/**
 * Each segment's width with its label on one line. The segments are held to
 * their flex share, so each is set to the size being read and given its own
 * style back straight after. The width comes from the computed style, since a
 * window's scale-in animation shrinks the bounding box.
 */
export function measureSegments(segs: HTMLElement[]): number[] {
  const own = segs.map((s) => s.style.cssText);
  for (const s of segs) Object.assign(s.style, { flex: "none", width: "max-content", minWidth: "0", maxWidth: "none" });
  const oneLine = segs.map((s) => parseFloat(getComputedStyle(s).width));
  segs.forEach((s, i) => (s.style.cssText = own[i]!));
  return oneLine;
}

/**
 * Watches how the segments of `track` share its one row, at once and whenever
 * the box or a segment resizes, since a late web font changes what a label
 * needs, and hands each new layout to `onLayout`. Labels dropped for glyphs
 * and segments hidden behind the dropdown are put back for the reading, so a
 * strip sees when they fit again. Returns the teardown.
 */
export function watchSelectorFit(
  track: HTMLElement,
  { pinWidth, fit, canSqueeze, canList }: { pinWidth: boolean; fit: boolean; canSqueeze: boolean; canList: boolean },
  onLayout: (layout: SelectorLayout) => void,
): () => void {
  let last: SelectorLayout | null = null;
  const measure = () => {
    const segs = segmentsOf(track);
    if (segs.length === 0) return;
    const hidden = Array.from(track.querySelectorAll("[data-sel-label].glim-sr-only"));
    for (const l of hidden) l.classList.remove("glim-sr-only");
    const listed = track.classList.contains("glim-sel--listed");
    track.classList.remove("glim-sel--listed");
    // A hugging track is only as wide as its segments; given the whole box for
    // the reading, it shows the room it could take.
    const { width, minWidth } = track.style;
    Object.assign(track.style, { width: "100%", minWidth: "0" });
    const oneLine = measureSegments(segs);
    const own = getComputedStyle(track);
    const inset = parseFloat(own.paddingLeft) + parseFloat(own.paddingRight);
    const room = track.clientWidth - inset;
    const gap = parseFloat(own.columnGap) || 0;
    Object.assign(track.style, { width, minWidth });
    for (const l of hidden) l.classList.add("glim-sr-only");
    if (listed) track.classList.add("glim-sel--listed");
    // A hidden box measures nothing; it is laid out once it shows.
    if (room <= 0) return;
    const pinned = pinWidth ? pinnedWidth(Math.max(...oneLine), segs.length, room, gap) : 0;
    const even = pinned || (fit ? Math.floor((room - gap * (segs.length - 1)) / segs.length) : null);
    const fits = segmentFit(room, even, oneLine, gap, canSqueeze, canList);
    const row = fits.fit === "even" ? (even ?? 0) * segs.length : fits.fit === "content" ? oneLine.reduce((sum, w) => sum + w, 0) : 0;
    // A pixel over, so rounding cannot leave the last segment short of room.
    const hug = row && row + gap * (segs.length - 1) + inset + 1;
    const next: SelectorLayout = { ...fits, pinned, hug };
    if (sameLayout(last, next)) return;
    last = next;
    onLayout(next);
  };
  measure();
  const watch = new ResizeObserver(measure);
  watch.observe(track);
  if (track.parentElement) watch.observe(track.parentElement);
  for (const seg of segmentsOf(track)) watch.observe(seg);
  void track.ownerDocument.fonts?.ready.then(measure);
  return () => watch.disconnect();
}

/**
 * The flex style of every segment and the style of the track, from the
 * measured layout.
 *
 * Pinned segments that fit keep the pinned width as their floor and grow into
 * an even share of a spanning track; in a hugging track they start from it
 * and the track ends where they do. Segments laid out by their labels start
 * from them and share out what is left, so a long name keeps its words while
 * the short ones give up room. Squeezed or cut short, they take even shares
 * of the row, and their floor gives way so the row never overflows its box.
 *
 * The track's labels do not size it (`contain: inline-size`), so a hugging
 * track is given its width here: its segments side by side while they fit,
 * the whole box once they do not.
 */
export function selectorFlex({ layout, inline, fit }: { layout: SelectorLayout | null; inline: boolean; fit: boolean }): {
  segment: Record<string, string>;
  track: Record<string, string>;
} {
  const mode = layout?.fit ?? "even";
  const pinned = layout?.pinned ?? 0;
  const cap: Record<string, string> = fit ? { maxWidth: `${MAX_PINNED_WIDTH}px` } : {};
  const segment: Record<string, string> =
    mode === "squeezed" || mode === "list" || mode === "truncated"
      ? { flex: "1 1 0", minWidth: "0", ...cap }
      : fit
        ? { flex: mode === "content" ? "1 0 auto" : "1 1 0", minWidth: "0", ...cap }
        : mode === "even" && pinned > 0
          ? inline
            ? { flex: `1 0 ${pinned}px` }
            : { flex: "1 1 0", minWidth: `${pinned}px` }
          : { flex: "1 0 auto" };
  const track: Record<string, string> = inline && layout ? { width: layout.hug ? `${layout.hug}px` : "100%" } : {};
  return { segment, track };
}

// Under rainbow every selector that sets a value wears a colour of its own on
// its chosen segment, and the selectors of a page count through the palette
// in the order they stand. A selector cannot know its place from its props, so
// each hands its track here, which sorts the tracks of one page by document
// position. A window counts its own selectors from the start, so opening one
// moves no colour on the page behind it.

const tracks = new Set<HTMLElement>();
let queued = false;

function scopeOf(track: HTMLElement): Element {
  return track.closest('[role="dialog"], [role="alertdialog"], main') ?? track.ownerDocument.body;
}

function recount(): void {
  queued = false;
  const scopes = new Map<Element, HTMLElement[]>();
  for (const track of tracks) {
    if (!track.isConnected) continue;
    const scope = scopeOf(track);
    scopes.set(scope, [...(scopes.get(scope) ?? []), track]);
  }
  for (const list of scopes.values()) {
    list.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    list.forEach((track, i) => {
      for (const [name, value] of Object.entries(hueVars(i))) track.style.setProperty(name, value);
    });
  }
}

function queue(): void {
  if (queued) return;
  queued = true;
  // After every selector of this render has joined, before the next paint.
  queueMicrotask(recount);
}

/** Puts a selector's track into its page's count and returns the function that takes it out again. */
export function countSelector(track: HTMLElement): () => void {
  tracks.add(track);
  queue();
  return () => {
    tracks.delete(track);
    queue();
  };
}
