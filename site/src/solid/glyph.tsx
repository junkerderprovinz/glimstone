import { Show } from "solid-js";
import { setGlyphResolver } from "@glimstone/solid";
import { glyphByName, glyphNameFor } from "../glyphData";

export function Glyph(props: { name: string; size?: number }) {
  return (
    <Show when={glyphByName.get(props.name)}>
      {(g) => <svg width={props.size ?? 16} height={props.size ?? 16} viewBox={g().viewBox} aria-hidden="true" fill="currentColor" innerHTML={g().svg} />}
    </Show>
  );
}

/** A glyph by name, for a prop that takes one. */
export const glyph = (name: string) => <Glyph name={name} />;

setGlyphResolver((key) => {
  const name = glyphNameFor(key);
  return name ? glyph(name) : undefined;
});
