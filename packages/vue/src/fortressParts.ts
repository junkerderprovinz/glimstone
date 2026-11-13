import type { FortressInstance } from "@glimstone/core";
import { glyphFor } from "./glyphs";

/** deviceGlyph asks the app's resolver for a device's glyph by its kind (`deviceServer`, `devicePc`, `deviceLaptop`, `devicePhone`). */
export function deviceGlyph(kind: FortressInstance["deviceKind"]) {
  return kind ? glyphFor(`device${kind.charAt(0).toUpperCase()}${kind.slice(1)}`) : undefined;
}
