// The marks the components draw themselves, as SVG data each framework puts
// into an <svg>. Every other icon is the app's own, asked for by meaning
// through a glyph resolver (glyphs.md).

export interface Mark {
  viewBox: string;
  /** The rendered size in px, square. */
  size: number;
  /** The SVG children, filled with currentColor. */
  body: string;
}

/**
 * The close mark: a plus rotated by 45 degrees, drawn as two rounded bars to
 * match the filled shapes of the assortment. The `2 2 10 10` viewBox is the box
 * every glyph in the set uses, so it carries the same optical weight as the
 * app's own icons.
 */
const close: Mark = {
  viewBox: "2 2 10 10",
  size: 16,
  body: '<g transform="rotate(45 7 7)"><rect x="2" y="5.9" width="10" height="2.2" rx="1.1"/><rect x="5.9" y="2" width="2.2" height="10" rx="1.1"/></g>',
};

export const MARKS = {
  close,
  /** The same shape as close, but dismissing a surface and abandoning an action
   *  mean different things at the call site, and an app may draw them apart. */
  cancel: close,
  /** The chosen option of a list, `IconCheck` from the assortment. */
  check: {
    viewBox: "0.3 0.549 13.399 13.399",
    size: 14,
    body: '<path fill-rule="evenodd" d="M4.381 12.219 L4.574 12.378 L4.793 12.497 L5.032 12.572 L5.155 12.592 L5.405 12.596 L5.651 12.552 L5.884 12.461 L6.096 12.328 L6.278 12.157 L13.457 3.957 L13.584 3.736 L13.666 3.495 L13.699 3.242 L13.683 2.988 L13.656 2.863 L13.566 2.625 L13.431 2.408 L13.257 2.222 L13.05 2.074 L12.936 2.016 L12.695 1.934 L12.442 1.901 L12.188 1.917 L11.942 1.983 L11.713 2.096 L11.511 2.251 L5.238 9.399 L2.519 6.681 L2.425 6.595 L2.213 6.454 L1.977 6.356 L1.854 6.325 L1.6 6.3 L1.346 6.325 L1.223 6.356 L0.987 6.454 L0.775 6.595 L0.595 6.775 L0.454 6.987 L0.399 7.103 L0.325 7.346 L0.3 7.6 L0.306 7.727 L0.356 7.977 L0.399 8.097 L0.519 8.322 L0.681 8.519Z"/>',
  },
  /** A closed list's trigger, `IconExpand` from the assortment. It turns over while the list is open. */
  expand: {
    viewBox: "3.6 2.95 12.8 12.8",
    size: 14,
    body: '<path d="M10 13.4 3.6 7l1.7-1.7L10 10l4.7-4.7L16.4 7 10 13.4Z"/>',
  },
  /** `IconWindowMinimise`: the bar the window goes down to. */
  windowMinimise: {
    viewBox: "0 0 14 14",
    size: 16,
    body: '<rect x="0" y="6" width="14" height="2" rx="1"/>',
  },
  /** `IconWindowMaximise`: the window filling the screen. */
  windowMaximise: {
    viewBox: "0 0 14 14",
    size: 16,
    body: '<path fill-rule="evenodd" clip-rule="evenodd" d="M2.5 0h9A2.5 2.5 0 0 1 14 2.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 0 11.5v-9A2.5 2.5 0 0 1 2.5 0Zm0 2a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5Z"/>',
  },
  /** `IconWindowRestore`: the window in front of the screen it filled. Not
   *  `IconRestore`, which brings a backup back. */
  windowRestore: {
    viewBox: "0 0 14 14",
    size: 16,
    body: '<path fill-rule="evenodd" clip-rule="evenodd" d="M2.5 3h6A2.5 2.5 0 0 1 11 5.5v6A2.5 2.5 0 0 1 8.5 14h-6A2.5 2.5 0 0 1 0 11.5v-6A2.5 2.5 0 0 1 2.5 3Zm0 2a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 0-.5-.5Z"/><path d="M5 0h6.5A2.5 2.5 0 0 1 14 2.5V9h-2V2.5a.5.5 0 0 0-.5-.5H5Z"/>',
  },
} satisfies Record<string, Mark>;
