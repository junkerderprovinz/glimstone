// A short code typed one character to a box, such as the six digits of a
// second factor. Zag's pin-input machine moves the focus between the boxes and
// takes a pasted code whole; this holds the words and turns the code from the
// one string an app keeps into the boxes and back.

export interface PinInputText {
  /** The accessible name of one box, such as "Digit 2 of 6". */
  cell: (index: number, length: number) => string;
}

export const PIN_INPUT_TEXT: PinInputText = {
  cell: (index, length) => `Character ${index} of ${length}`,
};

/** The code as one character a box, the empty boxes as empty strings. */
export function pinCells(value: string, length: number): string[] {
  const chars = Array.from(value);
  return Array.from({ length }, (_, i) => chars[i] ?? "");
}
