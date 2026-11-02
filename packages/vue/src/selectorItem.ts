import type { Component } from "vue";

export interface SelectorItem {
  /** Stable id, handed back through v-model. */
  id: string;
  label: string;
  /** Shown before the label; in a tab strip it is tinted with its tab's hue. */
  glyph?: Component;
  disabled?: boolean;
  /** Why the segment is in its state, shown in the bubble a keyboard reaches. */
  title?: string;
  /** The fuller version of a terse label, shown in the bubble. */
  tip?: string;
  /** Shows the glyph alone in every mode but text; the label stays the name. */
  iconOnly?: boolean;
  /** Tiles only: the page's own address, so a tile can open in a new tab. */
  href?: string;
  /** Tiles only: a page with nothing on it yet, dimmed rather than hidden. */
  dim?: boolean;
}
