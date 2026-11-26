import { intlHas } from "./intl.ts";

// A person's picture, or their initials while it loads or when there is none.
// Zag's avatar machine tells the two apart; this decides what the fallback
// says and what the circle wears.

/** `md` is a field's height, `lg` the key height, `sm` fits a line of text. */
export type AvatarSize = "sm" | "md" | "lg";

let letters: Intl.Segmenter | null | undefined;

// Without a Segmenter a letter is a code point, so an accent typed as its own
// mark or a flag drawn from two symbols comes out as half of itself.
function firstLetter(word: string): string {
  if (letters === undefined) letters = intlHas("Segmenter") ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
  if (!letters) return Array.from(word)[0] ?? "";
  return letters.segment(word)[Symbol.iterator]().next().value?.segment ?? "";
}

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

/** One of the eight chart series for a name, the same for the same name on every visit. */
export function avatarTone(name: string): number {
  let h = 0;
  for (const ch of name.trim().toLocaleLowerCase()) h = (Math.imul(h, 31) + ch.codePointAt(0)!) | 0;
  return (Math.abs(h) % 8) + 1;
}

/**
 * Neutral without a name. With one the initials take a soft tone of a chart
 * series, from the palette position where there is one and else from the
 * name, never the accent, which marks activity.
 */
export function avatarView({ size, hueIndex, name }: { size: AvatarSize; hueIndex?: number; name?: string }): AvatarView {
  const tone = hueIndex !== undefined ? (hueIndex % 8) + 1 : name ? avatarTone(name) : undefined;
  return {
    className: `glim-avatar glim-avatar--${size}${tone ? " glim-avatar--toned" : ""}`,
    style: tone ? { "--avatar-tone": `var(--chart-${tone})` } : undefined,
  };
}
