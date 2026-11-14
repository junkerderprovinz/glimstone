import type { FortressInstance, FortressLabelKeys, FortressText } from "@glimstone/core";
import { glyphFor } from "./glyphs.js";

export const LABEL_KEYS: FortressLabelKeys = {
  join: "fortressJoin",
  leave: "fortressLeave",
  showPhrase: "fortressShowPhrase",
  changePhrase: "fortressChangePhrase",
  remove: "delete",
  later: "fortressLater",
  unlock: "unlock",
  copy: "copy",
};

export const presenceText = (text: FortressText, i: FortressInstance) => ({ connected: text.connected, checking: text.checking, away: text.away })[i.presence];

/** A device's glyph, asked for by its kind through the app's resolver (`deviceServer`, `devicePc`, `deviceLaptop`, `devicePhone`). */
export function deviceGlyph(kind: FortressInstance["deviceKind"]) {
  return kind ? glyphFor(`device${kind.charAt(0).toUpperCase()}${kind.slice(1)}`) : undefined;
}
