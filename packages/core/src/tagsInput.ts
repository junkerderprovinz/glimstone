// The words of a TagsInput. Zag's tags-input machine adds a tag on Enter or a
// comma, walks the tags with the arrow keys and announces what changed; an app
// passes its own words for each of those.

import { en } from "./componentLocales/en.ts";
import type { ComponentWords } from "./componentWords.ts";
import { fill } from "./fortressText.ts";

export interface TagsInputText {
  /** The name of a tag's remove button, such as "Remove backup". */
  remove: (tag: string) => string;
  /** What a screen reader hears once a tag was added, picked or removed. */
  added: (tag: string) => string;
  selected: (tag: string) => string;
  removed: (tag: string) => string;
}

/** The words of a TagsInput from a language's table, its counts in that language's digits. */
export function tagsInputText(w: ComponentWords["tagsInput"], lang: string): TagsInputText {
  return {
    remove: (tag) => fill(w.remove, { tag }),
    added: (tag) => fill(w.added, { tag }),
    selected: (tag) => fill(w.selected, { tag }),
    removed: (tag) => fill(w.removed, { tag }),
  };
}

export const TAGS_INPUT_TEXT: TagsInputText = tagsInputText(en.tagsInput, "en");
