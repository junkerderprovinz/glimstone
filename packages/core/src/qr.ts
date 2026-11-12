// A QR code as one SVG path, for the window that shows the phrase, so a phone
// takes the words by camera instead of by typing. uqr does the encoding.

import { encode } from "uqr";

export interface QrCode {
  /** The modules along one side, without the quiet zone. */
  size: number;
  /** Every run of dark modules in a row as a unit-high rectangle, in module units. */
  path: string;
}

export function qrCode(text: string): QrCode {
  const { size, data } = encode(text, { ecc: "M", border: 0 });
  let path = "";
  data.forEach((row, y) => {
    for (let x = 0; x < size; x++) {
      if (!row[x]) continue;
      let end = x;
      while (end < size && row[end]) end++;
      path += `M${x} ${y}h${end - x}v1h-${end - x}Z`;
      x = end;
    }
  });
  return { size, path };
}
