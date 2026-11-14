// The words of a SignaturePad. Zag's signature-pad machine turns a pointer's
// strokes into SVG paths, which are the value an app keeps.

import { en } from "./componentLocales/en.ts";

export interface SignaturePadText {
  /** The name of the drawing area. */
  area: string;
  clear: string;
}

export const SIGNATURE_PAD_TEXT: SignaturePadText = en.signaturePad;
