// One destination of the navigation rail (docs/design-language.md, "The
// sidebar"). It is a link with aria-current, not a tab: the rail chooses which
// part of the app is showing, which is real navigation.
//
// The rail has a label axis of its own, since reducing it to glyphs changes
// the layout rather than only the density. Reactive centres the glyph and
// slides the name back in on hover, at the rail's full width, so nothing
// reflows.

import { hueVars } from "./appearance.ts";
import { hidesLabel, labelWidth, type LabelMode } from "./controls.ts";

export interface SidebarRowInput {
  /** The current mode of the "sidebar" label axis. */
  mode: LabelMode;
  label: string;
  hasGlyph: boolean;
  active: boolean;
  /** The row's rainbow position: its rank among the rows the rail shows. */
  hueIndex?: number;
  /** The figure on the row; nothing shows at zero. */
  count?: number;
  /** Something stands beside the link in the row, so it is never centred. */
  framed?: boolean;
  /** A tree's row: stepped in by its level, with a smaller glyph and gap. */
  depth?: number;
}

export interface SidebarRowView {
  className: string;
  style: Record<string, string> | undefined;
  showGlyph: boolean;
  /** Shown, revealed on hover, or screen-reader text: hidden, never removed,
   *  so the link keeps its name. */
  labelClass: string;
  /** The bubble for a row whose name is hidden, or undefined. */
  tip: string | undefined;
  /** The count badge's classes, or undefined when there is no figure. */
  countClass: string | undefined;
}

export function sidebarRowView(r: SidebarRowInput): SidebarRowView {
  // A row without a glyph shows its name in every mode, since a row of blanks
  // cannot be told apart.
  const mode: LabelMode = r.hasGlyph ? r.mode : "text";
  const showLabel = !hidesLabel(mode);
  const reactive = mode === "reactive";
  const hued = r.hueIndex !== undefined;
  const tree = r.depth !== undefined;
  // A tree's depth and a slot's control mean nothing in the middle of the row.
  const centred = !showLabel && !r.framed && !tree;
  const style: Record<string, string> = {
    ...(hued ? hueVars(r.hueIndex!) : {}),
    ...(tree ? { "--nav-depth": String(r.depth) } : {}),
    ...(reactive ? { "--reactive-chars": String(labelWidth(r.label)) } : {}),
  };
  return {
    className: [
      "glim-nav-row",
      centred && "glim-nav-row--centred",
      tree && "glim-nav-row--tree",
      reactive && "glim-reactive",
      hued && "glim-hue glim-hue-icon",
      r.active && "glim-active",
    ]
      .filter(Boolean)
      .join(" "),
    style: Object.keys(style).length ? style : undefined,
    showGlyph: mode !== "text",
    labelClass: showLabel ? "glim-nav-label" : reactive ? "glim-label-reactive" : "glim-sr-only",
    // Reactive needs no bubble, since hovering brings the word back.
    tip: showLabel || reactive ? undefined : r.label,
    // A row without a visible name centres its glyph, and a figure in the flow
    // would push it aside: the reactive row keeps it at its end, the narrow
    // rail hangs it on the corner.
    countClass: r.count
      ? `glim-nav-count glim-nav-count--${showLabel ? "row" : reactive ? "end" : "corner"}`
      : undefined,
  };
}
