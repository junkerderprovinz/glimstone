import type { ReactNode } from "react";
import { MARKS, type Mark } from "@glimstone/core";

// The icon on a "Save" button or a nav item is the app's vocabulary, so GlimStone
// ships the assortment as a specification (`packages/core/glyphs.md`) and lets the app
// register a resolver. `Button` then picks a glyph by meaning. Without a resolver a
// button falls back to the glyph it was handed, and with neither, to text alone.

let resolver: ((labelKey: string) => ReactNode | undefined) | null = null;

/**
 * Register the app's label-key-to-glyph mapping, once, at boot. A button that is
 * given no glyph cannot be shown in glyph mode, and one place to ask saves
 * passing an icon at every call site.
 */
export function setGlyphResolver(fn: (labelKey: string) => ReactNode | undefined): void {
  resolver = fn;
}

/** The mark for a label key, or nothing when no app resolver knows it. */
export function glyphFor(labelKey: string): ReactNode | undefined {
  return resolver ? resolver(labelKey) : undefined;
}

function MarkSvg({ mark }: { mark: Mark }) {
  return (
    <svg
      width={mark.size}
      height={mark.size}
      viewBox={mark.viewBox}
      fill="currentColor"
      className="shrink-0"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: mark.body }}
    />
  );
}

export const IconClose = () => <MarkSvg mark={MARKS.close} />;
export const IconCancel = () => <MarkSvg mark={MARKS.cancel} />;
export const IconCheck = () => <MarkSvg mark={MARKS.check} />;
export const IconExpand = () => <MarkSvg mark={MARKS.expand} />;
export const IconWindowMinimise = () => <MarkSvg mark={MARKS.windowMinimise} />;
export const IconWindowMaximise = () => <MarkSvg mark={MARKS.windowMaximise} />;
export const IconWindowRestore = () => <MarkSvg mark={MARKS.windowRestore} />;
