// A short code typed one character to a box, such as the six digits of a
// second factor. Zag's pin-input machine moves the focus between the boxes and
// takes a pasted code whole; this holds the words and turns the code from the
// one string an app keeps into the boxes and back.

import { en } from "./componentLocales/en.ts";
import type { ComponentWords } from "./componentWords.ts";
import { fill } from "./fortressText.ts";

export interface PinInputText {
  /** The accessible name of one box, such as "Digit 2 of 6". */
  cell: (index: number, length: number) => string;
}

/** The words of a PinInput from a language's table, its counts in that language's digits. */
export function pinInputText(w: ComponentWords["pinInput"], lang: string): PinInputText {
  return { cell: (index, length) => fill(w.cell, { index: index.toLocaleString(lang), length: length.toLocaleString(lang) }) };
}

export const PIN_INPUT_TEXT: PinInputText = pinInputText(en.pinInput, "en");

/** The code as one character a box, the empty boxes as empty strings. */
export function pinCells(value: string, length: number): string[] {
  const chars = Array.from(value);
  return Array.from({ length }, (_, i) => chars[i] ?? "");
}
