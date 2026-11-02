import { setGlyphResolver } from "@glimstone/react";
import { glyphByName, glyphNameFor } from "./glyphData";

export { GLYPHS, type GlyphEntry } from "./glyphData";

export function Glyph({ name, size = 16 }: { name: string; size?: number }) {
  const g = glyphByName.get(name);
  if (!g) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox={g.viewBox}
      aria-hidden="true"
      fill="currentColor"
      dangerouslySetInnerHTML={{ __html: g.svg }}
    />
  );
}

setGlyphResolver((key) => {
  const name = glyphNameFor(key);
  return name ? <Glyph name={name} /> : undefined;
});
