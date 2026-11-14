import type { Snippet } from "svelte";

export interface SelectorItem<V extends string | number = string> {
  /** Stable id, handed back by onChange as it stands here. */
  id: V;
  label: string;
  /** Shown before the label; in a tab strip it is tinted with its tab's hue. */
  glyph?: Snippet;
  disabled?: boolean;
  /** Why the segment is in its state, such as "Pick a folder first" on a
   *  disabled one. It goes into the bubble, which a keyboard reaches. */
  title?: string;
  /** The fuller version of a terse label, shown in the bubble. */
  tip?: string;
  /** Shows the glyph alone in every mode but text; the label stays the name. */
  iconOnly?: boolean;
  /** Tiles only: the page's own address, so a tile can open in a new tab. */
  href?: string;
  /** Tiles only: a page with nothing on it yet, dimmed rather than hidden. */
  dim?: boolean;
  /** Attributes for the item's own segment, such as a data hook. */
  attrs?: Record<string, string>;
}
