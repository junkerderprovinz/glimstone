// The words of a Rating. Zag's rating-group machine draws the stars as a
// radio group, takes the arrow keys and the pointer's half steps; an app
// passes the words a star is read with.

import { en } from "./componentLocales/en.ts";
import type { ComponentWords } from "./componentWords.ts";
import { fill, plural } from "./fortressText.ts";

export interface RatingText {
  /** How a star is read, such as "3 of 5 stars". */
  star: (value: number, count: number) => string;
}

/** The words of a Rating from a language's table, its counts in that language's digits. */
export function ratingText(w: ComponentWords["rating"], lang: string): RatingText {
  return { star: (value, count) => fill(plural(lang, w.star, count), { value: value.toLocaleString(lang) }) };
}

export const RATING_TEXT: RatingText = ratingText(en.rating, "en");
