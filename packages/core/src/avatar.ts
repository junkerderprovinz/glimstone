import { hueVars } from "./appearance.ts";

// A person's picture, or their initials while it loads or when there is none.
// Zag's avatar machine tells the two apart; this decides what the fallback
// says and what the circle wears.

/** `md` is a field's height, `lg` the key height, `sm` fits a line of text. */
export type AvatarSize = "sm" | "md" | "lg";

const letters = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const firstLetter = (word: string) => letters.segment(word)[Symbol.iterator]().next().value?.segment ?? "";

/** The first letter of the first and of the last word, as capitals. A combined letter stays whole. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const ends = words.length === 1 ? [words[0]!] : [words[0]!, words[words.length - 1]!];
  return ends.map(firstLetter).join("").toLocaleUpperCase();
}

export interface AvatarView {
  className: string;
  style: Record<string, string> | undefined;
}

/** Neutral by default. A palette position fills the circle with its hue, for a list of people under rainbow. */
export function avatarView({ size, hueIndex }: { size: AvatarSize; hueIndex?: number }): AvatarView {
  const hued = hueIndex !== undefined;
  return {
    className: `glim-avatar glim-avatar--${size}${hued ? " glim-avatar--hued glim-hue" : ""}`,
    style: hued ? hueVars(hueIndex) : undefined,
  };
}
