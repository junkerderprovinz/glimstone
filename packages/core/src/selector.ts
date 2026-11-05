// The one horizontal selector and its second form, the column of tiles
// (docs/design-language.md, "The one horizontal selector" and "Vertical
// tiles"). Tabs, filter bars, segmented controls and pickers all render
// through one component, so they cannot drift apart.
//
// selectorView() and segmentView() decide what a framework should not repeat:
// the roles, the classes, which label shows and what the bubble says.
// watchSelectorRows() and watchSelectorFit() measure the segments in the DOM,
// roveSelector() moves the focus, and countSelector() gives each selector of a
// page its colour, so the React and Vue components only wire them up.

import { hueVars } from "./appearance.ts";
import { hidesLabel, labelWidth, type ControlAxis, type LabelMode } from "./controls.ts";
import { segmentLayout, type SegmentWidths } from "./segmentLayout.ts";

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
 * make it. Past that the label wraps, or the row is laid out by content.
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
  nodes[next].focus();
  return nodes[next];
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
  pairsOnPhone: boolean;
  hue: boolean;
  hueOffset?: number;
  /** Whether the window is at least DESKTOP_QUERY wide. */
  desktop: boolean;
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
  /** Whether the segments are measured and pinned to one width. */
  pinWidth: boolean;
  /** Whether a strip kept to one row may drop its labels for glyphs. */
  canSqueeze: boolean;
  /** A well below the desktop shell, which pins so its rows come out even. */
  phoneWell: boolean;
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

  // Below the desktop shell a well soon runs out of row, and segments that hug
  // their labels then wrap into rows of odd widths; pinned to the widest label
  // they stay equal. A strip of glyphs alone keeps its squares.
  const phoneWell = !vertical && !s.desktop && well && !s.fit && !s.pairsOnPhone && !s.items.every((i) => i.iconOnly);
  // The pinned width is measured from text and floored at MIN_PINNED_WIDTH,
  // which around a lone glyph is only empty pill. The `lg` tabs pin anyway, so
  // a row of page tabs stays a row of equals in glyph mode.
  const labelsOffScreen = hidesLabel(mode) && allGlyphs;
  const pinWidth = !vertical && (s.equalWidth || phoneWell) && !s.fit && !(labelsOffScreen && s.size !== "lg");

  const perTab = s.hue && (vertical || s.hueOffset !== undefined);
  const className = vertical
    ? `glim-sel-tiles${mode === "glyph" ? " glim-sel-tiles--narrow" : ""}`
    : [
        "glim-sel",
        well ? "glim-sel--well" : "glim-sel--chip",
        s.inline && !s.fit && "glim-sel--inline",
        s.fit && "glim-sel--fit",
        s.pairsOnPhone && "glim-sel--pairs",
      ]
        .filter(Boolean)
        .join(" ");

  return {
    role: many ? "group" : manual ? (vertical ? "tablist" : "radiogroup") : "tablist",
    kind: many ? "toggle" : manual && !vertical ? "radio" : "tab",
    autoSelect: !many && !manual,
    pinWidth,
    canSqueeze: s.fit && mode === "textGlyph" && allGlyphs,
    phoneWell,
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
  pairsOnPhone: boolean;
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
  /** The strip keeps to one row and has dropped its labels for glyphs. */
  squeezed: boolean;
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
  const explains = g.tip ?? (nameHidden || g.squeezed ? g.label : undefined);
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
  const centred = g.equalWidth || g.strip.phoneWell || g.pairsOnPhone;
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
  const wraps = g.strip.pinWidth || g.pairsOnPhone;

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
          : wraps
            ? "glim-sel-label glim-sel-label--wrap"
            : "glim-sel-label",
    ariaLabel: nameHidden ? g.label : undefined,
    tip: reactive && !g.disabled ? undefined : tip,
  };
}

/**
 * How the pinned segments of one strip share their room. `room` is the box's
 * content width, `inset` the track's own padding, which a hugging track adds
 * to its segments.
 */
export interface SelectorRows {
  pinned: number;
  room: number;
  gap: number;
  inset: number;
  perRow: number;
  byContent: boolean;
}

const sameRows = (a: SelectorRows | null, b: SelectorRows) =>
  !!a &&
  a.perRow === b.perRow &&
  a.byContent === b.byContent &&
  Math.abs(a.pinned - b.pinned) < 0.5 &&
  Math.abs(a.room - b.room) < 0.5 &&
  a.gap === b.gap &&
  a.inset === b.inset;

const segmentsOf = (track: HTMLElement) => Array.from(track.querySelectorAll<HTMLElement>("[data-sel-id]"));

/**
 * Each segment's width with its label on one line and at its narrowest. The
 * segments are held to their flex share, so each is set to the size being
 * read and given its own style back straight after. The width comes from the
 * computed style, since a window's scale-in animation shrinks the bounding box.
 */
export function measureSegments(segs: HTMLElement[]): SegmentWidths[] {
  const own = segs.map((s) => s.style.cssText);
  const at = (width: string) => {
    for (const s of segs) Object.assign(s.style, { flex: "none", width, minWidth: "0", maxWidth: "none" });
    return segs.map((s) => parseFloat(getComputedStyle(s).width));
  };
  const oneLine = at("max-content");
  const narrowest = at("min-content");
  segs.forEach((s, i) => (s.style.cssText = own[i]));
  return segs.map((_, i) => ({ oneLine: oneLine[i], narrowest: narrowest[i] }));
}

/**
 * Measures how the pinned segments of `track` share the row, at once and whenever
 * the box or a segment resizes, since a late web font changes what a label
 * needs, and hands each new layout to `onRows`. The room is the track's own
 * content box while it spans and its parent's while it hugs. Returns the
 * teardown.
 */
export function watchSelectorRows(
  track: HTMLElement,
  { inline, equalWidth }: { inline: boolean; equalWidth: boolean },
  onRows: (rows: SelectorRows) => void,
): () => void {
  const box = inline ? track.parentElement! : track;
  let last: SelectorRows | null = null;
  const measure = () => {
    const segs = segmentsOf(track);
    if (segs.length === 0) return;
    const own = getComputedStyle(track);
    const inset = parseFloat(own.paddingLeft) + parseFloat(own.paddingRight);
    const outer = inline ? getComputedStyle(box) : own;
    const room = box.clientWidth - parseFloat(outer.paddingLeft) - parseFloat(outer.paddingRight) - (inline ? inset : 0);
    // A hidden box measures nothing; it is laid out once it shows.
    if (room <= 0) return;
    const gap = parseFloat(own.columnGap) || 0;
    const widths = measureSegments(segs);
    const widest = Math.max(...widths.map((w) => w.oneLine));
    // The shared floor belongs to the strips that asked to be pinned. A phone
    // well takes its widest label, so one beside a caption still hugs.
    let pinned = equalWidth ? pinnedWidth(widest, segs.length, room, gap) : Math.min(widest, room);
    let rows = segmentLayout(room, pinned, widths, gap);
    // A hugging strip that wraps takes the floor its rows have room for, so a
    // segment is as wide in a strip of eight as in a strip of four.
    if (inline && !rows.byContent && rows.perRow < segs.length) {
      pinned = equalWidth
        ? pinnedWidth(widest, rows.perRow, room, gap)
        : Math.floor((room - gap * (rows.perRow - 1)) / rows.perRow);
      rows = segmentLayout(room, pinned, widths, gap);
    }
    const next: SelectorRows = { pinned, room, gap, inset, ...rows };
    if (sameRows(last, next)) return;
    last = next;
    onRows(next);
  };
  measure();
  const watch = new ResizeObserver(measure);
  watch.observe(box);
  for (const seg of segmentsOf(track)) watch.observe(seg);
  return () => watch.disconnect();
}

/**
 * How a strip kept to one row holds its labels: in even shares while the
 * widest fits one, at each label's own width while they fit together, and as
 * glyphs alone after that.
 */
export type SelectorFit = "even" | "content" | "squeezed";

/**
 * Watches a strip kept to one row and hands `onFit` how it holds its labels.
 * The labels are put back on screen for the measurement, so a strip that has
 * dropped them sees when they fit again. Returns the teardown.
 */
export function watchSelectorFit(track: HTMLElement, onFit: (fit: SelectorFit) => void): () => void {
  let last: SelectorFit | null = null;
  const measure = () => {
    const segs = segmentsOf(track);
    const own = getComputedStyle(track);
    const room = track.clientWidth - parseFloat(own.paddingLeft) - parseFloat(own.paddingRight);
    if (room <= 0 || segs.length === 0) return;
    const gap = parseFloat(own.columnGap) || 0;
    const hidden = Array.from(track.querySelectorAll("[data-sel-label].glim-sr-only"));
    for (const l of hidden) l.classList.remove("glim-sr-only");
    const widths = measureSegments(segs).map((w) => w.oneLine);
    for (const l of hidden) l.classList.add("glim-sr-only");
    const free = room - gap * (segs.length - 1);
    const needed = widths.reduce((sum, w) => sum + w, 0);
    const next: SelectorFit = Math.max(...widths) <= free / segs.length ? "even" : needed <= free ? "content" : "squeezed";
    if (next === last) return;
    last = next;
    onFit(next);
  };
  measure();
  const watch = new ResizeObserver(measure);
  watch.observe(track);
  void track.ownerDocument.fonts?.ready.then(measure);
  return () => watch.disconnect();
}

/**
 * The flex style of every segment and the style of the track, from the
 * measured rows.
 *
 * A pinned segment keeps the pinned width as its floor and grows into its
 * share of the row, so every row ends at the track's edge once it wraps. The
 * basis leaves one gap of slack against sub-pixel rounding, and the growth
 * takes it back. The floor gives way to the room, so a box narrower than one
 * segment squeezes it instead of pushing it out of the card.
 *
 * In a hugging strip the pinned segments start from their width, and the track
 * is held to one row's worth of them, a pixel over against rounding, so it
 * wraps into even rows that end where the segments do.
 */
export function selectorFlex({
  rows,
  pinWidth,
  inline,
  fit,
  fitMode,
  pairsOnPhone,
}: {
  rows: SelectorRows | null;
  pinWidth: boolean;
  inline: boolean;
  fit: boolean;
  fitMode: SelectorFit;
  pairsOnPhone: boolean;
}): { segment: Record<string, string>; track: Record<string, string> } {
  const byContent = pinWidth && !!rows?.byContent;
  const pinned = pinWidth && rows && !rows.byContent ? rows : null;
  const hugged = inline && pinned;
  // In the content mode a segment starts from its label's width and shares
  // out what is left, so a long name keeps its words while the short ones
  // give up room.
  const segment: Record<string, string> = fit
    ? { flex: fitMode === "content" ? "1 1 auto" : "1 1 0", minWidth: "0", maxWidth: `${MAX_PINNED_WIDTH}px` }
    : hugged
      ? { flex: `1 0 ${Math.min(hugged.pinned, hugged.room)}px` }
      : pinned
        ? {
            minWidth: `${Math.min(pinned.pinned, pinned.room)}px`,
            flex: `1 0 calc((100% - ${pinned.perRow} * ${pinned.gap}px) / ${pinned.perRow})`,
          }
        : { flex: pairsOnPhone ? "1 0 var(--seg-basis, auto)" : "1 0 auto" };
  const track: Record<string, string> = fit
    ? { flexWrap: "nowrap" }
    : byContent
      ? { width: "100%", flexWrap: "nowrap" }
      : hugged
        ? { maxWidth: `${hugged.perRow * hugged.pinned + (hugged.perRow - 1) * hugged.gap + hugged.inset + 1}px` }
        : {};
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
