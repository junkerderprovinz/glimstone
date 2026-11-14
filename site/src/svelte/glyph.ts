import { createRawSnippet, type Snippet } from "svelte";
import { setGlyphResolver } from "@glimstone/svelte";
import { glyphByName, glyphNameFor } from "../glyphData";

/** A glyph by name as a snippet, for a prop that takes one. */
export function glyph(name: string, size = 16): Snippet {
  const g = glyphByName.get(name);
  return createRawSnippet(() => ({
    render: () => (g ? `<svg width="${size}" height="${size}" viewBox="${g.viewBox}" aria-hidden="true" fill="currentColor">${g.svg}</svg>` : "<span></span>"),
  }));
}

setGlyphResolver((key) => {
  const name = glyphNameFor(key);
  return name ? glyph(name) : undefined;
});
