// The words of a Pagination and the watch that keeps it to one row. Zag's
// pagination machine works out which pages stand in the row and where the gaps
// go; an app passes its own words.

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
  /** The page in force among all of them in the short form, such as "3 / 12". */
  status: (page: number, pages: number) => string;
}

/** The words of a Pagination from a language's table, its counts in that language's digits. */
export function paginationText(w: ComponentWords["pagination"], lang: string): PaginationText {
  return {
    label: w.label,
    previous: w.previous,
    next: w.next,
    page: (page, pages) => fill(w.page, { page: page.toLocaleString(lang), pages: pages.toLocaleString(lang) }),
    status: (page, pages) => `${page.toLocaleString(lang)} / ${pages.toLocaleString(lang)}`,
  };
}

export const PAGINATION_TEXT: PaginationText = paginationText(en.pagination, "en");

/**
 * Keeps a Pagination to its one row. While the steps and the pages do not fit
 * the box, `data-short` on `nav` swaps them for the short form, the two steps
 * as glyphs around "3 / 20". How wide the full row is depends on the language,
 * the label mode and the page numbers, so it is measured rather than set as a
 * breakpoint: at once, whenever the box resizes or the row changes, and once
 * the web font is in. Returns the teardown.
 */
export function watchPaginationFit(nav: HTMLElement): () => void {
  const measure = () => {
    nav.removeAttribute("data-short");
    nav.toggleAttribute("data-short", nav.scrollWidth > nav.clientWidth);
  };
  measure();
  const box = new ResizeObserver(measure);
  box.observe(nav);
  // A row that hugs its pages keeps the short form's width when its box grows,
  // so the room it could take is read off the parent.
  if (nav.parentElement) box.observe(nav.parentElement);
  // A page number with more digits, or a label mode that brings the words
  // back, widens the row without resizing the box.
  const row = new MutationObserver(measure);
  row.observe(nav, { subtree: true, childList: true, characterData: true, attributeFilter: ["class"] });
  void nav.ownerDocument.fonts?.ready.then(measure);
  return () => {
    box.disconnect();
    row.disconnect();
  };
}
