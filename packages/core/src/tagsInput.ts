// The words of a TagsInput. Zag's tags-input machine adds a tag on Enter or a
// comma, walks the tags with the arrow keys and announces what changed; an app
// passes its own words for each of those.

export interface TagsInputText {
  /** The name of a tag's remove button, such as "Remove backup". */
  remove: (tag: string) => string;
  /** What a screen reader hears once a tag was added, picked or removed. */
  added: (tag: string) => string;
  selected: (tag: string) => string;
  removed: (tag: string) => string;
}

export const TAGS_INPUT_TEXT: TagsInputText = {
  remove: (tag) => `Remove ${tag}`,
  added: (tag) => `${tag} added`,
  selected: (tag) => `${tag} picked. Press Backspace or Delete to remove it`,
  removed: (tag) => `${tag} removed`,
};
