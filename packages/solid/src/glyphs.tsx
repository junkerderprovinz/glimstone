import type { JSX } from "solid-js";
import { MARKS, type Mark } from "@glimstone/core";

// The icon on a "Save" button or a nav item is the app's vocabulary, so GlimStone
// ships the assortment as a specification (glyphs.md in the core) and lets the
// app register a resolver. Button then picks a glyph by meaning. Without a
// resolver a button falls back to the glyph it was handed, and with neither,
// to text alone.

let resolver: ((labelKey: string) => JSX.Element | undefined) | null = null;

/**
 * Register the app's label-key-to-glyph mapping, once, at boot. A button that is
 * given no glyph cannot be shown in glyph mode, and one place to ask saves
 * passing an icon at every call site. Each call draws a glyph of its own, so
 * the resolver makes a new element every time.
 */
export function setGlyphResolver(fn: (labelKey: string) => JSX.Element | undefined): void {
  resolver = fn;
}

/** The mark for a label key, or nothing when no app resolver knows it. */
export function glyphFor(labelKey: string): JSX.Element | undefined {
  return resolver ? resolver(labelKey) : undefined;
}

/** A mark from the core, drawn in the current colour. */
export function MarkSvg(props: { mark: Mark; class?: string }) {
  return (
    <svg
      width={props.mark.size}
      height={props.mark.size}
      viewBox={props.mark.viewBox}
      fill="currentColor"
      class={props.class}
      aria-hidden="true"
      innerHTML={props.mark.body}
    />
  );
}

export const IconClose = () => <MarkSvg mark={MARKS.close} class="glim-mark" />;
export const IconCancel = () => <MarkSvg mark={MARKS.cancel} class="glim-mark" />;
export const IconCheck = () => <MarkSvg mark={MARKS.check} class="glim-mark" />;
export const IconExpand = () => <MarkSvg mark={MARKS.expand} class="glim-mark" />;
export const IconFolderOpen = () => <MarkSvg mark={MARKS.folderOpen} class="glim-mark" />;
export const IconPencil = () => <MarkSvg mark={MARKS.pencil} class="glim-mark" />;
export const IconWindowMinimise = () => <MarkSvg mark={MARKS.windowMinimise} class="glim-mark" />;
export const IconWindowMaximise = () => <MarkSvg mark={MARKS.windowMaximise} class="glim-mark" />;
export const IconWindowRestore = () => <MarkSvg mark={MARKS.windowRestore} class="glim-mark" />;
export const IconEye = () => <MarkSvg mark={MARKS.eye} class="glim-mark" />;
export const IconEyeOff = () => <MarkSvg mark={MARKS.eyeOff} class="glim-mark" />;
export const IconCopy = () => <MarkSvg mark={MARKS.copy} class="glim-mark" />;
