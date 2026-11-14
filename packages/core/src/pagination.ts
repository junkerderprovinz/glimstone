// The words of a Pagination. Zag's pagination machine works out which pages
// stand in the row and where the gaps go; an app passes its own words.

import { en } from "./componentLocales/en.ts";
import type { ComponentWords } from "./componentWords.ts";
import { fill } from "./fortressText.ts";

export interface PaginationText {
  /** The name of the row, read when a screen reader enters it. */
  label: string;
  previous: string;
  next: string;
  /** A page's accessible name, such as "Page 3 of 12". */
  page: (page: number, pages: number) => string;
}

/** The words of a Pagination from a language's table, its counts in that language's digits. */
export function paginationText(w: ComponentWords["pagination"], lang: string): PaginationText {
  return {
    label: w.label,
    previous: w.previous,
    next: w.next,
    page: (page, pages) => fill(w.page, { page: page.toLocaleString(lang), pages: pages.toLocaleString(lang) }),
  };
}

export const PAGINATION_TEXT: PaginationText = paginationText(en.pagination, "en");
