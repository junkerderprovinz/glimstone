// The parts of a Splitter Zag's splitter machine leaves to the page: the
// panels it lays out, the handle's name and the id the machine gives the
// handle between two panels.

import { en } from "./componentLocales/en.ts";

export interface SplitterPanel {
  /** Names the panel to the machine and in the handle beside it. */
  id: string;
  /** The smallest and largest share of the splitter it takes, in percent. */
  minSize?: number;
  maxSize?: number;
  /** Enter on the handle after it folds it away to its smallest size and back. */
  collapsible?: boolean;
}

export interface SplitterText {
  /** The accessible name of a handle. */
  resize: string;
}

export const SPLITTER_TEXT: SplitterText = en.splitter;

/** The handle between a panel and the next, in the form the machine names it. */
export function splitterHandleId(before: SplitterPanel, after: SplitterPanel): `${string}:${string}` {
  return `${before.id}:${after.id}`;
}
