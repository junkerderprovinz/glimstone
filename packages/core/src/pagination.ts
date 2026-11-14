// The words of a Pagination. Zag's pagination machine works out which pages
// stand in the row and where the gaps go; an app passes its own words.

export interface PaginationText {
  /** The name of the row, read when a screen reader enters it. */
  label: string;
  previous: string;
  next: string;
  /** A page's accessible name, such as "Page 3 of 12". */
  page: (page: number, pages: number) => string;
}

export const PAGINATION_TEXT: PaginationText = {
  label: "Pages",
  previous: "Previous page",
  next: "Next page",
  page: (page, pages) => `Page ${page} of ${pages}`,
};
