import { h, type FunctionalComponent } from "vue";
import { setGlyphResolver } from "@glimstone/vue";
import { glyphByName, glyphNameFor } from "../glyphData";

export const Glyph: FunctionalComponent<{ name: string; size?: number }> = ({ name, size = 16 }) => {
  const g = glyphByName.get(name);
  return g
    ? h("svg", { width: size, height: size, viewBox: g.viewBox, "aria-hidden": "true", fill: "currentColor", innerHTML: g.svg })
    : null;
};
Glyph.props = ["name", "size"];

/** A glyph by name as a component, for a prop that takes one. */
export const glyph = (name: string): FunctionalComponent => () => h(Glyph, { name });

setGlyphResolver((key) => {
  const name = glyphNameFor(key);
  return name ? glyph(name) : undefined;
});
