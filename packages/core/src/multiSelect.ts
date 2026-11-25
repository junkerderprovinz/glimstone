// The words and rules of a MultiSelect, a field that picks several choices
// from a list and shows them as tags. A short list opens like a select and
// takes no typing; a long one filters while somebody types, since nobody
// scrolls through twenty rows to find the one they mean.

import { en } from "./componentLocales/en.ts";
import type { ComponentWords } from "./componentWords.ts";
import { fill } from "./fortressText.ts";
import type { SelectChoice } from "./selectModel.ts";

export interface MultiSelectText {
  /** The name of a tag's remove button, such as "Remove Photos". */
  remove: (item: string) => string;
  /** The line the list shows when a search finds nothing. */
  empty: string;
  /** Accessible name of the button that opens the list. */
  toggle: string;
  /** What a long list's field says while it waits for a search. */
  search: string;
}

/** The words of a MultiSelect from a language's table. */
export function multiSelectText(w: ComponentWords["multiSelect"]): MultiSelectText {
  return {
    remove: (item) => fill(w.remove, { item }),
    empty: w.empty,
    toggle: w.toggle,
    search: w.search,
  };
}

export const MULTI_SELECT_TEXT: MultiSelectText = multiSelectText(en.multiSelect);

/** How many choices a list shows before its field takes a search. */
export const MULTI_SELECT_SEARCH_AFTER = 7;

/** Whether a list of `count` choices filters as somebody types. */
export function multiSelectSearches(count: number, after: number = MULTI_SELECT_SEARCH_AFTER): boolean {
  return count > after;
}

/** The choices whose label holds the search, in their order, or all of them for an empty one. */
export function multiSelectMatches<C extends Pick<SelectChoice, "label">>(choices: C[], query: string): C[] {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return choices;
  return choices.filter((c) => c.label.toLocaleLowerCase().includes(q));
}

/** The picked values without one, the rest in the order they were picked. */
export function multiSelectWithout(values: string[], value: string): string[] {
  return values.filter((v) => v !== value);
}
