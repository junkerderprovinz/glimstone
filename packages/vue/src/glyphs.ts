// The icon on a "Save" button or a nav item is the app's vocabulary, so GlimStone
// ships the assortment as a specification (glyphs.md in the core) and lets the
// app register a resolver. Button then picks a glyph by meaning. Without a
// resolver a button falls back to the glyph it was handed, and with neither,
// to text alone.

import { h, type Component, type FunctionalComponent } from "vue";
import { MARKS, type Mark } from "@glimstone/core";

let resolver: ((labelKey: string) => Component | undefined) | null = null;

/**
 * Register the app's label-key-to-glyph mapping, once, at boot. A button that is
 * given no glyph cannot be shown in glyph mode, and one place to ask saves
 * passing an icon at every call site.
 */
export function setGlyphResolver(fn: (labelKey: string) => Component | undefined): void {
  resolver = fn;
}

/** The mark for a label key, or nothing when no app resolver knows it. */
export function glyphFor(labelKey: string): Component | undefined {
  return resolver ? resolver(labelKey) : undefined;
}

/** A mark from the core, drawn in the current colour. A `class` falls through to the <svg>. */
export const MarkSvg: FunctionalComponent<{ mark: Mark }> = ({ mark }) =>
  h("svg", {
    width: mark.size,
    height: mark.size,
    viewBox: mark.viewBox,
    fill: "currentColor",
    "aria-hidden": "true",
    innerHTML: mark.body,
  });
MarkSvg.props = ["mark"];

function markComponent(mark: Mark): FunctionalComponent {
  return () => h(MarkSvg, { mark, class: "glim-mark" });
}

export const IconClose = markComponent(MARKS.close);
export const IconCancel = markComponent(MARKS.cancel);
export const IconCheck = markComponent(MARKS.check);
export const IconExpand = markComponent(MARKS.expand);
export const IconWindowMinimise = markComponent(MARKS.windowMinimise);
export const IconWindowMaximise = markComponent(MARKS.windowMaximise);
export const IconWindowRestore = markComponent(MARKS.windowRestore);
