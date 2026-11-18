// A picker window's logic ("Pickers and wizards" in the design language): the
// tiles in their groups, alphabetical in the reader's language, narrowed by
// one search across all of them, and the arrow keys across the grid. The app
// brings the list; nothing here knows what is being picked.

import { focusedAsker } from "./dialog.ts";
import { readPortalHue } from "./portalHue.ts";

/** A mark kept as markup, with the colours its tile lights up in ("Brand tiles"). Without them the tile lights up in the accent. */
export interface TileMark {
  svg: string;
  tile?: string;
  ink?: string;
}

export interface PickGroup {
  id: string;
  /** The eyebrow over the group's tiles. */
  title: string;
}

/** One tile. `M` is the framework's own kind of glyph, for a choice that has no brand. */
export interface PickItem<M = unknown> {
  id: string;
  /** The short name shown, which is also the tile's accessible name with `sub`. */
  label: string;
  /** What kind of thing it is, such as "Windows share" beside SMB, as the tile's second line under the pointer. */
  sub?: string;
  /** A brand's TileMark, or one of the app's glyphs, which lights up in the accent. */
  mark?: M | TileMark;
  /** The group it stands in. Without one it stands after the groups. */
  group?: string;
  /** What the name cannot say, in the tile's info bubble. */
  hint?: string;
  /** A short word on the tile's tooltip, for a name that needs no (i). */
  tip?: string;
  /** Further words the search finds it by, such as the services it reaches. */
  terms?: readonly string[];
  /** The tile that takes anything, such as an address typed by hand, which stands last. */
  last?: boolean;
}

export interface PickerText {
  /** The search's placeholder and name, which says what it searches. */
  search: string;
  /** The sentence when nothing matches, with `{query}`. It names the tile that takes anything. */
  none: string;
  /** The name of the button that empties the search. */
  clear: string;
  /** The way out while the tiles show. */
  close: string;
  /** The way out beside a form's forward action. */
  cancel: string;
  /** Back from a form to the tiles. */
  back: string;
}

export interface PickSection<I> {
  id: string;
  title?: string;
  items: I[];
}

/** Lowercases and drops accents and hyphens, so "zeitplane" finds "Zeitpläne" and "offsite" finds "Off-site". */
function fold(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").replace(/ß/g, "ss").replace(/-/g, "").toLowerCase();
}

/** Whether every word of the query turns up in at least one of the names. */
export function pickMatches(query: string, names: readonly string[]): boolean {
  const said = names.map(fold);
  return fold(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => said.some((name) => name.includes(word)));
}

/**
 * The sections a picker shows for a query: one per group in the order given,
 * an untitled one after them for tiles outside every group, and only those
 * the query leaves a tile in. The search reads the name and its second line,
 * the id and the item's own words.
 */
export function pickSections<I extends PickItem>(
  items: readonly I[],
  groups: readonly PickGroup[],
  query: string,
  lang: string,
): PickSection<I>[] {
  const order = (a: I, b: I) =>
    Number(!!a.last) - Number(!!b.last) || a.label.localeCompare(b.label, lang, { sensitivity: "base" });
  const found = items.filter((item) => pickMatches(query, [item.label, item.sub ?? "", item.id, ...(item.terms ?? [])]));
  const known = new Set(groups.map((g) => g.id));
  const sections: PickSection<I>[] = groups.map((g) => ({ id: g.id, title: g.title, items: found.filter((i) => i.group === g.id) }));
  sections.push({ id: "", title: undefined, items: found.filter((i) => i.group === undefined || !known.has(i.group)) });
  return sections.filter((s) => s.items.length > 0).map((s) => ({ ...s, items: s.items.sort(order) }));
}

export function isTileMark(mark: unknown): mark is TileMark {
  return typeof mark === "object" && mark !== null && typeof (mark as TileMark).svg === "string";
}

/** The colour pair a brand's tile hands down to `.glim-provider-pick`, or nothing for the accent. */
export function pickTileStyle(mark: unknown): Record<string, string> | undefined {
  if (!isTileMark(mark) || !mark.tile || !mark.ink) return undefined;
  return { "--provider-tile": mark.tile, "--provider-ink": mark.ink };
}

export interface PickBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Where a key moves the focus from tile `from`, given every tile's box in
 * order: the tile beside it, the nearest one in the row above or below, the
 * first or the last. Up from the first row is the search. Null for a key the
 * grid leaves alone.
 */
export function pickKey(key: string, from: number, boxes: readonly PickBox[], rtl: boolean): number | "search" | null {
  const last = boxes.length - 1;
  const forward = rtl ? "ArrowLeft" : "ArrowRight";
  const back = rtl ? "ArrowRight" : "ArrowLeft";
  if (key === "Home") return 0;
  if (key === "End") return last;
  if (key === forward) return Math.min(from + 1, last);
  if (key === back) return Math.max(from - 1, 0);
  if (key !== "ArrowUp" && key !== "ArrowDown") return null;

  const here = boxes[from]!;
  const centre = (b: PickBox) => b.left + b.width / 2;
  // A row is every tile whose top lies within half a tile of the first one's.
  const sameRow = (a: PickBox, b: PickBox) => Math.abs(a.top - b.top) < Math.min(a.height, b.height) / 2;
  const down = key === "ArrowDown";
  const beyond = boxes
    .map((box, index) => ({ box, index }))
    .filter(({ box }) => !sameRow(box, here) && (down ? box.top > here.top : box.top < here.top));
  if (beyond.length === 0) return down ? from : "search";
  const near = beyond.reduce((a, b) => (Math.abs(b.box.top - here.top) < Math.abs(a.box.top - here.top) ? b : a));
  const row = beyond.filter(({ box }) => sameRow(box, near.box));
  return row.reduce((a, b) => (Math.abs(centre(b.box) - centre(here)) < Math.abs(centre(a.box) - centre(here)) ? b : a)).index;
}

const TILE = ".glim-provider-pick button.glim-readme-btn";

/**
 * Handles a key on a tile of the picker's `list`: moves the focus across the
 * grid, or up into `search`. Returns whether the key was used, so the
 * framework can stop the page from scrolling.
 */
export function pickTileKey(key: string, tile: Element, list: HTMLElement, search: HTMLElement | null): boolean {
  const tiles = [...list.querySelectorAll<HTMLElement>(TILE)];
  const from = tiles.indexOf(tile as HTMLElement);
  if (from < 0) return false;
  const to = pickKey(key, from, tiles.map((t) => t.getBoundingClientRect()), getComputedStyle(list).direction === "rtl");
  if (to === null) return false;
  (to === "search" ? search : tiles[to])?.focus();
  return true;
}

/**
 * Handles a key in the picker's search. Escape empties a field with text in
 * it before the window hears it, ArrowDown goes to the first tile, and Enter
 * picks the one tile a query has left. Returns whether the key was used.
 */
export function pickSearchKey(key: string, query: string, list: HTMLElement | null, clear: () => void): boolean {
  const tiles = list ? [...list.querySelectorAll<HTMLElement>(TILE)] : [];
  if (key === "Escape" && query !== "") {
    clear();
    return true;
  }
  if (key === "ArrowDown" && tiles[0]) {
    tiles[0].focus();
    return true;
  }
  if (key === "Enter" && query.trim() !== "" && tiles.length === 1) {
    tiles[0]!.click();
    return true;
  }
  return false;
}

/**
 * The rainbow position of the control that opens the picker, so the window
 * wears its card's colour as a list opened from it does. Read before the
 * window takes the focus; null when there is none to wear.
 */
export function pickerHue(): Record<string, string> | null {
  const opener = focusedAsker();
  return opener ? readPortalHue(opener) : null;
}

/** Keeps the tiles' area at the height it opened with, so the search does not move away from the eye while a query narrows it. */
export function holdPickHeight(scroll: HTMLElement): void {
  scroll.style.minHeight = `${scroll.clientHeight}px`;
}
