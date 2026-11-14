import { createRawSnippet, type Snippet } from "svelte";
import { MARKS, type Mark } from "@glimstone/core";

// The icon on a "Save" button or a nav item is the app's vocabulary, so GlimStone
// ships the assortment as a specification (glyphs.md in the core) and lets the
// app register a resolver. Button then picks a glyph by meaning. Without a
// resolver a button falls back to the glyph it was handed, and with neither,
// to text alone. A glyph is a snippet, so a resolver can build one from an
// SVG string with createRawSnippet.

let resolver: ((labelKey: string) => Snippet | undefined) | null = null;

/**
 * Register the app's label-key-to-glyph mapping, once, at boot. A button that is
 * given no glyph cannot be shown in glyph mode, and one place to ask saves
 * passing an icon at every call site.
 */
export function setGlyphResolver(fn: (labelKey: string) => Snippet | undefined): void {
  resolver = fn;
}

/** The mark for a label key, or nothing when no app resolver knows it. */
export function glyphFor(labelKey: string): Snippet | undefined {
  return resolver ? resolver(labelKey) : undefined;
}

/** The markup of a mark from the core, drawn in the current colour. */
export function markSvg(mark: Mark, className?: string): string {
  const cls = className ? ` class="${className}"` : "";
  return `<svg width="${mark.size}" height="${mark.size}" viewBox="${mark.viewBox}" fill="currentColor"${cls} aria-hidden="true">${mark.body}</svg>`;
}

const markSnippet = (mark: Mark): Snippet => createRawSnippet(() => ({ render: () => markSvg(mark, "glim-mark") }));

export const IconClose = markSnippet(MARKS.close);
export const IconCancel = markSnippet(MARKS.cancel);
export const IconCheck = markSnippet(MARKS.check);
export const IconExpand = markSnippet(MARKS.expand);
export const IconFolderOpen = markSnippet(MARKS.folderOpen);
export const IconPencil = markSnippet(MARKS.pencil);
export const IconWindowMinimise = markSnippet(MARKS.windowMinimise);
export const IconWindowMaximise = markSnippet(MARKS.windowMaximise);
export const IconWindowRestore = markSnippet(MARKS.windowRestore);
export const IconEye = markSnippet(MARKS.eye);
export const IconEyeOff = markSnippet(MARKS.eyeOff);
export const IconCopy = markSnippet(MARKS.copy);
